// Erzeugt die druckfertige PDF und Vorschaubilder des Leporellos.
// Aufruf: node docs/leporello/build.js
const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const dir = __dirname;
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 2 });
  await page.goto('file://' + path.join(dir, 'leporello-din-lang.html'), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({ path: path.join(dir, 'leporello-din-lang-druck.pdf'), preferCSSPageSize: true, printBackground: true });

  // Vorschau im Endformat (2 mm Beschnitt rundum abgeschnitten)
  const mm = 96 / 25.4;
  await page.setViewportSize({ width: Math.round(400 * mm), height: Math.round(214 * mm) });
  const sheets = await page.$$('.sheet');
  for (const [i, el] of sheets.entries()) {
    const box = await el.boundingBox();
    await page.screenshot({
      path: path.join(dir, `vorschau-${i === 0 ? 'aussen' : 'innen'}.png`),
      clip: { x: box.x + 2 * mm, y: box.y + 2 * mm, width: 396 * mm, height: 210 * mm },
      scale: 'device', fullPage: true,
    });
  }
  await browser.close();
  console.log('PDF und Vorschau erstellt');
})();
