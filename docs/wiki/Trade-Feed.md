# Trade Feed — `<wick-trade-feed>`

Scrolling list of recent trades with buy/sell indicators. Supports streaming via `addTrade()` and configurable time formatting.

## Usage

```html
<wick-trade-feed max-trades="50" time-format="time"></wick-trade-feed>
```

```javascript
import '@wick/trade-feed';

const feed = document.querySelector('wick-trade-feed');

// Set initial trades
feed.trades = [
  { id: '1', price: 67432.50, size: 0.5, side: 'buy', timestamp: Date.now() },
  { id: '2', price: 67430.00, size: 1.2, side: 'sell', timestamp: Date.now() - 1000 },
];

// Stream new trades
feed.addTrade({
  id: '3',
  price: 67435.00,
  size: 0.3,
  side: 'buy',
  timestamp: Date.now(),
});

// Batch insert
feed.addTrades([trade1, trade2, trade3]);
```

## Properties

| Property | Attribute | Type | Default | Description |
|----------|-----------|------|---------|-------------|
| `trades` | — | `Trade[]` | `[]` | Array of trades (newest first) |
| `maxTrades` | `max-trades` | `number` | `50` | Max visible trades |
| `priceFormat` | — | `PriceFormatOptions` | `{}` | Price formatting options |
| `sizePrecision` | `size-precision` | `number` | `4` | Decimal places for size |
| `timeFormat` | `time-format` | `'time' \| 'datetime' \| 'relative'` | `'time'` | Timestamp display format |

## Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `addTrade` | `(trade: Trade) => void` | Add a single trade to the top |
| `addTrades` | `(trades: Trade[]) => void` | Batch insert multiple trades |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `wick-trade-click` | `Trade` | Fired when a trade row is clicked |

## Time Formats

| Value | Output |
|-------|--------|
| `'time'` | `14:32:05` (HH:MM:SS) |
| `'datetime'` | `4/5/2026, 2:32:05 PM` (locale string) |
| `'relative'` | `3s ago`, `5m ago`, `2h ago` |

## CSS Parts

| Part | Description |
|------|-------------|
| `container` | Outer wrapper |
| `table` | The table element |
| `header` | Column headers row |
| `list` | Scrollable trades tbody |
| `row` | Each trade row |
| `buy-row` | Buy trade rows |
| `sell-row` | Sell trade rows |
| `price` | Price cell |
| `size` | Size cell |
| `time` | Timestamp cell |

## CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--wick-tf-buy-color` | `inherit` | Buy trade text color |
| `--wick-tf-sell-color` | `inherit` | Sell trade text color |
| `--wick-tf-row-height` | `24px` | Row height |
| `--wick-tf-font-size` | `13px` | Font size |
| `--wick-tf-max-height` | `400px` | Max height of scrollable area |
