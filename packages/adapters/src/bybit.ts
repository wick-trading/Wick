import type { OrderBookData, OrderBookDelta, Trade, TickerData } from '@wick/core';
import type { ExchangeAdapter, AdapterMessage } from './types.js';

/**
 * Raw Bybit WebSocket v5 message types.
 * @see https://bybit-exchange.github.io/docs/v5/ws/connect
 */

interface BybitOrderBookSnapshot {
  topic: string;
  type: 'snapshot';
  data: {
    s: string; // symbol
    b: [string, string][]; // bids [price, size]
    a: [string, string][]; // asks [price, size]
    u: number; // update id
  };
}

interface BybitOrderBookDelta {
  topic: string;
  type: 'delta';
  data: {
    s: string;
    b: [string, string][];
    a: [string, string][];
    u: number;
  };
}

interface BybitTrade {
  topic: string;
  type: 'snapshot';
  data: {
    T: number; // timestamp ms
    s: string; // symbol
    S: string; // side: 'Buy' | 'Sell'
    v: string; // qty
    p: string; // price
    i: string; // trade id
  }[];
}

interface BybitTicker {
  topic: string;
  type: 'snapshot';
  data: {
    symbol: string;
    lastPrice: string;
    highPrice24h: string;
    lowPrice24h: string;
    volume24h: string;
    price24hPcnt: string;
    turnover24h: string;
  };
}

export function parseOrderBookSnapshot(msg: BybitOrderBookSnapshot): OrderBookData {
  return {
    bids: msg.data.b.map(([price, size]) => ({
      price: parseFloat(price),
      size: parseFloat(size),
    })),
    asks: msg.data.a.map(([price, size]) => ({
      price: parseFloat(price),
      size: parseFloat(size),
    })),
  };
}

export function parseOrderBookDelta(msg: BybitOrderBookDelta): OrderBookDelta[] {
  const deltas: OrderBookDelta[] = [];
  for (const [price, size] of msg.data.b) {
    deltas.push({ side: 'bid', price: parseFloat(price), size: parseFloat(size) });
  }
  for (const [price, size] of msg.data.a) {
    deltas.push({ side: 'ask', price: parseFloat(price), size: parseFloat(size) });
  }
  return deltas;
}

export function parseTrades(msg: BybitTrade): Trade[] {
  return msg.data.map((t) => ({
    id: t.i,
    price: parseFloat(t.p),
    size: parseFloat(t.v),
    side: t.S === 'Buy' ? 'buy' as const : 'sell' as const,
    timestamp: t.T,
  }));
}

export function parseTicker(msg: BybitTicker): TickerData {
  return {
    symbol: msg.data.symbol,
    price: parseFloat(msg.data.lastPrice),
    change24h: parseFloat(msg.data.price24hPcnt) * 100,
    high24h: parseFloat(msg.data.highPrice24h),
    low24h: parseFloat(msg.data.lowPrice24h),
    volume24h: parseFloat(msg.data.volume24h),
    timestamp: Date.now(),
  };
}

/**
 * Full Bybit adapter — auto-detects message type and parses accordingly.
 *
 * @example
 * ```ts
 * import { bybitAdapter } from '@wick/adapters/bybit';
 *
 * const ws = new WebSocket('wss://stream.bybit.com/v5/public/spot');
 * ws.onopen = () => {
 *   ws.send(JSON.stringify({
 *     op: 'subscribe',
 *     args: ['orderbook.50.BTCUSDT', 'publicTrade.BTCUSDT', 'tickers.BTCUSDT'],
 *   }));
 * };
 *
 * ws.onmessage = (event) => {
 *   const msg = bybitAdapter.parse(JSON.parse(event.data));
 *   if (!msg) return;
 *   // ... handle msg.type
 * };
 * ```
 */
export const bybitAdapter: ExchangeAdapter = {
  name: 'bybit',

  parse(raw: unknown): AdapterMessage | null {
    if (typeof raw !== 'object' || raw === null) return null;
    const msg = raw as Record<string, unknown>;

    const topic = msg.topic as string | undefined;
    const type = msg.type as string | undefined;

    if (!topic) return null;

    if (topic.startsWith('orderbook.') && type === 'snapshot') {
      return {
        type: 'orderbook_snapshot',
        data: parseOrderBookSnapshot(raw as BybitOrderBookSnapshot),
      };
    }

    if (topic.startsWith('orderbook.') && type === 'delta') {
      return {
        type: 'orderbook_delta',
        data: parseOrderBookDelta(raw as BybitOrderBookDelta),
      };
    }

    if (topic.startsWith('publicTrade.')) {
      return {
        type: 'trades',
        data: parseTrades(raw as BybitTrade),
      };
    }

    if (topic.startsWith('tickers.') && msg.data && typeof (msg.data as Record<string, unknown>).lastPrice === 'string') {
      return {
        type: 'ticker',
        data: parseTicker(raw as BybitTicker),
      };
    }

    return null;
  },
};
