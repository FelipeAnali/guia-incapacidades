# Pendientes

## Para salir a producción
- [ ] **Jurídica:**
  - [ ] Aprobar `textoAutorizacion` (datos de salud, Ley 1581 de 2012).
  - [ ] Confirmar que se puede usar WhatsApp para pedir correcciones.
  - [ ] Confirmar que los correos de alerta van sin diagnóstico.
- [ ] Poner `enlacePoliticaDatos` en `index.html`.
- [ ] Verificar en incógnito que `linkSubida` sea un link de **Solicitar archivos** y que no pida iniciar sesión.
- [ ] Poner `enlaceAppColaborador` en `panel-incapacidades.html` cuando esté publicada la app.
- [ ] **Nómina:**
  - [ ] Confirmar la regla de prórroga: hoy es normal hasta 7 días y máximo 30 (Decreto 1427 de 2022).
  - [ ] Confirmar el texto de "Clase de incapacidad" para 019, 020 y 021 (hoy: "Accidente de trabajo",
    "Maternidad/Paternidad").
- [ ] Pruebas en celulares reales (Android y iPhone) y un envío real de punta a punta.

## Alertas 30/150 (Power Automate)
- [ ] Definir qué pasa a los **30 días** y a quién le llega el correo.
- [ ] Definir lo mismo para los **150 días**, y si se deja el aviso desde los **120** (`avisoPrevio150`) o se quita.
- [ ] Definir si los destinatarios son fijos o dependen de la sede o el cargo (si dependen, hay que leer el maestro).
- [ ] Construir el flujo (pasos en `COMO_FUNCIONA.md`, sección "Flujo de Power Automate").

## Siguientes fases
- [ ] **Plano del ERP:** hacer la primera carga real en el ERP con un plano descargado del panel y confirmar
  que lo acepta (concepto como texto, cédula como número, columnas vacías).
- [ ] **Leer el maestro de personal** en `Fuentes`, para traer sede, cargo, EPS/ARL y correos.
  Ojo: cruzar la cédula como texto en los dos lados (en el Excel viejo fallaba por número contra texto).
- [ ] Hacer el manual de Gestión Humana del panel de hojas de vida (está en el otro repositorio).

## Hecho recientemente
- Panel: "Para el ERP" descarga el **plano del ERP** en Excel (formato de carga de TNL, 28 columnas).
- Prórroga: de "máximo 7 días" a "normal 7, máximo 30 con aviso" en las dos páginas.
- Panel: Reportes ERP (histórico), cadenas de prórrogas, días escritos a mano, doble verificación.
- Panel: alertas 30/150 con archivos para Power Automate (en cola / enviado / error / reintentar).
- Manual de la gestora (`manual/Manual_gestora_Panel_de_incapacidades.pdf`).
