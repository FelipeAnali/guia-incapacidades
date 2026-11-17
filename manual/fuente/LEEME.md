# Manuales — cómo editarlos

| Manual | HTML | Imágenes | PDF |
|---|---|---|---|
| Colaborador | `manual_colaborador.html` | `img/` | `../Manual_colaborador_Envio_de_incapacidades.pdf` |
| Gestora (panel) | `manual_gestora.html` (estilo en `estilo_manual.css`) | `img_gestora/` | `../Manual_gestora_Panel_de_incapacidades.pdf` |

- Cada `<section class="pagina">` es una hoja carta. Cambia los textos en el HTML y míralo en Chrome.
- Para cambiar un pantallazo, reemplaza la imagen con el **mismo nombre**.
  - Colaborador: `index.html?prueba=1` en vista de celular (390 px).
  - Gestora: panel → "Abrir carpeta de ejemplo", en una ventana de 1280 × 800.
- En el manual de la gestora, `.pantalla.recorte-alto` muestra solo una parte del pantallazo:
  `--alto` es el alto visible, y `--x` / `--y` dicen qué parte se ve.
- Generar los PDF: `node hacer_pdf.js`. Otra forma: en Chrome, Ctrl + P → Guardar como PDF, tamaño Carta,
  márgenes Ninguno y "Gráficos de fondo" marcado.
- Todos los pantallazos tienen datos inventados.
