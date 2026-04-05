# Getting Started

## Installation

```bash
# Install all components
npm install @wick/order-book @wick/price-ticker @wick/trade-feed

# Or install individually
npm install @wick/order-book
```

## Basic Usage

Wick components are standard Web Components. Import them and use in HTML:

```html
<wick-order-book id="ob" depth="15" show-total show-depth></wick-order-book>

<script type="module">
  import '@wick/order-book';

  const ob = document.querySelector('#ob');
  ob.data = {
    bids: [{ price: 67400, size: 1.5 }, { price: 67399, size: 3.2 }],
    asks: [{ price: 67401, size: 0.8 }, { price: 67402, size: 2.1 }],
  };
</script>
```

## Framework Integration

### React

```jsx
import '@wick/order-book';

function OrderBook({ data }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) ref.current.data = data;
  }, [data]);

  return <wick-order-book ref={ref} depth={15} show-total show-depth />;
}
```

### Vue

```vue
<template>
  <wick-order-book ref="ob" :depth="15" show-total show-depth />
</template>

<script setup>
import '@wick/order-book';
import { ref, watch } from 'vue';

const ob = ref(null);
const data = ref({ bids: [], asks: [] });

watch(data, (val) => {
  if (ob.value) ob.value.data = val;
});
</script>
```

### Svelte

```svelte
<script>
  import '@wick/order-book';
  let ob;
  export let data;

  $: if (ob) ob.data = data;
</script>

<wick-order-book bind:this={ob} depth={15} show-total show-depth />
```

## Connecting to a WebSocket

```javascript
import '@wick/order-book';
import '@wick/trade-feed';

const ob = document.querySelector('wick-order-book');
const feed = document.querySelector('wick-trade-feed');

const ws = new WebSocket('wss://your-exchange.com/ws');

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);

  switch (msg.type) {
    case 'orderbook_snapshot':
      ob.data = msg.data;
      break;
    case 'orderbook_delta':
      ob.applyDelta(msg.data);
      break;
    case 'trade':
      feed.addTrade(msg.data);
      break;
  }
};
```

## Running the Demo

```bash
git clone https://github.com/astralchemist/vela.git
cd vela
npm install
npm run dev
```

This starts a local dev server with mock real-time BTC/USD data exercising all three components.
