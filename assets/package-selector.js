import { Component } from '@theme/component';

/**
 * A custom element that renders rich package cards and forwards selection
 * to the theme's native `<variant-picker>`, so price, media, and add-to-cart
 * continue to be driven by the theme's existing variant logic.
 */
class PackageSelector extends Component {
  requiredRefs = ['grid'];

  /** @type {HTMLElement | null} */
  #picker = null;

  #handlePickerChange = () => this.#syncActiveCard();

  connectedCallback() {
    super.connectedCallback();

    const picker = this.closest('[id^="ProductInformation-"]')?.querySelector('variant-picker');
    if (!picker) return;

    this.#picker = picker;
    this.#picker.style.display = 'none';
    this.#picker.addEventListener('change', this.#handlePickerChange);
    this.#syncActiveCard();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#picker?.removeEventListener('change', this.#handlePickerChange);
  }

  /** @param {Event} event */
  selectPackage(event) {
    const card = event.target;
    if (!(card instanceof HTMLElement) || !this.#picker) return;

    const optionValue = card.dataset.optionValue;
    if (!optionValue) return;

    const radio = this.#picker.querySelector(`input[type="radio"][value="${CSS.escape(optionValue)}"]`);
    if (!(radio instanceof HTMLInputElement) || radio.checked) return;

    radio.checked = true;
    radio.dispatchEvent(new Event('change', { bubbles: true }));
  }

  #syncActiveCard() {
    const { grid } = this.refs;
    if (!this.#picker || !(grid instanceof HTMLElement)) return;

    const checkedRadio = this.#picker.querySelector('input[type="radio"]:checked');
    const selectedValue = checkedRadio instanceof HTMLInputElement ? checkedRadio.value : undefined;

    for (const card of grid.querySelectorAll('[data-option-value]')) {
      const isActive = card.getAttribute('data-option-value') === selectedValue;
      card.classList.toggle('package-option--active', isActive);
      card.setAttribute('aria-checked', String(isActive));
    }
  }
}

if (!customElements.get('package-selector')) {
  customElements.define('package-selector', PackageSelector);
}
