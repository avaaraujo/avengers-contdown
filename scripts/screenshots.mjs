// Captures the README screenshots from a running app (production build recommended).
// Usage: npm run build && npx next start -p 3100   then   node scripts/screenshots.mjs http://localhost:3100
import { chromium } from 'playwright-core';

const base = process.argv[2] ?? 'http://localhost:3100';
const out = 'docs/images';
const SEEN = Array.from({ length: 9 }, (_, i) => i + 1); // the first nine films checked off, so the shelf shows both states

const browser = await chromium.launch({
  channel: 'msedge',
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'],
});

async function open(opts, path = '/') {
  const ctx = await browser.newContext({ locale: 'pt-BR', ...opts });
  await ctx.addInitScript(seen => localStorage.setItem('ac-watched', JSON.stringify(seen)), SEEN);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(base + path, { waitUntil: 'networkidle' });
  await page.waitForSelector('#loading.gone', { state: 'attached', timeout: 60000 });
  await page.waitForTimeout(2500);
  return { ctx, page, errors };
}

const desktop = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 };
const phone = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const report = [];

let s = await open(desktop);
await s.page.screenshot({ path: `${out}/shelf-desktop.png` });
await s.page.getByRole('button', { name: 'Lista', exact: true }).click();
await s.page.getByRole('tab', { name: /Séries/ }).click();
await s.page.locator('.xhead').first().click();
await s.page.waitForTimeout(700);
await s.page.screenshot({ path: `${out}/extras-desktop.png` });
report.push(...s.errors); await s.ctx.close();

s = await open(desktop, '/filme/the-avengers');
await s.page.waitForSelector('#page.open.shown', { timeout: 30000 });
await s.page.waitForTimeout(1200);
await s.page.screenshot({ path: `${out}/detail-desktop.png` });
report.push(...s.errors); await s.ctx.close();

s = await open(phone);
await s.page.screenshot({ path: `${out}/shelf-mobile.png` });
report.push(...s.errors); await s.ctx.close();

s = await open(phone, '/filme/black-panther');
await s.page.waitForSelector('#page.open.shown', { timeout: 30000 });
await s.page.waitForTimeout(1200);
await s.page.screenshot({ path: `${out}/detail-mobile.png` });
report.push(...s.errors); await s.ctx.close();

await browser.close();
console.log(report.length ? `console errors:\n${[...new Set(report)].join('\n')}` : 'no console errors');
