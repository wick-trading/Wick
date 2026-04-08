# @wick/indicators — Transmigration Sources

## Primary Sources

### react-stockcharts
- **URL:** https://github.com/rrag/react-stockcharts
- **License:** MIT
- **Stars:** ~4,000
- **Status:** Abandoned. Last meaningful release ~2018. Broken on React 17/18/19.
- **Why valuable:** 60+ indicators with battle-tested math. The indicator calculation logic
  (series calculations, data accessors) is framework-agnostic underneath the React layer.
- **What to take:** Pure math functions from `src/lib/indicator/` — they are already
  stateless transforms `(data: OHLCV[]) => SeriesData[]`. Strip the React rendering layer,
  keep the math.

### react-financial-charts
- **URL:** https://github.com/react-financial/react-financial-charts
- **License:** MIT
- **Stars:** ~1,400
- **Status:** Inactive (Snyk). Last release v2.0.1, May 2023. React 18 incomplete.
- **Why valuable:** TypeScript fork of react-stockcharts with a monorepo structure.
  Better starting point than the original — types already exist.
- **What to take:** `packages/indicators/` calculation logic. Discard all React rendering
  components. Keep: `src/calculator/` for each indicator.

---

## Transmigration Plan

1. **Extract pure math** — copy indicator calculation functions, remove all React/D3 deps.
2. **Type them properly** — `(candles: Candle[], options: T) => SeriesPoint[]`
3. **Wrap as Web Components** — each indicator is a `<wick-indicator-*>` that:
   - Accepts a `chart` attribute pointing to a `<wick-candlestick-chart>`
   - Calls `chart.getChartApi()` to add a series overlay
   - Re-calculates on candle prop changes
4. **Add to @wick/react, @wick/vue, etc.** — thin wrappers

## Key Indicator Files to Port

From `react-financial-charts`:
- `packages/indicators/src/calculator/ema.ts`
- `packages/indicators/src/calculator/sma.ts`
- `packages/indicators/src/calculator/macd.ts`
- `packages/indicators/src/calculator/rsi.ts`
- `packages/indicators/src/calculator/bollingerBand.ts`
- `packages/indicators/src/calculator/atr.ts`
- `packages/indicators/src/calculator/stochastic.ts`

## License Compliance
All source code is MIT licensed. Attribution in package README required.
Include `NOTICE` file listing original authors.
