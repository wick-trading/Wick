/**
 * Core data types for Wick trading components.
 * These define the standardized data contracts that all components consume.
 */

/** A single price level in an order book */
export interface OrderBookLevel {
  /** Price at this level */
  price: number;
  /** Quantity/size at this level */
  size: number;
}

/** Snapshot of order book state */
export interface OrderBookData {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
}

/** Delta update for an order book (size=0 means remove) */
export interface OrderBookDelta {
  side: 'bid' | 'ask';
  price: number;
  size: number;
}

/** A single executed trade */
export interface Trade {
  id: string;
  price: number;
  size: number;
  side: 'buy' | 'sell';
  timestamp: number;
}

/** OHLCV candle data */
export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/** Price ticker data for a single instrument */
export interface TickerData {
  symbol: string;
  price: number;
  /** Previous price for calculating change */
  prevPrice?: number;
  /** 24h high */
  high24h?: number;
  /** 24h low */
  low24h?: number;
  /** 24h volume */
  volume24h?: number;
  /** 24h price change percentage */
  change24h?: number;
  timestamp: number;
}

/** Standard price formatting options */
export interface PriceFormatOptions {
  /** Number of decimal places */
  precision?: number;
  /** Locale for number formatting */
  locale?: string;
  /** Currency symbol to prepend */
  currencySymbol?: string;
}
