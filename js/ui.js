const PensionUI = (() => {
  const money = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 });
  const years = value => `${value.toFixed(1)} years`;
  const reduction = value => value == null ? 'Not estimated' : `${(value * 100).toFixed(1)}%`;
  const amount = value => `<span class="amount-pair"><span class="year-amount"><strong>${money.format(value)}</strong> <small>/ year</small></span><span class="month-amount">or ${money.format(value / 12)} / month</span></span>`;
  const optionLabel = option => ({ immediate: 'Unreduced pension', annualAllowance: 'Reduced pension', deferred: 'No immediate payment', notEligible: 'No monthly estimate' })[option];
  const comparisonLabel = option => ({ immediate: 'Unreduced', annualAllowance: 'Reduced', deferred: 'Deferred / not estimated immediately', notEligible: 'Not eligible for monthly estimate' })[option];

  function optionMessage(r) {
    if (r.option === 'immediate') return 'Unreduced payments may start when you leave.';
    if (r.option === 'annualAllowance') return `${reduction(r.reductionPercent)} permanent reduction to the lifetime portion. Bridge remains unreduced.`;
    if (r.option === 'notEligible') return 'Less than 2 years of service. No monthly pension estimated.';
    return 'Payments may begin later. Your options are below.';
  }
  function warnings(r, input) {
    const items = ['Your actual plan group depends on when you began pension contributions, which may differ from your federal service start year.'];
    if (input.serviceStartYear === 2012 || input.serviceStartYear === 2013) items.push('Your start year is near the Group 1 / Group 2 boundary. Confirm your contribution start date.');
    if (input.birthYear < 1947) items.push('Official lifetime and bridge formula rates can differ for people born before 1947. This simplified estimate uses the standard rates shown above.');
    if (r.pensionableService >= 35) items.push('This estimate caps service used in the pension formula at 35 years. Actual pensionable service is still used for the 30-year eligibility test.');
    if (r.option === 'deferred' && r.ageAtRetirement < (r.group === 'Group 1' ? 50 : 55)) items.push('This retirement age is earlier than the minimum age for an annual allowance in your pension group. This tool does not estimate a payment starting immediately.');
    if (r.ageAtRetirement >= 65) items.push('No bridge benefit is shown because the bridge benefit is not payable after age 65.');
    if (input.salary > PENSION_CONFIG.DEFAULT_ESTIMATED_AMPE * 1.1) items.push('Part of your salary is above the AMPE assumption and uses the 2% formula rate. The actual AMPE depends on the retirement year and the prior four years.');
    if (input.retirementYear > new Date().getFullYear()) items.push('Future salary and AMPE are unknown; this estimate holds both inputs constant.');
    return items;
  }
  const escape = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  function scenario(input, year) {
    if (year <= input.serviceStartYear || year <= input.birthYear || input.gapYears > year - input.serviceStartYear) return null;
    return PensionCalculator.estimate({ ...input, retirementYear: year });
  }
  function scenarios(input) {
    return Array.from({ length: 5 }, (_, i) => input.retirementYear + i - 2)
      .map(year => ({ year, result: scenario(input, year) })).filter(item => item.result);
  }
  function scenarioReason(r) {
    if (r.option === 'notEligible') return 'Less than 2 years of pensionable service';
    if (r.option === 'deferred') return `No payment starting this year is estimated; a deferred pension may start at age ${r.normalAge}.`;
    return '';
  }
  function earliestOptions(input) {
    const options = PensionCalculator.earliestPensionOptions(input);
    const departure = options.departure;
    const rows = options.rows;
    const intro = `Leave in ${input.retirementYear} · ${years(departure.pensionableService)} of service. Service stays fixed after departure.`;
    const body = rows.length ? `<div class="pension-options">${rows.map(row => `<article class="pension-option"><h4>${row.type}</h4><p class="payment-age">Start at <strong>age ${row.age}</strong> · ${row.year}</p><p class="payment-amount">${amount(row.totalAnnual)}</p><dl class="amount-breakdown">${row.bridgeAnnual > 0 ? `<div><dt>Lifetime · ${reduction(row.reductionPercent)} reduction</dt><dd>${money.format(row.lifetimeAnnual)} / year</dd></div><div><dt>Unreduced bridge · until 65</dt><dd>${money.format(row.bridgeAnnual)} / year</dd></div>` : ''}<div><dt>Lifetime from age ${Math.max(65, row.age)}</dt><dd>${money.format(row.lifetimeAnnual)} / year · ${money.format(row.lifetimeAnnual / 12)} / month</dd></div></dl></article>`).join('')}</div>` : `<p class="no-estimate">${options.reason}</p>`;
    const reducedRow = rows.find(row => row.type === 'Reduced pension');
    const choiceNote = reducedRow && rows.length > 1 ? '<p class="help earliest-note"><strong>Two alternative start dates.</strong> Early payments stay reduced after 65.</p>' : '';
    return `<section class="earliest" aria-labelledby="earliest-heading"><h3 id="earliest-heading">When to start</h3><p class="help">${intro}</p>${body}${choiceNote}</section>`;
  }
  function comparison(input) {
    const rows = scenarios(input);
    const cells = rows.map(({ year, result: r }) => {
      const selected = year === input.retirementYear;
      const before = r.retirementStartsImmediately ? (r.ageAtRetirement < 65 ? amount(r.before65Annual) : 'Not applicable') : 'Not estimated';
      const after = r.retirementStartsImmediately ? amount(r.after65Annual) : 'Not estimated';
      const reason = scenarioReason(r);
      return { year, r, selected, before, after, reason };
    });
    return `<details class="comparison"><summary id="comparison-heading">Compare nearby departure years</summary>
      <p class="help">Same salary. Payments start in the departure year. “Not estimated” does not mean zero.</p>
      <div class="scenario-list">${cells.map(x => `<article class="scenario-row ${x.selected ? 'selected' : ''}"><h4>Leave in ${x.year}${x.selected ? '<span class="selected-note">Your selected departure year</span>' : ''}</h4><dl><div><dt>Approximate age</dt><dd>${x.r.ageAtRetirement}</dd></div><div><dt>Pensionable service</dt><dd>${years(x.r.pensionableService)}</dd></div><div><dt>Payment at departure</dt><dd>${comparisonLabel(x.r.option)}</dd></div><div><dt>Lifetime reduction</dt><dd>${reduction(x.r.reductionPercent)}</dd></div><div><dt>Before-65 amount</dt><dd>${x.before}</dd></div><div><dt>From-65 lifetime amount</dt><dd>${x.after}</dd></div></dl>${x.reason ? `<p class="help">${escape(x.reason)}</p>` : ''}</article>`).join('')}</div></details>`;
  }
  function render(result, input) {
    const r = result;
    const immediate = r.retirementStartsImmediately;
    const warningHtml = warnings(r, input).map(w => `<li>${escape(w)}</li>`).join('');
    const service = input.gapYears > 0 ? `<div><dt>Calendar service</dt><dd>${years(r.calendarService)}</dd></div><div><dt>Non-pensionable gap</dt><dd>${years(input.gapYears)}</dd></div><div><dt>Pensionable service</dt><dd>${years(r.pensionableService)}</dd></div><div><dt>Service used for amount</dt><dd>${years(r.serviceUsedForAmount)}</dd></div>` : `<div><dt>Service used for amount</dt><dd>${years(r.serviceUsedForAmount)}</dd></div>`;
    return `<div class="results-header"><h2 id="results-heading" tabindex="-1">Your estimated pension</h2></div>
      <dl class="result-meta"><div><dt>Pension group</dt><dd>${r.group} (estimated)</dd></div><div><dt>Approximate age at departure</dt><dd>${r.ageAtRetirement}</dd></div><div><dt>Estimated pensionable service</dt><dd>${years(r.pensionableService)}</dd></div><div><dt>Payment at departure</dt><dd>${optionLabel(r.option)}</dd></div></dl>
      <div class="option-message ${immediate ? '' : 'muted'}"><p>${optionMessage(r)}</p></div>
      ${earliestOptions(input)}
      <details class="breakdown"><summary id="breakdown-heading">Calculation &amp; notes</summary><dl>${service}<div><dt>Estimated AMPE proxy</dt><dd>${money.format(PENSION_CONFIG.DEFAULT_ESTIMATED_AMPE)}</dd></div>${immediate ? `<div><dt>Base lifetime pension</dt><dd>${amount(r.baseLifetimeAnnual)}</dd></div><div><dt>Early-retirement reduction</dt><dd>${reduction(r.reductionPercent)}</dd></div><div><dt>Estimated lifetime pension</dt><dd>${amount(r.estimatedLifetimeAnnual)}</dd></div><div><dt>Temporary bridge benefit to age 65</dt><dd>${r.bridgeIsPayable ? amount(r.estimatedBridgeAnnual) : 'Not payable'}</dd></div>` : ''}</dl>${immediate ? `<p>${r.reductionExplanation} ${r.bridgeIsPayable ? 'The reduction applies to the lifetime pension only; the bridge benefit is unreduced.' : 'No bridge benefit is payable at this age.'}</p>` : ''}<p class="help">Rounded amounts. Current salary and AMPE assumptions are held constant. Years rounding to $0 lifetime pension are skipped.</p><ul class="info-list result-warnings">${warningHtml}</ul></details>${comparison(input)}`;
  }
  return { render, money, scenarios };
})();

