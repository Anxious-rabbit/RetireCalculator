# Federal Public Service Pension Estimator

A standalone, English-language planning calculator. Open `index.html` directly in a modern browser. No installation, account, server, internet connection, or build step is required for the calculation. Official source links need an internet connection.

## Run the checks

From this folder, run `node --test tests/*.test.js`. The tests cover specification cases T01–T15, every annual-allowance formula branch, group and service boundaries, salary/AMPE boundaries, decimal gaps, input validation, and presentation behavior.

## Interactive design preview

The current design candidate lives in [`prototypes/pension`](prototypes/pension/README.md), on the design branch. It is separate from the released root `index.html` and shares the existing calculation modules.

Run `python3 scripts/preview.py`, then open <http://127.0.0.1:63047/prototypes/pension/>. The server binds only to localhost, disables caching, and redirects old root preview links to this one entry point. Unedited pages reload when source files change; pages with edited inputs show a reload notice so input isn't silently discarded. No form data is stored by the preview watcher.

Use Git commits and diffs to review design revisions. URL query parameters do not select versions. See the prototype README for optional browser checks and the scope of this candidate.

## Calculation scope

The estimator uses whole retirement and birth years, current salary as a highest-five salary proxy, and $74,600 as a configurable 2026 YMPE-based AMPE proxy. The earliest-payment table holds pensionable service fixed after the selected departure year and illustrates later payment amounts with today's assumptions. It does not calculate exact pension entitlement or an official deferred pension amount. Inputs remain in browser memory and are neither uploaded nor stored.

Update rule constants in `js/config.js`, the displayed review date, source notes, and the tests together when official rules change.

## Change log

- 2026-09-24: Initial static estimator, comparison, accessibility features, and specification test suite.
- 2026-09-24: Added earliest reduced and unreduced payment ages with fixed service after departure, whole-dollar positive amount guard, and a more compact layout.
- 2026-09-24: Standardized pension amount displays as rounded dollars per year or per month.

