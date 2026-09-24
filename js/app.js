(() => {
  const form = document.getElementById('estimate-form');
  const results = document.getElementById('results');
  const summary = document.getElementById('error-summary');
  const fields = ['birthYear', 'serviceStartYear', 'retirementYear', 'salary', 'gapYears'];
  const rawValues = () => Object.fromEntries(fields.map(key => [key, form.elements[key].value]));
  function clearErrors() {
    summary.hidden = true;
    summary.textContent = '';
    for (const key of fields) {
      form.elements[key].removeAttribute('aria-invalid');
      document.getElementById(`${key}-error`).textContent = '';
    }
  }
  function showErrors(errors) {
    const names = { birthYear: 'Birth year', serviceStartYear: 'Federal service start year', retirementYear: 'Planned retirement year', salary: 'Current annual salary', gapYears: 'Non-pensionable gap (years)' };
    const keys = Object.keys(errors);
    summary.innerHTML = `<p><strong>Please correct ${keys.length === 1 ? 'this field' : 'these fields'}:</strong> ${keys.map(key => names[key]).join(', ')}.</p>`;
    summary.hidden = false;
    for (const key of keys) {
      form.elements[key].setAttribute('aria-invalid', 'true');
      document.getElementById(`${key}-error`).textContent = errors[key];
    }
    if (errors.gapYears) document.getElementById('advanced').open = true;
    summary.focus();
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    clearErrors();
    const checked = PensionValidation.validate(rawValues());
    if (!checked.valid) {
      results.hidden = true;
      results.innerHTML = '';
      showErrors(checked.errors);
      return;
    }
    const result = PensionCalculator.estimate(checked.values);
    results.innerHTML = PensionUI.render(result, checked.values);
    results.hidden = false;
    results.scrollIntoView({ block: 'start', behavior: 'instant' });
  });
  form.addEventListener('reset', () => {
    clearErrors();
    results.hidden = true;
    results.innerHTML = '';
    document.getElementById('advanced').open = false;
    setTimeout(() => document.getElementById('birthYear').focus(), 0);
  });
  document.getElementById('ampe-display').textContent = PensionUI.money.format(PENSION_CONFIG.DEFAULT_ESTIMATED_AMPE);
})();

