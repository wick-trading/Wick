# Styling Guide

Vela components are **headless** — they ship with zero CSS. You have full control over appearance using standard CSS techniques.

## Approach

Since components opt out of Shadow DOM (rendering to the light DOM), you can style them with regular CSS selectors. Components expose:

1. **CSS Parts** (`[part="..."]`) — target specific elements within a component
2. **CSS Custom Properties** (`--vela-*`) — configure component behavior via properties
3. **Data Attributes** (`[data-direction]`, `[data-flashing]`) — state-driven styling

## Dark Theme Example

```css
:root {
  --vela-ob-bid-color: #00e676;
  --vela-ob-ask-color: #ff5252;
  --vela-ob-bid-depth-color: rgba(0, 230, 118, 0.12);
  --vela-ob-ask-depth-color: rgba(255, 82, 82, 0.12);
  --vela-ob-row-height: 28px;
  --vela-ob-font-size: 13px;

  --vela-tf-buy-color: #00e676;
  --vela-tf-sell-color: #ff5252;
  --vela-tf-max-height: 500px;

  --vela-ticker-up-color: #00e676;
  --vela-ticker-down-color: #ff5252;
}

/* Order book styling */
vela-order-book {
  font-family: 'SF Mono', 'Fira Code', monospace;
  background: #0d1117;
  border: 1px solid #21262d;
  border-radius: 8px;
  padding: 12px;
}

vela-order-book th {
  color: #484f58;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 6px 8px;
  border-bottom: 1px solid #21262d;
}

vela-order-book td {
  padding: 4px 8px;
  font-variant-numeric: tabular-nums;
}

vela-order-book tr:hover {
  background: rgba(255, 255, 255, 0.04);
}

/* Trade feed styling */
vela-trade-feed {
  font-family: 'SF Mono', monospace;
}

vela-trade-feed [part~="buy-row"] [part="price"] {
  color: var(--vela-tf-buy-color);
}

vela-trade-feed [part~="sell-row"] [part="price"] {
  color: var(--vela-tf-sell-color);
}

/* Price ticker with flash animation */
vela-price-ticker [part="symbol"] {
  font-size: 18px;
  font-weight: 700;
}

vela-price-ticker [part="price"] {
  font-size: 28px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  transition: color 150ms ease;
}

vela-price-ticker [data-flashing] [part="price"] {
  animation: price-flash 300ms ease-out;
}

@keyframes price-flash {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}
```

## Light Theme Example

```css
:root {
  --vela-ob-bid-color: #16a34a;
  --vela-ob-ask-color: #dc2626;
  --vela-ob-bid-depth-color: rgba(22, 163, 74, 0.08);
  --vela-ob-ask-depth-color: rgba(220, 38, 38, 0.08);

  --vela-tf-buy-color: #16a34a;
  --vela-tf-sell-color: #dc2626;

  --vela-ticker-up-color: #16a34a;
  --vela-ticker-down-color: #dc2626;
}

vela-order-book {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
}
```

## Tailwind CSS

Since components render to the light DOM, Tailwind classes work directly:

```html
<vela-order-book class="bg-gray-900 rounded-lg p-4 font-mono text-sm">
</vela-order-book>
```

You can also target parts with Tailwind's arbitrary selectors:

```html
<style>
  vela-order-book [part~="bid-row"] [part="price"] {
    @apply text-green-400;
  }
  vela-order-book [part~="ask-row"] [part="price"] {
    @apply text-red-400;
  }
</style>
```
