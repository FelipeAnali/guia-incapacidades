# Guía para Gestión Humana (sin programar)

Esta guía explica cómo publicar, configurar y probar el sistema de incapacidades.
Para el uso diario del panel, mira `manual/Manual_gestora_Panel_de_incapacidades.pdf`.

## 1. Qué hay y cómo se publica

| Página | Quién la usa | Dirección (GitHub Pages) |
|---|---|---|
| `index.html` | Colaboradores, desde el celular | `https://<usuario>.github.io/guia-incapacidades/` |
| `panel-incapacidades.html` | La gestora, en Chrome o Edge de computador | `https://<usuario>.github.io/guia-incapacidades/panel-incapacidades.html` |

Para publicar: en GitHub, **Settings → Pages → Deploy from a branch → main / (root)**. Espera 1–2 minutos.

## 2. Antes de publicar

1. **Carpeta de OneDrive "Incapacidades"**, distinta a la de hojas de vida. Dentro, el panel crea solo
   Recibidos, Colaboradores, Fuentes y Alertas.
2. **Link de subida:** en OneDrive, sobre la carpeta "Incapacidades" (o "Recibidos"), elige **Solicitar archivos**
   y copia el link. Pruébalo en una ventana de incógnito: debe pedir solo el nombre, sin iniciar sesión.
   Ponlo en `linkSubida` de `index.html` (ya tiene uno puesto: revisa que sea un link de "Solicitar archivos").
3. **Política de datos:** pon el link en `enlacePoliticaDatos` de `index.html` (hoy está vacío).
4. **Texto de autorización** (`textoAutorizacion`): debe revisarlo **Jurídica**, porque son datos de salud.
5. **Link de la app en los mensajes de corrección:** pon la dirección de `index.html` en `enlaceAppColaborador`
   de `panel-incapacidades.html`. Así el mensaje de WhatsApp lleva el link.

## 3. Configuración de la app del colaborador (`index.html`, bloque CONFIGURACIÓN)

| Opción | Qué hace | Hoy |
|---|---|---|
| `linkSubida` | Link "Solicitar archivos" de OneDrive. Obligatorio. | Puesto |
| `enlacePoliticaDatos` | Link a la política de tratamiento de datos | Vacío |
| `enlaceManual` | Manual del colaborador (botón "Ver manual (PDF)") | `manual/Manual_colaborador_Envio_de_incapacidades.pdf` |
| `diasConservacion` | Días que se guarda el avance en un celular propio | 7 |
| `minutosInactividad` | Minutos para borrar todo en un celular prestado | 10 |
| `tamanoMaximoMB` | Peso máximo de cada documento ya comprimido | 2 |
| `tamanoMaximoEntradaMB` | Peso máximo del archivo que elige el colaborador | 30 |
| `paginasMaximas` | Páginas o fotos máximas por documento | 15 |
| `diasNormalesProrroga` | Hasta estos días entre la anterior y la prórroga es lo normal | 7 |
| `diasMaximosProrroga` | Máximo para que sea prórroga, con aviso (Decreto 1427 de 2022: 30 días) | 30 |
| `foto` | Revisión de fotos: tamaño mínimo, nitidez y brillo | 700 / 40 / 90 |
| `textoAutorizacion` | Texto de la autorización de datos | Pendiente de Jurídica |
| `sedesTexto` | Sedes, una por línea (pegar la columna "Descripcion C.O." del Excel) | 38 sedes |
| `tipos`, `documentos` | Tipos de incapacidad y documentos. **No cambies `id` ni `codigo`.** | — |
| `textoCartaPaternidad` | Plantilla de la carta de licencia de paternidad | — |

### Reglas de la prórroga
- Entre el fin de la anterior y el inicio de la prórroga pasan **1 día** (lo normal) **a 7**: la app la acepta.
  Si no empieza al día siguiente, muestra un aviso suave.
- **De 8 a 30 días:** la acepta, con el aviso "Es raro que pasen tantos días: revisa que la fecha esté bien".
- **Más de 30 días:** no la deja como prórroga.
- El panel usa la misma regla y busca la anterior hasta 30 días atrás.
- Hay que confirmar con nómina qué regla usan al marcar "Es prórroga" en el ERP. Si es otra, cambia los dos números
  en **las dos páginas**.

## 4. Configuración del panel (`panel-incapacidades.html`, `CONFIG_PANEL`)

| Opción | Qué hace |
|---|---|
| `carpetas` | Nombres de las subcarpetas (no cambiar si ya hay datos) |
| `diasAlerta` | Días esperando para que el número se ponga rojo (2) |
| `enlaceAppColaborador` | Link de la app, para el mensaje de corrección |
| `alertas` | `umbral30` (30), `avisoPrevio150` (120), `umbral150` (150), `diasActiva` (30) |
| `conceptosIncapacidad` | Conceptos del reporte del ERP que son incapacidades |
| `diasNormalesProrroga`, `diasMaximosProrroga` | Igual que en la app del colaborador |
| `tipos`, `documentos`, `estados`, `motivosRechazo` | Listas del panel |

## 5. Qué llega en el ZIP

`1144098765_018_2026-11-14.zip`, con:
- un PDF por documento: `1144098765_018_01_INCAPACIDAD.pdf`, `…_02_HISTORIA.pdf`…;
- `datos_incapacidad.json` con los datos que llenó el colaborador.

El panel lo abre solo. No hay que descomprimirlo a mano.

## 6. Pruebas antes de abrirlo a todos

1. App: abre `index.html?prueba=1` en un celular Android y en un iPhone. Haz un envío completo con fotos y otro
   con PDF.
2. Haz un envío real de prueba y súbelo con el link. Revisa que llegue a la carpeta.
3. Panel: ábrelo en Chrome, elige la carpeta y pasa a revisión ese ZIP.
4. Deja un reporte de TNL en `Fuentes` y revisa "Reportes ERP".
5. Cuando exista el flujo de Power Automate, envía una alerta de prueba y revisa que pase a "Correo enviado".

## 7. Problemas frecuentes

| Problema | Qué hacer |
|---|---|
| El colaborador no puede terminar el envío | `linkSubida` vacío o mal puesto. |
| El link pide iniciar sesión | No es un link de "Solicitar archivos". Créalo de nuevo. |
| En Instagram o Facebook no descarga | Que abra el link en Chrome o Safari (la app lo avisa). |
| El panel dice "no puede abrir carpetas" | Usar Chrome o Edge en computador. |
| No llega nada a la Bandeja | Esperar la sincronización de OneDrive y tocar Actualizar. Revisar que el link apunte a la carpeta correcta. |
| Una alerta se queda "esperando" | El flujo de Power Automate está apagado o con error, o OneDrive no sincroniza. |
