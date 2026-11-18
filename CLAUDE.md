# Contexto del sistema "Incapacidades" — Supertiendas Cañaveral S.A.S.

Lee este archivo completo antes de proponer o cambiar algo.
Responde siempre en **español**, con lenguaje sencillo: lo usa personal de Gestión Humana que no programa.
Trabaja **por partes**, con cambios puntuales (no reescribas lo que no se pidió) y deja el código
**documentado** (comentarios que expliquen qué hace cada parte) para que otra persona lo entienda.

## Qué es

Sistema de **Gestión Humana** para recibir y gestionar las **incapacidades y licencias** de los colaboradores.
Son **dos páginas web estáticas, sin servidor ni base de datos**, publicadas con GitHub Pages:

1. **App del colaborador** — `index.html`
   El colaborador, desde el celular, llena los datos de su incapacidad y sube los documentos (PDF o fotos).
   La app revisa cada archivo, comprime, quita contraseñas de PDF, arma un **ZIP** y lo lleva a subirlo a la
   carpeta de OneDrive de la empresa (link "Solicitar archivos" en `CONFIG.linkSubida`).
2. **Panel de la gestora** — `panel-incapacidades.html`
   Se abre en **Chrome o Edge de computador** y trabaja sobre la carpeta de OneDrive **"Incapacidades"**
   sincronizada en el PC (File System Access API). Procesa los ZIP, revisa documentos, muestra los datos para el
   ERP, enlaza prórrogas con el reporte del ERP, hace la doble verificación y crea las alertas de 30/150 días que
   envía Power Automate.

Es el sistema "hermano" de **Documentos de ingreso / hojas de vida** (repositorio `FelipeAnali/GuiadearchivosHV`):
mismo estilo y misma forma de trabajar.

Estilo visual: tipo iOS (listas agrupadas, interruptores, hojas), colores de la marca
**#08200F** (tinta), **#1D5A2B** (bosque), **#7DD105** (lima), fondo **#F3F6EF**, títulos en **Nunito**,
modo oscuro. La app del colaborador en computador se ve en 3 columnas (Tu avance / contenido / Ayuda).

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | App del colaborador. Un solo archivo: estilos, bloque **CONFIGURACIÓN** (`window.CONFIG`), logo en base64 y el código React con JSX (Babel en el navegador). |
| `panel-incapacidades.html` | Panel de la gestora. Un solo archivo. Config en `window.CONFIG_PANEL`. Tiene un **mapa del código** al inicio. |
| `manual/Manual_colaborador_Envio_de_incapacidades.pdf` | Manual del colaborador (botón "Ver manual (PDF)" de la app). |
| `manual/Manual_gestora_Panel_de_incapacidades.pdf` | Manual de la gestora (panel). |
| `manual/fuente/` | HTML editables de los dos manuales, imágenes y `hacer_pdf.js` para generar los PDF. |
| `docs/GUIA_GESTION_HUMANA.md` | Cómo publicar y configurar la app del colaborador, sin programar. |
| `docs/COMO_FUNCIONA.md` | Parte técnica: carpetas, contratos (ZIP, JSON), reglas, alertas, Power Automate. |
| `docs/PENDIENTES.md` | Lo que falta. |

Librerías (desde cdnjs): React 18.2.0 UMD, Babel standalone 7.23.5, JSZip 3.10.1, pdf.js 3.11.174 y jsPDF 2.5.1
(app del colaborador), SheetJS xlsx 0.18.5 (panel, para leer el reporte del ERP).

## Reglas que no se pueden romper (contrato entre las dos páginas)

- **ZIP del colaborador:** `<cedula>_<tipo>_<fechaInicial>.zip`, con:
  - un PDF por documento: `<cedula>_<tipo>_<codigoDoc>_<ID_DOC>.pdf` (ej. `1144098765_018_02_HISTORIA.pdf`);
  - `datos_incapacidad.json` (campos en `docs/COMO_FUNCIONA.md`).
- **Tipos** (códigos del ERP): `018` enfermedad general, `019` accidente de trabajo, `020` licencia de maternidad,
  `021` licencia de paternidad. **Documentos** (id/código): incapacidad 01, historia 02, furips 03, nacido_vivo 04,
  registro_civil 05, incapacidad_madre 06, historia_parto 07, carta_paternidad 08.
  **No cambies `id` ni `codigo`:** dan nombre a los archivos y el panel los usa.
- Si cambias `CONFIG.tipos` o `CONFIG.documentos` en una página, cámbialo igual en la otra.
- **Prórroga:** días entre el fin de la anterior y el inicio de la prórroga.
  - Hasta `diasNormalesProrroga` (7) es lo normal.
  - Hasta `diasMaximosProrroga` (30) se acepta con aviso (Decreto 1427 de 2022: no puede haber una interrupción
    mayor a 30 días).
  - Con más días ya no es prórroga.
  - Misma regla en las dos páginas.
- Fecha final = fecha inicial + días − 1. Diagnóstico CIE-10: `^[A-Z][0-9]{2}[0-9X]?$` (sin puntos ni espacios).
- **Datos sensibles:** el diagnóstico y la historia clínica son datos de salud. Nada se guarda en servidores.
  - El navegador del colaborador guarda el avance solo si el dispositivo es propio (7 días).
  - El del panel guarda solo cuál carpeta y el nombre de la usuaria.
  - Los mensajes de WhatsApp y los JSON de alertas **no llevan diagnóstico**.

## Panel: lo importante

- **Carpetas** (dentro de "Incapacidades"):
  - `Recibidos/` (llegan los ZIP; `Recibidos/Procesados/` los ya procesados);
  - `Colaboradores/<cedula>_<NOMBRE>/<fechaInicial>_<tipo>/` (PDF + `incapacidad.json`; reemplazos en `_anteriores/`);
  - `Fuentes/` (reporte de TNL del ERP, se usa el más reciente);
  - `Alertas/Pendientes|Enviadas|Errores/`;
  - `control.json` en la raíz.
- `incapacidad.json` tiene:
  - `rev`: control de choques entre dos personas;
  - `estado`: recibida, revision, correccion, aprobada, registrada, no_procede;
  - `documentos{revision, motivo, huella SHA-256…}`;
  - `datosOriginales`;
  - `erp{consecTNL, consecAnterior, anterior{consec, contrato, modo}, registrado}`;
  - `correcciones`, `envios`, `bitacora`.
- **Reenvío:** mismo colaborador + fecha inicial + tipo. Los PDF iguales (misma huella) conservan su revisión.
- **Reporte del ERP (TNL):** el `Consec.TNL` es **por colaborador y contrato** → llave `cédula|contrato|consec`.
  Las cadenas de prórrogas se arman con `Consec.TNL Anterior`. Si el anterior no está (histórico borrado), la
  gestora escribe los días acumulados → `control.json.acumulados["cedula|consec"]`.
- **Alertas 30/150:**
  - Cuentan solo cadenas de prórrogas seguidas y activas, no las licencias.
  - La gestora revisa y toca "Enviar alerta" → el panel crea `Alertas/Pendientes/<id>.json`.
  - Power Automate lo toma, manda el correo y lo deja en `Enviadas/` (o en `Errores/`), agregando `estado`,
    `enviado`, `destinatarios` y `error`.
  - "No enviar" se guarda en `control.json.alertas`.
- **Plano del ERP:** "Para el ERP" descarga el Excel de carga de TNL (hoja `DATOS`, 28 columnas A–AB).
  Obligatorias (amarillo), siempre 0 (azul: J, L, S, W, X, Y), fecha de accidente solo en 019 (verde: Q),
  número de prórroga = Consec. TNL anterior solo en prórrogas (rojo: R). Detalle en `docs/COMO_FUNCIONA.md`.
- **Carpeta de ejemplo:** "Abrir carpeta de ejemplo" crea una carpeta EN MEMORIA con datos inventados y un selector
  Normal / Peor caso / Vacío / Uno. Úsala para probar todo cambio.

## Limitaciones conocidas (ya aceptadas)

- No hay servidor: las alertas se calculan cuando la gestora abre el panel; el histórico se actualiza cuando ella
  exporta y deja un reporte nuevo.
- El panel solo funciona en Chrome/Edge de computador con OneDrive sincronizado.
- En la vista previa de artifacts de claude.ai las descargas no funcionan; en GitHub Pages sí.

## Cómo probar antes de subir

- App del colaborador: abre `index.html?prueba=1` (selector Normal / Caso extremo / Vacío). Prueba a **390 px** y a
  **1280 px**, en claro y oscuro.
- Panel: "Abrir carpeta de ejemplo" y recorre Bandeja → Por revisar → ficha → Para el ERP → Alertas → Reportes ERP,
  en Normal y en Peor caso.
- Si cambias algo que se ve en los manuales, actualiza el pantallazo y regenera el PDF (`manual/fuente/LEEME.md`).
- Actualiza `docs/` si cambias una regla o un contrato.
