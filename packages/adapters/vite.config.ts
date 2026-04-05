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
        bybit: resolve(__dirname, 'src/bybit.ts'),
        okx: resolve(__dirname, 'src/okx.ts'),
        dydx: resolve(__dirname, 'src/dydx.ts'),
        bitfinex: resolve(__dirname, 'src/bitfinex.ts'),
        gateio: resolve(__dirname, 'src/gateio.ts'),
        mexc: resolve(__dirname, 'src/mexc.ts'),
        kucoin: resolve(__dirname, 'src/kucoin.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: ['@vela-trading/core'],
    },
  },
});
