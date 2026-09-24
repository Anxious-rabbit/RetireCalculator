const PensionUI = (() => {
  const money = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 });
  const years = value => `${value.toFixed(1)} years`;
  const reduction = value => value == null ? 'Not estimated' : `${(value * 100).toFixed(1)}%`;
  const amount = value => `<span class="amount-pair"><span class="year-amount"><strong>${money.format(value)}</strong>/year</span><span class="amount-or">or</span><span class="month-amount">${money.format(value / 12)}/month</span></span>`;
  const optionLabel = option => ({ immediate: 'Unreduced pension', annualAllowance: 'Reduced pension', deferred: 'No immediate payment', notEligible: 'No monthly estimate' })[option];
  const comparisonLabel = option => ({ immediate: 'Unreduced', annualAllowance: 'Reduced', deferred: 'Deferred / not estimated immediately', notEligible: 'Not eligible for monthly estimate' })[option];

  function optionMessage(r) {
    if (r.option === 'immediate') return 'You may qualify for an unreduced pension starting when you leave.';
    if (r.option === 'annualAllowance') return `You may qualify for a pension starting when you leave, with an estimated ${reduction(r.reductionPercent)} permanent reduction to the lifetime portion.`;
    if (r.option === 'notEligible') return 'This estimate shows less than 2 years of pensionable service. The usual monthly pension options are not estimated here.';
    return 'No monthly pension is estimated to start in your departure year. See the possible later payment ages above.';
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
  function incomeCard(title, annual, helper) {
    const available = annual != null;
    return `<article class="income-card"><h3>${title}</h3><p class="headline-amount">${available ? amount(annual) : 'Not applicable'}</p><p class="help">${helper}</p></article>`;
  }
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
  function earliestTable(input) {
    const options = PensionCalculator.earliestPensionOptions(input);
    const departure = options.departure;
    const rows = options.rows;
    const intro = `Assumes you leave in ${input.retirementYear} with ${years(departure.pensionableService)} of pensionable service. Service does not increase after you leave.`;
    const body = rows.length ? `<div class="earliest-table-wrap"><table class="earliest-table"><thead><tr><th scope="col">Pension option</th><th scope="col">Earliest age · year</th><th scope="col">Lifetime reduction</th><th scope="col">Amount at start</th></tr></thead><tbody>${rows.map((row, index) => `<tr class="${index === 0 ? 'selected' : ''}"><th scope="row">${row.type}</th><td data-label="Earliest age · year"><strong>${row.age}</strong> · ${row.year}</td><td data-label="Lifetime reduction">${reduction(row.reductionPercent)}</td><td data-label="Amount at start">${amount(row.totalAnnual)}<span class="amount-note">${row.bridgeAnnual > 0 ? 'Includes temporary bridge to 65' : 'Lifetime pension only'}</span></td></tr>`).join('')}</tbody></table></div>` : `<p class="no-estimate">${options.reason}</p>`;
    const choiceNote = rows.length > 1 ? 'These are alternatives. Starting a reduced pension keeps its lifetime reduction after 65; the unreduced row assumes you wait. ' : '';
    return `<section class="earliest" aria-labelledby="earliest-heading"><div class="earliest-heading"><h3 id="earliest-heading">Earliest pension start</h3><span class="eyebrow">Based on your departure year</span></div><p class="help">${intro} These are estimated payment start ages, not a minimum age for leaving work.</p>${body}<p class="help earliest-note">${choiceNote}Amounts use today's dollars and are rounded. Years showing $0 lifetime pension are skipped. Confirm options with official records.</p></section>`;
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
    return `<details class="comparison"><summary id="comparison-heading">Compare nearby retirement years</summary>
      <p class="help">Same salary and assumptions; only the retirement year changes. “Not estimated” does not mean zero.</p>
      <div class="table-wrap"><table><thead><tr><th scope="col">Retirement year</th><th scope="col">Approximate age</th><th scope="col">Pensionable service</th><th scope="col">Benefit type</th><th scope="col">Reduction</th><th scope="col">Before-65 amount</th><th scope="col">From-65 lifetime amount</th></tr></thead>
      <tbody>${cells.map(x => `<tr class="${x.selected ? 'selected' : ''}"><th scope="row">${x.year}${x.selected ? '<span class="selected-note">Your selected year</span>' : ''}</th><td>${x.r.ageAtRetirement}</td><td>${years(x.r.pensionableService)}</td><td>${comparisonLabel(x.r.option)}${x.reason ? `<br><small>${escape(x.reason)}</small>` : ''}</td><td>${reduction(x.r.reductionPercent)}</td><td>${x.before}</td><td>${x.after}</td></tr>`).join('')}</tbody></table></div>
      <div class="scenario-cards">${cells.map(x => `<article class="scenario-card ${x.selected ? 'selected' : ''}"><h4>${x.year}${x.selected ? ' <span class="selected-note">Your selected year</span>' : ''}</h4><dl><dt>Approximate age</dt><dd>${x.r.ageAtRetirement}</dd><dt>Pensionable service</dt><dd>${years(x.r.pensionableService)}</dd><dt>Benefit type</dt><dd>${comparisonLabel(x.r.option)}</dd>${x.reason ? `<dt>Reason</dt><dd>${escape(x.reason)}</dd>` : ''}<dt>Reduction</dt><dd>${reduction(x.r.reductionPercent)}</dd><dt>Before-65 amount</dt><dd>${x.before}</dd><dt>From-65 lifetime amount</dt><dd>${x.after}</dd></dl></article>`).join('')}</div></details>`;
  }
  function render(result, input) {
    const r = result;
    const immediate = r.retirementStartsImmediately;
    const warningHtml = warnings(r, input).map(w => `<li>${escape(w)}</li>`).join('');
    const service = input.gapYears > 0 ? `<div><dt>Calendar service</dt><dd>${years(r.calendarService)}</dd></div><div><dt>Non-pensionable gap</dt><dd>${years(input.gapYears)}</dd></div><div><dt>Pensionable service</dt><dd>${years(r.pensionableService)}</dd></div><div><dt>Service used for amount</dt><dd>${years(r.serviceUsedForAmount)}</dd></div>` : `<div><dt>Service used for amount</dt><dd>${years(r.serviceUsedForAmount)}</dd></div>`;
    return `<div class="results-header"><div><p class="eyebrow">02 / Your result</p><h2 id="results-heading">Your estimated pension</h2></div></div>
      <dl class="result-meta"><div><dt>Pension group</dt><dd>${r.group} (estimated)</dd></div><div><dt>Estimated retirement age</dt><dd>${r.ageAtRetirement}</dd></div><div><dt>Estimated pensionable service</dt><dd>${years(r.pensionableService)}</dd></div><div><dt>Payment at departure</dt><dd>${optionLabel(r.option)}</dd></div></dl>
      ${earliestTable(input)}
      <div class="option-message ${immediate ? '' : 'muted'}"><p>${optionMessage(r)}</p></div>
      ${immediate ? `<div class="income-grid ${r.ageAtRetirement >= 65 ? 'single' : ''}">${r.ageAtRetirement < 65 ? incomeCard('Estimated pension before age 65', r.before65Annual, 'Lifetime pension plus temporary bridge benefit.') : ''}${incomeCard('Estimated lifetime pension from age 65', r.after65Annual, 'Bridge benefit ends at 65. CPP, QPP, OAS, and tax are not included.')}</div>` : ''}
      <ul class="info-list result-warnings">${warningHtml}</ul>
      <details class="breakdown"><summary id="breakdown-heading">How this estimate was calculated</summary><dl>${service}<div><dt>Estimated AMPE proxy</dt><dd>${money.format(PENSION_CONFIG.DEFAULT_ESTIMATED_AMPE)}</dd></div>${immediate ? `<div><dt>Base lifetime pension</dt><dd>${amount(r.baseLifetimeAnnual)}</dd></div><div><dt>Early-retirement reduction</dt><dd>${reduction(r.reductionPercent)}</dd></div><div><dt>Estimated lifetime pension</dt><dd>${amount(r.estimatedLifetimeAnnual)}</dd></div><div><dt>Temporary bridge benefit to age 65</dt><dd>${r.bridgeIsPayable ? amount(r.estimatedBridgeAnnual) : 'Not payable'}</dd></div>` : ''}</dl>${immediate ? `<p>${r.reductionExplanation} ${r.bridgeIsPayable ? 'The reduction applies to the lifetime pension only; the bridge benefit is unreduced.' : 'No bridge benefit is payable at this age.'}</p>` : ''}</details>${comparison(input)}`;
  }
  return { render, money, scenarios };
})();

