/* Pure, deterministic calculation functions; no browser or DOM dependencies. */
const PensionCalculator = (() => {
  const config = typeof module !== 'undefined' ? require('./config.js') : PENSION_CONFIG;
  const clamp = value => Math.max(0, Math.min(1, value));
  const percent = value => `${(value * 100).toFixed(1)}%`;
  const wholeDollarIsPositive = amount => Math.round(amount) >= 1;

  function amountBases(salary, service, c) {
    const low = Math.min(salary, c.DEFAULT_ESTIMATED_AMPE);
    const high = Math.max(salary - c.DEFAULT_ESTIMATED_AMPE, 0);
    return {
      lifetime: (c.LIFETIME_LOW_RATE * low + c.LIFETIME_HIGH_RATE * high) * Math.min(service, c.PENSION_AMOUNT_SERVICE_CAP),
      bridge: c.BRIDGE_RATE * low * Math.min(service, c.PENSION_AMOUNT_SERVICE_CAP)
    };
  }

  function annualAllowanceReduction(group, age, service, c = config) {
    const rate = c.EARLY_REDUCTION_PER_YEAR;
    let agePart, servicePart, comparison, reduction;
    if (group === 'Group 1') {
      if (service < c.EARLY_SERVICE_TEST) {
        reduction = rate * (60 - age);
        comparison = `${percent(reduction)} for age (5% for each year before 60)`;
      } else if (age < 55) {
        agePart = rate * (55 - age);
        servicePart = rate * Math.max(0, c.FULL_SERVICE_TEST - service);
        reduction = Math.max(agePart, servicePart);
        comparison = `higher of ${percent(agePart)} for age and ${percent(servicePart)} for service`;
      } else {
        agePart = rate * (60 - age);
        servicePart = rate * Math.max(0, c.FULL_SERVICE_TEST - service);
        reduction = Math.min(agePart, servicePart);
        comparison = `lower of ${percent(agePart)} for age and ${percent(servicePart)} for service`;
      }
    } else {
      if (service < c.EARLY_SERVICE_TEST) {
        reduction = rate * (65 - age);
        comparison = `${percent(reduction)} for age (5% for each year before 65)`;
      } else if (age < 60) {
        agePart = rate * (60 - age);
        servicePart = rate * Math.max(0, c.FULL_SERVICE_TEST - service);
        reduction = Math.max(agePart, servicePart);
        comparison = `higher of ${percent(agePart)} for age and ${percent(servicePart)} for service`;
      } else {
        agePart = rate * (65 - age);
        servicePart = rate * Math.max(0, c.FULL_SERVICE_TEST - service);
        reduction = Math.min(agePart, servicePart);
        comparison = `lower of ${percent(agePart)} for age and ${percent(servicePart)} for service`;
      }
    }
    return { reduction: clamp(reduction), comparison };
  }

  function estimate(input, c = config) {
    const ageAtRetirement = input.retirementYear - input.birthYear;
    const calendarService = input.retirementYear - input.serviceStartYear;
    const pensionableService = Math.max(0, calendarService - input.gapYears);
    const serviceUsedForAmount = Math.min(pensionableService, c.PENSION_AMOUNT_SERVICE_CAP);
    const group = input.serviceStartYear <= c.GROUP_1_LAST_START_YEAR ? 'Group 1' : 'Group 2';
    const normalAge = group === 'Group 1' ? 60 : 65;
    const allowanceAge = group === 'Group 1' ? 50 : 55;
    const result = { ageAtRetirement, calendarService, pensionableService, serviceUsedForAmount, group, normalAge,
      option: '', reductionPercent: null, reductionExplanation: '', retirementStartsImmediately: false,
      estimatedLifetimeAnnual: null, estimatedBridgeAnnual: null, before65Annual: null, after65Annual: null };

    if (pensionableService < c.MIN_VESTING_SERVICE) {
      result.option = 'notEligible';
      return result;
    }
    const unreduced = group === 'Group 1'
      ? (ageAtRetirement >= 60 || (ageAtRetirement >= 55 && pensionableService >= c.FULL_SERVICE_TEST))
      : (ageAtRetirement >= 65 || (ageAtRetirement >= 60 && pensionableService >= c.FULL_SERVICE_TEST));
    if (unreduced) {
      result.option = 'immediate';
      result.reductionPercent = 0;
      result.reductionExplanation = 'Estimated reduction: 0.0% (unreduced immediate annuity).';
    } else if (ageAtRetirement >= allowanceAge && ageAtRetirement < normalAge) {
      result.option = 'annualAllowance';
      const { reduction, comparison } = annualAllowanceReduction(group, ageAtRetirement, pensionableService, c);
      result.reductionPercent = reduction;
      result.reductionExplanation = `Estimated reduction: ${percent(reduction)} (${comparison}).`;
    } else {
      result.option = 'deferred';
      return result;
    }
    result.retirementStartsImmediately = true;
    const bases = amountBases(input.salary, serviceUsedForAmount, c);
    result.baseLifetimeAnnual = bases.lifetime;
    result.baseBridgeAnnual = bases.bridge;
    result.estimatedLifetimeAnnual = result.baseLifetimeAnnual * (1 - result.reductionPercent);
    result.estimatedBridgeAnnual = result.baseBridgeAnnual;
    result.bridgeIsPayable = ageAtRetirement < 65;
    result.before65Annual = result.estimatedLifetimeAnnual + (result.bridgeIsPayable ? result.estimatedBridgeAnnual : 0);
    result.after65Annual = result.estimatedLifetimeAnnual;
    result.before65Monthly = result.before65Annual / 12;
    result.after65Monthly = result.after65Annual / 12;
    return result;
  }

  // Payment may begin years after departure. Service is fixed at departure.
  function earliestPensionOptions(input, c = config) {
    const departure = estimate(input, c);
    const service = departure.pensionableService;
    if (service < c.MIN_VESTING_SERVICE) return { departure, rows: [], reason: 'At least 2 years of pensionable service are needed for this monthly estimate.' };
    const allowanceAge = departure.group === 'Group 1' ? 50 : 55;
    const earlyUnreducedAge = departure.group === 'Group 1' ? 55 : 60;
    const unreducedAge = Math.max(departure.ageAtRetirement,
      service >= c.FULL_SERVICE_TEST ? earlyUnreducedAge : departure.normalAge);
    const bases = amountBases(input.salary, service, c);
    const rows = [];
    const firstCandidateAge = Math.max(departure.ageAtRetirement, allowanceAge);
    for (let age = firstCandidateAge; age < unreducedAge; age += 1) {
      const { reduction } = annualAllowanceReduction(departure.group, age, service, c);
      const lifetimeAnnual = bases.lifetime * (1 - reduction);
      if (!wholeDollarIsPositive(lifetimeAnnual)) continue;
      rows.push({ type: 'Reduced pension', age, year: input.birthYear + age, reductionPercent: reduction,
        lifetimeAnnual, bridgeAnnual: age < 65 ? bases.bridge : 0,
        totalAnnual: lifetimeAnnual + (age < 65 ? bases.bridge : 0) });
      break;
    }
    if (wholeDollarIsPositive(bases.lifetime)) {
      rows.push({ type: 'Unreduced pension', age: unreducedAge, year: input.birthYear + unreducedAge,
        reductionPercent: 0, lifetimeAnnual: bases.lifetime,
        bridgeAnnual: unreducedAge < 65 ? bases.bridge : 0,
        totalAnnual: bases.lifetime + (unreducedAge < 65 ? bases.bridge : 0) });
    }
    return { departure, rows,
      reason: rows.length ? '' : 'The annual estimate rounds to $0 with these inputs; no positive whole-dollar amount can be shown.' };
  }
  return { estimate, annualAllowanceReduction, earliestPensionOptions };
})();
if (typeof module !== 'undefined') module.exports = PensionCalculator;

