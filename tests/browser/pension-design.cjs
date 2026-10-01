// Optional browser check: install nothing; use an existing Playwright runtime.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { mkdir } = require('node:fs/promises');
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:63047/prototypes/pension/';
const evidence = process.env.EVIDENCE_DIR;

(async () => {
  const browser = await chromium.launch({
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}),
  });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base);
    const toggle = page.getByRole('button', { name: 'Breakdown', exact: true });
    assert.equal(await page.locator('.option').count(), 2);
    assert.equal(await page.locator('.page-header period-switch').count(), 1);
    assert.equal(await page.locator('footer .support').count(), 1);
    assert.equal(await page.locator('.results-title,.results-controls,.interpretation').count(), 0);
    assert.equal(await page.locator('.result-context').innerText(), '25.0 years’ service');

    for (const width of [320, 375, 768, 960, 1024, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const size of ['default', 'large']) {
        await page.evaluate(value => document.documentElement.dataset.size = value, size);
        const layout = await page.evaluate(() => {
          const rect = selector => document.querySelector(selector).getBoundingClientRect();
          const cards = [...document.querySelectorAll('.option')].map(node => node.getBoundingClientRect());
          const label = rect('[data-action-label]'), button = rect('#calculate');
          return {
            overflow: document.documentElement.scrollWidth > innerWidth,
            aligned: cards.every(card => Math.abs(card.top - rect('.input-panel').top) < 0.1),
            toolsBelow: rect('.comparison-toolbar').top >= rect('.options').bottom,
            periodAbove: rect('period-switch').bottom <= rect('.workspace').top,
            labelCentered: Math.abs(label.x + label.width / 2 - button.x - button.width / 2) < 0.1,
          };
        });
        assert(!layout.overflow && layout.toolsBelow && layout.periodAbove && layout.labelCentered, JSON.stringify({ width, size, layout }));
        if (width > 960) assert(layout.aligned);
      }
    }
    await page.evaluate(() => document.documentElement.dataset.size = 'default');
    await page.getByText('Yearly', { exact: true }).click();
    assert.equal(await page.locator('.amount money-counter').first().getAttribute('aria-label'), '$40,414');
    await toggle.click();
    assert.equal(await page.locator('[data-disclosure-panel]:visible').count(), 2);
    await page.getByLabel('Salary / year · CAD').fill('110,000');
    assert(await page.locator('#stale').isVisible());
    await page.locator('#calculate').click();
    assert.equal(await page.locator('[data-disclosure-panel]:visible').count(), 2);
    assert.equal(await page.locator('period-switch input:checked').inputValue(), 'year');
    await toggle.press('Space');
    assert.equal(await page.locator('[data-disclosure-panel]:visible').count(), 0);
    await toggle.press('Enter');
    assert.equal(await page.locator('[data-disclosure-panel]:visible').count(), 2);
    await page.getByText('Assumptions & sources', { exact: true }).click();
    assert(await page.getByText('Early payments stay reduced after 65.', { exact: false }).isVisible());
    await page.locator('.gap-chip').click();
    await page.locator('#gapYears').press('ArrowUp');
    assert.equal(await page.locator('#gapYears').inputValue(), '0.5');
    await page.getByRole('button', { name: 'Reset', exact: true }).click();
    assert.equal(await page.locator('#birthYear').inputValue(), '');
    assert(!(await page.locator('period-switch').isVisible()));
    await page.evaluate(() => setState('error'));
    assert(await page.locator('#error-summary').isVisible());
    await page.evaluate(() => setState('result'));
    await page.getByText('Monthly', { exact: true }).click();
    await page.locator('h1').click();
    if (evidence) {
      await mkdir(evidence, { recursive: true });
      await page.screenshot({ path: `${evidence}/desktop.png`, fullPage: true });
      await page.setViewportSize({ width: 375, height: 1000 });
      await page.screenshot({ path: `${evidence}/mobile.png`, fullPage: true });
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.evaluate(() => document.body.style.zoom = '2');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await toggle.click();
    assert.equal(await page.locator('[data-disclosure-panel]:visible').count(), 2);
    assert.deepEqual(errors, []);
    console.log('PASS: 12 layouts, panel edges, header period, footer sources, shared disclosure, keyboard, stale/recalculate, wheel, reset/error/recovery, CSS zoom 200%, no JS errors.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
