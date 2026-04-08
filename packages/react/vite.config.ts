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
        'react', 'react-dom', 'react/jsx-runtime',
        'lit', /^lit\//,
        '@wick/core',
        '@wick/order-book',
        '@wick/price-ticker',
        '@wick/trade-feed',
        '@wick/depth-chart',
        '@wick/candlestick-chart',
        '@wick/connection-status',
        '@wick/position-sizer',
        '@wick/risk-panel',
        '@wick/market-clock',
        '@wick/economic-calendar',
        '@wick/liquidation-feed',
        '@wick/news-feed',
        '@wick/alerts',
        '@wick/trade-history',
        '@wick/open-interest',
        '@wick/pnl',
        '@wick/positions',
        '@wick/correlation-matrix',
        '@wick/watchlist',
        '@wick/symbol-search',
        '@wick/order-ticket',
        '@wick/order-manager',
        '@wick/screener',
        '@wick/volume-profile',
        '@wick/dom-ladder',
        '@wick/drawing-tools',
      ],
    },
  },
});
