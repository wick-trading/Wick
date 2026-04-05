# Price Ticker — `<vela-price-ticker>`

Displays a single instrument's price with flash-on-change direction detection and optional 24h stats.

## Usage

```html
<vela-price-ticker show-details></vela-price-ticker>
```

```javascript
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

// Update with new price — triggers flash
ticker.data = { ...ticker.data, price: 67450.00, timestamp: Date.now() };
```

## Properties

| Property | Attribute | Type | Default | Description |
|----------|-----------|------|---------|-------------|
| `data` | — | `TickerData` | `{ symbol: '', price: 0, timestamp: 0 }` | Ticker data |
| `priceFormat` | — | `PriceFormatOptions` | `{}` | Price formatting options |
| `showDetails` | `show-details` | `boolean` | `false` | Show 24h high, low, volume |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `vela-price-change` | `{ price, prevPrice, direction }` | Fired on price change. `direction` is `'up'`, `'down'`, or `'neutral'` |

## Flash-on-Change

When the price changes, the component:
1. Sets `data-direction="up"` or `data-direction="down"` on the container
2. Sets `data-flashing` attribute for 300ms
3. Fires `vela-price-change` event

Style the flash with CSS:

```css
vela-price-ticker [data-direction="up"] [part="price"] {
  color: #4dff88;
}

vela-price-ticker [data-direction="down"] [part="price"] {
  color: #ff4d4d;
}

vela-price-ticker [data-flashing] [part="price"] {
  animation: flash 300ms ease-out;
}

@keyframes flash {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}
```

## CSS Parts

| Part | Description |
|------|-------------|
| `container` | Outer wrapper |
| `symbol` | Instrument symbol |
| `price` | Current price |
| `change` | 24h change percentage |
| `high` | 24h high price |
| `low` | 24h low price |
| `volume` | 24h volume |

## CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--vela-ticker-up-color` | `inherit` | Price increase color |
| `--vela-ticker-down-color` | `inherit` | Price decrease color |
| `--vela-ticker-flash-duration` | `300ms` | Flash animation duration |
