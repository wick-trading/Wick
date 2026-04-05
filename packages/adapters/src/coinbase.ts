import type { OrderBookData, OrderBookDelta, Trade, TickerData } from '@wick/core';
import type { ExchangeAdapter, AdapterMessage } from './types.js';

/**
 * Raw Coinbase Advanced Trade WebSocket message types.
 * @see https://docs.cdp.coinbase.com/advanced-trade/docs/ws-overview
 */

interface CoinbaseSnapshot {
  type: 'snapshot';
  product_id: string;
  bids: [string, string][]; // [price, size]
  asks: [string, string][];
}

interface CoinbaseL2Update {
  type: 'l2update';
  product_id: string;
  changes: [string, string, string][]; // [side, price, size]
}

interface CoinbaseMatch {
  type: 'match' | 'last_match';
  trade_id: number;
  product_id: string;
  price: string;
  size: string;
  side: string; // 'buy' or 'sell' (maker side)
  time: string; // ISO 8601
}

interface CoinbaseTicker {
  type: 'ticker';
  product_id: string;
  price: string;
  open_24h: string;
  high_24h: string;
  low_24h: string;
  volume_24h: string;
  time: string;
}

/**
 * Parse a Coinbase L2 snapshot into Wick OrderBookData.
 */
export function parseSnapshot(msg: CoinbaseSnapshot): OrderBookData {
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
 * Parse a Coinbase L2 update into Wick OrderBookDelta[].
 */
export function parseL2Update(msg: CoinbaseL2Update): OrderBookDelta[] {
  return msg.changes.map(([side, price, size]) => ({
    side: side === 'buy' ? 'bid' as const : 'ask' as const,
    price: parseFloat(price),
    size: parseFloat(size),
  }));
}

/**
 * Parse a Coinbase match/trade into a Wick Trade.
 */
export function parseMatch(msg: CoinbaseMatch): Trade {
  return {
    id: String(msg.trade_id),
    price: parseFloat(msg.price),
    size: parseFloat(msg.size),
    // Coinbase reports maker side — taker is opposite
    side: msg.side === 'buy' ? 'sell' : 'buy',
    timestamp: new Date(msg.time).getTime(),
  };
}

/**
 * Parse a Coinbase ticker into Wick TickerData.
 */
export function parseTicker(msg: CoinbaseTicker): TickerData {
  const price = parseFloat(msg.price);
  const open = parseFloat(msg.open_24h);
  const change = open > 0 ? ((price - open) / open) * 100 : 0;

  return {
    symbol: msg.product_id.replace('-', '/'),
    price,
    change24h: change,
    high24h: parseFloat(msg.high_24h),
    low24h: parseFloat(msg.low_24h),
    volume24h: parseFloat(msg.volume_24h),
    timestamp: new Date(msg.time).getTime(),
  };
}

/**
 * Full Coinbase adapter — auto-detects message type and parses accordingly.
 *
 * @example
 * ```ts
 * import { coinbaseAdapter } from '@wick/adapters/coinbase';
 *
 * const ws = new WebSocket('wss://ws-feed.exchange.coinbase.com');
 * ws.onopen = () => {
 *   ws.send(JSON.stringify({
 *     type: 'subscribe',
 *     channels: ['level2', 'matches', 'ticker'],
 *     product_ids: ['BTC-USD'],
 *   }));
 * };
 *
 * ws.onmessage = (event) => {
 *   const msg = coinbaseAdapter.parse(JSON.parse(event.data));
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
export const coinbaseAdapter: ExchangeAdapter = {
  name: 'coinbase',

  parse(raw: unknown): AdapterMessage | null {
    if (typeof raw !== 'object' || raw === null) return null;
    const msg = raw as Record<string, unknown>;

    const type = msg.type as string | undefined;

    if (type === 'snapshot') {
      return {
        type: 'orderbook_snapshot',
        data: parseSnapshot(raw as CoinbaseSnapshot),
      };
    }

    if (type === 'l2update') {
      return {
        type: 'orderbook_delta',
        data: parseL2Update(raw as CoinbaseL2Update),
      };
    }

    if (type === 'match' || type === 'last_match') {
      return {
        type: 'trade',
        data: parseMatch(raw as CoinbaseMatch),
      };
    }

    if (type === 'ticker') {
      return {
        type: 'ticker',
        data: parseTicker(raw as CoinbaseTicker),
      };
    }

    return null;
  },
};
