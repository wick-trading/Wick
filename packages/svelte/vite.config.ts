import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: [
        'lit', /^lit\//,
        '@wick/core',
        '@wick/order-book',
        '@wick/price-ticker',
        '@wick/trade-feed',
        '@wick/depth-chart',
        '@wick/candlestick-chart',
      ],
    },
  },
});
