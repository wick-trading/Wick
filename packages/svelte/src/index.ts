/**
 * @wick/svelte — Svelte actions for Wick Web Components.
 *
 * Svelte has excellent native Web Component support. This package provides
 * Svelte actions that sync reactive data to Web Component properties.
 *
 * @example
 * ```svelte
 * <script>
 *   import { orderBook, tradeFeed } from '@wick/svelte';
 *   let data = { bids: [], asks: [] };
 *   let trades = [];
 * </script>
 *
 * <wick-order-book use:orderBook={data} depth={15} show-total show-depth />
 * <wick-trade-feed use:tradeFeed={trades} max-trades={50} />
 * ```
 */

// Register custom elements
import '@wick/order-book';
import '@wick/price-ticker';
import '@wick/trade-feed';
import '@wick/depth-chart';
import '@wick/candlestick-chart';

import type { OrderBookData, TickerData, Trade, Candle, PriceFormatOptions } from '@wick/core';
import type { WickOrderBook } from '@wick/order-book';
import type { WickPriceTicker } from '@wick/price-ticker';
import type { WickTradeFeed } from '@wick/trade-feed';
import type { WickDepthChart } from '@wick/depth-chart';
import type { WickCandlestickChart } from '@wick/candlestick-chart';

interface SvelteAction<T> {
  update?: (value: T) => void;
  destroy?: () => void;
}

/**
 * Svelte action for `<wick-order-book>`.
 * Syncs reactive OrderBookData to the component.
 *
 * @example `<wick-order-book use:orderBook={data} />`
 */
export function orderBook(node: WickOrderBook, data: OrderBookData): SvelteAction<OrderBookData> {
  node.data = data;
  return {
    update(data: OrderBookData) {
      node.data = data;
    },
  };
}

/**
 * Svelte action for `<wick-price-ticker>`.
 *
 * @example `<wick-price-ticker use:priceTicker={tickerData} />`
 */
export function priceTicker(node: WickPriceTicker, data: TickerData): SvelteAction<TickerData> {
  node.data = data;
  return {
    update(data: TickerData) {
      node.data = data;
    },
  };
}

/**
 * Svelte action for `<wick-trade-feed>`.
 *
 * @example `<wick-trade-feed use:tradeFeed={trades} />`
 */
export function tradeFeed(node: WickTradeFeed, trades: Trade[]): SvelteAction<Trade[]> {
  node.trades = trades;
  return {
    update(trades: Trade[]) {
      node.trades = trades;
    },
  };
}

/**
 * Svelte action for `<wick-depth-chart>`.
 *
 * @example `<wick-depth-chart use:depthChart={bookData} />`
 */
export function depthChart(node: WickDepthChart, data: OrderBookData): SvelteAction<OrderBookData> {
  node.data = data;
  return {
    update(data: OrderBookData) {
      node.data = data;
    },
  };
}

/**
 * Svelte action for `<wick-candlestick-chart>`.
 *
 * @example `<wick-candlestick-chart use:candlestickChart={candles} />`
 */
export function candlestickChart(node: WickCandlestickChart, candles: Candle[]): SvelteAction<Candle[]> {
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
} from '@wick/core';
