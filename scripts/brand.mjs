// Renders the brand assets (app icons and the social card) from scripts/brand/*.html with a local Edge/Chrome.
// Usage: node scripts/brand.mjs
import { chromium } from 'playwright-core';
import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const browser = await chromium.launch({ channel: 'msedge' });
const shot = async (file, w, h) => {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.goto(pathToFileURL(resolve('scripts/brand', file)).href);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  const png = await page.screenshot();
  await page.close();
  return png;
};

const icon = await shot('icon.html', 512, 512);
await sharp(icon).toFile('src/app/icon.png');
await sharp(icon).resize(180, 180).toFile('src/app/apple-icon.png');

// favicon.ico: PNG-compressed entries at 16, 32 and 48 px
const sizes = [16, 32, 48];
const pngs = await Promise.all(sizes.map(s => sharp(icon).resize(s, s).ensureAlpha().png().toBuffer()));
const head = Buffer.alloc(6); head.writeUInt16LE(1, 2); head.writeUInt16LE(sizes.length, 4);
let offset = 6 + 16 * sizes.length;
const dir = pngs.map((png, i) => {
  const e = Buffer.alloc(16); e[0] = sizes[i]; e[1] = sizes[i]; e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6); e.writeUInt32LE(png.length, 8); e.writeUInt32LE(offset, 12);
  offset += png.length; return e;
});
await writeFile('src/app/favicon.ico', Buffer.concat([head, ...dir, ...pngs]));

const og = await shot('og.html', 1200, 630);
await sharp(og).png({ compressionLevel: 9 }).toFile('src/app/opengraph-image.png');
await sharp(og).png({ compressionLevel: 9 }).toFile('src/app/twitter-image.png');
await writeFile('src/app/opengraph-image.alt.txt', 'Avengers Countdown: uma estante de gibis em 3D para maratonar o MCU até a estreia de Vingadores: Doutor Destino');
await writeFile('src/app/twitter-image.alt.txt', 'Avengers Countdown: uma estante de gibis em 3D para maratonar o MCU até a estreia de Vingadores: Doutor Destino');
await browser.close();
console.log('brand assets written');
