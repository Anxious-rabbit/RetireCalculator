// Exercise the static release entry, including GitHub Pages' project subpath.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const base = process.env.RELEASE_URL || 'http://127.0.0.1:63048/RetireCalculator/';

(async () => {
  const browser = await chromium.launch({ ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
    ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}) });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    const errors = [], failed = [], requests = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) failed.push(response.url()); });
    page.on('requestfailed', request => failed.push(request.url()));
    page.on('request', request => requests.push(request.url()));
    await page.goto(base);
    assert.equal(await page.locator('#birthYear').inputValue(), '');
    assert.equal(await page.locator('#salary').inputValue(), '');
    assert.equal(await page.locator('#gapYears').inputValue(), '0');
    assert.equal(await page.evaluate(() => typeof window.setState), 'undefined');
    assert.equal(await page.locator('script[src*="preview"]').count(), 0);
    assert(await page.getByText('Fill in your details to begin.', { exact: true }).isVisible());
    await page.locator('#calculate').click();
    assert.equal(await page.locator('#birthYear').getAttribute('aria-invalid'), 'true');
    for (const [id, value] of Object.entries({ birthYear: '1980', serviceStartYear: '2015', retirementYear: '2040', salary: '100,000' })) {
      await page.locator(`#${id}`).fill(value);
    }
    await page.locator('#calculate').click();
    assert.equal(await page.locator('.option').count(), 2);
    assert.equal(await page.locator('.amount money-counter').first().getAttribute('aria-label'), '$3,368');
    await page.getByText('Yearly', { exact: true }).click();
    assert.equal(await page.locator('.amount money-counter').first().getAttribute('aria-label'), '$40,414');
    await page.getByRole('button', { name: 'Breakdown', exact: true }).click();
    assert.equal(await page.locator('[data-disclosure-panel]:visible').count(), 2);
    await page.locator('#gapYears').fill('1.5');
    assert(await page.locator('#stale').isVisible());
    await page.locator('#calculate').click();
    assert.equal(await page.locator('.result-context').innerText(), '23.5 years’ service');
    const trigger = page.getByRole('button', { name: 'Assumptions and sources', exact: true });
    await trigger.click();
    assert(await page.getByRole('dialog').isVisible());
    assert.equal(await page.locator('.source-list a').count(), 6);
    assert((await page.getByRole('dialog').innerText()).includes('Actual AMPE averages'));
    await page.keyboard.press('Escape');
    assert(await trigger.evaluate(el => el === document.activeElement));
    for (const width of [320, 375, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    }
    // No qualifying pension: retain an explicit explanation, never invented $0 cards.
    await page.locator('#gapYears').fill('0');
    await page.locator('#retirementYear').fill('2016');
    await page.locator('#calculate').click();
    assert.equal(await page.locator('.option').count(), 0);
    assert(await page.locator('.placeholder').isVisible());
    await page.getByRole('button', { name: 'Reset', exact: true }).click();
    assert.equal(await page.locator('#salary').inputValue(), '');
    if (base.startsWith('http')) {
      assert.equal(await page.evaluate(() => localStorage.length + sessionStorage.length), 0);
      assert(requests.every(url => url.startsWith(new URL('.', base).href)), 'All page requests stay under the static project URL');
    }
    assert.deepEqual(errors, []);
    assert.deepEqual(failed, []);
    console.log(`PASS: ${base} — empty entry, validation, calculation, periods, shared breakdown, decimal gap/stale state, six sources/modal focus, five widths, no-entitlement state, reset, no persistence or third-party requests, no failed assets or JS errors.`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
