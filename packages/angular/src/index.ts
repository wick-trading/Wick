/**
 * @wick/angular — Angular directives for Wick Web Components.
 *
 * Angular's Web Component support requires:
 * 1. CUSTOM_ELEMENTS_SCHEMA on the module/component
 * 2. Manual property binding for complex objects (Angular only binds attributes)
 * 3. Event listener wrappers for CustomEvents
 *
 * This package provides standalone directives that handle all of this.
 *
 * @example
 * ```typescript
 * // In your component:
 * import { WickOrderBookDirective, WickPriceTickerDirective } from '@wick/angular';
 *
 * @Component({
 *   selector: 'app-trading',
 *   standalone: true,
 *   imports: [WickOrderBookDirective, WickPriceTickerDirective],
 *   schemas: [CUSTOM_ELEMENTS_SCHEMA],
 *   template: `
 *     <wick-order-book
 *       wickOrderBook
 *       [wickData]="bookData"
 *       [wickPriceFormat]="priceFormat"
 *       (wickLevelClick)="onLevelClick($event)"
 *       depth="15"
 *       show-total
 *       show-depth
 *     ></wick-order-book>
 *
 *     <wick-price-ticker
 *       wickPriceTicker
 *       [wickData]="tickerData"
 *       (wickPriceChange)="onPriceChange($event)"
 *       show-details
 *     ></wick-price-ticker>
 *   `
 * })
 * ```
 */

// Register custom elements
import '@wick/order-book';
import '@wick/price-ticker';
import '@wick/trade-feed';
import '@wick/depth-chart';
import '@wick/candlestick-chart';

import type {
  OrderBookData,
  OrderBookDelta,
  TickerData,
  Trade,
  Candle,
  PriceFormatOptions,
} from '@wick/core';

import type { WickOrderBook } from '@wick/order-book';
import type { WickPriceTicker } from '@wick/price-ticker';
import type { WickTradeFeed } from '@wick/trade-feed';
import type { WickDepthChart, DepthChartTheme } from '@wick/depth-chart';
import type { WickCandlestickChart } from '@wick/candlestick-chart';

// ── Lightweight directive factories ──────────────────────
// These are plain classes with Angular-compatible metadata.
// We avoid importing @angular/core at the module level so the
// package can be published without Angular as a real dependency
// (it's a peerDependency). The consuming Angular app's compiler
// handles the decorator semantics.

/**
 * Helper: sync a property to an element when the value changes.
 */
function syncProperty(el: HTMLElement, prop: string, value: unknown): void {
  if (value !== undefined && value !== null) {
    (el as unknown as Record<string, unknown>)[prop] = value;
  }
}

/**
 * Helper: create an EventEmitter-like object for Angular outputs.
 * Returns a simple object with subscribe/emit that Angular's template compiler
 * can bind to via (eventName)="handler($event)".
 */
interface SimpleEmitter<T> {
  _listeners: Array<(value: T) => void>;
  subscribe: (fn: (value: T) => void) => { unsubscribe: () => void };
  emit: (value: T) => void;
}

function createEmitter<T>(): SimpleEmitter<T> {
  const listeners: Array<(value: T) => void> = [];
  return {
    _listeners: listeners,
    subscribe(fn: (value: T) => void) {
      listeners.push(fn);
      return {
        unsubscribe() {
          const idx = listeners.indexOf(fn);
          if (idx !== -1) listeners.splice(idx, 1);
        },
      };
    },
    emit(value: T) {
      for (const fn of listeners) fn(value);
    },
  };
}

// ── Order Book Directive ─────────────────────────────────

/**
 * Directive for `<wick-order-book wickOrderBook>`.
 *
 * Binds:
 * - [wickData] → OrderBookData
 * - [wickPriceFormat] → PriceFormatOptions
 * - (wickLevelClick) → { price, side }
 */
export class WickOrderBookDirective {
  private _el: WickOrderBook;
  private _listener: ((e: Event) => void) | null = null;

  wickData: OrderBookData | undefined;
  wickPriceFormat: PriceFormatOptions | undefined;
  wickLevelClick = createEmitter<{ price: number; side: 'bid' | 'ask' }>();

  constructor(el: { nativeElement: WickOrderBook }) {
    this._el = el.nativeElement;
  }

  ngOnChanges(): void {
    if (this.wickData) syncProperty(this._el, 'data', this.wickData);
    if (this.wickPriceFormat) syncProperty(this._el, 'priceFormat', this.wickPriceFormat);
  }

  ngOnInit(): void {
    this._listener = (e: Event) => {
      this.wickLevelClick.emit((e as CustomEvent).detail);
    };
    this._el.addEventListener('wick-order-book-level-click', this._listener);
  }

  ngOnDestroy(): void {
    if (this._listener) {
      this._el.removeEventListener('wick-order-book-level-click', this._listener);
    }
  }

  /** Imperative: apply a delta update */
  applyDelta(delta: OrderBookDelta): void {
    this._el.applyDelta(delta);
  }

  /** Imperative: apply multiple deltas */
  applyDeltas(deltas: OrderBookDelta[]): void {
    this._el.applyDeltas(deltas);
  }
}

// ── Price Ticker Directive ───────────────────────────────

/**
 * Directive for `<wick-price-ticker wickPriceTicker>`.
 *
 * Binds:
 * - [wickData] → TickerData
 * - [wickPriceFormat] → PriceFormatOptions
 * - (wickPriceChange) → { price, prevPrice, direction }
 */
export class WickPriceTickerDirective {
  private _el: WickPriceTicker;
  private _listener: ((e: Event) => void) | null = null;

  wickData: TickerData | undefined;
  wickPriceFormat: PriceFormatOptions | undefined;
  wickPriceChange = createEmitter<{ price: number; prevPrice: number; direction: string }>();

  constructor(el: { nativeElement: WickPriceTicker }) {
    this._el = el.nativeElement;
  }

  ngOnChanges(): void {
    if (this.wickData) syncProperty(this._el, 'data', this.wickData);
    if (this.wickPriceFormat) syncProperty(this._el, 'priceFormat', this.wickPriceFormat);
  }

  ngOnInit(): void {
    this._listener = (e: Event) => {
      this.wickPriceChange.emit((e as CustomEvent).detail);
    };
    this._el.addEventListener('wick-price-change', this._listener);
  }

  ngOnDestroy(): void {
    if (this._listener) {
      this._el.removeEventListener('wick-price-change', this._listener);
    }
  }
}

// ── Trade Feed Directive ─────────────────────────────────

/**
 * Directive for `<wick-trade-feed wickTradeFeed>`.
 *
 * Binds:
 * - [wickTrades] → Trade[]
 * - [wickPriceFormat] → PriceFormatOptions
 * - (wickTradeClick) → Trade
 */
export class WickTradeFeedDirective {
  private _el: WickTradeFeed;
  private _listener: ((e: Event) => void) | null = null;

  wickTrades: Trade[] | undefined;
  wickPriceFormat: PriceFormatOptions | undefined;
  wickTradeClick = createEmitter<Trade>();

  constructor(el: { nativeElement: WickTradeFeed }) {
    this._el = el.nativeElement;
  }

  ngOnChanges(): void {
    if (this.wickTrades) syncProperty(this._el, 'trades', this.wickTrades);
    if (this.wickPriceFormat) syncProperty(this._el, 'priceFormat', this.wickPriceFormat);
  }

  ngOnInit(): void {
    this._listener = (e: Event) => {
      this.wickTradeClick.emit((e as CustomEvent).detail);
    };
    this._el.addEventListener('wick-trade-click', this._listener);
  }

  ngOnDestroy(): void {
    if (this._listener) {
      this._el.removeEventListener('wick-trade-click', this._listener);
    }
  }

  /** Imperative: add a trade */
  addTrade(trade: Trade): void {
    this._el.addTrade(trade);
  }

  /** Imperative: add multiple trades */
  addTrades(trades: Trade[]): void {
    this._el.addTrades(trades);
  }
}

// ── Depth Chart Directive ────────────────────────────────

/**
 * Directive for `<wick-depth-chart wickDepthChart>`.
 *
 * Binds:
 * - [wickData] → OrderBookData
 * - [wickTheme] → Partial<DepthChartTheme>
 * - (wickHover) → { price, total, side }
 * - (wickChartClick) → { price, total, side }
 */
export class WickDepthChartDirective {
  private _el: WickDepthChart;
  private _hoverListener: ((e: Event) => void) | null = null;
  private _clickListener: ((e: Event) => void) | null = null;

  wickData: OrderBookData | undefined;
  wickTheme: Partial<DepthChartTheme> | undefined;
  wickHover = createEmitter<{ price: number; total: number; side: string }>();
  wickChartClick = createEmitter<{ price: number; total: number; side: string }>();

  constructor(el: { nativeElement: WickDepthChart }) {
    this._el = el.nativeElement;
  }

  ngOnChanges(): void {
    if (this.wickData) syncProperty(this._el, 'data', this.wickData);
    if (this.wickTheme) syncProperty(this._el, 'theme', this.wickTheme);
  }

  ngOnInit(): void {
    this._hoverListener = (e: Event) => this.wickHover.emit((e as CustomEvent).detail);
    this._clickListener = (e: Event) => this.wickChartClick.emit((e as CustomEvent).detail);
    this._el.addEventListener('wick-depth-chart-hover', this._hoverListener);
    this._el.addEventListener('wick-depth-chart-click', this._clickListener);
  }

  ngOnDestroy(): void {
    if (this._hoverListener) this._el.removeEventListener('wick-depth-chart-hover', this._hoverListener);
    if (this._clickListener) this._el.removeEventListener('wick-depth-chart-click', this._clickListener);
  }
}

// ── Candlestick Chart Directive ──���───────────────────────

/**
 * Directive for `<wick-candlestick-chart wickCandlestickChart>`.
 *
 * Binds:
 * - [wickCandles] → Candle[]
 * - (wickCrosshair) → crosshair event data
 * - (wickChartClick) → click event data
 */
export class WickCandlestickChartDirective {
  private _el: WickCandlestickChart;
  private _crosshairListener: ((e: Event) => void) | null = null;
  private _clickListener: ((e: Event) => void) | null = null;

  wickCandles: Candle[] | undefined;
  wickCrosshair = createEmitter<unknown>();
  wickChartClick = createEmitter<unknown>();

  constructor(el: { nativeElement: WickCandlestickChart }) {
    this._el = el.nativeElement;
  }

  ngOnChanges(): void {
    if (this.wickCandles) syncProperty(this._el, 'candles', this.wickCandles);
  }

  ngOnInit(): void {
    this._crosshairListener = (e: Event) => this.wickCrosshair.emit((e as CustomEvent).detail);
    this._clickListener = (e: Event) => this.wickChartClick.emit((e as CustomEvent).detail);
    this._el.addEventListener('wick-candlestick-crosshair', this._crosshairListener);
    this._el.addEventListener('wick-candlestick-click', this._clickListener);
  }

  ngOnDestroy(): void {
    if (this._crosshairListener) this._el.removeEventListener('wick-candlestick-crosshair', this._crosshairListener);
    if (this._clickListener) this._el.removeEventListener('wick-candlestick-click', this._clickListener);
  }

  /** Imperative: update or append a candle */
  updateCandle(candle: Candle): void {
    this._el.updateCandle(candle);
  }

  /** Imperative: fit all data to view */
  fitContent(): void {
    this._el.fitContent();
  }
}

// ── Re-export types ──────────────────────────────────────

export type {
  OrderBookData,
  OrderBookDelta,
  TickerData,
  Trade,
  Candle,
  PriceFormatOptions,
} from '@wick/core';
