# Cómo funciona (parte técnica)

## 1. El recorrido completo

```
Colaborador (celular)                 OneDrive "Incapacidades"                    Gestora (panel en PC)
─────────────────────                 ────────────────────────                    ─────────────────────
index.html: datos + documentos  ──►  Recibidos/<cedula>_<tipo>_<fecha>.zip  ──►  Bandeja: "Pasar a revisión"
  (revisa, comprime, quita clave)        (link "Solicitar archivos")                 │
                                                                                    ▼
                                      Colaboradores/<ced>_<NOMBRE>/<fecha>_<tipo>/   Ficha: aprobar/rechazar,
                                        PDF + incapacidad.json                      copiar datos al ERP,
                                                                                    enlazar prórroga, registrar
                                      Fuentes/<reporte TNL>.xlsx  ◄── exporta del ERP la gestora
                                      Alertas/Pendientes/<id>.json ──► Power Automate ──► correo
                                      Alertas/Enviadas | Errores   ◄──────────────┘
                                      control.json (días a mano, alertas no enviadas)
```

## 2. App del colaborador (`index.html`)

**Pasos:**
1. Preguntas iniciales: ¿dispositivo propio? y autorización de datos sensibles.
2. Tus datos: nombre, cédula, celular y sede (lista de 38 sedes en `CONFIG.sedesTexto`).
3. Tu incapacidad:
   - tipo; si es 018, pregunta si fue accidente de tránsito; si es 019, la fecha del accidente;
   - **prórroga primero**, con la fecha final de la anterior;
   - fecha inicial, días y fecha final (se ajustan entre sí);
   - diagnóstico CIE-10, con tutorial.
4. Documentos según el tipo (más FURIPS si fue de tránsito).
5. Descarga del ZIP y subida a OneDrive.

**Archivos:**
- PDF o fotos. La app une las fotos en un PDF.
- Revisa las fotos: borrosa (varianza Laplaciana < 40), oscura (brillo < 90) o pequeña (lado < 700 px).
- Comprime a **2 MB por documento**.
- Si un PDF pesa más de 2 MB o tiene contraseña (prueba con la cédula o la que escriba el colaborador), lo
  rehace página por página con pdf.js + jsPDF.

**Guardado:** en IndexedDB por 7 días, solo si el dispositivo es propio. Si es prestado, se borra a los
10 minutos sin uso.

**Prueba:** `?prueba=1`.

### `datos_incapacidad.json` (dentro del ZIP)

```json
{
  "version": 1, "tipo": "incapacidad",
  "cedula": "1144098765", "nombre": "Laura Gómez", "celular": "3001234567", "sede": "CAÑAVERAL PANCE",
  "codigoTipo": "018", "nombreTipo": "Incapacidad por enfermedad general",
  "accidenteTransito": false, "fechaAccidente": null,
  "fechaInicial": "2026-11-14", "dias": 3, "fechaFinal": "2026-11-16",
  "diagnostico": "J069",
  "prorroga": false, "fechaFinalAnterior": null,
  "autorizacionDatos": { "aceptada": true, "fecha": "2026-11-14T15:20:00.000Z" },
  "generado": "2026-11-14T15:30:00.000Z",
  "archivos": [
    { "documento": "incapacidad", "archivo": "1144098765_018_01_INCAPACIDAD.pdf", "origen": "pdf|fotos",
      "paginas": 1, "comprimido": false, "claveQuitada": false, "fotosConAdvertencia": 0 }
  ]
}
```

`prorroga` y `fechaFinalAnterior` son `null` en las licencias (020 y 021).

## 3. Panel (`panel-incapacidades.html`)

### Carpetas
| Carpeta | Para qué |
|---|---|
| `Recibidos/` | Llegan los ZIP (también se leen los `.zip` sueltos en la raíz y 2 niveles de subcarpetas). |
| `Recibidos/Procesados/` | ZIP ya procesados (no se borran). |
| `Colaboradores/<cedula>_<NOMBRE>/<fechaInicial>_<tipo>/` | PDF + `incapacidad.json`. Versiones reemplazadas en `_anteriores/<fecha_hora>/`. |
| `Fuentes/` | Reporte de TNL del ERP (`.xlsx`, `.xls`, `.csv`). Se usa el **más reciente**; se cachea por nombre + fecha. |
| `Alertas/Pendientes`, `Enviadas`, `Errores` | Archivos de alerta para Power Automate. |
| `control.json` | `acumulados` (días escritos a mano) y `alertas` (las que se decidió no enviar). Se escribe leyendo siempre la versión más reciente. |

### `incapacidad.json`
- `rev`: sube en cada guardado; si al guardar el del disco es distinto → "Otra persona cambió esta incapacidad".
- `estado`: `recibida → revision → correccion → aprobada → registrada` (o `no_procede`).
- `datosOriginales`: lo que mandó el colaborador. Las correcciones de la gestora quedan en los campos principales
  y en la bitácora ("Corrigió X de A a B").
- `documentos[id]`: `{ archivo, huella (SHA-256), revision: pendiente|aprobado|rechazado, motivo, origen, paginas,
  comprimido, claveQuitada, fotosConAdvertencia, recibido }`.
- `erp`: `{ consecTNL, consecAnterior, anterior: { consec, contrato, modo: sugerido|elegido|escrito|manual,
  diasAcumulados }, registrado, registradoPor }`.
- `correcciones[]`, `envios[]` (cada ZIP procesado), `bitacora[]`.

### Revisiones automáticas (ficha)
- Fecha final contra los días.
- Antigüedad: empezó hace más de 30 días, o empieza en el futuro.
- Formato CIE-10.
- Prórroga:
  - salto de 1 a 7 días: ok;
  - de 8 a 30: aviso;
  - de 0 o menos, o más de 30: error.
- Cadena de prórroga: sin anterior, o anterior fuera del histórico.
- Nivel de alerta de la cadena.
- Cruce de fechas con otra incapacidad del mismo colaborador.
- Accidente de tránsito (SOAT/FURIPS).
- Celular válido.

### Datos para el ERP
Van en el orden de la pantalla "Tiempos no laborados / Generales":

Concepto, Fecha inicial, No. días, Fecha final, Empleado (cédula), Nombre, Código de diagnóstico, Clase de
incapacidad, Fecha de accidente (019), Es prórroga, Consecutivo TNL anterior, Total días.

El ERP llena solo el contrato, las horas y la fecha de expedición.

### Reporte del ERP (TNL)
- Se buscan las columnas por nombre:
  - Cédula, Nombres y apellidos, Contrato, Consec.TNL, Estado TNL, Concepto, Desc.Concepto;
  - Fecha Inicial, Fecha Final, Nro.Dias, Clase de incapacidad, Es prorroga, Consec.TNL Anterior.

  Obligatorias: cédula, consecutivo, concepto, fechas y días.
- Solo cuentan los conceptos `018, 019, 020, 021, 042` (`CONFIG_PANEL.conceptosIncapacidad`).
- Las fechas pueden venir como número de Excel o texto dd/mm/aaaa. Los días, con punto o coma.
- **Llave:** `cédula|contrato|consec` (el consecutivo es por colaborador y contrato).
- **Cadena:**
  - Se sigue `Consec.TNL Anterior` hacia atrás.
  - Si el anterior no está, se usa `control.json.acumulados["cedula|consec"]`.
  - Si tampoco hay, la cadena queda "incompleta".
- **Sugerencia de anterior para una prórroga del panel:** misma cédula, que haya terminado entre 1 y 30 días antes.
  Prefiere la que termina justo en "terminó la anterior" y, si no, la más cercana.
- **Doble verificación:** cada incapacidad `registrada` del panel con su `consecTNL` se compara con la fila del
  reporte (concepto, fechas, días, prórroga, consecutivo anterior). Queda en uno de cuatro grupos: coinciden,
  diferencias, no aparecen, o registradas después del reporte.

### Alertas 30/150
- Se cuentan cadenas de prórrogas seguidas, sin licencias, que siguen activas: la última terminó hace 30 días o
  menos (`CONFIG_PANEL.alertas.diasActiva`).
- **Niveles:** `a30` (≥ 30 días), `previo150` (≥ 120), `a150` (≥ 150).
- **Id de la alerta** (nombre del archivo): `<cedula>_<inicioCadena>_<nivel>`, o `<cedula>_m<consec>_<nivel>` si
  la cadena viene de días escritos a mano. Así, la misma alerta nunca se envía dos veces. Si la cadena sube de
  nivel, sale una alerta nueva.

#### JSON que crea el panel en `Alertas/Pendientes/<id>.json`
```json
{
  "version": 1, "id": "16789012_2026-07-12_previo150", "tipo": "previo150", "tipoTexto": "Se acerca a 150",
  "cedula": "16789012", "nombre": "Quintero Ruben Dario", "sede": "",
  "diasCadena": 130, "cadenaCompleta": true, "inicioCadena": "2026-07-12", "finUltima": "2026-11-18",
  "incapacidades": [ { "consec": "8", "concepto": "018", "fechaInicial": "…", "fechaFinal": "…", "dias": 10, "fuente": "ERP" } ],
  "nota": "Se pidió concepto de rehabilitación",
  "creado": "…", "creadoPor": "Natalia Restrepo", "estado": "pendiente"
}
```
No lleva diagnóstico, a propósito. `sede` sale del panel si el colaborador tiene alguna incapacidad ahí. Si no,
va vacía; cuando el panel lea el maestro, se llenará.

#### Flujo de Power Automate (por construir)
1. Disparador: **Cuando se crea un archivo** (OneDrive para la Empresa) en `Incapacidades/Alertas/Pendientes`.
2. **Obtener contenido de archivo** → **Analizar JSON** (esquema: el de arriba).
3. **Condición** sobre `tipo`: `a30` → correo de 30 días; `previo150` / `a150` → correo de 150 días.
   Destinatarios y textos: pendientes de definir (ver `PENDIENTES.md`).
4. **Crear archivo** en `Alertas/Enviadas/<id>.json` con el mismo JSON más
   `"estado": "enviado"`, `"enviado": utcNow()` y `"destinatarios": "…"`.
5. **Eliminar archivo** de `Pendientes`.
6. Si el correo falla (configurar "ejecutar después de: con errores"): crear el archivo en `Alertas/Errores/<id>.json`
   con `"estado": "error"` y `"error": "<mensaje>"`, y eliminar el de `Pendientes`.

Se mueve el archivo en vez de sobrescribirlo en el mismo sitio, para que el flujo no se vuelva a disparar con su
propio cambio. El panel lee las tres carpetas: Pendientes = "Esperando a Power Automate", Enviadas = "Correo
enviado", Errores = "No se pudo enviar" (con Reintentar).
