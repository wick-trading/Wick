/**
 * @vela-trading/angular — Angular directives for Vela Web Components.
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
 * import { VelaOrderBookDirective, VelaPriceTickerDirective } from '@vela-trading/angular';
 *
 * @Component({
 *   selector: 'app-trading',
 *   standalone: true,
 *   imports: [VelaOrderBookDirective, VelaPriceTickerDirective],
 *   schemas: [CUSTOM_ELEMENTS_SCHEMA],
 *   template: `
 *     <vela-order-book
 *       velaOrderBook
 *       [velaData]="bookData"
 *       [velaPriceFormat]="priceFormat"
 *       (velaLevelClick)="onLevelClick($event)"
 *       depth="15"
 *       show-total
 *       show-depth
 *     ></vela-order-book>
 *
 *     <vela-price-ticker
 *       velaPriceTicker
 *       [velaData]="tickerData"
 *       (velaPriceChange)="onPriceChange($event)"
 *       show-details
 *     ></vela-price-ticker>
 *   `
 * })
 * ```
 */

// Register custom elements
import '@vela-trading/order-book';
import '@vela-trading/price-ticker';
import '@vela-trading/trade-feed';
import '@vela-trading/depth-chart';
import '@vela-trading/candlestick-chart';

import type {
  OrderBookData,
  OrderBookDelta,
  TickerData,
  Trade,
  Candle,
  PriceFormatOptions,
} from '@vela-trading/core';

import type { VelaOrderBook } from '@vela-trading/order-book';
import type { VelaPriceTicker } from '@vela-trading/price-ticker';
import type { VelaTradeFeed } from '@vela-trading/trade-feed';
import type { VelaDepthChart, DepthChartTheme } from '@vela-trading/depth-chart';
import type { VelaCandlestickChart } from '@vela-trading/candlestick-chart';

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
 * Directive for `<vela-order-book velaOrderBook>`.
 *
 * Binds:
 * - [velaData] → OrderBookData
 * - [velaPriceFormat] → PriceFormatOptions
 * - (velaLevelClick) → { price, side }
 */
export class VelaOrderBookDirective {
  private _el: VelaOrderBook;
  private _listener: ((e: Event) => void) | null = null;

  velaData: OrderBookData | undefined;
  velaPriceFormat: PriceFormatOptions | undefined;
  velaLevelClick = createEmitter<{ price: number; side: 'bid' | 'ask' }>();

  constructor(el: { nativeElement: VelaOrderBook }) {
    this._el = el.nativeElement;
  }

  ngOnChanges(): void {
    if (this.velaData) syncProperty(this._el, 'data', this.velaData);
    if (this.velaPriceFormat) syncProperty(this._el, 'priceFormat', this.velaPriceFormat);
  }

  ngOnInit(): void {
    this._listener = (e: Event) => {
      this.velaLevelClick.emit((e as CustomEvent).detail);
    };
    this._el.addEventListener('vela-order-book-level-click', this._listener);
  }

  ngOnDestroy(): void {
    if (this._listener) {
      this._el.removeEventListener('vela-order-book-level-click', this._listener);
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
 * Directive for `<vela-price-ticker velaPriceTicker>`.
 *
 * Binds:
 * - [velaData] → TickerData
 * - [velaPriceFormat] → PriceFormatOptions
 * - (velaPriceChange) → { price, prevPrice, direction }
 */
export class VelaPriceTickerDirective {
  private _el: VelaPriceTicker;
  private _listener: ((e: Event) => void) | null = null;

  velaData: TickerData | undefined;
  velaPriceFormat: PriceFormatOptions | undefined;
  velaPriceChange = createEmitter<{ price: number; prevPrice: number; direction: string }>();

  constructor(el: { nativeElement: VelaPriceTicker }) {
    this._el = el.nativeElement;
  }

  ngOnChanges(): void {
    if (this.velaData) syncProperty(this._el, 'data', this.velaData);
    if (this.velaPriceFormat) syncProperty(this._el, 'priceFormat', this.velaPriceFormat);
  }

  ngOnInit(): void {
    this._listener = (e: Event) => {
      this.velaPriceChange.emit((e as CustomEvent).detail);
    };
    this._el.addEventListener('vela-price-change', this._listener);
  }

  ngOnDestroy(): void {
    if (this._listener) {
      this._el.removeEventListener('vela-price-change', this._listener);
    }
  }
}

// ── Trade Feed Directive ─────────────────────────────────

/**
 * Directive for `<vela-trade-feed velaTradeFeed>`.
 *
 * Binds:
 * - [velaTrades] → Trade[]
 * - [velaPriceFormat] → PriceFormatOptions
 * - (velaTradeClick) → Trade
 */
export class VelaTradeFeedDirective {
  private _el: VelaTradeFeed;
  private _listener: ((e: Event) => void) | null = null;

  velaTrades: Trade[] | undefined;
  velaPriceFormat: PriceFormatOptions | undefined;
  velaTradeClick = createEmitter<Trade>();

  constructor(el: { nativeElement: VelaTradeFeed }) {
    this._el = el.nativeElement;
  }

  ngOnChanges(): void {
    if (this.velaTrades) syncProperty(this._el, 'trades', this.velaTrades);
    if (this.velaPriceFormat) syncProperty(this._el, 'priceFormat', this.velaPriceFormat);
  }

  ngOnInit(): void {
    this._listener = (e: Event) => {
      this.velaTradeClick.emit((e as CustomEvent).detail);
    };
    this._el.addEventListener('vela-trade-click', this._listener);
  }

  ngOnDestroy(): void {
    if (this._listener) {
      this._el.removeEventListener('vela-trade-click', this._listener);
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
 * Directive for `<vela-depth-chart velaDepthChart>`.
 *
 * Binds:
 * - [velaData] → OrderBookData
 * - [velaTheme] → Partial<DepthChartTheme>
 * - (velaHover) → { price, total, side }
 * - (velaChartClick) → { price, total, side }
 */
export class VelaDepthChartDirective {
  private _el: VelaDepthChart;
  private _hoverListener: ((e: Event) => void) | null = null;
  private _clickListener: ((e: Event) => void) | null = null;

  velaData: OrderBookData | undefined;
  velaTheme: Partial<DepthChartTheme> | undefined;
  velaHover = createEmitter<{ price: number; total: number; side: string }>();
  velaChartClick = createEmitter<{ price: number; total: number; side: string }>();

  constructor(el: { nativeElement: VelaDepthChart }) {
    this._el = el.nativeElement;
  }

  ngOnChanges(): void {
    if (this.velaData) syncProperty(this._el, 'data', this.velaData);
    if (this.velaTheme) syncProperty(this._el, 'theme', this.velaTheme);
  }

  ngOnInit(): void {
    this._hoverListener = (e: Event) => this.velaHover.emit((e as CustomEvent).detail);
    this._clickListener = (e: Event) => this.velaChartClick.emit((e as CustomEvent).detail);
    this._el.addEventListener('vela-depth-chart-hover', this._hoverListener);
    this._el.addEventListener('vela-depth-chart-click', this._clickListener);
  }

  ngOnDestroy(): void {
    if (this._hoverListener) this._el.removeEventListener('vela-depth-chart-hover', this._hoverListener);
    if (this._clickListener) this._el.removeEventListener('vela-depth-chart-click', this._clickListener);
  }
}

// ── Candlestick Chart Directive ──���───────────────────────

/**
 * Directive for `<vela-candlestick-chart velaCandlestickChart>`.
 *
 * Binds:
 * - [velaCandles] → Candle[]
 * - (velaCrosshair) → crosshair event data
 * - (velaChartClick) → click event data
 */
export class VelaCandlestickChartDirective {
  private _el: VelaCandlestickChart;
  private _crosshairListener: ((e: Event) => void) | null = null;
  private _clickListener: ((e: Event) => void) | null = null;

  velaCandles: Candle[] | undefined;
  velaCrosshair = createEmitter<unknown>();
  velaChartClick = createEmitter<unknown>();

  constructor(el: { nativeElement: VelaCandlestickChart }) {
    this._el = el.nativeElement;
  }

  ngOnChanges(): void {
    if (this.velaCandles) syncProperty(this._el, 'candles', this.velaCandles);
  }

  ngOnInit(): void {
    this._crosshairListener = (e: Event) => this.velaCrosshair.emit((e as CustomEvent).detail);
    this._clickListener = (e: Event) => this.velaChartClick.emit((e as CustomEvent).detail);
    this._el.addEventListener('vela-candlestick-crosshair', this._crosshairListener);
    this._el.addEventListener('vela-candlestick-click', this._clickListener);
  }

  ngOnDestroy(): void {
    if (this._crosshairListener) this._el.removeEventListener('vela-candlestick-crosshair', this._crosshairListener);
    if (this._clickListener) this._el.removeEventListener('vela-candlestick-click', this._clickListener);
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
} from '@vela-trading/core';
