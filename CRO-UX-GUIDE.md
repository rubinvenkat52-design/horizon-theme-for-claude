# UX & CRO Optimization Guide — Horizon Theme

This file scopes all future editing work in this repo to one goal: **improve UX and Conversion Rate Optimization (CRO)**, measured against premium competitor Shopify themes — primarily **Elixir** and **Shrine**. Any change made under this guide must trace back to a specific conversion or usability outcome, not a stylistic or architectural preference.

## Ground rules for any edit made under this guide

1. **State the metric first.** Before editing, name the outcome: add-to-cart rate, PDP scroll depth, bounce rate, AOV, checkout abandonment, trust/credibility, mobile usability. If an edit can't be tied to one of these, it's out of scope here.
2. **Beat the competitor pattern, don't just copy it.** Elixir and Shrine are the bar, not the ceiling — when closing a gap, aim to execute the pattern more cleanly (faster, more accessible, better mobile behavior) than they do.
3. **Prefer existing blocks/sections over new markup.** This theme already uses Shopify's block-based architecture (`blocks/`, `sections/`, `snippets/`). Extend or restyle existing blocks (e.g. `_trust-rating.liquid`, `usp-checklist.liquid`, `comparison-slider.liquid`, `package-selector.liquid`) before inventing new ones.
4. **Watch schema validation.** Past work broke schema validation on the landing template (`fb11bd5`). Always confirm `{% schema %}` blocks in edited sections/blocks are valid JSON before considering a task done.
5. **Protect buy-box consistency.** Recent work (`7de26e6`, `840ee9c`) rebuilt the PDP buy-box for competitor parity and fixed cross-block consistency (colors, borders, fonts, mobile grid). Any new PDP edit must preserve that consistency — same color scheme tokens, spacing scale, and border treatment across `product-information.liquid` and its blocks.
6. **Checkout/cart logic is higher risk.** `main-cart.liquid`, `cart-summary`, and checkout-adjacent blocks touch Shopify's checkout flow. Changes here should be visual/UX (clarity, reassurance, friction reduction) — not logic rewrites — unless explicitly requested.
7. **Mobile-first verification.** Every CRO change must be checked at mobile width first — most competitor-benchmarked traffic (and most Elixir/Shrine sales) is mobile.
8. **Never hardcode data that Shopify already provides.** Any section/block that displays product, variant, price, inventory, or review data must render it from Shopify's Liquid objects, not from typed-in placeholder values. See "Data integrity rule" below — this applies to every CRO edit, no exceptions.

## Data integrity rule: real backend data only, no hardcoded values

Whenever an edit touches something that involves store data (price, variants, inventory, reviews, ratings, quantity, images), the output must reflect what's actually in the Shopify backend for that product/collection — not a fixed example value written into the template.

**What this means in practice:**
- **Variants** — if a product has 3 variants, all 3 must be represented (loop over `product.variants`, not a hand-picked subset). If a product has no variants beyond the default, the picker should not fabricate options — render whatever `product.options_with_values` actually returns.
- **Prices** — always pull from `variant.price` / `product.price_min` / `product.price_max` via `snippets/price.liquid` and `snippets/format-price.liquid` (already built to default to `0` when a value is genuinely absent, e.g. `assign price_value = price | default: 0` in `format-price.liquid`). Never write a literal price string into markup to "show what it looks like" — use a real product or `product == blank` preview fallback instead.
- **Inventory / stock messages** — `blocks/product-inventory.liquid` already reads `variant.inventory_quantity` and `variant.inventory_policy`; low-stock/out-of-stock thresholds must come from the merchant's `inventory_threshold` setting, never a hardcoded "Only 3 left!" string.
- **Reviews/ratings** — star counts, review totals, and quotes must come from the connected review app's metafields/objects (e.g. via `sections/customer-reviews.liquid`, `blocks/_rating-badge.liquid`), not sample text left in the block.
- **Zero/empty states are real states, not bugs to hide.** If a product has 0 reviews, 0 stock, or only 1 variant, the section should render that truthfully (e.g. hide the rating stars, show "Out of stock", show a single non-interactive option) rather than falling back to placeholder numbers.
- **When previewing in the theme editor with no product context**, it's acceptable to fall back to `collections.all.products.first` (the pattern already used in `blocks/product-description.liquid` and `blocks/variant-picker.liquid`) purely so the block renders something in the editor — this is a preview fallback, not a production hardcode, and must never be the value shown to real storefront visitors.

Any CRO suggestion that "shows 3 variants at $X, $Y, $Z" as an example must be understood as illustrative only — the actual implementation always loops over the live `product.variants` (or equivalent object) for whatever product the merchant assigns.

## Competitive benchmark: what Elixir and Shrine do well

| Pattern | Elixir | Shrine | Horizon (this theme) status |
|---|---|---|---|
| Sticky add-to-cart on scroll | Yes | Partial | Check `blocks/add-to-cart.liquid` / `blocks/buy-buttons.liquid` — add sticky behavior if missing |
| Trust badges near price (secure checkout, guarantees) | Yes, prominent | Minimal | `blocks/_trust-rating.liquid`, `blocks/usp-checklist.liquid`, `blocks/payment-icons.liquid` exist — verify placement directly under price/buy-buttons |
| Urgency/scarcity signals (low stock, fast shipping countdown) | Yes | No (deliberately minimal) | `blocks/product-inventory.liquid` — confirm low-stock messaging is visible, not just present in code |
| Bundle / volume discount selector | Yes | No | `blocks/package-selector.liquid` already exists — ensure it's wired into `product.json` and styled to feel native, not bolted-on |
| Before/after or lifestyle comparison imagery | Sometimes | Yes | `blocks/comparison-slider.liquid` exists — confirm it's used on key PDPs |
| Large, distraction-free product gallery | Adequate | Excellent | `snippets/product-media-gallery-content.liquid`, `blocks/_product-media-gallery.liquid` — Shrine's minimalism is the bar here |
| Reviews/social proof near add-to-cart | Yes | Yes | `sections/customer-reviews.liquid`, `blocks/_review-card.liquid`, `blocks/_rating-badge.liquid` — check proximity to buy-box, not just page presence |
| Key differentiators / stat strip (e.g. "10,000+ sold", "30-day returns") | Yes | Sometimes | `sections/key-metrics.liquid`, `blocks/_stat-item.liquid`, `blocks/_usp-item.liquid` |
| Clean variant/swatch picker | Adequate | Excellent | `blocks/variant-picker.liquid`, `blocks/swatches.liquid` |
| Accelerated/express checkout button (Shop Pay etc.) | Yes | Yes | `blocks/accelerated-checkout.liquid` — confirm it renders above the fold near primary ATC |

Use this table as a living checklist. When asked to "improve the PDP" or "optimize for conversion," check this table first, identify the weakest row for the page in question, and fix that before moving to the next.

## The Perfect Product Page framework (Attention → Belief → Convert)

Every PDP edit should be classified into one of three stages — **Attention** (get noticed), **Belief** (build trust that this product solves the visitor's problem), **Convert** (remove every remaining reason not to buy). If a change doesn't clearly serve one of these three, it's decoration, not CRO. Checklist below maps each stage's components to what already exists in this theme vs. what's missing.

### 1. Attention — first 3 seconds above the fold

| Component | Spec | Theme file(s) |
|---|---|---|
| Product media | Min. 5 images + video/360 where possible: front, back, side, detail x2, lifestyle/in-use. Thumbnails visible, not hidden in a swipe-only carousel | `blocks/_product-media-gallery.liquid`, `snippets/product-media.liquid`, `snippets/product-media-gallery-content.liquid` |
| Product badges | New / Best seller / Low stock / Limited edition, positioned consistently (top-left is standard) | `blocks/_offer-label.liquid` — confirm it supports badge-style short tags, not just the dashed "offer line" text treatment |
| Pricing | Main price bold, strike-through compare-at price, buy-now-pay-later line (one line only, e.g. "or 4 payments of $X with Afterpay") | `blocks/price.liquid`, `snippets/price.liquid`, `snippets/format-price.liquid` |
| Pitch | One elevator-pitch sentence: the outcome, not the feature list. Can double as a strong review pull-quote | `blocks/product-title.liquid` + `blocks/product-description.liquid` (richtext) — first line of the description block should carry this, not be buried |
| Star rating | Visible directly under the title, links/scrolls to reviews | `blocks/_rating-badge.liquid`, `sections/customer-reviews.liquid` |

### 2. Belief — why this product, why trust it

| Component | Spec | Theme file(s) |
|---|---|---|
| Benefits & features | Outcome-focused benefits first, feature bullets second — not a spec dump | `blocks/product-description.liquid` (richtext), consider structured bullets via `blocks/usp-checklist.liquid` |
| Options / variant clarity | Size with clickable size guide, colour swatches (not a plain dropdown), tapping a swatch swaps the image | `blocks/variant-picker.liquid`, `blocks/swatches.liquid` |
| Feature icons | 3-4 short icon+label callouts (USPs) directly under the buy-box, not buried in the description | `blocks/_usp-item.liquid`, `blocks/usp-checklist.liquid` |
| Social proof | Expanded reviews (not just stars): review text, photos/UGC, verified-buyer tag, awards/press logos, "as seen in" | `sections/customer-reviews.liquid`, `blocks/_review-card.liquid`, `blocks/_rating-badge.liquid` — no UGC/press-logo block currently exists; flag as a gap if requested |
| Supporting info (accordion) | Product spec/size guide, shipping message, returns & warranty, FAQ (3-5 questions max, then link out) — each as its own collapsible row | `blocks/accordion.liquid` + `blocks/_accordion-row.liquid` (already theme-native, `accordion-custom.js` in `assets/`) — this is the right tool for shipping/returns/FAQ tabs, don't hardcode new markup |
| Related / you may also like | Same category or shared tags — complementary, not random | `sections/product-recommendations.liquid` |

### 3. Convert — remove the last objections, one clear action

| Component | Spec | Theme file(s) |
|---|---|---|
| CTA block | **One** primary button only. Button text can be action-based ("Add to Cart", "Select a Size" when a variant isn't chosen yet). Input + button large enough for thumbs (min 40px tall). Button colour must contrast the page background | `blocks/buy-buttons.liquid`, `blocks/add-to-cart.liquid`, `snippets/buy-buttons-styles.liquid` |
| Quantity | Only show if relevant; prefer a compact stepper/dropdown over a bare text input | `blocks/quantity.liquid` |
| Accelerated checkout | Shop Pay / express wallet button visible near the primary CTA, not hidden below the fold | `blocks/accelerated-checkout.liquid` |
| Objection busters | Guarantee/risk-remover (e.g. "100-day money-back guarantee"), shipping message (dispatch time + cost/ETA), returns window — short, visible near the CTA, each with an optional "read more" link | `blocks/_offer-label.liquid` for short badges; longer copy belongs in the accordion rows above, not crammed into the buy-box |
| Trust badges | Secure checkout, payment icons, delivery/warranty badges directly under or beside the CTA | `blocks/_trust-rating.liquid`, `blocks/payment-icons.liquid` |
| Scarcity / urgency | Low-stock indicator when genuinely low; avoid fake countdowns — only wire up scarcity elements that reflect real inventory | `blocks/product-inventory.liquid` (already threshold-aware via `inventory_threshold` setting) |
| Conversion bumps | Buy-now-pay-later, bundle/subscription pricing (one-time vs. subscribe & save), package/volume discounts | `blocks/package-selector.liquid`, `blocks/price.liquid` |

### Product Description Framework (for the `product-description.liquid` richtext block)

Structure every product description in this order, not as a wall of text:
1. **Pitch** — one sentence, outcome-focused ("what problem this solves / how it makes them feel").
2. **Outcomes** — 3-5 bullet results of using the product (use `blocks/usp-checklist.liquid` or bold list items).
3. **Benefits** — why it matters to the visitor, above features.
4. **Features** — the technical facts, last, for the visitor who wants detail.

This keeps the belief-building content skimmable and puts the emotional/outcome hook before the spec sheet.

## File map — where CRO levers live in this theme

**Homepage / Landing**
- `templates/index.json`, `templates/product.landing.json`
- `sections/hero.liquid`, `sections/marquee.liquid`, `sections/layered-slideshow.liquid`, `sections/key-metrics.liquid`, `sections/media-with-content.liquid`

**Product page (PDP)**
- `templates/product.json`
- `sections/product-information.liquid`, `sections/featured-product-information.liquid`, `sections/product-hotspots.liquid`
- `blocks/buy-buttons.liquid`, `blocks/add-to-cart.liquid`, `blocks/accelerated-checkout.liquid`, `blocks/price.liquid`, `blocks/variant-picker.liquid`, `blocks/swatches.liquid`, `blocks/quantity.liquid`, `blocks/product-inventory.liquid`, `blocks/package-selector.liquid`, `blocks/comparison-slider.liquid`, `blocks/sku.liquid`
- `blocks/_trust-rating.liquid`, `blocks/usp-checklist.liquid`, `blocks/_offer-label.liquid`, `blocks/_usp-item.liquid`
- `blocks/accordion.liquid`, `blocks/_accordion-row.liquid` (shipping / returns / FAQ / size guide tabs — `assets/accordion-custom.js`)
- `blocks/product-description.liquid` (Pitch → Outcomes → Benefits → Features structure)
- `sections/customer-reviews.liquid`, `sections/product-recommendations.liquid`
- `snippets/product-media-gallery-content.liquid`, `snippets/buy-buttons-styles.liquid`, `snippets/product-badges-styles.liquid`, `snippets/price.liquid`, `snippets/format-price.liquid`

**Collection / PLP**
- `templates/collection.json`, `sections/main-collection.liquid`, `sections/product-list.liquid`
- `snippets/product-card.liquid`, `snippets/product-grid.liquid`, `snippets/price-filter.liquid`, `blocks/_product-card.liquid`, `blocks/_offer-label.liquid`

**Cart**
- `templates/cart.json`, `sections/main-cart.liquid`
- `snippets/cart-summary.liquid`, `snippets/cart-products.liquid`, `snippets/cart-items-component.liquid`, `blocks/_cart-summary.liquid`, `blocks/_cart-products.liquid`

**Global trust/nav**
- `sections/header.liquid`, `sections/header-announcements.liquid`, `sections/footer.liquid`, `blocks/payment-icons.liquid`, `blocks/follow-on-shop.liquid`

## Priority order when asked to "optimize a page"

Maps directly onto the Attention → Belief → Convert framework above:

1. **Attention** — above-the-fold clarity: media, badges, bold price, pitch line, star rating visible without scrolling on mobile.
2. **Belief** — trust and social proof adjacency (reviews/ratings/UGC/awards within one scroll of the buy-box), accordion tabs for spec/shipping/returns/FAQ instead of a wall of text.
3. **Convert** — friction removal in the buy-box: one primary CTA, thumb-sized tap targets (min 40px), contrasting button colour, variant picker/swatches/quantity, sticky ATC.
4. **Convert** — objection busters and trust badges beside the CTA (guarantee, shipping, secure checkout, payment icons).
5. Urgency/scarcity and differentiation (real stock messaging, bundle/package selector, key metrics) — only when backed by real inventory data.
6. Cross-sell/upsell surfaces (recommendations, comparison slider) — after the primary conversion path is solid, not before.
7. Cart and checkout entry clarity (cart summary, express checkout visibility).

## Out of scope under this guide

- Non-visual refactors, dependency upgrades, or code cleanup with no UX/CRO justification.
- Backend/inventory/logic changes unrelated to presentation.
- New features not mapped to one of the metrics in "Ground rules" above.
- Checkout logic changes beyond what Shopify themes are permitted to customize.

When in doubt, name the competitor pattern being matched (Elixir or Shrine), name the metric, name the file — then edit.
