# Pension design candidate

This is a runnable design candidate, not the released root page. Its source is now part of the repository so browser feedback can result in reviewable Git changes. It imports `../../js/config.js`, `pension-calculator.js`, and `validation.js`; no second copy of the financial formulas is maintained here.

## Decision and layout

Question: can the comparison remain easy to scan while preserving panel alignment and removing the detached block of controls below the results?

The current direction uses a page-level Monthly/Yearly switch alongside the title. The input panel and both result cards share their top edge. A single row below the results contains pensionable service and the shared Breakdown button. Estimate remains an accessible region heading but is visually hidden. Assumptions, official sources, and the explanation of permanent early-payment reductions live in the page footer; each option still displays its reduction percentage.

Time away is a permanently visible decimal input, aligned with the right-hand form fields. There is no wheel or expandable editor. Desktop form and result panels share one grid row, aligning both top and bottom edges without a fixed height; expanded details can grow that row.

Preserved interactions include one button for both breakdowns, centered Calculate/Recalculate labels, a sliding arrow followed by animated amounts, and instant values with reduced motion. The background uses local WebGL with a static CSS fallback. No third-party assets or package installation are needed to run it.

## Preview and revisions

From the repository root:

```sh
python3 scripts/preview.py
```

Open <http://127.0.0.1:63047/prototypes/pension/>. Root links, including old `?v=...` links, redirect here. The source fingerprint detects actual file changes; it is not a release/version selector. Unedited pages reload automatically. Edited pages retain their current state and show a reload button, explicitly warning that reloading resets inputs. The preview watcher is injected by the local server and is not imported by the static app.

Review and compare Git commits to identify revisions. Continue edits in this directory rather than the earlier external scratch folder. The prototype can also be opened through `index.html` directly for static use, without the development watcher.

The initial form values are a synthetic review scenario: birth 1980, joined 2015, departure 2040, salary CAD 100,000. Inputs are not persisted. The test-only `setState('empty' | 'result' | 'stale' | 'error')` helper remains available in the page.

## Verification

Core regressions:

```sh
node --test tests/*.test.js
```

Optional browser checks, using an already available Playwright installation:

```sh
node tests/browser/pension-design.cjs
```

Set `NODE_PATH` if Playwright is supplied outside this repository, `PLAYWRIGHT_CHROMIUM_EXECUTABLE` if using an existing non-default browser binary, and `EVIDENCE_DIR` to save screenshots. `PREVIEW_URL` can select another port/server. No CI workflow or package dependency is added.

Observed in Chromium headless on macOS: 320, 375, 768, 960, 1024, 1440px at default and large text; aligned desktop panel top and bottom edges; header period selector; footer sources; no horizontal overflow; shared disclosure with click/Space/Enter; period and expanded state after recalculation; stale inputs; direct decimal gap input (1.5 and 1.25), invalid/negative/excessive gaps with field focus; reset, validation failure and recovery; CSS zoom 200%. All 31 existing Node tests pass. The browser suite records the checks rather than claiming all production qualities from a screenshot.

Not verified: Safari/Firefox, physical touch devices, native browser-chrome zoom, assistive-technology speech, hardware rendering performance, and a fresh audit of pension rules. The formula regression tests verify existing behavior, not legal or financial completeness. Real-device interaction coverage and production integration remain separate work.

## Disposition

Retain this candidate for interactive review. The simplified hierarchy and interaction checks support continuing with this structure; visual preference remains the owner's decision. Do not publish, merge into the released page, or remove the old evidence as an automatic consequence of running the preview.
