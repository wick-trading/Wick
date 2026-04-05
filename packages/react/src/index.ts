import {
  forwardRef,
  useRef,
  useImperativeHandle,
  type HTMLAttributes,
} from 'react';
import { createElement } from 'react';
import { usePropertySync, useCustomEvent } from './create-wrapper.js';

// Side-effect: register custom elements
import '@wick/order-book';
import '@wick/price-ticker';
import '@wick/trade-feed';
import '@wick/depth-chart';
import '@wick/candlestick-chart';

import type { OrderBookData, OrderBookDelta, PriceFormatOptions, TickerData, Trade, Candle } from '@wick/core';
import type { WickOrderBook as OrderBookElement } from '@wick/order-book';
import type { WickPriceTicker as PriceTickerElement } from '@wick/price-ticker';
import type { WickTradeFeed as TradeFeedElement } from '@wick/trade-feed';
import type { WickDepthChart as DepthChartElement } from '@wick/depth-chart';
import type { WickCandlestickChart as CandlestickChartElement } from '@wick/candlestick-chart';
import type { DepthChartTheme } from '@wick/depth-chart';

// Re-export hooks for custom usage
export { usePropertySync, useCustomEvent } from './create-wrapper.js';

// --- OrderBook ---

export interface OrderBookProps extends HTMLAttributes<HTMLElement> {
  data?: OrderBookData;
  depth?: number;
  priceFormat?: PriceFormatOptions;
  sizePrecision?: number;
  showTotal?: boolean;
  showDepth?: boolean;
  grouping?: number;
  onLevelClick?: (detail: { price: number; side: 'bid' | 'ask' }) => void;
}

export const OrderBook = forwardRef<OrderBookElement, OrderBookProps>(
  ({ data, depth, priceFormat, sizePrecision, showTotal, showDepth, grouping, onLevelClick, ...attrs }, fwdRef) => {
    const ref = useRef<OrderBookElement>(null);
    useImperativeHandle(fwdRef, () => ref.current!, []);

    usePropertySync(ref, { data, priceFormat });
    useCustomEvent(ref, 'wick-order-book-level-click', onLevelClick);

    return createElement('wick-order-book', {
      ref,
      depth,
      'size-precision': sizePrecision,
      'show-total': showTotal ? '' : undefined,
      'show-depth': showDepth ? '' : undefined,
      grouping,
      ...attrs,
    });
  },
);
OrderBook.displayName = 'OrderBook';

// --- PriceTicker ---

export interface PriceTickerProps extends HTMLAttributes<HTMLElement> {
  data?: TickerData;
  priceFormat?: PriceFormatOptions;
  showDetails?: boolean;
  onPriceChange?: (detail: { price: number; prevPrice: number; direction: 'up' | 'down' | 'neutral' }) => void;
}

export const PriceTicker = forwardRef<PriceTickerElement, PriceTickerProps>(
  ({ data, priceFormat, showDetails, onPriceChange, ...attrs }, fwdRef) => {
    const ref = useRef<PriceTickerElement>(null);
    useImperativeHandle(fwdRef, () => ref.current!, []);

    usePropertySync(ref, { data, priceFormat });
    useCustomEvent(ref, 'wick-price-change', onPriceChange);

    return createElement('wick-price-ticker', {
      ref,
      'show-details': showDetails ? '' : undefined,
      ...attrs,
    });
  },
);
PriceTicker.displayName = 'PriceTicker';

// --- TradeFeed ---

export interface TradeFeedProps extends HTMLAttributes<HTMLElement> {
  trades?: Trade[];
  maxTrades?: number;
  priceFormat?: PriceFormatOptions;
  sizePrecision?: number;
  timeFormat?: 'time' | 'datetime' | 'relative';
  onTradeClick?: (detail: Trade) => void;
}

export const TradeFeed = forwardRef<TradeFeedElement, TradeFeedProps>(
  ({ trades, maxTrades, priceFormat, sizePrecision, timeFormat, onTradeClick, ...attrs }, fwdRef) => {
    const ref = useRef<TradeFeedElement>(null);
    useImperativeHandle(fwdRef, () => ref.current!, []);

    usePropertySync(ref, { trades, priceFormat });
    useCustomEvent(ref, 'wick-trade-click', onTradeClick);

    return createElement('wick-trade-feed', {
      ref,
      'max-trades': maxTrades,
      'size-precision': sizePrecision,
      'time-format': timeFormat,
      ...attrs,
    });
  },
);
TradeFeed.displayName = 'TradeFeed';

// --- DepthChart ---

export interface DepthChartProps extends HTMLAttributes<HTMLElement> {
  data?: OrderBookData;
  depth?: number;
  width?: number;
  height?: number;
  theme?: Partial<DepthChartTheme>;
  enableCrosshair?: boolean;
  onHover?: (detail: { price: number; total: number; side: 'bid' | 'ask' }) => void;
  onChartClick?: (detail: { price: number; total: number; side: 'bid' | 'ask' }) => void;
}

export const DepthChart = forwardRef<DepthChartElement, DepthChartProps>(
  ({ data, depth, width, height, theme, enableCrosshair, onHover, onChartClick, ...attrs }, fwdRef) => {
    const ref = useRef<DepthChartElement>(null);
    useImperativeHandle(fwdRef, () => ref.current!, []);

    usePropertySync(ref, { data, theme });
    useCustomEvent(ref, 'wick-depth-chart-hover', onHover);
    useCustomEvent(ref, 'wick-depth-chart-click', onChartClick);

    return createElement('wick-depth-chart', {
      ref,
      depth,
      width,
      height,
      'enable-crosshair': enableCrosshair ? '' : undefined,
      ...attrs,
    });
  },
);
DepthChart.displayName = 'DepthChart';

// --- CandlestickChart ---

export interface CandlestickChartProps extends HTMLAttributes<HTMLElement> {
  candles?: Candle[];
  width?: number;
  height?: number;
  showVolume?: boolean;
  autoScroll?: boolean;
  onCrosshair?: (detail: unknown) => void;
  onChartClick?: (detail: unknown) => void;
}

export const CandlestickChart = forwardRef<CandlestickChartElement, CandlestickChartProps>(
  ({ candles, width, height, showVolume, autoScroll, onCrosshair, onChartClick, ...attrs }, fwdRef) => {
    const ref = useRef<CandlestickChartElement>(null);
    useImperativeHandle(fwdRef, () => ref.current!, []);

    usePropertySync(ref, { candles });
    useCustomEvent(ref, 'wick-candlestick-crosshair', onCrosshair);
    useCustomEvent(ref, 'wick-candlestick-click', onChartClick);

    return createElement('wick-candlestick-chart', {
      ref,
      width,
      height,
      'show-volume': showVolume ? '' : undefined,
      'auto-scroll': autoScroll ? '' : undefined,
      ...attrs,
    });
  },
);
CandlestickChart.displayName = 'CandlestickChart';
