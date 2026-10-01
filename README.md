# Federal Public Service Pension Estimator

A standalone, English-language planning calculator. Open `index.html` directly in a modern browser. No installation, account, server, internet connection, or build step is required for the calculation. Official source links need an internet connection.

## Run the checks

From this folder, run `node --test tests/*.test.js`. The tests cover specification cases T01–T15, every annual-allowance formula branch, group and service boundaries, salary/AMPE boundaries, decimal gaps, input validation, and presentation behavior.

## Published site and local preview

The released calculator is at [GitHub Pages](https://anxious-rabbit.github.io/RetireCalculator/). GitHub Pages publishes the root of `main` using the existing branch-based configuration. No GitHub Actions workflow or build step is needed. `.nojekyll` keeps publication static.

The canonical application is `index.html`, `styles.css`, and `js/`. It opens with empty inputs. The earlier prototype URL redirects to the main calculator when hosted statically.

Run `python3 scripts/preview.py`, then open <http://127.0.0.1:63047/prototypes/pension/>. This local preview serves the same application with synthetic sample inputs, no caching, and a development-only reload watcher. Edited pages show a reload notice instead of silently discarding input. Preview helpers and the watcher are not enabled on the published page. See [preview notes](prototypes/pension/README.md) for browser checks.

## Release verification

Run the Node tests above and, with an existing Playwright runtime, `node tests/browser/pension-design.cjs` and `node tests/browser/pension-dialog.cjs` against the local preview. Run `RELEASE_URL=https://anxious-rabbit.github.io/RetireCalculator/ node tests/browser/pension-release.cjs` after publication. Set `NODE_PATH` and `PLAYWRIGHT_CHROMIUM_EXECUTABLE` for an externally supplied runtime; no dependency installation or CI is required.

The release check covers an empty initial form, validation, calculation, amount periods, breakdown, decimal gaps, stale results, dialog and all six source links, responsive overflow, no-entitlement results, reset, asset loading, and no answer persistence or third-party requests. It also supports a local project-subpath URL and `file:///.../index.html`. Existing `js/ui.js` and `js/preferences.js` are retained as legacy code for historical regression coverage; the current page does not load them.

Before publishing, inspect the diff and run these checks. Push a fast-forward update to `main`, confirm GitHub Pages reports the matching commit as built, then run the release check on the public URL. To roll back, review and publish a revert restoring the prior release; do not force-push shared history. The release preceding this redesign is `8c20027`.

## Calculation scope

The estimator uses whole retirement and birth years, current salary as a highest-five salary proxy, and $74,600 as a configurable 2026 YMPE-based AMPE proxy. The earliest-payment table holds pensionable service fixed after the selected departure year and illustrates later payment amounts with today's assumptions. It does not calculate exact pension entitlement or an official deferred pension amount. Inputs remain in browser memory and are neither uploaded nor stored.

Update rule constants in `js/config.js`, the displayed review date, source notes, and the tests together when official rules change.

## Change log

- 2026-09-30: Released the approved pension layout, aligned decimal time-away input, shared amount/breakdown controls, and stable assumptions dialog. Local preview now uses the same source as production.

- 2026-09-24: Initial static estimator, comparison, accessibility features, and specification test suite.
- 2026-09-24: Added earliest reduced and unreduced payment ages with fixed service after departure, whole-dollar positive amount guard, and a more compact layout.
- 2026-09-24: Standardized pension amount displays as rounded dollars per year or per month.

