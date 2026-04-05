# Wick

Headless Web Components for trading interfaces. Framework-agnostic, unstyled, real-time ready.

## Documentation

| | |
|---|---|
| [Getting Started](docs/wiki/Getting-Started.md) | Installation, basic usage, framework integration |
| [Components](docs/wiki/Components.md) | Overview of all components and design principles |
| [Order Book](docs/wiki/Order-Book.md) | `<wick-order-book>` — full API reference |
| [Price Ticker](docs/wiki/Price-Ticker.md) | `<wick-price-ticker>` — full API reference |
| [Trade Feed](docs/wiki/Trade-Feed.md) | `<wick-trade-feed>` — full API reference |
| [Styling Guide](docs/wiki/Styling-Guide.md) | Dark/light themes, Tailwind, CSS parts |
| [Data Contracts](docs/wiki/Data-Contracts.md) | TypeScript types, exchange mapping examples |
| [Architecture](docs/wiki/Architecture.md) | Project structure, build pipeline, design decisions |
| [Contributing](docs/wiki/Contributing.md) | Development setup, component guidelines |
| [Development Log](docs/DEVELOPMENT.md) | Issues encountered & solutions |

## Packages

| Package | Description | Size (gzip) |
|---------|-------------|-------------|
| `@wick/core` | Shared types & utilities | ~0.5 KB |
| `@wick/order-book` | `<wick-order-book>` | ~1.8 KB |
| `@wick/price-ticker` | `<wick-price-ticker>` | ~1.2 KB |
| `@wick/trade-feed` | `<wick-trade-feed>` | ~1.4 KB |
| `@wick/adapters` | Binance, Coinbase, Kraken adapters | ~0.6 KB each |

## Quick Start

```bash
npm install @wick/order-book @wick/price-ticker @wick/trade-feed
```

### Order Book

```html
<wick-order-book depth="15" show-total show-depth></wick-order-book>

<script type="module">
  import '@wick/order-book';

  const ob = document.querySelector('wick-order-book');

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
  ob.addEventListener('wick-order-book-level-click', (e) => {
    console.log(e.detail); // { price: 67400, side: 'bid' }
  });
</script>
```

### Price Ticker

```html
<wick-price-ticker show-details></wick-price-ticker>

<script type="module">
  import '@wick/price-ticker';

  const ticker = document.querySelector('wick-price-ticker');

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
  ticker.addEventListener('wick-price-change', (e) => {
    console.log(e.detail.direction); // 'up' or 'down'
  });
</script>
```

### Trade Feed

```html
<wick-trade-feed max-trades="50" time-format="time"></wick-trade-feed>

<script type="module">
  import '@wick/trade-feed';

  const feed = document.querySelector('wick-trade-feed');

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
wick-order-book [part~="bid-row"] [part="price"] { color: #4dff88; }
wick-order-book [part~="ask-row"] [part="price"] { color: #ff4d4d; }
--wick-ob-bid-depth-color: rgba(77, 255, 77, 0.15);
--wick-ob-ask-depth-color: rgba(255, 77, 77, 0.15);
--wick-ob-row-height: 24px;

/* Price ticker */
--wick-ticker-up-color: #4dff88;
--wick-ticker-down-color: #ff4d4d;
--wick-ticker-flash-duration: 300ms;

/* Trade feed */
--wick-tf-buy-color: #4dff88;
--wick-tf-sell-color: #ff4d4d;
--wick-tf-max-height: 400px;
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
