const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { mkdir } = require('node:fs/promises');
(async () => {
  const browser = await chromium.launch({ ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}) });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 780 }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(process.env.PREVIEW_URL || 'http://127.0.0.1:63047/prototypes/pension/');
    const trigger = page.getByRole('button', { name: 'Assumptions and sources', exact: true });
    const dialog = page.getByRole('dialog');
    const geometry = () => page.evaluate(() => ({
      pageHeight: document.documentElement.scrollHeight,
      scroll: scrollY,
      panels: [...document.querySelectorAll('.input-panel,.option')].map(node => {
        const r = node.getBoundingClientRect();
        return [r.left, r.top, r.width, r.height];
      }),
    }));
    for (const width of [320, 375, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: width < 768 ? 640 : 780 });
      for (const size of ['default', 'large']) {
        await page.evaluate(size => document.documentElement.dataset.size = size, size);
        await trigger.scrollIntoViewIfNeeded();
        const before = await geometry();
        await trigger.click();
        assert(await dialog.isVisible());
        assert.deepEqual(await geometry(), before, 'Opening must not move or resize the page');
        const state = await dialog.evaluate(el => {
          const box = el.getBoundingClientRect();
          return { inside: box.left >= 0 && box.right <= innerWidth && box.top >= 0 && box.bottom <= innerHeight,
            focusInside: el.contains(document.activeElement),
            fits: el.scrollWidth <= el.clientWidth,
            motion: el.getAnimations().length,
            bodyScrollable: el.querySelector('.dialog-body').scrollHeight > el.querySelector('.dialog-body').clientHeight };
        });
        assert(state.inside && state.focusInside && state.fits);
        assert.equal(state.motion, 0);
        if (width === 320 && size === 'large') assert(state.bodyScrollable);
        await page.keyboard.press('Shift+Tab');
        assert(await dialog.evaluate(el => el.contains(document.activeElement)));
        await page.keyboard.press('Tab');
        assert(await dialog.evaluate(el => el.contains(document.activeElement)));
        await page.mouse.wheel(0, 300);
        assert.equal((await geometry()).scroll, before.scroll);
        await page.keyboard.press('Escape');
        await dialog.waitFor({ state: 'hidden' });
        assert.deepEqual(await geometry(), before, 'Closing must restore the same geometry');
        assert(await trigger.evaluate(el => el === document.activeElement));
      }
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.evaluate(() => document.documentElement.dataset.size = 'default');
    await trigger.click();
    await page.mouse.click(4, 4);
    await dialog.waitFor({ state: 'hidden' });
    assert(await trigger.evaluate(el => el === document.activeElement));
    await page.getByRole('button', { name: 'Reset', exact: true }).click();
    await trigger.click();
    assert(await dialog.isVisible());
    assert(!(await page.locator('#calculation-context').isVisible()));
    assert.equal(await page.locator('#assumed-ampe').innerText(), '$74,600');
    await page.getByRole('button', { name: 'Close assumptions', exact: true }).click();
    await page.evaluate(() => setState('result'));
    await trigger.click();
    assert((await page.locator('#calculation-context').innerText()).includes('$100,000'));
    if (process.env.EVIDENCE_DIR) {
      await mkdir(process.env.EVIDENCE_DIR, { recursive: true });
      await page.screenshot({ path: `${process.env.EVIDENCE_DIR}/dialog-desktop.png` });
      await page.getByRole('button', { name: 'Close assumptions', exact: true }).click();
      await page.screenshot({ path: `${process.env.EVIDENCE_DIR}/page-desktop.png`, fullPage: true });
      await page.setViewportSize({ width: 375, height: 760 });
      await trigger.click();
      await page.screenshot({ path: `${process.env.EVIDENCE_DIR}/dialog-mobile.png` });
    }
    assert.deepEqual(errors, []);
    console.log('PASS: 10 viewport/type cases with unchanged page geometry and scroll; bounded dialog and internal scroll; keyboard focus containment/return, Escape, close button, backdrop; reduced motion; reset and current calculation context.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
