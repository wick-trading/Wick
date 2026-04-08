# @wick/price-ticker

## 0.1.0

### Minor Changes

- [`b4c3e10`](https://github.com/wick-trading/Wick/commit/b4c3e10c256561fae5abd067711a7489e36ade2c) Thanks [@claude](https://github.com/claude)! - Initial release of Wick — headless Web Components for trading interfaces.

  **Components:**

  - `<wick-order-book>` — bids/asks table with depth bars, grouping, delta updates
  - `<wick-price-ticker>` — price display with flash-on-change direction detection
  - `<wick-trade-feed>` — scrolling trade list with streaming API
  - `<wick-depth-chart>` — Canvas 2D cumulative bid/ask depth visualization
  - `<wick-candlestick-chart>` — OHLCV charts wrapping TradingView Lightweight Charts

  **Exchange adapters:**

  - Binance (depth, trades, ticker)
  - Coinbase (L2 snapshots, matches, ticker)
  - Kraken (book, trades, ticker)

  All components are framework-agnostic, fully headless (no built-in styles), and optimized for real-time WebSocket data.

### Patch Changes

- Updated dependencies [[`b4c3e10`](https://github.com/wick-trading/Wick/commit/b4c3e10c256561fae5abd067711a7489e36ade2c)]:
  - @wick/core@0.1.0
