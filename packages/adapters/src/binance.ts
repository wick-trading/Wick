import type { OrderBookData, OrderBookDelta, Trade, TickerData } from '@wick/core';
import type { ExchangeAdapter, AdapterMessage } from './types.js';

/**
 * Raw Binance WebSocket message types.
 * @see https://binance-docs.github.io/apidocs/spot/en/#websocket-market-streams
 */

interface BinanceDepthSnapshot {
  lastUpdateId: number;
  bids: [string, string][]; // [price, qty]
  asks: [string, string][];
}

interface BinanceDepthUpdate {
  e: 'depthUpdate';
  s: string; // symbol
  b: [string, string][]; // bids [price, qty]
  a: [string, string][]; // asks [price, qty]
}

interface BinanceTrade {
  e: 'trade' | 'aggTrade';
  s: string;
  p: string; // price
  q: string; // quantity
  t: number; // trade id
  T: number; // timestamp
  m: boolean; // is buyer the maker?
}

interface BinanceTicker {
  e: '24hrTicker';
  s: string;
  c: string; // last price
  P: string; // price change percent
  h: string; // high
  l: string; // low
  v: string; // base volume
  E: number; // event time
}

/**
 * Parse a Binance depth snapshot (REST or initial WS message) into Wick OrderBookData.
 */
export function parseDepthSnapshot(msg: BinanceDepthSnapshot): OrderBookData {
  return {
    bids: msg.bids.map(([price, size]) => ({
      price: parseFloat(price),
      size: parseFloat(size),
    })),
    asks: msg.asks.map(([price, size]) => ({
      price: parseFloat(price),
      size: parseFloat(size),
    })),
  };
}

/**
 * Parse a Binance depth update into Wick OrderBookDelta[].
 */
export function parseDepthUpdate(msg: BinanceDepthUpdate): OrderBookDelta[] {
  const deltas: OrderBookDelta[] = [];

  for (const [price, qty] of msg.b) {
    deltas.push({ side: 'bid', price: parseFloat(price), size: parseFloat(qty) });
  }
  for (const [price, qty] of msg.a) {
    deltas.push({ side: 'ask', price: parseFloat(price), size: parseFloat(qty) });
  }

  return deltas;
}

/**
 * Parse a Binance trade message into a Wick Trade.
 */
export function parseTrade(msg: BinanceTrade): Trade {
  return {
    id: String(msg.t),
    price: parseFloat(msg.p),
    size: parseFloat(msg.q),
    side: msg.m ? 'sell' : 'buy', // m=true means buyer is maker, so taker is seller
    timestamp: msg.T,
  };
}

/**
 * Parse a Binance 24hr ticker into Wick TickerData.
 */
export function parseTicker(msg: BinanceTicker): TickerData {
  return {
    symbol: msg.s,
    price: parseFloat(msg.c),
    change24h: parseFloat(msg.P),
    high24h: parseFloat(msg.h),
    low24h: parseFloat(msg.l),
    volume24h: parseFloat(msg.v),
    timestamp: msg.E,
  };
}

/**
 * Full Binance adapter — auto-detects message type and parses accordingly.
 *
 * @example
 * ```ts
 * import { binanceAdapter } from '@wick/adapters/binance';
 *
 * const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@depth@100ms');
 * ws.onmessage = (event) => {
 *   const msg = binanceAdapter.parse(JSON.parse(event.data));
 *   if (!msg) return;
 *
 *   switch (msg.type) {
 *     case 'orderbook_snapshot': orderBook.data = msg.data; break;
 *     case 'orderbook_delta': orderBook.applyDeltas(msg.data); break;
 *     case 'trade': feed.addTrade(msg.data); break;
 *     case 'ticker': ticker.data = msg.data; break;
 *   }
 * };
 * ```
 */
export const binanceAdapter: ExchangeAdapter = {
  name: 'binance',

  parse(raw: unknown): AdapterMessage | null {
    if (typeof raw !== 'object' || raw === null) return null;
    const msg = raw as Record<string, unknown>;

    // Depth snapshot (from REST API or combined stream)
    if ('lastUpdateId' in msg && 'bids' in msg && 'asks' in msg) {
      return {
        type: 'orderbook_snapshot',
        data: parseDepthSnapshot(raw as BinanceDepthSnapshot),
      };
    }

    const eventType = msg.e as string | undefined;

    if (eventType === 'depthUpdate') {
      return {
        type: 'orderbook_delta',
        data: parseDepthUpdate(raw as BinanceDepthUpdate),
      };
    }

    if (eventType === 'trade' || eventType === 'aggTrade') {
      return {
        type: 'trade',
        data: parseTrade(raw as BinanceTrade),
      };
    }

    if (eventType === '24hrTicker') {
      return {
        type: 'ticker',
        data: parseTicker(raw as BinanceTicker),
      };
    }

    return null;
  },
};
