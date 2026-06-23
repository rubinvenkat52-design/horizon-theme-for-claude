import { Component } from '@theme/component';
import { prefersReducedMotion } from '@theme/utilities';

const ANIMATION_DURATION = 1200;

/**
 * A custom element that counts up its stat numbers once they scroll into view.
 */
class KeyMetrics extends Component {
  /** @type {IntersectionObserver | undefined} */
  #observer;

  #animated = false;

  connectedCallback() {
    super.connectedCallback();

    if (prefersReducedMotion()) return;

    this.#observer = new IntersectionObserver(this.#handleIntersect, { threshold: [0, 0.3] });
    this.#observer.observe(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#observer?.disconnect();
  }

  /**
   * @param {IntersectionObserverEntry[]} entries
   */
  #handleIntersect = (entries) => {
    const entry = entries[entries.length - 1];

    if (!entry || this.#animated || entry.intersectionRatio < 0.3) return;

    this.#animated = true;
    this.#observer?.disconnect();
    this.#countUp();
  };

  #countUp() {
    const items = Array.from(this.querySelectorAll('[data-stat-target]'));
    const start = performance.now();

    /** @param {number} now */
    const tick = (now) => {
      const progress = Math.min((now - start) / ANIMATION_DURATION, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      for (const item of items) {
        if (!(item instanceof HTMLElement)) continue;

        const numberElement = item.querySelector('[data-stat-number]');
        if (!numberElement) continue;

        const target = Number.parseFloat(item.dataset.statTarget || '0');
        const decimals = Number.parseInt(item.dataset.statDecimals || '0', 10);
        const prefix = item.dataset.statPrefix || '';
        const suffix = item.dataset.statSuffix || '';
        const current = (target * eased).toFixed(decimals);

        numberElement.textContent = `${prefix}${Number(current).toLocaleString(undefined, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })}${suffix}`;
      }

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  }
}

if (!customElements.get('key-metrics')) {
  customElements.define('key-metrics', KeyMetrics);
}
