/**
 * @vela-trading/svelte — Svelte actions for Vela Web Components.
 *
 * Svelte has excellent native Web Component support. This package provides
 * Svelte actions that sync reactive data to Web Component properties.
 *
 * @example
 * ```svelte
 * <script>
 *   import { orderBook, tradeFeed } from '@vela-trading/svelte';
 *   let data = { bids: [], asks: [] };
 *   let trades = [];
 * </script>
 *
 * <vela-order-book use:orderBook={data} depth={15} show-total show-depth />
 * <vela-trade-feed use:tradeFeed={trades} max-trades={50} />
 * ```
 */

// Register custom elements
import '@vela-trading/order-book';
import '@vela-trading/price-ticker';
import '@vela-trading/trade-feed';
import '@vela-trading/depth-chart';
import '@vela-trading/candlestick-chart';

import type { OrderBookData, TickerData, Trade, Candle, PriceFormatOptions } from '@vela-trading/core';
import type { VelaOrderBook } from '@vela-trading/order-book';
import type { VelaPriceTicker } from '@vela-trading/price-ticker';
import type { VelaTradeFeed } from '@vela-trading/trade-feed';
import type { VelaDepthChart } from '@vela-trading/depth-chart';
import type { VelaCandlestickChart } from '@vela-trading/candlestick-chart';

interface SvelteAction<T> {
  update?: (value: T) => void;
  destroy?: () => void;
}

/**
 * Svelte action for `<vela-order-book>`.
 * Syncs reactive OrderBookData to the component.
 *
 * @example `<vela-order-book use:orderBook={data} />`
 */
export function orderBook(node: VelaOrderBook, data: OrderBookData): SvelteAction<OrderBookData> {
  node.data = data;
  return {
    update(data: OrderBookData) {
      node.data = data;
    },
  };
}

/**
 * Svelte action for `<vela-price-ticker>`.
 *
 * @example `<vela-price-ticker use:priceTicker={tickerData} />`
 */
export function priceTicker(node: VelaPriceTicker, data: TickerData): SvelteAction<TickerData> {
  node.data = data;
  return {
    update(data: TickerData) {
      node.data = data;
    },
  };
}

/**
 * Svelte action for `<vela-trade-feed>`.
 *
 * @example `<vela-trade-feed use:tradeFeed={trades} />`
 */
export function tradeFeed(node: VelaTradeFeed, trades: Trade[]): SvelteAction<Trade[]> {
  node.trades = trades;
  return {
    update(trades: Trade[]) {
      node.trades = trades;
    },
  };
}

/**
 * Svelte action for `<vela-depth-chart>`.
 *
 * @example `<vela-depth-chart use:depthChart={bookData} />`
 */
export function depthChart(node: VelaDepthChart, data: OrderBookData): SvelteAction<OrderBookData> {
  node.data = data;
  return {
    update(data: OrderBookData) {
      node.data = data;
    },
  };
}

/**
 * Svelte action for `<vela-candlestick-chart>`.
 *
 * @example `<vela-candlestick-chart use:candlestickChart={candles} />`
 */
export function candlestickChart(node: VelaCandlestickChart, candles: Candle[]): SvelteAction<Candle[]> {
  node.candles = candles;
  return {
    update(candles: Candle[]) {
      node.candles = candles;
    },
  };
}

// Re-export types for convenience
export type {
  OrderBookData,
  TickerData,
  Trade,
  Candle,
  PriceFormatOptions,
} from '@vela-trading/core';
