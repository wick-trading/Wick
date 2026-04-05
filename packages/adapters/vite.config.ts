import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        binance: resolve(__dirname, 'src/binance.ts'),
        coinbase: resolve(__dirname, 'src/coinbase.ts'),
        kraken: resolve(__dirname, 'src/kraken.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: ['@vela-trading/core'],
    },
  },
});
