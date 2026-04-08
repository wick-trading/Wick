# Wick — Milestones

Wick is built by one person (@astralchemist). Trust is earned in small,
verifiable steps, not by shipping a 31-package badge wall. Each milestone
below has a single definition of done and a single artifact a stranger can
verify without asking.

No dates. No velocity claims. The only commitment is order.

---

## M0 — Honesty baseline ✅

**Done when:** the repo describes itself accurately.

- [x] `README.md` states solo maintenance and zero shipped packages
- [x] `CATEGORIES.md` legend matches reality (every built package is 🚧, not ✅)
- [x] `.github/CODEOWNERS` routes to a single owner with no phantom squads
- [x] `MILESTONES.md` exists (this file)

**Verify:** clone the repo, read the top of `README.md`, compare to
`packages/CATEGORIES.md`. They agree.

---

## M1 — First real ship: `@wick/order-book`

**Done when:** one stranger can `npm install @wick/order-book`, paste the
quick-start into a blank HTML file, and see a working order book.

- [ ] Published to npm at `@wick/order-book@0.1.0` (not a local workspace build)
- [ ] Dedicated docs page at `/docs/order-book` on the site with a runnable example
- [ ] Live demo at `/live` driven by the market engine, using the real
      `<wick-order-book>` element (not the interim React renderer)
- [ ] Unit tests cover delta application, depth rendering, and click events
      — not just "it mounts"
- [ ] `CHANGELOG.md` entry with the `0.1.0` release notes

**Verify:** `npm view @wick/order-book` returns a real package. The docs
page loads. The live demo renders the custom element, not a React fallback.

This is the only milestone that matters until it is done. Everything else
in the monorepo is preparation.

---

## M2 — The market-data trio

**Done when:** `@wick/price-ticker` and `@wick/trade-feed` meet the same
four criteria as M1, and the `/live` page wires all three real elements to
the market engine with cross-component highlighting preserved.

- [ ] `@wick/price-ticker@0.1.0` published + documented + demoed + tested
- [ ] `@wick/trade-feed@0.1.0` published + documented + demoed + tested
- [ ] `/live` page uses only real `<wick-*>` elements for these three —
      no interim renderers remain
- [ ] `@wick/react` wrappers for the trio are published and usable from a
      fresh Next.js project without workspace tricks

**Verify:** a fresh `npm create next-app`, `npm install @wick/react
@wick/order-book @wick/price-ticker @wick/trade-feed`, paste three imports,
render the trio.

---

## M3 — The first chart

**Done when:** `@wick/candlestick-chart` ships end-to-end and composes
cleanly with the market-data trio on the same page.

- [ ] `@wick/candlestick-chart@0.1.0` published + documented + demoed + tested
- [ ] Docs page shows it composed with `<wick-order-book>` sharing a symbol
- [ ] `@wick/theme` dark/glass/minimal tokens work without any per-component
      override

**Verify:** the docs page renders a candle chart and an order book side by
side, themed by a single `<link>` tag switch.

---

## M4 — Adapter proof

**Done when:** `@wick/adapters` can take a real Binance websocket stream
and feed the four shipped components without any user-side glue code.

- [ ] `@wick/adapters@0.1.0` published with at least the Binance adapter
- [ ] Docs page: "Connect to Binance in 10 lines" — and the 10 lines work
- [ ] One end-to-end recorded demo of live BTC/USDT data driving the page

**Verify:** copy the 10-line example, run it, watch real data flow.

---

## Beyond M4

The remaining 25+ built packages do not get milestones yet. They are 🚧
until they earn their way through the same four criteria: published,
documented, demoed, tested. Adding more milestones before M1 ships would
be exactly the kind of negentropy theater this file exists to prevent.

---

## Rules

1. **No milestone counts as done until a stranger can verify it.** Local
   workspace builds do not count. A passing test suite does not count.
   Only the public artifact counts.
2. **Milestones ship in order.** M2 does not start until M1 is verified.
3. **If a milestone has to be redefined mid-flight, the redefinition is
   logged in `CHANGELOG.md` with a reason.** Moving goalposts silently is
   how trust gets lost.
4. **Zero is an honest number.** The current count of shipped packages is
   zero. It will stay zero until M1 is actually done.
