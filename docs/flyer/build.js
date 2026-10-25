// Erzeugt die druckfertige PDF und Vorschaubilder des Flyers.
// Aufruf: node docs/flyer/build.js [flyer-din-lang | flyer-b-din-lang]
const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const dir = __dirname;
  const name = process.argv[2] || 'flyer-din-lang';
  const url = 'file://' + path.join(dir, name + '.html');
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 3 });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({ path: path.join(dir, name + '-druck.pdf'), preferCSSPageSize: true, printBackground: true });

  // Vorschau: Endformat ohne Beschnitt (2 mm rundum abgeschnitten)
  const mm = 96 / 25.4;
  await page.setViewportSize({ width: Math.round(103 * mm), height: Math.round(214 * mm) });
  const pages = await page.$$('.page');
  for (const [i, el] of pages.entries()) {
    const box = await el.boundingBox();
    await page.screenshot({
      path: path.join(dir, `vorschau${name === 'flyer-din-lang' ? '' : '-' + name.split('-')[1]}-${i === 0 ? 'vorne' : 'hinten'}.png`),
      clip: { x: box.x + 2 * mm, y: box.y + 2 * mm, width: 99 * mm, height: 210 * mm },
      scale: 'device', fullPage: true,
    });
  }
  await browser.close();
  console.log('PDF und Vorschau erstellt');
})();
