const assert = require('node:assert/strict');
const { test } = require('node:test');
const { estimate, earliestPensionOptions } = require('../js/pension-calculator.js');
const { validate } = require('../js/validation.js');
const config = require('../js/config.js');
const input = (birthYear, serviceStartYear, retirementYear, salary, gapYears = 0) => ({ birthYear, serviceStartYear, retirementYear, salary, gapYears });
const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 0.001, `${actual} != ${expected}`);

test('T01 Group 2 age 65, 30 years, no bridge', () => {
  const r = estimate(input(1980, 2015, 2045, 100000));
  assert.equal(r.group, 'Group 2'); assert.equal(r.ageAtRetirement, 65); assert.equal(r.pensionableService, 30);
  assert.equal(r.option, 'immediate'); assert.equal(r.bridgeIsPayable, false);
  close(r.estimatedLifetimeAnnual, 46012.5); close(r.after65Monthly, 3834.375);
});
test('T02 Group 1 unreduced, temporary bridge', () => {
  const r = estimate(input(1970, 1995, 2025, 100000));
  assert.equal(r.group, 'Group 1'); assert.equal(r.option, 'immediate');
  close(r.estimatedLifetimeAnnual, 46012.5); close(r.estimatedBridgeAnnual, 13987.5); close(r.before65Annual, 60000);
});
test('T03 Group 1 >=25 age under 55: higher reduction, bridge unreduced', () => {
  const r = estimate(input(1975, 2000, 2028, 90000));
  assert.equal(r.option, 'annualAllowance'); close(r.reductionPercent, .10);
  close(r.estimatedLifetimeAnnual, r.baseLifetimeAnnual * .9); close(r.estimatedBridgeAnnual, r.baseBridgeAnnual);
  assert.match(r.reductionExplanation, /higher of/);
});
test('T04 Group 1 >=25 age 55 to under 60: lower reduction', () => {
  const r = estimate(input(1970, 2000, 2028, 80000));
  close(r.reductionPercent, .10); assert.match(r.reductionExplanation, /lower of/);
});
test('T05 Group 1 <25 service', () => close(estimate(input(1975, 2005, 2028, 80000)).reductionPercent, .35));
test('T06 Group 2 <25 service', () => close(estimate(input(1980, 2015, 2038, 85000)).reductionPercent, .35));
test('T07 gap deducted before 35-year cap', () => {
  const r = estimate(input(1978, 2000, 2036, 95000, 5));
  assert.equal(r.calendarService, 36); assert.equal(r.pensionableService, 31); assert.equal(r.serviceUsedForAmount, 31); assert.equal(r.option, 'immediate');
});
test('T08 Group 2 >=25 age 60 to under 65: lower reduction', () => {
  const r = estimate(input(1980, 2013, 2040, 90000));
  close(r.reductionPercent, .15); assert.match(r.reductionExplanation, /lower of/);
});
test('T09 gap changes Group 2 reduction branch', () => {
  const r = estimate(input(1980, 2013, 2040, 90000, 3));
  assert.equal(r.pensionableService, 24); close(r.reductionPercent, .25);
});
test('T10 amount cap keeps actual service for eligibility', () => {
  const r = estimate(input(1970, 1980, 2020, 90000, 3));
  assert.equal(r.pensionableService, 37); assert.equal(r.serviceUsedForAmount, 35); assert.equal(r.option, 'annualAllowance');
});
test('T11 too young for Group 2 annual allowance', () => {
  const r = estimate(input(1990, 2020, 2040, 70000));
  assert.equal(r.option, 'deferred'); assert.equal(r.before65Annual, null);
});
test('T12 two service years but too young', () => {
  const r = estimate(input(1980, 2020, 2022, 70000));
  assert.equal(r.option, 'deferred'); assert.equal(r.retirementStartsImmediately, false);
});
test('T13 under two service years', () => {
  const r = estimate(input(1980, 2020, 2021, 70000));
  assert.equal(r.option, 'notEligible'); assert.equal(r.after65Annual, null);
});
test('T14 gap longer than calendar service is invalid', () => {
  const r = validate(input(1980, 2020, 2030, 70000, 11));
  assert.equal(r.valid, false); assert.match(r.errors.gapYears, /cannot be longer/);
});
test('T15 retirement must follow service start', () => {
  const r = validate(input(1980, 2020, 2020, 70000));
  assert.equal(r.valid, false); assert.match(r.errors.retirementYear, /must be after/);
});
test('Group 2 >=25 age 55 to under 60: higher reduction', () => {
  const r = estimate(input(1980, 2013, 2038, 90000));
  assert.equal(r.ageAtRetirement, 58); assert.equal(r.pensionableService, 25);
  close(r.reductionPercent, .25); assert.match(r.reductionExplanation, /higher of/);
});
test('group boundary 2012 / 2013', () => {
  assert.equal(estimate(input(1970, 2012, 2037, 70000)).group, 'Group 1');
  assert.equal(estimate(input(1970, 2013, 2038, 70000)).group, 'Group 2');
});
test('service boundary 25 and 30; ages 50, 55, 60, 65', () => {
  close(estimate(input(1975, 2000, 2025, 70000)).reductionPercent, .25); // Group 1 age 50, service 25
  assert.equal(estimate(input(1970, 2000, 2025, 70000)).option, 'annualAllowance'); // age 55, service 25
  assert.equal(estimate(input(1970, 2000, 2030, 70000)).option, 'immediate'); // age 60, service 30
  assert.equal(estimate(input(1980, 2015, 2045, 70000)).option, 'immediate'); // age 65
  assert.equal(estimate(input(1975, 2000, 2030, 70000)).option, 'immediate'); // age 55, service 30
});
test('35 and 35.1 service; decimal gap 0.5', () => {
  const a = estimate(input(1970, 2000, 2035, 70000));
  const b = estimate(input(1970, 2000, 2036, 70000, .9));
  const c = estimate(input(1970, 2000, 2036, 70000, .5));
  assert.equal(a.serviceUsedForAmount, 35); close(b.pensionableService, 35.1); assert.equal(b.serviceUsedForAmount, 35);
  close(c.pensionableService, 35.5); assert.equal(c.serviceUsedForAmount, 35);
});
test('salary below, at, and above AMPE', () => {
  for (const salary of [70000, config.DEFAULT_ESTIMATED_AMPE, 100000]) {
    const r = estimate(input(1970, 2000, 2030, salary));
    const low = Math.min(salary, config.DEFAULT_ESTIMATED_AMPE);
    const high = Math.max(salary - config.DEFAULT_ESTIMATED_AMPE, 0);
    close(r.baseLifetimeAnnual, (low * .01375 + high * .02) * 30);
    close(r.baseBridgeAnnual, low * .00625 * 30);
  }
});
test('validation: currency, required, ordering, non-positive salary, negative gap', () => {
  assert.equal(validate({ birthYear:'1980', serviceStartYear:'2015', retirementYear:'2045', salary:'$100,000', gapYears:'0.5' }).valid, true);
  assert.equal(validate(input(1980, 2015, 2045, 0)).valid, false);
  assert.ok(validate(input(2045, 2015, 2040, 80000)).errors.retirementYear);
  assert.ok(validate(input(1980, 2015, 2040, 80000, -1)).errors.gapYears);
  assert.ok(validate({ birthYear:'', serviceStartYear:'', retirementYear:'', salary:'' }).errors.birthYear);
});
test('earliest payment ages keep service fixed after departure', () => {
  const result = earliestPensionOptions(input(1996, 2022, 2037, 70000));
  assert.equal(result.departure.pensionableService, 15);
  assert.deepEqual(result.rows.map(row => [row.age, row.year, row.reductionPercent]), [[55, 2051, .5], [65, 2061, 0]]);
  close(result.rows[0].lifetimeAnnual, .5 * .01375 * 70000 * 15);
});
test('30 years of Group 2 service permits unreduced payment at 60', () => {
  const result = earliestPensionOptions(input(2000, 2013, 2043, 80000));
  assert.deepEqual(result.rows.map(row => row.age), [55, 60]);
});
test('payment search skips a 100% reduction and a displayed $0', () => {
  const example = input(1996, 2022, 2037, 70000);
  const altered = { ...config, EARLY_REDUCTION_PER_YEAR: .11 };
  const result = earliestPensionOptions(example, altered);
  assert.equal(result.rows[0].age, 56);
  assert.ok(Math.round(result.rows[0].lifetimeAnnual) >= 1);
  assert.equal(earliestPensionOptions(input(1996, 2022, 2037, 1)).rows.length, 0);
});

