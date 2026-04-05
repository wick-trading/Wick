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
        '@angular/core', '@angular/common',
        'lit', /^lit\//,
        '@vela-trading/core',
        '@vela-trading/order-book',
        '@vela-trading/price-ticker',
        '@vela-trading/trade-feed',
        '@vela-trading/depth-chart',
        '@vela-trading/candlestick-chart',
      ],
    },
  },
});
