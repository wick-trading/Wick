---
"@vela-trading/core": minor
"@vela-trading/order-book": minor
"@vela-trading/price-ticker": minor
"@vela-trading/trade-feed": minor
"@vela-trading/depth-chart": minor
"@vela-trading/candlestick-chart": minor
"@vela-trading/adapters": minor
---

Initial release of Vela — headless Web Components for trading interfaces.

**Components:**
- `<vela-order-book>` — bids/asks table with depth bars, grouping, delta updates
- `<vela-price-ticker>` — price display with flash-on-change direction detection
- `<vela-trade-feed>` — scrolling trade list with streaming API
- `<vela-depth-chart>` — Canvas 2D cumulative bid/ask depth visualization
- `<vela-candlestick-chart>` — OHLCV charts wrapping TradingView Lightweight Charts

**Exchange adapters:**
- Binance (depth, trades, ticker)
- Coinbase (L2 snapshots, matches, ticker)
- Kraken (book, trades, ticker)

All components are framework-agnostic, fully headless (no built-in styles), and optimized for real-time WebSocket data.
