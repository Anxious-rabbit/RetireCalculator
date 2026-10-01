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

/* Light-DOM field editor: the input stays in its original form.
 * Native popovers own outside dismissal and Escape. Positioning, value preview,
 * and lifecycle cleanup are independent of the field's business rules.
 */
class FieldPopover extends HTMLElement {
  connectedCallback() {
    this.trigger = this.querySelector('[data-trigger]');
    this.panel = this.querySelector('[popover]');
    this.input = this.querySelector('input');
    this.preview = this.querySelector('[data-value]');
    this.lifecycle?.abort();
    this.lifecycle = new AbortController();
    const options = { signal: this.lifecycle.signal };
    const place = () => this.position();
    this.trigger.addEventListener('click', event => {
      event.preventDefault();
      if (this.panel.matches(':popover-open')) this.dismiss(true);
      else {
        this.show();
        this.input.focus({ preventScroll: true });
      }
    }, options);
    this.panel.addEventListener('beforetoggle', event => {
      this.trigger.setAttribute('aria-expanded', String(event.newState === 'open'));
    }, options);
    this.panel.addEventListener('toggle', () => {
      if (!this.panel.matches(':popover-open')) return;
      this.position();
      if (document.activeElement === this.trigger) this.input.focus({ preventScroll: true });
    }, options);
    this.querySelector('[data-done]').addEventListener('click', () => this.dismiss(true), options);
    this.input.addEventListener('input', () => this.syncValue(), options);
    this.panel.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        this.dismiss(true);
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        this.dismiss(true);
      }
    }, options);
    this.addEventListener('focusout', event => {
      if (event.relatedTarget && !this.contains(event.relatedTarget)) this.dismiss();
    }, options);
    window.addEventListener('resize', place, options);
    window.addEventListener('scroll', place, { ...options, capture: true });
    this.resizeObserver = new ResizeObserver(place);
    this.resizeObserver.observe(this.panel);
    this.syncValue();
  }
  disconnectedCallback() {
    this.lifecycle?.abort();
    this.resizeObserver?.disconnect();
  }
  syncValue() {
    const value = this.input.value.trim();
    this.preview.textContent = value === '' ? '0 yr' : /^\d+(?:\.\d+)?$/.test(value) ? `${value} yr` : 'Edit';
  }
  show() {
    if (!this.panel.matches(':popover-open')) this.panel.showPopover();
    this.position();
  }
  dismiss(restoreFocus = false) {
    if (this.panel.matches(':popover-open')) this.panel.hidePopover();
    if (restoreFocus) this.trigger.focus({ preventScroll: true });
  }
  position() {
    if (!this.panel.matches(':popover-open')) return;
    const margin = 16;
    const anchor = this.trigger.getBoundingClientRect();
    const width = this.panel.offsetWidth;
    const height = this.panel.offsetHeight;
    const above = anchor.bottom + 10 + height > innerHeight - margin && anchor.top > height + margin;
    const left = Math.max(margin, Math.min(anchor.left, innerWidth - width - margin));
    const top = above ? anchor.top - height - 10 : Math.min(anchor.bottom + 10, innerHeight - height - margin);
    this.panel.style.left = `${left}px`;
    this.panel.style.top = `${Math.max(margin, top)}px`;
    this.panel.dataset.side = above ? 'above' : 'below';
  }
}
customElements.define('field-popover', FieldPopover);

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
