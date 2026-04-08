# @wick/indicators

> `🚧 Built` — exists in the monorepo with tests, not yet published to npm.
> See [`MILESTONES.md`](../../MILESTONES.md) for the shipping roadmap.

Technical-analysis indicator overlays for `<wick-candlestick-chart>`. Pure
math lives in `math.ts` (EMA, SMA, Bollinger, MACD, RSI, VWAP) and each
indicator is exposed as a custom element that projects onto the parent
chart's coordinate system.

## Attribution

Math and indicator formulas studied from:

- **[react-financial-charts](https://github.com/react-financial/react-financial-charts)** — MIT
- **[react-stockcharts](https://github.com/rrag/react-stockcharts)** — MIT

Both are MIT-licensed; no additional `NOTICE` file is required. The
formulas themselves are standard TA literature. See [`SOURCES.md`](./SOURCES.md)
for a detailed account of what was taken (math patterns) and what was
rewritten from scratch (rendering, custom-element wiring).

## Status

- [x] EMA / SMA
- [x] Bollinger Bands
- [x] MACD
- [x] RSI
- [x] VWAP
- [ ] Stochastic / ATR / Ichimoku
- [ ] Published to npm
- [ ] Dedicated docs page
