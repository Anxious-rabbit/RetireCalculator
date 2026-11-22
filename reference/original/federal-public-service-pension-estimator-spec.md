# Federal Public Service Pension Estimator — Product and Implementation Specification

**Document status:** Implementation-ready specification  
**Rules reviewed:** 2026-09-24  
**Website language:** English only  
**Product type:** Mobile-first, static, browser-only pension estimator  
**Not affiliated with:** Government of Canada

> **Estimate only — not an official pension calculation.** This website provides a simplified estimate of a federal Public Service Pension Plan benefit. It cannot confirm eligibility, pensionable service, retirement options, tax treatment, insurance, or the amount payable by the Government of Canada. For a decision about retirement, consult your pension statement, MyGCPension, or the Government of Canada Pension Centre.

## 1. Purpose and product boundary

Build a polished, accessible single-page website called **Federal Public Service Pension Estimator**. It helps a person make a simple, private estimate of their pension from four familiar inputs and one optional adjustment.

The visitor enters a birth year, the year they began federal pension-plan service, a planned retirement year, and current annual salary. The page then estimates pensionable service, the applicable pension group, retirement eligibility or reduction, a lifetime pension, a temporary bridge benefit, and the estimated monthly and annual amounts before and after age 65.

This is a planning tool, not a pension-administration tool. Do **not** add accounts, sign-in, a database, a server-side API, analytics that capture form values, payment functionality, or a results-saving feature. Every calculation must run in the visitor’s browser and their inputs must never leave the device.

### In scope

- Federal public service pension-plan estimate using the simplified rules in this document.
- Group 1 or Group 2 classification from the supplied start year.
- Immediate-annuity / annual-allowance / deferred-annuity guidance.
- Reduced annual allowance where an immediate pension is selected and eligible.
- Pension amount, bridge benefit, before-65 and age-65-plus views.
- Nearby retirement-year comparison.
- Plain-English warnings, sources, privacy language, and an explicit disclaimer.

### Explicitly out of scope

- Buyback, pension transfer agreements, prior-service credits, operational-service provisions, correctional-service special rules, medical retirement, workforce-adjustment waivers, transfer values, return of contributions, divorce, survivor benefits, disability, re-employment, indexing, CPP, QPP, OAS, GIS, taxes, insurance, salary history, salary progression, exact dates, Quebec-specific treatment, part-time calculations, and complex leave without pay (LWOP).
- A final eligibility determination or an official pension estimate.

## 2. Authoritative rules and source links

The implementation must preserve these URLs in a visible **Sources and assumptions** section. They are official Government of Canada sources reviewed on 2026-09-24. Links open in a new tab with an accessible indication such as “opens in a new tab.”

1. [Public service pension at a glance](https://www.canada.ca/en/treasury-board-secretariat/services/pension-plan/plan-information/public-service-pension-glance.html) — standard lifetime-pension and bridge-benefit formulas, 35-year maximum, AMPE definition, and bridge ending at 65.
2. [Public service pension options](https://www.canada.ca/en/treasury-board-secretariat/services/pension-plan/plan-information/public-service-pension-options.html) — Group 1/2 eligibility overview and possible benefit types.
3. [Member on or before December 31, 2012 (Group 1)](https://www.canada.ca/en/public-services-procurement/services/pay-pension/public-service-pension-plan/retired/entitlement-information-packages/2-more-years-pensionable-service/member-on-before-december-31-2012.html) — Group 1 annual-allowance eligibility and reduction formulas.
4. [Member on or after January 1, 2013 (Group 2)](https://www.canada.ca/en/public-services-procurement/services/pay-pension/public-service-pension-plan/retired/entitlement-information-packages/2-more-years-pensionable-service/member-on-after-january-1-2013.html) — Group 2 annual-allowance eligibility and reduction formulas.
5. [Pension contribution rates for the 3 major public sector pension plans](https://www.canada.ca/en/treasury-board-secretariat/services/pension-plan/active-members/pension-contribution-rates-major-public-sector-pension-plans.html) — confirms the 2026 CPP YMPE of $74,600.
6. [Annual Allowance](https://www.canada.ca/en/treasury-board-secretariat/services/pension-plan/plan-information/annual-allowance.html) — publishes the Group 1 and Group 2 reduction tables and explicitly says an unreduced bridge benefit is also payable until age 65.

### Rule interpretation used by this estimator

- **Group classification.** Official rules classify members by the date they began *contributing to the pension plan*, not necessarily their hiring date. This simplified website uses **Federal Service Start Year** as a proxy. It must say so plainly and warn that a start year may not equal the pension-plan contribution date.
- **AMPE.** Official AMPE is the average of the CPP/QPP YMPE for the year employment ends and the preceding four years. The site cannot know future values or the visitor’s actual highest-five salary. It therefore uses a disclosed, configurable estimate; it is not an official AMPE.
- **Annual allowance.** The official [Annual Allowance](https://www.canada.ca/en/treasury-board-secretariat/services/pension-plan/plan-information/annual-allowance.html) page explicitly says a person receiving an annual allowance would also receive an **unreduced bridge benefit** until age 65. Apply the early-retirement reduction to the lifetime-pension component only. Do not automatically reduce the bridge benefit.
- **Exact-age caveat.** Official reductions use age and service to the nearest tenth of a year. This website accepts years only, so it intentionally uses whole-year approximation and visibly says so.

## 3. User experience, content, and information architecture

### Primary outcome

Within a few seconds, a non-technical visitor should be able to answer:

> “If I retire in this year, what type of public-service pension might I receive, how much could it be before 65 and from 65 onward, and how would one or two nearby retirement years compare?”

### Page order

1. Header and calm, one-sentence explanation.
2. Prominent estimate-only notice.
3. Input card with four core fields and a closed advanced-options disclosure.
4. Calculate button.
5. Results region (hidden until a valid calculation is made).
6. Nearby retirement-year comparison.
7. Assumptions and what is not included.
8. Privacy statement, disclaimer, official sources, and rule-review date.

### Exact English UI copy

Use the following copy verbatim unless a punctuation or accessibility adjustment is necessary.

#### Header

**Title:** `Federal Public Service Pension Estimator`  
**Intro:** `A simple private estimate based on your age, service, salary, and planned retirement year.`  
**Notice heading:** `Estimate only`  
**Notice text:** `This is a planning estimate, not an official Government of Canada pension calculation. Your pension statement and the Pension Centre are the right sources for a retirement decision.`

#### Form

**Section title:** `Your estimate`  
**Required note:** `All fields marked Required are needed to calculate an estimate.`

| Field label | Control and helper text | Required |
|---|---|---:|
| `Birth year` | Numeric year. Helper: `Used to estimate your age in the retirement year. Because this tool uses years only, your age is approximate.` | Yes |
| `Federal service start year` | Numeric year. Helper: `The year you began federal service. This tool uses it as a proxy for when you began contributing to the pension plan.` | Yes |
| `Planned retirement year` | Numeric year. Helper: `The year you expect to stop working in the federal public service.` | Yes |
| `Current annual salary` | Canadian-dollar currency field. Helper: `Use your current annual full-time salary. This estimate uses it as a proxy for your highest-paid five consecutive years.` | Yes |
| `Advanced options` | Native disclosure/accordion, collapsed initially. | No |
| `Non-pensionable gap (years)` | Decimal numeric field, default `0`, step `0.1`, minimum `0`. Helper: `Enter time between your start and retirement years that does not count toward pensionable service. Do not enter ordinary leave unless you know it was non-pensionable.` | No |

**Button:** `Calculate estimate`  
**Reset link/button:** `Start over`  
**Privacy line beneath form:** `Your information stays on this device. This calculator does not upload or store your answers.`

#### Results

**Results heading:** `Your estimated pension`  
**Eligibility card labels:** `Pension group`, `Estimated retirement age`, `Estimated pensionable service`, `Possible pension option`  
**Before-65 title:** `Estimated annual pension before age 65`  
**Before-65 helper:** `Includes the estimated lifetime pension and temporary bridge benefit, when a bridge benefit is payable.`  
**After-65 title:** `Estimated annual lifetime pension from age 65`  
**After-65 helper:** `The bridge benefit ends at age 65. CPP, QPP, OAS, taxes, and other income are not included.`  
**Monthly label:** `Monthly estimate`  
**Annual label:** `Annual estimate`  
**Breakdown title:** `How this estimate was calculated`  
**Comparison title:** `Compare nearby retirement years`  
**Comparison helper:** `Same salary and assumptions; only the retirement year changes.`

#### Plain-language option messages

- Immediate annuity: `You appear to meet the age and service requirements for an unreduced immediate pension.`
- Annual allowance: `You may be eligible to start a permanently reduced pension immediately. This estimate applies an estimated early-retirement reduction of {reductionPercent}%.`
- Deferred annuity: `You may have earned a pension, but this simplified tool does not show an immediate unreduced pension at this age. A deferred pension may be available at age {normalAge}.`
- Under minimum pensionable-service threshold: `This estimate shows less than 2 years of pensionable service. The usual monthly pension options are not estimated here.`
- Younger than annual-allowance age: `This retirement age is earlier than the minimum age for an annual allowance in your pension group. This tool does not estimate a payment starting immediately.`

#### Required warning copy

`Important: your actual plan group depends on the date you started contributing to the pension plan, which can differ from your federal service start year.`

`This website uses whole years. Official pension calculations may use exact dates, service to the nearest tenth of a year, salary records, and other plan details.`

`The bridge benefit normally ends on the first day of the month after your 65th birthday, or earlier if you become entitled to CPP/QPP disability benefits. This tool does not calculate disability benefits.`

## 4. Text wireframe

```text
┌────────────────────────────────────────────────────────────┐
│ Federal Public Service Pension Estimator                     │
│ A simple private estimate based on your age, service...     │
│ [Estimate only: not an official pension calculation.]       │
├────────────────────────────────────────────────────────────┤
│ Your estimate                                               │
│ Birth year                         [ 1980                 ] │
│ Used to estimate your age...                                 │
│ Federal service start year         [ 2015                 ] │
│ Planned retirement year            [ 2045                 ] │
│ Current annual salary              [ $100,000             ] │
│ ▸ Advanced options                                         │
│   Non-pensionable gap (years)      [ 0.0                  ] │
│ [ Calculate estimate ]       [Start over]                  │
│ Your information stays on this device...                    │
├────────────────────────────────────────────────────────────┤
│ Your estimated pension                                      │
│ Group 2 | Retirement age 65 | Service 30.0 years           │
│ ✓ You appear to meet... unreduced immediate pension.        │
│ ┌─────────────────────┐  ┌──────────────────────────────┐  │
│ │ Before age 65       │  │ From age 65                 │  │
│ │ $XX,XXX / year      │  │ $XX,XXX / year              │  │
│ │ $X,XXX / month      │  │ $X,XXX / month              │  │
│ └─────────────────────┘  └──────────────────────────────┘  │
│ Breakdown: lifetime | bridge | reduction | AMPE assumption  │
│ Compare nearby retirement years [responsive table/cards]    │
├────────────────────────────────────────────────────────────┤
│ Assumptions | Privacy | Estimate-only disclaimer | Sources │
└────────────────────────────────────────────────────────────┘
```

## 5. Calculation model

### 5.1 Configuration constants (centralize in one file)

All constants must live in a named configuration object, with comments and a displayed “rules reviewed” date. Never scatter thresholds through the UI code.

| Constant | Value | Purpose |
|---|---:|---|
| `GROUP_1_LAST_START_YEAR` | `2012` | Simplified proxy: service start on/before 2012 = Group 1. |
| `GROUP_2_FIRST_START_YEAR` | `2013` | Simplified proxy: service start in/after 2013 = Group 2. |
| `MIN_VESTING_SERVICE` | `2` | Threshold used for the simplified monthly-pension guidance. |
| `EARLY_SERVICE_TEST` | `25` | Threshold choosing annual-allowance formula branch. |
| `FULL_SERVICE_TEST` | `30` | Service criterion for early unreduced pension. |
| `PENSION_AMOUNT_SERVICE_CAP` | `35` | Maximum service used to calculate pension amount. |
| `EARLY_REDUCTION_PER_YEAR` | `0.05` | Five percent per year (whole-year approximation). |
| `LIFETIME_LOW_RATE` | `0.01375` | 1.375% of salary up to AMPE. |
| `LIFETIME_HIGH_RATE` | `0.02` | 2% of salary above AMPE. |
| `BRIDGE_RATE` | `0.00625` | 0.625% of salary up to AMPE. |
| `DEFAULT_ESTIMATED_AMPE` | `74600` | A configurable 2026 YMPE-based proxy in CAD, **not** the actual five-year AMPE. |
| `RULES_REVIEWED_DATE` | `2026-09-24` | Display in footer and source section. |

The 2026 CPP YMPE is $74,600. The actual AMPE used in a pension calculation is the average YMPE for the retirement year and four preceding years; therefore $74,600 is only an intentionally conservative/configurable estimator input. Future retirement years must not be represented as using the official future AMPE.

### 5.2 Derived values

Use numeric values internally. Do not round intermediate values except where explicitly stated. Display currency rounded to the nearest dollar by default and show service to one decimal place.

```text
ageAtRetirement = retirementYear - birthYear
calendarService = retirementYear - serviceStartYear
pensionableService = max(0, calendarService - nonPensionableGapYears)
serviceUsedForAmount = min(pensionableService, 35)
```

Rules:

- Calculate **calendar service**, subtract the gap, then apply the 35-year cap. Never cap calendar service before subtracting the gap.
- Use `pensionableService` (not the 35-year-capped amount) for the 25-year and 30-year eligibility/reduction tests.
- The site is a year-level approximation. Do not claim that `ageAtRetirement` is an exact retirement age or that service is exact to a day.

### 5.3 Group selection

```text
if serviceStartYear <= 2012:
    group = Group 1
else:
    group = Group 2
```

Show the result as `Group 1 (estimated)` or `Group 2 (estimated)`, followed by the mandatory contribution-date warning.

### 5.4 Unreduced immediate-annuity eligibility

Use these rules exactly:

| Group | Unreduced immediate annuity when either condition is true |
|---|---|
| Group 1 | `ageAtRetirement >= 60 AND pensionableService >= 2`, **or** `ageAtRetirement >= 55 AND pensionableService >= 30` |
| Group 2 | `ageAtRetirement >= 65 AND pensionableService >= 2`, **or** `ageAtRetirement >= 60 AND pensionableService >= 30` |

If this is true, `reductionPercent = 0` and the option result is `Immediate annuity (unreduced estimate)`.

### 5.5 Annual-allowance availability and reduction logic

This section is mandatory and must be unit-tested branch by branch. It implements the requested simplified year-based reading of the official Group 1 and Group 2 pages.

First determine whether the visitor could be shown an annual allowance:

| Group | Estimated age range | Minimum service |
|---|---|---:|
| Group 1 | age 50 to under 60 | 2 years |
| Group 2 | age 55 to under 65 | 2 years |

If the retirement does not satisfy an unreduced-immediate-annuity condition but is in the matching range, classify it as `Annual allowance (reduced estimate)`. Otherwise, do not invent an immediate payment; show deferred-annuity or out-of-scope guidance.

Let `fivePercent = 0.05`.

#### Group 1 reduction (estimated)

1. If `pensionableService < 25` and `50 <= ageAtRetirement < 60`:

   ```text
   reduction = fivePercent * (60 - ageAtRetirement)
   ```

2. If `pensionableService >= 25` and `50 <= ageAtRetirement < 55`:

   ```text
   age55Reduction = fivePercent * (55 - ageAtRetirement)
   serviceReduction = fivePercent * max(0, 30 - pensionableService)
   reduction = max(age55Reduction, serviceReduction)
   ```

3. If `pensionableService >= 25` and `55 <= ageAtRetirement < 60`:

   ```text
   age60Reduction = fivePercent * (60 - ageAtRetirement)
   serviceReduction = fivePercent * max(0, 30 - pensionableService)
   reduction = min(age60Reduction, serviceReduction)
   ```

#### Group 2 reduction (estimated)

1. If `pensionableService < 25` and `55 <= ageAtRetirement < 65`:

   ```text
   reduction = fivePercent * (65 - ageAtRetirement)
   ```

2. If `pensionableService >= 25` and `55 <= ageAtRetirement < 60`:

   ```text
   age60Reduction = fivePercent * (60 - ageAtRetirement)
   serviceReduction = fivePercent * max(0, 30 - pensionableService)
   reduction = max(age60Reduction, serviceReduction)
   ```

3. If `pensionableService >= 25` and `60 <= ageAtRetirement < 65`:

   ```text
   age65Reduction = fivePercent * (65 - ageAtRetirement)
   serviceReduction = fivePercent * max(0, 30 - pensionableService)
   reduction = min(age65Reduction, serviceReduction)
   ```

Finish all annual-allowance paths with:

```text
reductionPercent = clamp(reduction, 0, 1)
annualAllowanceFactor = 1 - reductionPercent
```

Show the comparison basis in the calculation breakdown, for example: `Estimated reduction: 15.0% (lower of 20.0% for age and 15.0% for service).`

### 5.6 Pension formulas

Use the current annual salary as the simplified estimate of the highest-paid-five average salary.

```text
salaryUpToAmpe = min(currentAnnualSalary, estimatedAmpe)
salaryAboveAmpe = max(currentAnnualSalary - estimatedAmpe, 0)

baseLifetimeAnnual =
    (0.01375 * salaryUpToAmpe * serviceUsedForAmount)
  + (0.02    * salaryAboveAmpe * serviceUsedForAmount)

baseBridgeAnnual =
    0.00625 * salaryUpToAmpe * serviceUsedForAmount
```

Apply the annual-allowance factor to the lifetime component. Keep the bridge component unreduced, as stated on the official Annual Allowance page:

```text
estimatedLifetimeAnnual = baseLifetimeAnnual * annualAllowanceFactor
estimatedBridgeAnnual = baseBridgeAnnual
```

Bridge display rules:

```text
bridgeIsPayable = retirementStartsImmediately AND ageAtRetirement < 65
before65Annual = estimatedLifetimeAnnual + (bridgeIsPayable ? estimatedBridgeAnnual : 0)
after65Annual = estimatedLifetimeAnnual

before65Monthly = before65Annual / 12
after65Monthly = after65Annual / 12
```

If the result is a **deferred annuity**, do not display the retirement-year amount as an immediate income amount. Instead display: `This estimate does not calculate the amount or start date of a deferred pension. Official records and pension options are needed.` A future enhancement may calculate it only after its assumptions are fully specified.

### 5.7 Calculation pseudocode

```text
function estimate(inputs, config):
    validate(inputs)

    age = inputs.retirementYear - inputs.birthYear
    calendarService = inputs.retirementYear - inputs.serviceStartYear
    pensionableService = max(0, calendarService - inputs.gapYears)
    serviceForAmount = min(pensionableService, config.PENSION_AMOUNT_SERVICE_CAP)
    group = inputs.serviceStartYear <= 2012 ? "Group 1" : "Group 2"

    if pensionableService < 2:
        return nonMonthlyPensionGuidance(...)

    if qualifiesForImmediateAnnuity(group, age, pensionableService):
        option = "immediate"
        reduction = 0
    else if canStartAnnualAllowance(group, age):
        option = "annualAllowance"
        reduction = annualAllowanceReduction(group, age, pensionableService)
    else:
        return deferredOrTooEarlyGuidance(...)

    factor = 1 - reduction
    lowSalary = min(inputs.salary, config.estimatedAmpe)
    highSalary = max(inputs.salary - config.estimatedAmpe, 0)
    baseLifetime = (0.01375 * lowSalary + 0.02 * highSalary) * serviceForAmount
    baseBridge = 0.00625 * lowSalary * serviceForAmount

    lifetime = baseLifetime * factor
    bridge = baseBridge
    bridgePayable = age < 65

    return result with annual/monthly lifetime, bridge, before65, after65,
           group, service values, reduction explanation, warnings, and sources
```

## 6. Validation, errors, warnings, and edge cases

### Input validation

- All core fields are required and must be finite numbers.
- Birth, service-start, and retirement fields must be four-digit whole years. Use a sensible inclusive UI range (for example 1900–2100) but do not make a historical rule claim from that range.
- Salary must be greater than `0`; accept a currency-formatted entry such as `$100,000`, normalize it safely, and store a numeric CAD amount.
- Gap must be a number `>= 0`, permit decimals such as `0.5`, and default to `0`.
- `retirementYear` must be greater than `serviceStartYear`; otherwise show: `Your planned retirement year must be after your federal service start year.`
- `retirementYear` must be greater than `birthYear`; otherwise show: `Your planned retirement year must be after your birth year.`
- A gap cannot exceed calendar service; otherwise show: `Your non-pensionable gap cannot be longer than the time between your start and retirement years.`

### Validation behavior

- Use inline error text connected to its field with `aria-describedby`; do not rely on color alone.
- Move focus to a concise error summary only after submit if validation fails.
- Preserve valid entries when correcting an error.
- Do not show a result card if validation fails.

### Warnings (show when applicable)

- Start year is 2012 or 2013: always show the pension-contribution-date warning.
- Pensionable service is at least 35: `This estimate caps service used in the pension formula at 35 years. Actual pensionable service is still used for the 30-year eligibility test.`
- Gap is greater than zero: show calendar service, gap, pensionable service, and service used for amount as separate values.
- Retirement age is below annual-allowance eligibility: explain that no immediate-payment estimate is shown.
- Retirement age is 65 or older: `No bridge benefit is shown because the bridge benefit is not payable after age 65.`
- Salary is materially above the AMPE proxy: `Part of your salary is above the AMPE assumption and uses the 2% formula rate. The actual AMPE depends on the retirement year and the prior four years.`
- Retirement year is beyond the current calendar year: `Future salary, YMPE, and AMPE values are unknown. This estimate holds your current salary and the displayed AMPE proxy constant.`

## 7. Nearby retirement-year comparison

After a valid calculation, show five scenario years:

```text
[retirementYear - 2, retirementYear - 1, retirementYear,
  retirementYear + 1, retirementYear + 2]
```

Exclude a scenario only if it creates an invalid year relationship (for example, retirement is not after service start). Re-run the **same** calculation for every row using the original birth year, start year, salary, gap, and AMPE proxy. Do not model salary growth, contribution changes, or AMPE growth.

On desktop, use a table. On small screens, render each scenario as a labelled card or a responsive table with visible row headers. Mark the chosen year with `Your selected year`.

Columns/cards must contain:

- Retirement year
- Approximate age
- Pensionable service
- Benefit type (`Unreduced`, `Reduced`, `Deferred / not estimated immediately`, or `Not eligible for monthly estimate`)
- Reduction
- Before-65 annual amount, if immediately payable
- From-65 annual lifetime amount, if immediately payable

Do not show comparison amounts where the base scenario logic says an immediate payment is unavailable; use `Not estimated` with a clear reason.

## 8. Accessibility and inclusive design requirements

- Meet WCAG 2.2 AA in the implementation: keyboard access, semantic controls, visible focus, robust labels, sufficient contrast, and readable error feedback.
- Use native `<label>`, `<input>`, `<button>`, `<details>`/`<summary>`, headings in order, and a live results region such as `aria-live="polite"` after successful calculation.
- Do not use placeholder text as the only label. Place currency format examples in helper text, not as unlabeled visual decoration.
- Ensure the calculate button, reset control, disclosure, source links, and comparison controls work by keyboard alone.
- Respect `prefers-reduced-motion`; avoid decorative animation that delays or obscures results.
- Use clear language around age, salary, disability, and retirement. Do not suggest that the calculation is a benefit entitlement.
- Format CAD using `Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 })`; retain cents internally if needed. Screen-reader text should make the amount unambiguous.

## 9. Visual and responsive design guidance

Aim for a trustworthy, modern financial-planning tool, not an institutional portal and not a spreadsheet.

- **Mobile first:** single column by default; fields are full width; a minimum 44×44 px touch target; calculate button is full width on narrow screens.
- **Layout:** comfortably constrained content width (roughly 680–960px) with generous whitespace. On wider screens, place the two headline result cards side by side.
- **Palette:** calm navy/blue for structure, off-white background, white cards, one restrained teal or green accent for confirmed/unreduced status, and an amber/blue information treatment for warnings. Ensure contrast independently passes AA.
- **Typography:** system font stack; title strong but not oversized; plain 16px-or-larger body text; tabular figures for money values when useful.
- **Cards:** subtle border and shadow, 12–16px radius, no gradients required, no stock photos, no dashboards full of tiny charts.
- **Priority:** the two income states—before 65 and from 65—must be the most visually prominent values. State clearly that neither includes CPP/QPP/OAS/tax.
- **Avoid:** jargon in field labels, dense legal copy above the form, marketing language, flashy counters, auto-submission, tooltips essential for understanding, and horizontal page scrolling.

## 10. Suggested static file structure

```text
federal-public-service-pension-estimator/
├── index.html
├── styles.css
├── js/
│   ├── config.js              # Rules date, thresholds, AMPE proxy; no UI code
│   ├── pension-calculator.js  # Pure calculation functions, no DOM access
│   ├── validation.js          # Parsing and validation
│   ├── ui.js                  # Render form results, errors, comparison table
│   └── app.js                 # Event binding and application bootstrap
├── tests/
│   └── pension-calculator.test.js
├── README.md
└── LICENSE
```

Implementation notes:

- Use plain HTML, CSS, and modern vanilla JavaScript; a framework and build step are unnecessary for this small, static app.
- Keep calculation functions deterministic and side-effect free so they can be unit-tested independently of the browser.
- Put the AMPE proxy in `config.js`, show it in the assumptions panel, and make it easy for a future maintainer to update.
- Do not include third-party scripts, web fonts, cookies, trackers, or form-post endpoints by default.

## 11. Test cases

All calculator tests should use `estimatedAmpe = 74600`, salary and output amounts in CAD, and allow a small floating-point tolerance before display rounding.

| ID | Inputs: birth / start / retirement / salary / gap | Expected result |
|---|---|---|
| T01 | 1980 / 2015 / 2045 / 100000 / 0 | Group 2; age 65; service 30; unreduced immediate annuity; no bridge; lifetime = `0.01375×74600×30 + 0.02×25400×30 = $46,012.50/year`; monthly $3,834.375 before display rounding. |
| T02 | 1970 / 1995 / 2025 / 100000 / 0 | Group 1; age 55; service 30; unreduced immediate annuity; bridge payable; lifetime $46,012.50/year; bridge `0.00625×74600×30 = $13,987.50/year`; before-65 total $60,000/year. |
| T03 | 1975 / 2000 / 2028 / 90000 / 0 | Group 1; age 53; service 28; annual allowance; ≥25 and age 50–<55; max(age-55 reduction 10%, service reduction 10%) = 10%; apply factor 90% to lifetime only; bridge remains unreduced. |
| T04 | 1970 / 2000 / 2028 / 80000 / 0 | Group 1; age 58; service 28; annual allowance; ≥25 and age 55–<60; min(age-60 reduction 10%, service reduction 10%) = 10%. |
| T05 | 1975 / 2005 / 2028 / 80000 / 0 | Group 1; age 53; service 23; annual allowance; <25; 5%×(60−53) = 35%. |
| T06 | 1980 / 2015 / 2038 / 85000 / 0 | Group 2; age 58; service 23; annual allowance; <25; 5%×(65−58) = 35%. |
| T07 | 1978 / 2000 / 2036 / 95000 / 5 | Group 1; age 58; calendar 36; pensionable 31; unreduced immediate annuity through age 55 + 30 service; service used = 31. Verify gap is deducted before capping. |
| T08 | 1980 / 2013 / 2040 / 90000 / 0 | Group 2; age 60; service 27; annual allowance; ≥25 age 60–<65; min(age-65 25%, service 15%) = 15%. |
| T09 | 1980 / 2013 / 2040 / 90000 / 3 | Group 2; age 60; service 24; annual allowance; <25; 5%×(65−60) = 25%. |
| T10 | 1970 / 1980 / 2020 / 90000 / 3 | Group 1; pensionable 37; amount-service cap 35; eligibility service remains 37; display cap warning. |
| T11 | 1990 / 2020 / 2040 / 70000 / 0 | Group 2; age 50; too young for annual allowance; do not show immediate-payment amount. |
| T12 | 1980 / 2020 / 2022 / 70000 / 0 | service 2 but age 42; deferred/too-early guidance, no immediate payment. |
| T13 | 1980 / 2020 / 2021 / 70000 / 0 | service 1; show less-than-two-years monthly-estimate guidance. |
| T14 | 1980 / 2020 / 2030 / 70000 / 11 | invalid: gap exceeds 10 calendar-service years. |
| T15 | 1980 / 2020 / 2020 / 70000 / 0 | invalid: retirement year must be after service start year. |

Also test boundary years/ages: start year `2012` vs `2013`; 25.0 service; 30.0 service; 35.0 and 35.1 service; ages 50, 55, 60, and 65; salary exactly at AMPE; salary below AMPE; salary above AMPE; zero gap; and decimal gap `0.5`.

## 12. Deployment and maintenance

The output is a static site. Any of the following hosts is suitable:

| Host | Deployment approach |
|---|---|
| GitHub Pages | Put the site in a GitHub repository; configure Pages to deploy from the chosen branch/folder; share the generated HTTPS URL. |
| Cloudflare Pages | Connect a Git repository or upload the static output; set the output directory to the project root if there is no build step. |
| Netlify | Connect a repository or drag-and-drop the static site folder; no server functions are needed. |

For all options:

- The owner’s computer does **not** need to remain on. The host serves the files.
- No visitor login is required; users simply open the public HTTPS link.
- Configure no form submission, no database, and no serverless function.
- Before publishing, verify the public page over HTTPS on iPhone/Android-size and desktop-size viewports, with JavaScript enabled and a keyboard-only pass.
- After a pension-rule update, update the central configuration, review calculation tests, change the displayed review date, and publish again. Keep a short change log in `README.md`.

## 13. Acceptance criteria

The implementation is ready to deliver only when all of the following are true:

- The site is a responsive static website with no login, database, backend, form-posting, or storage of pension inputs.
- Every user-facing string is English, clear, and appropriate for a non-technical visitor.
- The four core inputs and decimal non-pensionable-gap option are present with the specified helper text.
- Gap is deducted from calendar service before the 35-year amount cap; actual pensionable service is used for the 30-year test.
- Group 1/2 classification, unreduced eligibility, and every Group 1/Group 2 annual-allowance branch match Sections 5.3–5.5.
- Annual-allowance reductions are applied to the lifetime portion only; the bridge remains unreduced, with the calculation explanation visible.
- The site distinguishes a temporary before-65 total from a from-65 lifetime-pension total, and does not imply that CPP/QPP/OAS is included.
- Bridge benefit is shown only for an immediately payable retirement before age 65 and is labelled as temporary to age 65.
- The official-source links, AMPE-proxy disclosure, privacy text, review date, and prominent estimate-only disclaimer are visible.
- Validation covers invalid ordering, negative/oversized gaps, missing fields, and non-positive salary without losing valid user entries.
- The results are keyboard-accessible and announced after calculation; contrast, focus styles, labels, error messages, and responsive comparisons meet the accessibility requirements.
- All named test cases pass, including boundaries and decimal-gap tests.
- The page is manually checked on a narrow mobile viewport and a desktop viewport, has no horizontal overflow, and needs no technical knowledge to use.

## 14. Final footer copy

Use this text at the bottom of the page:

`Privacy: Your answers are calculated locally in your browser. This website does not upload, save, or share them.`

`Estimate only: This independent tool is not the Government of Canada and does not provide an official pension estimate or retirement advice. Pension rules and amounts can change. Confirm your situation with your pension records and the Government of Canada Pension Centre.`

`Rules and sources reviewed: September 24, 2026.`
