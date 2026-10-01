const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const calculator = require('../js/pension-calculator.js');
const config = require('../js/config.js');
const context = vm.createContext({ PENSION_CONFIG: config, PensionCalculator: calculator });
vm.runInContext(fs.readFileSync(path.join(__dirname, '../js/ui.js'), 'utf8'), context);
const ui = vm.runInContext('PensionUI', context);
const input = (birthYear, serviceStartYear, retirementYear, salary, gapYears = 0) => ({ birthYear, serviceStartYear, retirementYear, salary, gapYears });
const render = values => ui.render(calculator.estimate(values), values);
const options = html => html.slice(html.indexOf('<div class="pension-options">'), html.indexOf('</section>'));

test('later payment alternatives preserve lifetime, bridge, and after-65 amounts', () => {
  const html = render(input(1996, 2022, 2036, 70000));
  const parts = options(html).split('<article class="pension-option">').slice(1);
  assert.equal(parts.length, 2);
  assert.match(parts[0], /Reduced pension/);
  assert.match(parts[0], /age 55/);
  assert.match(parts[0], /\$12,863/);
  assert.match(parts[0], /50\.0% reduction/);
  assert.match(parts[0], /Unreduced bridge · until 65<\/dt><dd>\$6,125/);
  assert.match(parts[0], /Lifetime from age 65<\/dt><dd>\$6,738/);
  assert.match(parts[1], /Unreduced pension/);
  assert.match(parts[1], /age 65/);
  assert.match(parts[1], /\$13,475/);
  assert.doesNotMatch(parts[1], /Unreduced bridge · until 65/);
  assert.match(html, /Two alternative start dates/);
  assert.match(html, /Early payments stay reduced after 65/);
});

test('immediate reduced pension keeps its after-65 reduction visible', () => {
  const html = render(input(1980, 2015, 2035, 70000));
  assert.match(html, /50\.0% permanent reduction to the lifetime portion/);
  assert.match(html, /Lifetime from age 65/);
  assert.match(html, /bridge benefit is unreduced/);
});

test('from-65 retirements omit before-65 income and payable bridge', () => {
  const html = render(input(1980, 2015, 2045, 100000));
  assert.doesNotMatch(html, /<h3>Estimated pension before age 65/);
  assert.doesNotMatch(options(html), /Unreduced bridge · until 65/);
  assert.match(html, /Not payable/);
});

test('departures after 65 label lifetime income from the actual start age', () => {
  assert.match(render(input(1980, 2015, 2050, 100000)), /Lifetime from age 70/);
});

test('under-two-year and near-zero estimates never invent payment options', () => {
  const underTwo = render(input(1980, 2020, 2021, 70000));
  assert.doesNotMatch(underTwo, /class="pension-option"/);
  assert.match(underTwo, /At least 2 years/);
  assert.match(underTwo, /No monthly estimate/);
  const nearZero = render(input(1996, 2022, 2036, 1));
  assert.doesNotMatch(nearZero, /class="pension-option"/);
  assert.match(nearZero, /rounds to \$0/);
});

test('comparison has one canonical representation and one selected year', () => {
  const html = render(input(1980, 2015, 2040, 90000));
  assert.equal((html.match(/class="scenario-row/g) || []).length, 5);
  assert.equal((html.match(/Your selected departure year/g) || []).length, 1);
  assert.doesNotMatch(html, /<table|scenario-cards|table-wrap/);
  assert.match(html, /Payments start in the departure year/);
});

test('deferred comparison distinguishes unestimated amounts from zero', () => {
  const html = render(input(1996, 2022, 2036, 70000));
  assert.match(html, /“Not estimated” does not mean zero/);
  assert.match(html, /Before-65 amount<\/dt><dd>Not estimated/);
  assert.match(html, /From-65 lifetime amount<\/dt><dd>Not estimated/);
});
