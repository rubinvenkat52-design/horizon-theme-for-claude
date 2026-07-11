/* ── Swipe hint animation ───────────────────────────────────────────────── */

const HAND_PATH = `
  <path d="M18.19 12.44c.24.07.46.17.67.3V9a2 2 0 0 0-2-2
    1.99 1.99 0 0 0-1.4.59A2 2 0 0 0 14 6a2 2 0 0 0-1.76 1.07
    A2.02 2.02 0 0 0 11 6a2 2 0 0 0-2 2v5.24
    a1.5 1.5 0 0 0-1.39-.98 1.5 1.5 0 0 0-1.5 1.5
    1.5 1.5 0 0 0 .18.71L8.46 18A5.98 5.98 0 0 0 14 21
    a6 6 0 0 0 6-6v-1.5c0-.74-.37-1.39-.93-1.79
    -.27-.19-.59-.32-.88-.27z
    M18 15a4 4 0 0 1-4 4 3.99 3.99 0 0 1-3.63-2.33
    l-1.54-3.07.03-.01a.5.5 0 0 1 .64.26l.82 1.64L11 15
    V8a.5.5 0 0 1 1 0v5h1V7a.5.5 0 0 1 1 0v6h1V8
    a.5.5 0 0 1 1 0v5h1v-3a.5.5 0 0 1 1 0v5z"/>
`;

const HAND_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg"
       viewBox="0 0 24 24"
       width="26" height="26"
       fill="currentColor"
       aria-hidden="true">
    ${HAND_PATH}
  </svg>
`;

function buildHint(side) {
  const el = document.createElement('div');
  el.className = `product-swipe-hint product-swipe-hint--${side}`;
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = `<div class="product-swipe-hint__pill">${HAND_SVG}</div>`;
  return el;
}

function showHint(container, side) {
  const hint = buildHint(side);
  container.appendChild(hint);
  hint.addEventListener('animationend', () => hint.remove(), { once: true });
  setTimeout(() => hint.remove(), 2100);
}

function initSwipeHint() {
  const mediaWrapper = document.querySelector('[data-testid="product-information-media"]');
  if (!mediaWrapper) return;

  const gallery = mediaWrapper.querySelector('media-gallery');
  if (!gallery) return;

  const slides = Array.from(gallery.querySelectorAll('slideshow-slide'));
  if (slides.length <= 1) return;

  /* Target the slideshow container for positioning the hint */
  const container =
    gallery.querySelector('slideshow-container') ||
    gallery.querySelector('slideshow-component') ||
    gallery;

  if (getComputedStyle(container).position === 'static') {
    container.style.position = 'relative';
  }

  /* Right-side "swipe left" hint — once per session */
  const KEY = 'psh-right-shown';
  if (!sessionStorage.getItem(KEY)) {
    sessionStorage.setItem(KEY, '1');
    setTimeout(() => showHint(container, 'right'), 700);
  }

  /* Left-side "swipe right" hint — once when user passes first slide */
  let leftShown = false;
  const observer = new MutationObserver(() => {
    if (leftShown) return;
    const activeIndex = slides.findIndex(
      (s) => s.getAttribute('aria-hidden') === 'false'
    );
    if (activeIndex > 0) {
      leftShown = true;
      showHint(container, 'left');
      observer.disconnect();
    }
  });
  slides.forEach((s) => observer.observe(s, { attributes: true, attributeFilter: ['aria-hidden'] }));
}

/* ── Bootstrap ─────────────────────────────────────────────────────────────── */

function boot() {
  initSwipeHint();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
