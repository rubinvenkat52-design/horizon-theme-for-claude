/**
 * product-swipe-hint.js
 *
 * Two responsibilities:
 *  1. initHeroLayout  — when .feature-boxes is a section-level additional block
 *     (Perfect template), moves it inside the media column to create the
 *     image | boxes side-by-side layout via DOM manipulation.
 *  2. initSwipeHint   — animated hand icon on the product image carousel to
 *     replace the native nav arrows.
 */

/* ── 1. Hero layout DOM repositioner ──────────────────────────────────────── */

function initHeroLayout() {
  /* The grid wrapper only exists on product-information sections */
  const grid = document.querySelector('[data-product-grid-content]');
  if (!grid) return;

  /* .feature-boxes is rendered as an additional block OUTSIDE the grid
     on the Perfect template. On the default template it lives inside
     .product-details > .group-block (INSIDE the grid). */
  const featureBoxes = document.querySelector('.feature-boxes');
  if (!featureBoxes || grid.contains(featureBoxes)) return;

  /* Confirmed: this is the Perfect template - proceed with repositioning */

  const mediaWrapper = document.querySelector('[data-testid="product-information-media"]');
  if (!mediaWrapper) return;

  const gallery = mediaWrapper.querySelector('media-gallery');
  if (!gallery) return;

  /* Build: [.pih-gallery-wrapper] [.pih-boxes-column] inside the media div */
  const galleryWrapper = document.createElement('div');
  galleryWrapper.className = 'pih-gallery-wrapper';

  const boxesColumn = document.createElement('div');
  boxesColumn.className = 'pih-boxes-column';

  /* Replace gallery with galleryWrapper containing gallery */
  mediaWrapper.insertBefore(galleryWrapper, gallery);
  galleryWrapper.appendChild(gallery);

  /* Move .feature-boxes into the boxes column */
  boxesColumn.appendChild(featureBoxes);
  mediaWrapper.appendChild(boxesColumn);
}

/* ── 2. Swipe hint animation ───────────────────────────────────────────────── */

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
  initHeroLayout();   /* reposition boxes FIRST so layout is correct */
  initSwipeHint();    /* then set up swipe animation */
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
