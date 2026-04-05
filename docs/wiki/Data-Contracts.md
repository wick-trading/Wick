# Data Contracts

All Vela components consume standardized TypeScript types from `@vela-trading/core`. These types are exchange-agnostic — you map your exchange's data format to these types.

## Types

### OrderBookLevel

```typescript
interface OrderBookLevel {
  price: number;  // Price at this level
  size: number;   // Quantity/size at this level
}
```

### OrderBookData

```typescript
interface OrderBookData {
  bids: OrderBookLevel[];  // Sorted descending by price
  asks: OrderBookLevel[];  // Sorted ascending by price
}
```

### OrderBookDelta

```typescript
interface OrderBookDelta {
  side: 'bid' | 'ask';
  price: number;
  size: number;  // 0 = remove this level
}
```

### Trade

```typescript
interface Trade {
  id: string;       // Unique trade identifier
  price: number;    // Execution price
  size: number;     // Trade size/quantity
  side: 'buy' | 'sell';  // Taker side
  timestamp: number;     // Unix timestamp in milliseconds
}
```

### TickerData

```typescript
interface TickerData {
  symbol: string;       // e.g. 'BTC/USD'
  price: number;        // Current price
  prevPrice?: number;   // Previous price (for flash direction)
  high24h?: number;     // 24h high
  low24h?: number;      // 24h low
  volume24h?: number;   // 24h volume
  change24h?: number;   // 24h change percentage
  timestamp: number;    // Unix timestamp in milliseconds
}
```

### Candle (OHLCV)

```typescript
interface Candle {
  time: number;    // Unix timestamp
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
```

### PriceFormatOptions

```typescript
interface PriceFormatOptions {
  precision?: number;       // Decimal places (default: 2)
  locale?: string;          // Number locale (default: 'en-US')
  currencySymbol?: string;  // Prepended symbol (default: '')
}
```

## Mapping Exchange Data

### Binance WebSocket

```javascript
// Binance order book depth stream
ws.onmessage = (e) => {
  const msg = JSON.parse(e.data);

  // Map Binance format to Vela format
  const delta = {
    side: msg.s === 'BUY' ? 'bid' : 'ask',
    price: parseFloat(msg.p),
    size: parseFloat(msg.q),
  };

  orderBook.applyDelta(delta);
};
```

### Coinbase WebSocket

```javascript
// Coinbase l2update channel
ws.onmessage = (e) => {
  const msg = JSON.parse(e.data);

  if (msg.type === 'l2update') {
    const deltas = msg.changes.map(([side, price, size]) => ({
      side: side === 'buy' ? 'bid' : 'ask',
      price: parseFloat(price),
      size: parseFloat(size),
    }));

    orderBook.applyDeltas(deltas);
  }
};
```

## Utilities

`@vela-trading/core` exports utility functions:

```javascript
import {
  formatPrice,          // Format price for display
  formatSize,           // Format size (with K/M abbreviations)
  applyOrderBookDelta,  // Immutably apply delta to order book
  cumulativeTotals,     // Calculate running totals for depth bars
} from '@vela-trading/core';

formatPrice(67432.5, { precision: 2, currencySymbol: '$' });
// → "$67,432.50"

formatSize(1500000);
// → "1.50M"

formatSize(2500);
// → "2.50K"
```
