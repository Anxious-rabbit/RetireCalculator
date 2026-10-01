# Pension preview and design history

The approved design has been promoted to the root application. Edit `index.html`, `styles.css`, and `js/`; this directory no longer holds a second implementation. Its static `index.html` redirects to the main page. The local preview server serves the root application at the stable preview URL, with sample inputs and a development watcher injected only for local review.

## Decision and layout

Question: can the comparison remain easy to scan while preserving panel alignment and removing the detached block of controls below the results?

The current direction uses a page-level Monthly/Yearly switch alongside the title. The input panel and both result cards share their top edge. A single row below the results contains pensionable service and the shared Breakdown button. Estimate remains an accessible region heading but is visually hidden. A small information button after the Rules reviewed date opens a native modal dialog containing assumptions, official sources, and the explanation of permanent early-payment reductions; each option still displays its reduction percentage. The footer stays one compact metadata group instead of expanding into paragraphs.

Time away is a permanently visible decimal input, aligned with the right-hand form fields. There is no wheel or expandable editor. Desktop form and result panels share one grid row, aligning both top and bottom edges without a fixed height; expanded details can grow that row.

Preserved interactions include one button for both breakdowns, centered Calculate/Recalculate labels, a sliding arrow followed by animated amounts, and instant values with reduced motion. The background uses local WebGL with a static CSS fallback. No third-party assets or package installation are needed to run it.

## Preview and revisions

From the repository root:

```sh
python3 scripts/preview.py
```

Open <http://127.0.0.1:63047/prototypes/pension/>. Root links, including old `?v=...` links, redirect here. The source fingerprint detects actual file changes; it is not a release/version selector. Unedited pages reload automatically. Edited pages retain their current state and show a reload button, explicitly warning that reloading resets inputs. The preview watcher is injected by the local server and is not imported by the static app.

Review and compare Git commits to identify revisions. Continue edits in the root application. Open the root `index.html` directly for static use without sample inputs or the development watcher.

The initial form values are a synthetic review scenario: birth 1980, joined 2015, departure 2040, salary CAD 100,000. Inputs are not persisted. The test-only `setState('empty' | 'result' | 'stale' | 'error')` helper is exposed only in the local preview. The released page starts empty.

## Verification

Core regressions:

```sh
node --test tests/*.test.js
```

Optional browser checks, using an already available Playwright installation:

```sh
node tests/browser/pension-design.cjs
node tests/browser/pension-dialog.cjs
RELEASE_URL=https://anxious-rabbit.github.io/RetireCalculator/ node tests/browser/pension-release.cjs
```

Set `NODE_PATH` if Playwright is supplied outside this repository, `PLAYWRIGHT_CHROMIUM_EXECUTABLE` if using an existing non-default browser binary, and `EVIDENCE_DIR` to save screenshots. `PREVIEW_URL` can select another port/server. No CI workflow or package dependency is added.

Observed in Chromium headless on macOS: 320, 375, 768, 960, 1024, 1440px at default and large text; aligned desktop panel top and bottom edges; header period selector; footer information button; no horizontal overflow; shared disclosure with click/Space/Enter; period and expanded state after recalculation; stale inputs; direct decimal gap input (1.5 and 1.25), invalid/negative/excessive gaps with field focus; reset, validation failure and recovery; CSS zoom 200%. All 31 existing Node tests pass. The browser suite records the checks rather than claiming all production qualities from a screenshot.

Dialog verification: 320/375/768/1024/1440px at default and large text. Opening and closing leave document height, panel geometry, and page scroll unchanged; long content scrolls inside the bounded dialog. Escape, close button, intentional backdrop click, keyboard focus wrapping and return, reduced motion, empty/reset state and current calculation context pass. The original expanding disclosure increased document height from 780px to 1070px in the test viewport; horizontal movement was not reproduced with that headless browser’s default scrollbar mode. Stable root scrollbar space and scroll locking are covered by the new geometry checks.

Not verified: Safari/Firefox, physical touch devices, native browser-chrome zoom, assistive-technology speech, hardware rendering performance, and a fresh audit of pension rules. The formula regression tests verify existing behavior, not legal or financial completeness. Real-device interaction coverage remains unverified. The release smoke check verifies the integrated static page separately.

## Disposition

The owner approved completing, committing, pushing, and deploying this design to the existing GitHub Pages site. The production entry and local preview now share one implementation. Earlier Git commits and screenshots retain the design history.
