/* Reusable view control. No dependency on pension formulas or application IDs. */
let periodSwitchCount = 0;
class PeriodSwitch extends HTMLElement {
  connectedCallback() {
    if (this.querySelector('input')) return;
    const name = `period-${++periodSwitchCount}`;
    const value = this.dataset.value === 'year' ? 'year' : 'month';
    this.dataset.value = value;
    this.setAttribute('role', 'group');
    this.innerHTML = ['month', 'year'].map(period =>
      `<label><input type="radio" name="${name}" value="${period}" ${period === value ? 'checked' : ''}>${period === 'month' ? 'Monthly' : 'Yearly'}</label>`
    ).join('');
    this.addEventListener('change', event => {
      if (!(event.target instanceof HTMLInputElement)) return;
      this.dataset.value = event.target.value;
      this.dispatchEvent(new CustomEvent('period-change', {
        bubbles: true,
        detail: { value: event.target.value }
      }));
    });
  }
}
customElements.define('period-switch', PeriodSwitch);

/* One accessible control for related panels. No dependency on pension rules. */
let disclosureGroupCount = 0;
class DisclosureGroup extends HTMLElement {
  connectedCallback() {
    this.lifecycle?.abort();
    this.lifecycle = new AbortController();
    this.trigger = this.querySelector('[data-disclosure-trigger]');
    this.panels = [...this.querySelectorAll('[data-disclosure-panel]')];
    const group = ++disclosureGroupCount;
    this.panels.forEach((panel, index) => { panel.id ||= `disclosure-${group}-${index}`; });
    this.trigger.setAttribute('aria-controls', this.panels.map(panel => panel.id).join(' '));
    this.setExpanded(this.hasAttribute('expanded'));
    this.trigger.addEventListener('click', () => this.setExpanded(!this.hasAttribute('expanded')), {
      signal: this.lifecycle.signal
    });
  }
  setExpanded(expanded) {
    this.toggleAttribute('expanded', expanded);
    this.trigger.setAttribute('aria-expanded', String(expanded));
    for (const panel of this.panels) panel.hidden = !expanded;
  }
  disconnectedCallback() { this.lifecycle?.abort(); }
}
customElements.define('disclosure-group', DisclosureGroup);
