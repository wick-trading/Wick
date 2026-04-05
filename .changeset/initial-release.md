---
"@wick/core": minor
"@wick/order-book": minor
"@wick/price-ticker": minor
"@wick/trade-feed": minor
"@wick/depth-chart": minor
"@wick/candlestick-chart": minor
"@wick/adapters": minor
---

Initial release of Wick — headless Web Components for trading interfaces.

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
