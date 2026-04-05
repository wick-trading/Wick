/**
 * @wick/vue — Vue 3 composables and type helpers for Wick Web Components.
 *
 * Vue 3 has native Web Component support via `app.config.compilerOptions.isCustomElement`.
 * This package provides:
 * 1. A composable `useWickComponent` for syncing reactive data to Web Component refs
 * 2. Type declarations so `<wick-order-book>` etc. are recognized in Vue templates
 * 3. Side-effect imports to register all custom elements
 *
 * @example
 * ```vue
 * <script setup>
 * import { useOrderBook } from '@wick/vue';
 * import { ref } from 'vue';
 *
 * const data = ref({ bids: [], asks: [] });
 * const { elRef } = useOrderBook(data);
 * </script>
 *
 * <template>
 *   <wick-order-book ref="elRef" :depth="15" show-total show-depth />
 * </template>
 * ```
 */

// Register custom elements
import '@wick/order-book';
import '@wick/price-ticker';
import '@wick/trade-feed';
import '@wick/depth-chart';
import '@wick/candlestick-chart';

import type { Ref } from 'vue';
import type { OrderBookData, TickerData, Trade, Candle, PriceFormatOptions } from '@wick/core';
import type { WickOrderBook } from '@wick/order-book';
import type { WickPriceTicker } from '@wick/price-ticker';
import type { WickTradeFeed } from '@wick/trade-feed';
import type { WickDepthChart, DepthChartTheme } from '@wick/depth-chart';
import type { WickCandlestickChart } from '@wick/candlestick-chart';

/**
 * Generic composable that syncs a reactive value to a Web Component property.
 */
export function useWickSync<T extends HTMLElement>(
  elRef: Ref<T | null>,
  propName: string,
  value: Ref<unknown>,
): void {
  // Vue's watch is imported dynamically to avoid bundling vue
  import('vue').then(({ watch }) => {
    watch(value, (val) => {
      if (elRef.value && val !== undefined) {
        (elRef.value as unknown as Record<string, unknown>)[propName] = val;
      }
    }, { immediate: true, deep: true });
  });
}

/**
 * Composable for `<wick-order-book>`.
 */
export function useOrderBook(data: Ref<OrderBookData>, priceFormat?: Ref<PriceFormatOptions>) {
  const elRef = {} as Ref<WickOrderBook | null>;

  // Will be connected when Vue assigns the template ref
  import('vue').then(({ ref, watch, onMounted }) => {
    watch(data, (val) => {
      if (elRef.value) elRef.value.data = val;
    }, { deep: true });

    if (priceFormat) {
      watch(priceFormat, (val) => {
        if (elRef.value) elRef.value.priceFormat = val;
      }, { deep: true });
    }
  });

  return { elRef };
}

/**
 * Composable for `<wick-price-ticker>`.
 */
export function usePriceTicker(data: Ref<TickerData>, priceFormat?: Ref<PriceFormatOptions>) {
  const elRef = {} as Ref<WickPriceTicker | null>;

  import('vue').then(({ watch }) => {
    watch(data, (val) => {
      if (elRef.value) elRef.value.data = val;
    }, { deep: true });

    if (priceFormat) {
      watch(priceFormat, (val) => {
        if (elRef.value) elRef.value.priceFormat = val;
      }, { deep: true });
    }
  });

  return { elRef };
}

/**
 * Composable for `<wick-trade-feed>`.
 */
export function useTradeFeed(trades: Ref<Trade[]>, priceFormat?: Ref<PriceFormatOptions>) {
  const elRef = {} as Ref<WickTradeFeed | null>;

  import('vue').then(({ watch }) => {
    watch(trades, (val) => {
      if (elRef.value) elRef.value.trades = val;
    }, { deep: true });

    if (priceFormat) {
      watch(priceFormat, (val) => {
        if (elRef.value) elRef.value.priceFormat = val;
      }, { deep: true });
    }
  });

  return {
    elRef,
    addTrade: (trade: Trade) => elRef.value?.addTrade(trade),
    addTrades: (trades: Trade[]) => elRef.value?.addTrades(trades),
  };
}

/**
 * Composable for `<wick-depth-chart>`.
 */
export function useDepthChart(data: Ref<OrderBookData>, theme?: Ref<Partial<DepthChartTheme>>) {
  const elRef = {} as Ref<WickDepthChart | null>;

  import('vue').then(({ watch }) => {
    watch(data, (val) => {
      if (elRef.value) elRef.value.data = val;
    }, { deep: true });

    if (theme) {
      watch(theme, (val) => {
        if (elRef.value) elRef.value.theme = val;
      }, { deep: true });
    }
  });

  return { elRef };
}

/**
 * Composable for `<wick-candlestick-chart>`.
 */
export function useCandlestickChart(candles: Ref<Candle[]>) {
  const elRef = {} as Ref<WickCandlestickChart | null>;

  import('vue').then(({ watch }) => {
    watch(candles, (val) => {
      if (elRef.value) elRef.value.candles = val;
    }, { deep: true });
  });

  return {
    elRef,
    updateCandle: (candle: Candle) => elRef.value?.updateCandle(candle),
    fitContent: () => elRef.value?.fitContent(),
  };
}

/**
 * Vue plugin that configures custom element recognition.
 *
 * @example
 * ```ts
 * import { createApp } from 'vue';
 * import { WickPlugin } from '@wick/vue';
 * const app = createApp(App);
 * app.use(WickPlugin);
 * ```
 */
export const WickPlugin = {
  install(app: { config: { compilerOptions: { isCustomElement: (tag: string) => boolean } } }) {
    const prev = app.config.compilerOptions.isCustomElement;
    app.config.compilerOptions.isCustomElement = (tag: string) =>
      tag.startsWith('wick-') || (prev ? prev(tag) : false);
  },
};
