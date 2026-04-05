# Styling Guide

Wick components are **headless** — they ship with zero CSS. You have full control over appearance using standard CSS techniques.

## Approach

Since components opt out of Shadow DOM (rendering to the light DOM), you can style them with regular CSS selectors. Components expose:

1. **CSS Parts** (`[part="..."]`) — target specific elements within a component
2. **CSS Custom Properties** (`--wick-*`) — configure component behavior via properties
3. **Data Attributes** (`[data-direction]`, `[data-flashing]`) — state-driven styling

## Dark Theme Example

```css
:root {
  --wick-ob-bid-color: #00e676;
  --wick-ob-ask-color: #ff5252;
  --wick-ob-bid-depth-color: rgba(0, 230, 118, 0.12);
  --wick-ob-ask-depth-color: rgba(255, 82, 82, 0.12);
  --wick-ob-row-height: 28px;
  --wick-ob-font-size: 13px;

  --wick-tf-buy-color: #00e676;
  --wick-tf-sell-color: #ff5252;
  --wick-tf-max-height: 500px;

  --wick-ticker-up-color: #00e676;
  --wick-ticker-down-color: #ff5252;
}

/* Order book styling */
wick-order-book {
  font-family: 'SF Mono', 'Fira Code', monospace;
  background: #0d1117;
  border: 1px solid #21262d;
  border-radius: 8px;
  padding: 12px;
}

wick-order-book th {
  color: #484f58;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 6px 8px;
  border-bottom: 1px solid #21262d;
}

wick-order-book td {
  padding: 4px 8px;
  font-variant-numeric: tabular-nums;
}

wick-order-book tr:hover {
  background: rgba(255, 255, 255, 0.04);
}

/* Trade feed styling */
wick-trade-feed {
  font-family: 'SF Mono', monospace;
}

wick-trade-feed [part~="buy-row"] [part="price"] {
  color: var(--wick-tf-buy-color);
}

wick-trade-feed [part~="sell-row"] [part="price"] {
  color: var(--wick-tf-sell-color);
}

/* Price ticker with flash animation */
wick-price-ticker [part="symbol"] {
  font-size: 18px;
  font-weight: 700;
}

wick-price-ticker [part="price"] {
  font-size: 28px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  transition: color 150ms ease;
}

wick-price-ticker [data-flashing] [part="price"] {
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
  --wick-ob-bid-color: #16a34a;
  --wick-ob-ask-color: #dc2626;
  --wick-ob-bid-depth-color: rgba(22, 163, 74, 0.08);
  --wick-ob-ask-depth-color: rgba(220, 38, 38, 0.08);

  --wick-tf-buy-color: #16a34a;
  --wick-tf-sell-color: #dc2626;

  --wick-ticker-up-color: #16a34a;
  --wick-ticker-down-color: #dc2626;
}

wick-order-book {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
}
```

## Tailwind CSS

Since components render to the light DOM, Tailwind classes work directly:

```html
<wick-order-book class="bg-gray-900 rounded-lg p-4 font-mono text-sm">
</wick-order-book>
```

You can also target parts with Tailwind's arbitrary selectors:

```html
<style>
  wick-order-book [part~="bid-row"] [part="price"] {
    @apply text-green-400;
  }
  wick-order-book [part~="ask-row"] [part="price"] {
    @apply text-red-400;
  }
</style>
```
