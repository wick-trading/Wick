# Vela

Headless Web Components for trading interfaces. Framework-agnostic, unstyled, real-time ready.

## Documentation

| | |
|---|---|
| [Getting Started](docs/wiki/Getting-Started.md) | Installation, basic usage, framework integration |
| [Components](docs/wiki/Components.md) | Overview of all components and design principles |
| [Order Book](docs/wiki/Order-Book.md) | `<vela-order-book>` — full API reference |
| [Price Ticker](docs/wiki/Price-Ticker.md) | `<vela-price-ticker>` — full API reference |
| [Trade Feed](docs/wiki/Trade-Feed.md) | `<vela-trade-feed>` — full API reference |
| [Styling Guide](docs/wiki/Styling-Guide.md) | Dark/light themes, Tailwind, CSS parts |
| [Data Contracts](docs/wiki/Data-Contracts.md) | TypeScript types, exchange mapping examples |
| [Architecture](docs/wiki/Architecture.md) | Project structure, build pipeline, design decisions |
| [Contributing](docs/wiki/Contributing.md) | Development setup, component guidelines |
| [Development Log](docs/DEVELOPMENT.md) | Issues encountered & solutions |

## Packages

| Package | Description | Size (gzip) |
|---------|-------------|-------------|
| `@vela-trading/core` | Shared types & utilities | ~0.5 KB |
| `@vela-trading/order-book` | `<vela-order-book>` | ~1.8 KB |
| `@vela-trading/price-ticker` | `<vela-price-ticker>` | ~1.2 KB |
| `@vela-trading/trade-feed` | `<vela-trade-feed>` | ~1.4 KB |
| `@vela-trading/adapters` | Binance, Coinbase, Kraken adapters | ~0.6 KB each |

## Quick Start

```bash
npm install @vela-trading/order-book @vela-trading/price-ticker @vela-trading/trade-feed
```

### Order Book

```html
<vela-order-book depth="15" show-total show-depth></vela-order-book>

<script type="module">
  import '@vela-trading/order-book';

  const ob = document.querySelector('vela-order-book');

  // Set full snapshot
  ob.data = {
    bids: [
      { price: 67400, size: 1.5 },
      { price: 67399, size: 3.2 },
    ],
    asks: [
      { price: 67401, size: 0.8 },
      { price: 67402, size: 2.1 },
    ],
  };

  // Stream delta updates from WebSocket
  ws.onmessage = (e) => {
    const delta = JSON.parse(e.data);
    ob.applyDelta(delta); // { side: 'bid', price: 67400, size: 2.0 }
  };

  // Listen for clicks
  ob.addEventListener('vela-order-book-level-click', (e) => {
    console.log(e.detail); // { price: 67400, side: 'bid' }
  });
</script>
```

### Price Ticker

```html
<vela-price-ticker show-details></vela-price-ticker>

<script type="module">
  import '@vela-trading/price-ticker';

  const ticker = document.querySelector('vela-price-ticker');

  ticker.data = {
    symbol: 'BTC/USD',
    price: 67432.50,
    change24h: 2.34,
    high24h: 68200,
    low24h: 66100,
    volume24h: 42150,
    timestamp: Date.now(),
  };

  // Flash-on-change: listen for direction
  ticker.addEventListener('vela-price-change', (e) => {
    console.log(e.detail.direction); // 'up' or 'down'
  });
</script>
```

### Trade Feed

```html
<vela-trade-feed max-trades="50" time-format="time"></vela-trade-feed>

<script type="module">
  import '@vela-trading/trade-feed';

  const feed = document.querySelector('vela-trade-feed');

  // Stream trades
  ws.onmessage = (e) => {
    const trade = JSON.parse(e.data);
    feed.addTrade(trade);
    // { id: '1', price: 67432.50, size: 0.5, side: 'buy', timestamp: 1712345678000 }
  };
</script>
```

## Styling

All components are **headless** — no built-in styles. Use CSS parts and custom properties:

```css
/* Order book */
vela-order-book [part~="bid-row"] [part="price"] { color: #4dff88; }
vela-order-book [part~="ask-row"] [part="price"] { color: #ff4d4d; }
--vela-ob-bid-depth-color: rgba(77, 255, 77, 0.15);
--vela-ob-ask-depth-color: rgba(255, 77, 77, 0.15);
--vela-ob-row-height: 24px;

/* Price ticker */
--vela-ticker-up-color: #4dff88;
--vela-ticker-down-color: #ff4d4d;
--vela-ticker-flash-duration: 300ms;

/* Trade feed */
--vela-tf-buy-color: #4dff88;
--vela-tf-sell-color: #ff4d4d;
--vela-tf-max-height: 400px;
```

## Data Types

```typescript
interface OrderBookLevel { price: number; size: number; }
interface OrderBookData { bids: OrderBookLevel[]; asks: OrderBookLevel[]; }
interface OrderBookDelta { side: 'bid' | 'ask'; price: number; size: number; }

interface Trade {
  id: string;
  price: number;
  size: number;
  side: 'buy' | 'sell';
  timestamp: number;
}

interface TickerData {
  symbol: string;
  price: number;
  prevPrice?: number;
  change24h?: number;
  high24h?: number;
  low24h?: number;
  volume24h?: number;
  timestamp: number;
}
```

## Development

```bash
npm install
npm run build    # Build all packages
npm test         # Run tests
npm run dev      # Start demo app
```

## License

MIT
