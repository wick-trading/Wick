/**
 * @vela-trading/vue — Vue 3 composables and type helpers for Vela Web Components.
 *
 * Vue 3 has native Web Component support via `app.config.compilerOptions.isCustomElement`.
 * This package provides:
 * 1. A composable `useVelaComponent` for syncing reactive data to Web Component refs
 * 2. Type declarations so `<vela-order-book>` etc. are recognized in Vue templates
 * 3. Side-effect imports to register all custom elements
 *
 * @example
 * ```vue
 * <script setup>
 * import { useOrderBook } from '@vela-trading/vue';
 * import { ref } from 'vue';
 *
 * const data = ref({ bids: [], asks: [] });
 * const { elRef } = useOrderBook(data);
 * </script>
 *
 * <template>
 *   <vela-order-book ref="elRef" :depth="15" show-total show-depth />
 * </template>
 * ```
 */

// Register custom elements
import '@vela-trading/order-book';
import '@vela-trading/price-ticker';
import '@vela-trading/trade-feed';
import '@vela-trading/depth-chart';
import '@vela-trading/candlestick-chart';

import type { Ref } from 'vue';
import type { OrderBookData, TickerData, Trade, Candle, PriceFormatOptions } from '@vela-trading/core';
import type { VelaOrderBook } from '@vela-trading/order-book';
import type { VelaPriceTicker } from '@vela-trading/price-ticker';
import type { VelaTradeFeed } from '@vela-trading/trade-feed';
import type { VelaDepthChart, DepthChartTheme } from '@vela-trading/depth-chart';
import type { VelaCandlestickChart } from '@vela-trading/candlestick-chart';

/**
 * Generic composable that syncs a reactive value to a Web Component property.
 */
export function useVelaSync<T extends HTMLElement>(
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
 * Composable for `<vela-order-book>`.
 */
export function useOrderBook(data: Ref<OrderBookData>, priceFormat?: Ref<PriceFormatOptions>) {
  const elRef = {} as Ref<VelaOrderBook | null>;

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
 * Composable for `<vela-price-ticker>`.
 */
export function usePriceTicker(data: Ref<TickerData>, priceFormat?: Ref<PriceFormatOptions>) {
  const elRef = {} as Ref<VelaPriceTicker | null>;

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
 * Composable for `<vela-trade-feed>`.
 */
export function useTradeFeed(trades: Ref<Trade[]>, priceFormat?: Ref<PriceFormatOptions>) {
  const elRef = {} as Ref<VelaTradeFeed | null>;

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
 * Composable for `<vela-depth-chart>`.
 */
export function useDepthChart(data: Ref<OrderBookData>, theme?: Ref<Partial<DepthChartTheme>>) {
  const elRef = {} as Ref<VelaDepthChart | null>;

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
 * Composable for `<vela-candlestick-chart>`.
 */
export function useCandlestickChart(candles: Ref<Candle[]>) {
  const elRef = {} as Ref<VelaCandlestickChart | null>;

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
 * import { VelaPlugin } from '@vela-trading/vue';
 * const app = createApp(App);
 * app.use(VelaPlugin);
 * ```
 */
export const VelaPlugin = {
  install(app: { config: { compilerOptions: { isCustomElement: (tag: string) => boolean } } }) {
    const prev = app.config.compilerOptions.isCustomElement;
    app.config.compilerOptions.isCustomElement = (tag: string) =>
      tag.startsWith('vela-') || (prev ? prev(tag) : false);
  },
};
