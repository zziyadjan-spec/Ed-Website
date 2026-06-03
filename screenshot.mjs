import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const url    = process.argv[2] || 'http://localhost:3000';
const label  = process.argv[3] ? `-${process.argv[3]}` : '';
const outDir = path.join(__dirname, 'temporary screenshots');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Auto-increment: find next unused N
let n = 1;
while (fs.existsSync(path.join(outDir, `screenshot-${n}${label}.png`))) n++;
const outPath = path.join(outDir, `screenshot-${n}${label}.png`);

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });

// Scroll through page to trigger IntersectionObserver reveals
await page.evaluate(async () => {
  await new Promise(resolve => {
    let y = 0;
    const step = 400;
    const delay = 80;
    const timer = setInterval(() => {
      window.scrollBy(0, step);
      y += step;
      if (y >= document.body.scrollHeight) {
        window.scrollTo(0, 0);
        clearInterval(timer);
        resolve();
      }
    }, delay);
  });
});

// Let reveals and fonts settle
await new Promise(r => setTimeout(r, 1200));

await page.screenshot({ path: outPath, fullPage: true });
await browser.close();

console.log(`Screenshot saved: ${outPath}`);
