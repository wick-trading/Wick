# Order Book — `<vela-order-book>`

Displays bids and asks with depth visualization. Supports streaming delta updates, price grouping, and configurable depth.

## Usage

```html
<vela-order-book
  depth="15"
  show-total
  show-depth
  size-precision="4"
  grouping="0.01"
></vela-order-book>
```

```javascript
import '@vela-trading/order-book';

const ob = document.querySelector('vela-order-book');

// Set full snapshot
ob.data = {
  bids: [{ price: 67400, size: 1.5 }],
  asks: [{ price: 67401, size: 0.8 }],
};

// Apply streaming delta
ob.applyDelta({ side: 'bid', price: 67400, size: 2.0 });

// Batch deltas
ob.applyDeltas([
  { side: 'bid', price: 67400, size: 2.0 },
  { side: 'ask', price: 67401, size: 0 }, // size=0 removes the level
]);
```

## Properties

| Property | Attribute | Type | Default | Description |
|----------|-----------|------|---------|-------------|
| `data` | — | `OrderBookData` | `{ bids: [], asks: [] }` | Full order book snapshot |
| `depth` | `depth` | `number` | `15` | Visible levels per side |
| `priceFormat` | — | `PriceFormatOptions` | `{}` | Price formatting options |
| `sizePrecision` | `size-precision` | `number` | `4` | Decimal places for size display |
| `showTotal` | `show-total` | `boolean` | `true` | Show cumulative total column |
| `showDepth` | `show-depth` | `boolean` | `true` | Show depth visualization bars |
| `grouping` | `grouping` | `number` | `0` | Tick size for price grouping (0 = no grouping) |

## Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `applyDelta` | `(delta: OrderBookDelta) => void` | Apply a single delta update |
| `applyDeltas` | `(deltas: OrderBookDelta[]) => void` | Apply multiple deltas in batch |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `vela-order-book-level-click` | `{ price: number, side: 'bid' \| 'ask' }` | Fired when a price level row is clicked |

## CSS Parts

| Part | Description |
|------|-------------|
| `container` | Outer wrapper div |
| `table` | The table element |
| `header` | Column headers row |
| `header-price` | Price header cell |
| `header-size` | Size header cell |
| `header-total` | Total header cell |
| `asks` | Asks tbody |
| `bids` | Bids tbody |
| `row` | Each price level row |
| `ask-row` | Ask-side rows |
| `bid-row` | Bid-side rows |
| `price` | Price cell |
| `size` | Size cell |
| `total` | Cumulative total cell |

## CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--vela-ob-ask-color` | `inherit` | Ask price text color |
| `--vela-ob-bid-color` | `inherit` | Bid price text color |
| `--vela-ob-ask-depth-color` | `rgba(255,77,77,0.15)` | Ask depth bar fill |
| `--vela-ob-bid-depth-color` | `rgba(77,255,77,0.15)` | Bid depth bar fill |
| `--vela-ob-row-height` | `24px` | Row height |
| `--vela-ob-font-size` | `13px` | Font size |

## Price Grouping

Set `grouping` to aggregate levels by tick size:

```javascript
ob.grouping = 10;   // Group to nearest $10
ob.grouping = 0.01; // Group to nearest cent
ob.grouping = 0;    // No grouping (default)
```
