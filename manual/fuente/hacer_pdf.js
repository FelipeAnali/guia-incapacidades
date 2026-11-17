// Genera los PDF de los manuales a partir de los HTML (hoja carta, con colores).
// Uso (en esta carpeta):  npm install playwright  →  npx playwright install chromium  →  node hacer_pdf.js
// Necesita internet para la letra Nunito (Google Fonts). Los PDF quedan en la carpeta manual/.
const { chromium } = require('playwright');
const path = require('path');
const MANUALES = [
  ['manual_colaborador.html', '../Manual_colaborador_Envio_de_incapacidades.pdf'],
  ['manual_gestora.html', '../Manual_gestora_Panel_de_incapacidades.pdf'],
];
(async () => {
  const navegador = await chromium.launch();
  const pagina = await navegador.newPage({ viewport: { width: 816, height: 1056 } });
  for (const [html, pdf] of MANUALES) {
    await pagina.goto('file://' + path.join(__dirname, html));
    await pagina.evaluate(() => document.fonts.ready);
    await pagina.waitForTimeout(500);
    await pagina.emulateMedia({ media: 'print' });
    await pagina.pdf({ path: path.join(__dirname, pdf), width: '8.5in', height: '11in', printBackground: true });
    console.log('Listo:', pdf);
  }
  await navegador.close();
})();
