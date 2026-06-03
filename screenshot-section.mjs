import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

// Scroll through to trigger reveal animations
await page.evaluate(async () => {
  for (let y = 0; y <= document.body.scrollHeight; y += 250) {
    window.scrollTo(0, y);
    await new Promise(r => setTimeout(r, 60));
  }
  window.scrollTo(0, 0);
});
await new Promise(r => setTimeout(r, 1500));

// Fleet section
const fleet = await page.evaluateHandle(() => document.querySelector('#fleet'));
await fleet.asElement().screenshot({ path: 'temporary screenshots/fleet-check.png' });

// Hero section (nav + hero)
await page.screenshot({ path: 'temporary screenshots/hero-nav-check.png', clip: { x: 0, y: 0, width: 1440, height: 900 } });

await browser.close();
console.log('Section screenshots saved.');
