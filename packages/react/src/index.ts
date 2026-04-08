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

import type { OrderBookData, PriceFormatOptions, TickerData, Trade, Candle } from '@wick/core';
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

// ─── New packages (Batch A–E) ────────────────────────────────────────────────

import '@wick/connection-status';
import '@wick/position-sizer';
import '@wick/risk-panel';
import '@wick/market-clock';
import '@wick/economic-calendar';
import '@wick/liquidation-feed';
import '@wick/news-feed';
import '@wick/alerts';
import '@wick/trade-history';
import '@wick/open-interest';
import '@wick/pnl';
import '@wick/positions';
import '@wick/correlation-matrix';
import '@wick/watchlist';
import '@wick/symbol-search';
import '@wick/order-ticket';
import '@wick/order-manager';
import '@wick/screener';
import '@wick/volume-profile';
import '@wick/dom-ladder';
import '@wick/drawing-tools';

import type { WickConnectionStatus } from '@wick/connection-status';
import type { WickPositionSizer } from '@wick/position-sizer';
import type { WickRiskPanel } from '@wick/risk-panel';
import type { WickMarketClock } from '@wick/market-clock';
import type { WickEconomicCalendar } from '@wick/economic-calendar';
import type { WickLiquidationFeed } from '@wick/liquidation-feed';
import type { WickNewsFeed } from '@wick/news-feed';
import type { WickAlerts } from '@wick/alerts';
import type { WickTradeHistory } from '@wick/trade-history';
import type { WickOpenInterest } from '@wick/open-interest';
import type { WickPnlSummary, WickEquityCurve } from '@wick/pnl';
import type { WickPositions } from '@wick/positions';
import type { WickCorrelationMatrix } from '@wick/correlation-matrix';
import type { WickWatchlist } from '@wick/watchlist';
import type { WickSymbolSearch } from '@wick/symbol-search';
import type { WickOrderTicket } from '@wick/order-ticket';
import type { WickOrderManager } from '@wick/order-manager';
import type { WickScreener } from '@wick/screener';
import type { WickVolumeProfile } from '@wick/volume-profile';
import type { WickDomLadder } from '@wick/dom-ladder';
import type { WickDrawingOverlay } from '@wick/drawing-tools';

import type {
  ConnectionState,
} from '@wick/connection-status';
import type { PositionSizingResult } from '@wick/position-sizer';
import type { RiskData } from '@wick/risk-panel';
import type { MarketSession } from '@wick/market-clock';
import type { EconomicEvent } from '@wick/economic-calendar';
import type { LiquidationEvent } from '@wick/liquidation-feed';
import type { NewsItem } from '@wick/news-feed';
import type { AlertRule } from '@wick/alerts';
import type { TradeRecord } from '@wick/trade-history';
import type { OpenInterestData, OpenInterestSample } from '@wick/open-interest';
import type { PnlSummaryData, EquityPoint, TimeFrame } from '@wick/pnl';
import type { Position } from '@wick/positions';
import type { CorrelationData } from '@wick/correlation-matrix';
import type { WatchlistInstrument, WatchlistSort } from '@wick/watchlist';
import type { SymbolEntry } from '@wick/symbol-search';
import type { OrderRequest, OrderSide, OrderType as OTOrderType } from '@wick/order-ticket';
import type { OpenOrder, OrderStatus } from '@wick/order-manager';
import type { FilterDef, FilterValue, ScreenableInstrument } from '@wick/screener';
import type { VolumeBar, VolumeProfileData, VpLevels } from '@wick/volume-profile';
import type { DomLevel, DomData, DomDelta } from '@wick/dom-ladder';
import type { DrawingTool, ToolType, ToolPoint } from '@wick/drawing-tools';

// Re-export all types
export type {
  ConnectionState,
  PositionSizingResult, RiskData, MarketSession, EconomicEvent,
  LiquidationEvent, NewsItem, AlertRule, TradeRecord,
  OpenInterestData, OpenInterestSample,
  PnlSummaryData, EquityPoint, TimeFrame,
  Position, CorrelationData,
  WatchlistInstrument, WatchlistSort,
  SymbolEntry, OrderRequest, OrderSide, OTOrderType,
  OpenOrder, OrderStatus,
  FilterDef, FilterValue, ScreenableInstrument,
  VolumeBar, VolumeProfileData, VpLevels,
  DomLevel, DomData, DomDelta,
  DrawingTool, ToolType, ToolPoint,
};

// ── ConnectionStatus ──────────────────────────────────────────────────────────

export interface ConnectionStatusProps extends HTMLAttributes<HTMLElement> {
  state?: ConnectionState;
  latencyMs?: number;
  staleAfterMs?: number;
  onStateChange?: (detail: { state: ConnectionState; prevState: ConnectionState }) => void;
  onStale?: (detail: { lastTickAt: number }) => void;
}

export const ConnectionStatus = forwardRef<WickConnectionStatus, ConnectionStatusProps>(
  ({ state, latencyMs, staleAfterMs, onStateChange, onStale, ...attrs }, fwdRef) => {
    const ref = useRef<WickConnectionStatus>(null);
    useImperativeHandle(fwdRef, () => ref.current!, []);
    usePropertySync(ref, { state });
    useCustomEvent(ref, 'wick-conn-state-change', onStateChange);
    useCustomEvent(ref, 'wick-conn-stale', onStale);
    return createElement('wick-connection-status', {
      ref, 'latency-ms': latencyMs, 'stale-after-ms': staleAfterMs, ...attrs,
    });
  },
);
ConnectionStatus.displayName = 'ConnectionStatus';

// ── PositionSizer ─────────────────────────────────────────────────────────────

export interface PositionSizerProps extends HTMLAttributes<HTMLElement> {
  accountBalance?: number;
  riskPercent?: number;
  entryPrice?: number;
  stopPrice?: number;
  targetPrice?: number;
  tickSize?: number;
  onSizingChange?: (detail: PositionSizingResult) => void;
}

export const PositionSizer = forwardRef<WickPositionSizer, PositionSizerProps>(
  ({ accountBalance, riskPercent, entryPrice, stopPrice, targetPrice, tickSize, onSizingChange, ...attrs }, fwdRef) => {
    const ref = useRef<WickPositionSizer>(null);
    useImperativeHandle(fwdRef, () => ref.current!, []);
    useCustomEvent(ref, 'wick-sizing-change', onSizingChange);
    return createElement('wick-position-sizer', {
      ref,
      'account-balance': accountBalance,
      'risk-percent': riskPercent,
      'entry-price': entryPrice,
      'stop-price': stopPrice,
      'target-price': targetPrice,
      'tick-size': tickSize,
      ...attrs,
    });
  },
);
PositionSizer.displayName = 'PositionSizer';

// ── RiskPanel ─────────────────────────────────────────────────────────────────

export interface RiskPanelProps extends HTMLAttributes<HTMLElement> {
  data?: RiskData;
  warnThreshold?: number;
  dangerThreshold?: number;
  onThresholdCross?: (detail: { level: string; utilization: number }) => void;
}

export const RiskPanel = forwardRef<WickRiskPanel, RiskPanelProps>(
  ({ data, warnThreshold, dangerThreshold, onThresholdCross, ...attrs }, fwdRef) => {
    const ref = useRef<WickRiskPanel>(null);
    useImperativeHandle(fwdRef, () => ref.current!, []);
    usePropertySync(ref, { data });
    useCustomEvent(ref, 'wick-risk-threshold-cross', onThresholdCross);
    return createElement('wick-risk-panel', {
      ref,
      'warn-threshold': warnThreshold,
      'danger-threshold': dangerThreshold,
      ...attrs,
    });
  },
);
RiskPanel.displayName = 'RiskPanel';

// ── MarketClock ───────────────────────────────────────────────────────────────

export interface MarketClockProps extends HTMLAttributes<HTMLElement> {
  sessions?: MarketSession[];
  onTick?: (detail: { ts: number }) => void;
}

export const MarketClock = forwardRef<WickMarketClock, MarketClockProps>(
  ({ sessions, onTick, ...attrs }, fwdRef) => {
    const ref = useRef<WickMarketClock>(null);
    useImperativeHandle(fwdRef, () => ref.current!, []);
    usePropertySync(ref, { sessions });
    useCustomEvent(ref, 'wick-clock-tick', onTick);
    return createElement('wick-market-clock', { ref, ...attrs });
  },
);
MarketClock.displayName = 'MarketClock';

// ── EconomicCalendar ──────────────────────────────────────────────────────────

export interface EconomicCalendarProps extends HTMLAttributes<HTMLElement> {
  events?: EconomicEvent[];
  filterImpact?: string[];
  filterRegions?: string[];
  imminentMinutes?: number;
  onEventImminent?: (detail: { event: EconomicEvent; minutesUntil: number }) => void;
}

export const EconomicCalendar = forwardRef<WickEconomicCalendar, EconomicCalendarProps>(
  ({ events, filterImpact, filterRegions, imminentMinutes, onEventImminent, ...attrs }, fwdRef) => {
    const ref = useRef<WickEconomicCalendar>(null);
    useImperativeHandle(fwdRef, () => ref.current!, []);
    usePropertySync(ref, { events, filterImpact, filterRegions });
    useCustomEvent(ref, 'wick-event-imminent', onEventImminent);
    return createElement('wick-economic-calendar', {
      ref, 'imminent-minutes': imminentMinutes, ...attrs,
    });
  },
);
EconomicCalendar.displayName = 'EconomicCalendar';

// ── LiquidationFeed ───────────────────────────────────────────────────────────

export interface LiquidationFeedProps extends HTMLAttributes<HTMLElement> {
  events?: LiquidationEvent[];
  maxEvents?: number;
  minSizeUsd?: number;
  whaleSizeUsd?: number;
  onLiquidation?: (detail: LiquidationEvent) => void;
}

export const LiquidationFeed = forwardRef<WickLiquidationFeed, LiquidationFeedProps>(
  ({ events, maxEvents, minSizeUsd, whaleSizeUsd, onLiquidation, ...attrs }, fwdRef) => {
    const ref = useRef<WickLiquidationFeed>(null);
    useImperativeHandle(fwdRef, () => ref.current!, []);
    usePropertySync(ref, { events });
    useCustomEvent(ref, 'wick-liquidation', onLiquidation);
    return createElement('wick-liquidation-feed', {
      ref,
      'max-events': maxEvents,
      'min-size-usd': minSizeUsd,
      'whale-size-usd': whaleSizeUsd,
      ...attrs,
    });
  },
);
LiquidationFeed.displayName = 'LiquidationFeed';

// ── NewsFeed ──────────────────────────────────────────────────────────────────

export interface NewsFeedProps extends HTMLAttributes<HTMLElement> {
  items?: NewsItem[];
  maxItems?: number;
  filterSymbols?: string[];
  filterSources?: string[];
  onItemClick?: (detail: NewsItem) => void;
}

export const NewsFeed = forwardRef<WickNewsFeed, NewsFeedProps>(
  ({ items, maxItems, filterSymbols, filterSources, onItemClick, ...attrs }, fwdRef) => {
    const ref = useRef<WickNewsFeed>(null);
    useImperativeHandle(fwdRef, () => ref.current!, []);
    usePropertySync(ref, { items, filterSymbols, filterSources });
    useCustomEvent(ref, 'wick-news-item-click', onItemClick);
    return createElement('wick-news-feed', {
      ref, 'max-items': maxItems, ...attrs,
    });
  },
);
NewsFeed.displayName = 'NewsFeed';

// ── Alerts ────────────────────────────────────────────────────────────────────

export interface AlertsProps extends HTMLAttributes<HTMLElement> {
  rules?: AlertRule[];
  onAlertTriggered?: (detail: { rule: AlertRule; value: number }) => void;
}

export const Alerts = forwardRef<WickAlerts, AlertsProps>(
  ({ rules, onAlertTriggered, ...attrs }, fwdRef) => {
    const ref = useRef<WickAlerts>(null);
    useImperativeHandle(fwdRef, () => ref.current!, []);
    usePropertySync(ref, { rules });
    useCustomEvent(ref, 'wick-alert-triggered', onAlertTriggered);
    return createElement('wick-alerts', { ref, ...attrs });
  },
);
Alerts.displayName = 'Alerts';

// ── TradeHistory ──────────────────────────────────────────────────────────────

export interface TradeHistoryProps extends HTMLAttributes<HTMLElement> {
  trades?: TradeRecord[];
  onRowClick?: (detail: TradeRecord) => void;
}

export const TradeHistory = forwardRef<WickTradeHistory, TradeHistoryProps>(
  ({ trades, onRowClick, ...attrs }, fwdRef) => {
    const ref = useRef<WickTradeHistory>(null);
    useImperativeHandle(fwdRef, () => ref.current!, []);
    usePropertySync(ref, { trades });
    useCustomEvent(ref, 'wick-trade-row-click', onRowClick);
    return createElement('wick-trade-history', { ref, ...attrs });
  },
);
TradeHistory.displayName = 'TradeHistory';

// ── OpenInterest ──────────────────────────────────────────────────────────────

export interface OpenInterestProps extends HTMLAttributes<HTMLElement> {
  data?: OpenInterestData;
  lookback?: number;
  flashThreshold?: number;
  onOiChange?: (detail: { symbol: string; prev: number; value: number; deltaPct: number }) => void;
}

export const OpenInterest = forwardRef<WickOpenInterest, OpenInterestProps>(
  ({ data, lookback, flashThreshold, onOiChange, ...attrs }, fwdRef) => {
    const ref = useRef<WickOpenInterest>(null);
    useImperativeHandle(fwdRef, () => ref.current!, []);
    usePropertySync(ref, { data });
    useCustomEvent(ref, 'wick-oi-change', onOiChange);
    return createElement('wick-open-interest', {
      ref, lookback, 'flash-threshold': flashThreshold, ...attrs,
    });
  },
);
OpenInterest.displayName = 'OpenInterest';

// ── PnlSummary ────────────────────────────────────────────────────────────────

export interface PnlSummaryProps extends HTMLAttributes<HTMLElement> {
  data?: PnlSummaryData;
  showRealized?: boolean;
  showUnrealized?: boolean;
  showDaily?: boolean;
  showTotal?: boolean;
}

export const PnlSummary = forwardRef<WickPnlSummary, PnlSummaryProps>(
  ({ data, showRealized, showUnrealized, showDaily, showTotal, ...attrs }, fwdRef) => {
    const ref = useRef<WickPnlSummary>(null);
    useImperativeHandle(fwdRef, () => ref.current!, []);
    usePropertySync(ref, { data });
    return createElement('wick-pnl-summary', {
      ref,
      'show-realized': showRealized === false ? undefined : '',
      'show-unrealized': showUnrealized === false ? undefined : '',
      'show-daily': showDaily === false ? undefined : '',
      'show-total': showTotal === false ? undefined : '',
      ...attrs,
    });
  },
);
PnlSummary.displayName = 'PnlSummary';

// ── EquityCurve ───────────────────────────────────────────────────────────────

export interface EquityCurveProps extends HTMLAttributes<HTMLElement> {
  data?: EquityPoint[];
  timeFrame?: TimeFrame;
  onTimeframeChange?: (detail: { timeFrame: TimeFrame }) => void;
}

export const EquityCurve = forwardRef<WickEquityCurve, EquityCurveProps>(
  ({ data, timeFrame, onTimeframeChange, ...attrs }, fwdRef) => {
    const ref = useRef<WickEquityCurve>(null);
    useImperativeHandle(fwdRef, () => ref.current!, []);
    usePropertySync(ref, { data });
    useCustomEvent(ref, 'wick-pnl-timeframe-change', onTimeframeChange);
    return createElement('wick-equity-curve', {
      ref, 'time-frame': timeFrame, ...attrs,
    });
  },
);
EquityCurve.displayName = 'EquityCurve';

// ── Positions ─────────────────────────────────────────────────────────────────

export interface PositionsProps extends HTMLAttributes<HTMLElement> {
  positions?: Position[];
  onPositionClose?: (detail: { id: string; symbol: string; side: string; qty: number }) => void;
  onPositionClick?: (detail: { id: string }) => void;
}

export const Positions = forwardRef<WickPositions, PositionsProps>(
  ({ positions, onPositionClose, onPositionClick, ...attrs }, fwdRef) => {
    const ref = useRef<WickPositions>(null);
    useImperativeHandle(fwdRef, () => ref.current!, []);
    usePropertySync(ref, { positions });
    useCustomEvent(ref, 'wick-position-close', onPositionClose);
    useCustomEvent(ref, 'wick-position-click', onPositionClick);
    return createElement('wick-positions', { ref, ...attrs });
  },
);
Positions.displayName = 'Positions';

// ── CorrelationMatrix ─────────────────────────────────────────────────────────

export interface CorrelationMatrixProps extends HTMLAttributes<HTMLElement> {
  data?: CorrelationData;
  returnMode?: 'simple' | 'log';
  onCellClick?: (detail: { a: string; b: string; value: number }) => void;
}

export const CorrelationMatrix = forwardRef<WickCorrelationMatrix, CorrelationMatrixProps>(
  ({ data, returnMode, onCellClick, ...attrs }, fwdRef) => {
    const ref = useRef<WickCorrelationMatrix>(null);
    useImperativeHandle(fwdRef, () => ref.current!, []);
    usePropertySync(ref, { data });
    useCustomEvent(ref, 'wick-corr-cell-click', onCellClick);
    return createElement('wick-correlation-matrix', {
      ref, 'return-mode': returnMode, ...attrs,
    });
  },
);
CorrelationMatrix.displayName = 'CorrelationMatrix';

// ── Watchlist ─────────────────────────────────────────────────────────────────

export interface WatchlistProps extends HTMLAttributes<HTMLElement> {
  instruments?: WatchlistInstrument[];
  columns?: string;
  sortBy?: WatchlistSort;
  sortDir?: 'asc' | 'desc';
  onRowClick?: (detail: { id: string; symbol: string }) => void;
  onSortChange?: (detail: { sortBy: WatchlistSort; sortDir: 'asc' | 'desc' }) => void;
}

export const Watchlist = forwardRef<WickWatchlist, WatchlistProps>(
  ({ instruments, columns, sortBy, sortDir, onRowClick, onSortChange, ...attrs }, fwdRef) => {
    const ref = useRef<WickWatchlist>(null);
    useImperativeHandle(fwdRef, () => ref.current!, []);
    usePropertySync(ref, { instruments });
    useCustomEvent(ref, 'wick-watchlist-row-click', onRowClick);
    useCustomEvent(ref, 'wick-watchlist-sort-change', onSortChange);
    return createElement('wick-watchlist', {
      ref, columns, 'sort-by': sortBy, 'sort-dir': sortDir, ...attrs,
    });
  },
);
Watchlist.displayName = 'Watchlist';

// ── SymbolSearch ──────────────────────────────────────────────────────────────

export interface SymbolSearchProps extends HTMLAttributes<HTMLElement> {
  universe?: SymbolEntry[];
  placeholder?: string;
  maxResults?: number;
  onSymbolPick?: (detail: SymbolEntry) => void;
  onSymbolQuery?: (detail: { query: string }) => void;
}

export const SymbolSearch = forwardRef<WickSymbolSearch, SymbolSearchProps>(
  ({ universe, placeholder, maxResults, onSymbolPick, onSymbolQuery, ...attrs }, fwdRef) => {
    const ref = useRef<WickSymbolSearch>(null);
    useImperativeHandle(fwdRef, () => ref.current!, []);
    usePropertySync(ref, { universe });
    useCustomEvent(ref, 'wick-symbol-pick', onSymbolPick);
    useCustomEvent(ref, 'wick-symbol-query', onSymbolQuery);
    return createElement('wick-symbol-search', {
      ref, placeholder, 'max-results': maxResults, ...attrs,
    });
  },
);
SymbolSearch.displayName = 'SymbolSearch';

// ── OrderTicket ───────────────────────────────────────────────────────────────

export interface OrderTicketProps extends HTMLAttributes<HTMLElement> {
  symbol?: string;
  price?: number;
  tickSize?: number;
  lotSize?: number;
  minQty?: number;
  maxQty?: number;
  onOrderSubmit?: (detail: OrderRequest) => void;
  onSideChange?: (detail: { side: OrderSide }) => void;
  onTypeChange?: (detail: { type: OTOrderType }) => void;
}

export const OrderTicket = forwardRef<WickOrderTicket, OrderTicketProps>(
  ({ symbol, price, tickSize, lotSize, minQty, maxQty, onOrderSubmit, onSideChange, onTypeChange, ...attrs }, fwdRef) => {
    const ref = useRef<WickOrderTicket>(null);
    useImperativeHandle(fwdRef, () => ref.current!, []);
    useCustomEvent(ref, 'wick-order-submit', onOrderSubmit);
    useCustomEvent(ref, 'wick-side-change', onSideChange);
    useCustomEvent(ref, 'wick-type-change', onTypeChange);
    return createElement('wick-order-ticket', {
      ref, symbol, price,
      'tick-size': tickSize, 'lot-size': lotSize,
      'min-qty': minQty, 'max-qty': maxQty,
      ...attrs,
    });
  },
);
OrderTicket.displayName = 'OrderTicket';

// ── OrderManager ──────────────────────────────────────────────────────────────

export interface OrderManagerProps extends HTMLAttributes<HTMLElement> {
  orders?: OpenOrder[];
  symbolFilter?: string;
  sideFilter?: 'buy' | 'sell' | '';
  onOrderCancel?: (detail: { id: string }) => void;
  onOrderModify?: (detail: { id: string; changes: { price?: number; size?: number } }) => void;
}

export const OrderManager = forwardRef<WickOrderManager, OrderManagerProps>(
  ({ orders, symbolFilter, sideFilter, onOrderCancel, onOrderModify, ...attrs }, fwdRef) => {
    const ref = useRef<WickOrderManager>(null);
    useImperativeHandle(fwdRef, () => ref.current!, []);
    usePropertySync(ref, { orders });
    useCustomEvent(ref, 'wick-order-cancel', onOrderCancel);
    useCustomEvent(ref, 'wick-order-modify', onOrderModify);
    return createElement('wick-order-manager', {
      ref,
      'symbol-filter': symbolFilter,
      'side-filter': sideFilter,
      ...attrs,
    });
  },
);
OrderManager.displayName = 'OrderManager';

// ── Screener ──────────────────────────────────────────────────────────────────

export interface ScreenerProps extends HTMLAttributes<HTMLElement> {
  filters?: FilterDef[];
  universe?: ScreenableInstrument[];
  onResults?: (detail: { results: ScreenableInstrument[]; count: number }) => void;
  onFilterChange?: (detail: { id: string; value: FilterValue }) => void;
}

export const Screener = forwardRef<WickScreener, ScreenerProps>(
  ({ filters, universe, onResults, onFilterChange, ...attrs }, fwdRef) => {
    const ref = useRef<WickScreener>(null);
    useImperativeHandle(fwdRef, () => ref.current!, []);
    usePropertySync(ref, { filters, universe });
    useCustomEvent(ref, 'wick-screener-results', onResults);
    useCustomEvent(ref, 'wick-screener-filter-change', onFilterChange);
    return createElement('wick-screener', { ref, ...attrs });
  },
);
Screener.displayName = 'Screener';

// ── VolumeProfile ─────────────────────────────────────────────────────────────

export interface VolumeProfileProps extends HTMLAttributes<HTMLElement> {
  data?: VolumeProfileData;
  valueArea?: number;
  bucketSize?: number;
  onPocChange?: (detail: VpLevels) => void;
}

export const VolumeProfile = forwardRef<WickVolumeProfile, VolumeProfileProps>(
  ({ data, valueArea, bucketSize, onPocChange, ...attrs }, fwdRef) => {
    const ref = useRef<WickVolumeProfile>(null);
    useImperativeHandle(fwdRef, () => ref.current!, []);
    usePropertySync(ref, { data });
    useCustomEvent(ref, 'wick-vp-poc-change', onPocChange);
    return createElement('wick-volume-profile', {
      ref, 'value-area': valueArea, 'bucket-size': bucketSize, ...attrs,
    });
  },
);
VolumeProfile.displayName = 'VolumeProfile';

// ── DomLadder ─────────────────────────────────────────────────────────────────

export interface DomLadderProps extends HTMLAttributes<HTMLElement> {
  data?: DomData;
  tickSize?: number;
  rowCount?: number;
  onRowClick?: (detail: { price: number; side: string; intent: 'buy' | 'sell' }) => void;
}

export const DomLadder = forwardRef<WickDomLadder, DomLadderProps>(
  ({ data, tickSize, rowCount, onRowClick, ...attrs }, fwdRef) => {
    const ref = useRef<WickDomLadder>(null);
    useImperativeHandle(fwdRef, () => ref.current!, []);
    usePropertySync(ref, { data });
    useCustomEvent(ref, 'wick-dom-row-click', onRowClick);
    return createElement('wick-dom-ladder', {
      ref, 'tick-size': tickSize, 'row-count': rowCount, ...attrs,
    });
  },
);
DomLadder.displayName = 'DomLadder';

// ── DrawingOverlay ────────────────────────────────────────────────────────────

export interface DrawingOverlayProps extends HTMLAttributes<HTMLElement> {
  tools?: DrawingTool[];
  activeTool?: ToolType | null;
  onCreate?: (detail: { tool: DrawingTool }) => void;
  onUpdate?: (detail: { id: string; tool: DrawingTool }) => void;
  onDelete?: (detail: { id: string }) => void;
  onDrawingSelect?: (detail: { id: string }) => void;
}

export const DrawingOverlay = forwardRef<WickDrawingOverlay, DrawingOverlayProps>(
  ({ tools, activeTool, onCreate, onUpdate, onDelete, onDrawingSelect, ...attrs }, fwdRef) => {
    const ref = useRef<WickDrawingOverlay>(null);
    useImperativeHandle(fwdRef, () => ref.current!, []);
    usePropertySync(ref, { tools });
    useCustomEvent(ref, 'wick-drawing-create', onCreate);
    useCustomEvent(ref, 'wick-drawing-update', onUpdate);
    useCustomEvent(ref, 'wick-drawing-delete', onDelete);
    useCustomEvent(ref, 'wick-drawing-select', onDrawingSelect);
    return createElement('wick-drawing-overlay', {
      ref, 'active-tool': activeTool ?? undefined, ...attrs,
    });
  },
);
DrawingOverlay.displayName = 'DrawingOverlay';

// ─── Transmigrating packages ──────────────────────────────────────────────────

import '@wick/indicators';
import '@wick/order-book-heatmap';
import '@wick/market-heatmap';

import type {
  WickIndicatorEma, WickIndicatorSma, WickIndicatorBollinger,
  WickIndicatorMacd, WickIndicatorRsi, WickIndicatorVwap,
  BollingerResult, MACDResult,
} from '@wick/indicators';
import type { WickOrderBookHeatmap, HeatmapSnapshot } from '@wick/order-book-heatmap';
import type { WickMarketHeatmap, HeatmapTile } from '@wick/market-heatmap';

export type { BollingerResult, MACDResult, HeatmapSnapshot, HeatmapTile };

// ── IndicatorEma ──────────────────────────────────────────────────────────────

export interface IndicatorEmaProps extends HTMLAttributes<HTMLElement> {
  candles?: Candle[];
  period?: number;
  color?: string;
  chart?: string;
}

export const IndicatorEma = forwardRef<WickIndicatorEma, IndicatorEmaProps>(
  ({ candles, period, color, chart, ...attrs }, fwdRef) => {
    const ref = useRef<WickIndicatorEma>(null);
    useImperativeHandle(fwdRef, () => ref.current!, []);
    usePropertySync(ref, { candles });
    return createElement('wick-indicator-ema', { ref, period, color, chart, ...attrs });
  },
);
IndicatorEma.displayName = 'IndicatorEma';

// ── IndicatorSma ──────────────────────────────────────────────────────────────

export interface IndicatorSmaProps extends HTMLAttributes<HTMLElement> {
  candles?: Candle[];
  period?: number;
  color?: string;
  chart?: string;
}

export const IndicatorSma = forwardRef<WickIndicatorSma, IndicatorSmaProps>(
  ({ candles, period, color, chart, ...attrs }, fwdRef) => {
    const ref = useRef<WickIndicatorSma>(null);
    useImperativeHandle(fwdRef, () => ref.current!, []);
    usePropertySync(ref, { candles });
    return createElement('wick-indicator-sma', { ref, period, color, chart, ...attrs });
  },
);
IndicatorSma.displayName = 'IndicatorSma';

// ── IndicatorBollinger ────────────────────────────────────────────────────────

export interface IndicatorBollingerProps extends HTMLAttributes<HTMLElement> {
  candles?: Candle[];
  period?: number;
  stddev?: number;
  colorUpper?: string;
  colorMiddle?: string;
  colorLower?: string;
  chart?: string;
}

export const IndicatorBollinger = forwardRef<WickIndicatorBollinger, IndicatorBollingerProps>(
  ({ candles, period, stddev, colorUpper, colorMiddle, colorLower, chart, ...attrs }, fwdRef) => {
    const ref = useRef<WickIndicatorBollinger>(null);
    useImperativeHandle(fwdRef, () => ref.current!, []);
    usePropertySync(ref, { candles });
    return createElement('wick-indicator-bollinger', {
      ref, period, stddev,
      'color-upper': colorUpper, 'color-middle': colorMiddle, 'color-lower': colorLower,
      chart, ...attrs,
    });
  },
);
IndicatorBollinger.displayName = 'IndicatorBollinger';

// ── IndicatorMacd ─────────────────────────────────────────────────────────────

export interface IndicatorMacdProps extends HTMLAttributes<HTMLElement> {
  candles?: Candle[];
  fast?: number;
  slow?: number;
  signal?: number;
  colorMacd?: string;
  colorSignal?: string;
  colorHist?: string;
  chart?: string;
}

export const IndicatorMacd = forwardRef<WickIndicatorMacd, IndicatorMacdProps>(
  ({ candles, fast, slow, signal, colorMacd, colorSignal, colorHist, chart, ...attrs }, fwdRef) => {
    const ref = useRef<WickIndicatorMacd>(null);
    useImperativeHandle(fwdRef, () => ref.current!, []);
    usePropertySync(ref, { candles });
    return createElement('wick-indicator-macd', {
      ref, fast, slow, signal,
      'color-macd': colorMacd, 'color-signal': colorSignal, 'color-hist': colorHist,
      chart, ...attrs,
    });
  },
);
IndicatorMacd.displayName = 'IndicatorMacd';

// ── IndicatorRsi ──────────────────────────────────────────────────────────────

export interface IndicatorRsiProps extends HTMLAttributes<HTMLElement> {
  candles?: Candle[];
  period?: number;
  color?: string;
  chart?: string;
}

export const IndicatorRsi = forwardRef<WickIndicatorRsi, IndicatorRsiProps>(
  ({ candles, period, color, chart, ...attrs }, fwdRef) => {
    const ref = useRef<WickIndicatorRsi>(null);
    useImperativeHandle(fwdRef, () => ref.current!, []);
    usePropertySync(ref, { candles });
    return createElement('wick-indicator-rsi', { ref, period, color, chart, ...attrs });
  },
);
IndicatorRsi.displayName = 'IndicatorRsi';

// ── IndicatorVwap ─────────────────────────────────────────────────────────────

export interface IndicatorVwapProps extends HTMLAttributes<HTMLElement> {
  candles?: Candle[];
  color?: string;
  chart?: string;
}

export const IndicatorVwap = forwardRef<WickIndicatorVwap, IndicatorVwapProps>(
  ({ candles, color, chart, ...attrs }, fwdRef) => {
    const ref = useRef<WickIndicatorVwap>(null);
    useImperativeHandle(fwdRef, () => ref.current!, []);
    usePropertySync(ref, { candles });
    return createElement('wick-indicator-vwap', { ref, color, chart, ...attrs });
  },
);
IndicatorVwap.displayName = 'IndicatorVwap';

// ── OrderBookHeatmap ──────────────────────────────────────────────────────────

export interface OrderBookHeatmapProps extends HTMLAttributes<HTMLElement> {
  historyDepth?: number;
  priceLevels?: number;
  colorBid?: string;
  colorAsk?: string;
  onHeatmapClick?: (detail: { timestamp: number; price: number }) => void;
  onHeatmapHover?: (detail: { timestamp: number; price: number }) => void;
}

export const OrderBookHeatmap = forwardRef<WickOrderBookHeatmap, OrderBookHeatmapProps>(
  ({ historyDepth, priceLevels, colorBid, colorAsk, onHeatmapClick, onHeatmapHover, ...attrs }, fwdRef) => {
    const ref = useRef<WickOrderBookHeatmap>(null);
    useImperativeHandle(fwdRef, () => ref.current!, []);
    useCustomEvent(ref, 'wick-heatmap-click', onHeatmapClick);
    useCustomEvent(ref, 'wick-heatmap-hover', onHeatmapHover);
    return createElement('wick-order-book-heatmap', {
      ref,
      'history-depth': historyDepth,
      'price-levels': priceLevels,
      'color-bid': colorBid,
      'color-ask': colorAsk,
      ...attrs,
    });
  },
);
OrderBookHeatmap.displayName = 'OrderBookHeatmap';

// ── MarketHeatmap ─────────────────────────────────────────────────────────────

export interface MarketHeatmapProps extends HTMLAttributes<HTMLElement> {
  data?: HeatmapTile[];
  changeMax?: number;
  labelThreshold?: number;
  onTileClick?: (detail: { tile: HeatmapTile }) => void;
  onTileHover?: (detail: { tile: HeatmapTile | null }) => void;
}

export const MarketHeatmap = forwardRef<WickMarketHeatmap, MarketHeatmapProps>(
  ({ data, changeMax, labelThreshold, onTileClick, onTileHover, ...attrs }, fwdRef) => {
    const ref = useRef<WickMarketHeatmap>(null);
    useImperativeHandle(fwdRef, () => ref.current!, []);
    usePropertySync(ref, { data });
    useCustomEvent(ref, 'wick-heatmap-tile-click', onTileClick);
    useCustomEvent(ref, 'wick-heatmap-tile-hover', onTileHover);
    return createElement('wick-market-heatmap', {
      ref,
      'change-max': changeMax,
      'label-threshold': labelThreshold,
      ...attrs,
    });
  },
);
MarketHeatmap.displayName = 'MarketHeatmap';
