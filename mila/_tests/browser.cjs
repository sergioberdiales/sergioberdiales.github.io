const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
(async () => {
  const dataContext = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../chistes.js'), 'utf8'), dataContext);
  const data = dataContext.window.MILA_DATA;
  assert.equal(data.chistes.length, 50);
  assert.equal(new Set(data.chistes).size, 50);
  const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  const url = process.env.MILA_URL || 'http://127.0.0.1:8765/mila/';
  await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
  await page.goto(url);
  await page.clock.pauseAt(new Date("2026-01-01T00:00:10Z"));
  const seen = [await page.locator('#joke').textContent()];
  for (let i = 1; i <= 50; i++) {
    await page.locator('#generate').evaluate(b => { for (let j = 0; j < 10; j++) b.click(); });
    assert.equal(await page.locator('#generate').textContent(), 'Mila está pensando…');
    await page.clock.runFor(549);
    assert.equal(await page.locator('#joke').textContent(), seen.at(-1));
    await page.clock.runFor(1);
    const text = await page.locator('#joke').textContent();
    if (i < 50) { assert(!seen.includes(text)); seen.push(text); }
    else assert.equal(text, data.despedida);
  }
  assert.deepEqual([...seen].sort(), [...data.chistes].sort());
  await page.locator('#generate').evaluate(b => b.click());
  await page.clock.runFor(1000);
  assert.equal(await page.locator('#joke').textContent(), data.despedida);
  assert.equal(await page.locator('#generate').getAttribute('aria-disabled'), 'true');
  for (const width of [320, 390, 700, 701, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const text of [...data.chistes, data.despedida]) {
      await page.locator('#joke').evaluate((el, value) => el.textContent = value, text);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Overflow at ${width}`);
      const fits = await page.locator('#joke').evaluate(el => { const r = el.getBoundingClientRect(); const b = el.parentElement.getBoundingClientRect(); return r.bottom <= b.bottom && r.right <= b.right; });
      assert(fits, `Bubble overflow at ${width}`);
    }
    if ([390, 1440].includes(width)) await page.screenshot({ path: `/tmp/mila-${width}.png`, fullPage: true });
  }
  await page.reload();
  assert(data.chistes.includes(await page.locator('#joke').textContent()));
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'generate');
  await page.keyboard.press('Enter');
  await page.clock.runFor(600);
  assert.equal(await page.evaluate(() => document.activeElement.id), 'generate');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  assert.equal(await page.locator('#joke').evaluate(el => getComputedStyle(el).animationName), 'none');
  assert.equal(await page.locator('img').evaluate(el => el.naturalWidth), 1536);
  assert.deepEqual(errors, []);
  await browser.close();
  console.log('PASS: 50 exact unique jokes, timing, duplicate clicks, farewell, reload, keyboard, reduced motion, image, 7 viewport widths × 51 texts; no JS errors.');
})().catch(e => { console.error(e); process.exit(1); });
