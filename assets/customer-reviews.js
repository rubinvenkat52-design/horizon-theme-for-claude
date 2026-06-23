import { Component } from '@theme/component';

class CustomerReviews extends Component {
  requiredRefs = ['grid', 'sortSelect'];

  /** @type {HTMLElement[]} */
  #originalOrder = [];

  connectedCallback() {
    super.connectedCallback();
    this.#originalOrder = [...this.refs.grid.querySelectorAll('.review-card')];
  }

  /** @param {Event} event */
  handleSortChange(event) {
    const select = event.target;
    if (!(select instanceof HTMLSelectElement)) return;

    const { grid } = this.refs;
    const cards = [...this.#originalOrder];

    if (select.value === 'highest') {
      cards.sort((a, b) => Number(b.dataset.rating) - Number(a.dataset.rating));
    } else if (select.value === 'lowest') {
      cards.sort((a, b) => Number(a.dataset.rating) - Number(b.dataset.rating));
    }

    for (const card of cards) grid.appendChild(card);
  }
}

if (!customElements.get('customer-reviews')) {
  customElements.define('customer-reviews', CustomerReviews);
}
