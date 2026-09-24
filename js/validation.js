const PensionValidation = (() => {
  function parseYear(raw, label) {
    const value = String(raw).trim();
    if (!value) return { error: `${label} is required.` };
    if (!/^\d{4}$/.test(value) || Number(value) < 1900 || Number(value) > 2100)
      return { error: `Enter a four-digit ${label.toLowerCase()} between 1900 and 2100.` };
    return { value: Number(value) };
  }
  function validate(raw) {
    const errors = {};
    const parsed = {};
    for (const [key, label] of [['birthYear', 'Birth year'], ['serviceStartYear', 'Federal service start year'], ['retirementYear', 'Planned retirement year']]) {
      const p = parseYear(raw[key], label);
      if (p.error) errors[key] = p.error; else parsed[key] = p.value;
    }
    const salaryText = String(raw.salary ?? '').trim();
    const normalized = salaryText.replace(/^\$/, '').replace(/,/g, '').trim();
    if (!salaryText) errors.salary = 'Current annual salary is required.';
    else if (!/^\d+(?:\.\d{1,2})?$/.test(normalized) || !Number.isFinite(Number(normalized)) || Number(normalized) <= 0)
      errors.salary = 'Enter a salary greater than $0, such as $100,000.';
    else parsed.salary = Number(normalized);
    const gapText = String(raw.gapYears ?? '').trim();
    if (gapText === '') parsed.gapYears = 0;
    else if (!/^\d+(?:\.\d+)?$/.test(gapText) || !Number.isFinite(Number(gapText)))
      errors.gapYears = 'Enter a non-pensionable gap of 0 years or more.';
    else parsed.gapYears = Number(gapText);
    if (!errors.retirementYear && !errors.serviceStartYear && parsed.retirementYear <= parsed.serviceStartYear)
      errors.retirementYear = 'Your planned retirement year must be after your federal service start year.';
    if (!errors.retirementYear && !errors.birthYear && parsed.retirementYear <= parsed.birthYear)
      errors.retirementYear = 'Your planned retirement year must be after your birth year.';
    if (!errors.gapYears && !errors.retirementYear && !errors.serviceStartYear && parsed.gapYears > parsed.retirementYear - parsed.serviceStartYear)
      errors.gapYears = 'Your non-pensionable gap cannot be longer than the time between your start and retirement years.';
    return { valid: Object.keys(errors).length === 0, errors, values: parsed };
  }
  return { validate };
})();
if (typeof module !== 'undefined') module.exports = PensionValidation;

