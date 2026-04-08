# Wick — Component Categories

This document is the operational map. Every package lives in one category.
Before building anything, check here to understand where it fits and what
state it's in.

Wick is built and maintained by one person (@astralchemist). Categories are
how the surface area is organised, not how work is divided.

---

## Status Legend

A package is only `✅ Shipped` when it meets **all four** criteria:

1. **Published** to npm under `@wick/*` at a real semver (≥ `0.1.0`)
2. **Documented** with a dedicated page on the site (not a one-line table entry)
3. **Demoed** live at `/live` driven by the market engine
4. **Tested** with meaningful unit tests (not just smoke tests)

| Symbol | Meaning |
|--------|---------|
| ✅ | Shipped — meets all four criteria above |
| 🚧 | Built — exists in the monorepo with tests, but not yet published/documented/demoed |
| 🔄 | Transmigrating — porting from an abandoned OSS library |
| 📋 | Planned — greenfield, design phase |
| 🧩 | Framework wrapper — thin wrapper, not a component |

**Current state (2026-04-08):** zero packages are `✅ Shipped`. Every row
below marked 🚧 exists in the monorepo with tests, but is not yet published,
documented, or live-demoed. The bar is deliberate — `✅` means a stranger can
`npm install` it and land on a real docs page. See [`MILESTONES.md`](../MILESTONES.md)
for the trust-building roadmap.

---

## Category 1 — Market Data
> Real-time streaming primitives. The core of any trading UI.

| Package | Status | Component | Notes |
|---------|--------|-----------|-------|
| `@wick/order-book` | 🚧 | `<wick-order-book>` | Delta streaming, depth bars, click events |
| `@wick/price-ticker` | 🚧 | `<wick-price-ticker>` | Flash-on-change, 24h stats |
| `@wick/trade-feed` | 🚧 | `<wick-trade-feed>` | Streaming trade list, time formats |
| `@wick/depth-chart` | 🚧 | `<wick-depth-chart>` | Canvas 2D, 60fps, crosshair |
| `@wick/funding-rate` | 🚧 | `<wick-funding-rate>` | Perp funding + countdown + composes `<wick-mini-chart>` for history |
| `@wick/open-interest` | 🚧 | `<wick-open-interest>` | Live OI counter + sparkline history. Fires `wick-oi-change` on delta threshold |
| `@wick/liquidation-feed` | 🚧 | `<wick-liquidation-feed>` | Streaming long/short liqs, whale-size highlight |
| `@wick/dom-ladder` | 🚧 | `<wick-dom-ladder>` | Fixed-axis DOM ladder, `applyDelta`, click-to-trade events |

---

## Category 2 — Charts
> OHLCV visualisation, technical analysis overlays, and inline mini charts.

| Package | Status | Component | Notes |
|---------|--------|-----------|-------|
| `@wick/candlestick-chart` | 🚧 | `<wick-candlestick-chart>` | Lightweight Charts, volume overlay |
| `@wick/indicators` | 🚧 | `<wick-indicator-ema>` etc. | EMA, SMA, Bollinger, MACD, RSI, VWAP overlays for `<wick-candlestick-chart>`. Pure math in `math.ts` |
| `@wick/volume-profile` | 🚧 | `<wick-volume-profile>` | VPVR with VAH/VAL/POC computation. Fires `wick-vp-poc-change` |
| `@wick/drawing-tools` | 🚧 | `<wick-drawing-overlay>` | Trendlines, fib, hlines, channels. Project callback for any chart |
| `@wick/mini-chart` | 🚧 | `<wick-mini-chart>` | SVG sparkline, auto up/down colour, area/dot/smooth/extremes/baseline |
| `@wick/correlation-matrix` | 🚧 | `<wick-correlation-matrix>` | Pearson grid for asset baskets. Static `returns()` + `pearson()` methods |

**Indicator roadmap (priority order):**
1. EMA / SMA (moving averages)
2. Bollinger Bands
3. MACD
4. RSI
5. VWAP
6. Volume Profile
7. Stochastic, ATR, Ichimoku

---

## Category 3 — Heatmaps
> Visual density maps for liquidity and market structure.

| Package | Status | Component | Notes |
|---------|--------|-----------|-------|
| `@wick/order-book-heatmap` | 🚧 | `<wick-order-book-heatmap>` | Canvas heatmap, ring-buffer snapshots, RAF loop, hit-test events |
| `@wick/market-heatmap` | 🚧 | `<wick-market-heatmap>` | Canvas squarified treemap. `updateTile()` for hot-patch without full relayout |

---

## Category 4 — Execution
> Order entry, sizing and management primitives.

| Package | Status | Component | Notes |
|---------|--------|-----------|-------|
| `@wick/order-ticket` | 🚧 | `<wick-order-ticket>` | Market/Limit/Stop/OCO entry. `validate()`, `buildOrder()`, `setSide()` |
| `@wick/order-manager` | 🚧 | `<wick-order-manager>` | Open orders table + cancel/modify events. `fillPct()` static helper |
| `@wick/position-sizer` | 🚧 | `<wick-position-sizer>` | Risk-based sizing: R-multiple, risk/reward, tick/lot rounding |

**Design target:** Headless forms with full validation, tick-size enforcement,
and normalised events. Style them to match any exchange.

---

## Category 5 — Portfolio
> Position, P&L, and account-state visualisation.

| Package | Status | Component | Notes |
|---------|--------|-----------|-------|
| `@wick/positions` | 🚧 | `<wick-positions>` | Open positions table, live P&L, `updatePrice()`, close events |
| `@wick/pnl` | 🚧 | `<wick-pnl-summary>` + `<wick-equity-curve>` | Stat tiles + equity chart. `patch()` for partial updates |
| `@wick/trade-history` | 🚧 | `<wick-trade-history>` | Closed trades log. `computeSummary()` returns winRate/profitFactor/expectancy |
| `@wick/risk-panel` | 🚧 | `<wick-risk-panel>` | Margin utilisation, safe/warn/danger levels, health bar |

---

## Category 6 — Market Overview
> Instrument discovery, comparison and session awareness.

| Package | Status | Component | Notes |
|---------|--------|-----------|-------|
| `@wick/watchlist` | 🚧 | `<wick-watchlist>` | Sortable table, per-cell flash, sparklines via `<wick-mini-chart>`. `updatePrices()` bulk |
| `@wick/screener` | 🚧 | `<wick-screener>` | Range/select filter engine. `setFilter()`, `resetFilters()`. Composable with watchlist |
| `@wick/symbol-search` | 🚧 | `<wick-symbol-search>` | Fuzzy search, keyboard nav, recent history. Static `score()` method |
| `@wick/market-clock` | 🚧 | `<wick-market-clock>` | Multi-market session clock + countdowns. Static `statusFor()` method |

---

## Category 7 — Alerts & Intel
> Awareness layer: alerts, news, calendars, and connection health.

| Package | Status | Component | Notes |
|---------|--------|-----------|-------|
| `@wick/alerts` | 🚧 | `<wick-alerts>` | Price/condition alerts engine. `>`, `<`, `crosses-above`, `crosses-below` ops |
| `@wick/news-feed` | 🚧 | `<wick-news-feed>` | Streaming headlines. `addItem()`, symbol+source filtering, sentiment parts |
| `@wick/economic-calendar` | 🚧 | `<wick-economic-calendar>` | Impact-tagged event calendar. Imminent-event countdown tick |
| `@wick/connection-status` | 🚧 | `<wick-connection-status>` | WS health state machine, latency display, stale-tick detection |

---

## Infrastructure
> Not components — support packages shared across every category.

| Package | Status | Notes |
|---------|--------|-------|
| `@wick/core` | 🚧 | Shared types, utils (`formatPrice`, `applyDelta`, etc.) |
| `@wick/adapters` | 🚧 | 10 exchange adapters (Binance → Wick types) |
| `@wick/theme` | 🚧 | 3 CSS themes: `dark`, `glass`, `minimal`. See `THEMING.md` |
| `@wick/react` | 🧩 | React wrappers for all built components |
| `@wick/vue` | 🧩 | Vue 3 wrappers |
| `@wick/svelte` | 🧩 | Svelte wrappers |
| `@wick/angular` | 🧩 | Angular directives |

---

## Build Order

When a new category starts, build in this order:
1. Types in `@wick/core` first (shared interfaces)
2. The Web Component package (headless)
3. Theme tokens in `@wick/theme` (extend existing variable names — see `THEMING.md`)
4. Framework wrappers (`@wick/react`, etc.) — thin re-exports
5. Docs page + playground in `site/`

## Transmigration Rule
Every package that ports from an existing library must have:
- `SOURCES.md` — original repo URL, license, what was taken, what was discarded
- `NOTICE` file if the source is not MIT (e.g. BSD-2-Clause for order-book-heatmap)
- Attribution in the package `README.md`

## Greenfield Rule
Every greenfield package must:
- Define its TypeScript data contracts in its `src/index.ts` (currently as design comments)
- Promote stable types into `@wick/core` once shipped
- Ship with a playground page in `site/` before declaring ✅
- Reuse the shared theme tokens — never invent isolated CSS variables (see `THEMING.md`)
