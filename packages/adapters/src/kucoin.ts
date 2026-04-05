import type { OrderBookDelta, Trade, TickerData } from '@wick/core';
import type { ExchangeAdapter, AdapterMessage } from './types.js';

/**
 * KuCoin WebSocket message types.
 * @see https://docs.kucoin.com/#websocket-feed
 */

interface KucoinBookSnapshot {
  topic: string; // '/market/level2:BTC-USDT'
  type: 'message';
  subject: 'trade.l2update';
  data: {
    sequenceStart: number;
    sequenceEnd: number;
    changes: {
      asks: [string, string, string][]; // [price, size, sequence]
      bids: [string, string, string][];
    };
  };
}

interface KucoinTrade {
  topic: string; // '/market/match:BTC-USDT'
  type: 'message';
  subject: 'trade.l3match';
  data: {
    tradeId: string;
    price: string;
    size: string;
    side: string; // 'buy' | 'sell'
    time: string; // nanosecond timestamp
    symbol: string;
  };
}

interface KucoinSnapshot {
  topic: string; // '/market/snapshot:BTC-USDT'
  type: 'message';
  subject: 'trade.snapshot';
  data: {
    data: {
      symbol: string;
      lastTradedPrice: string;
      high: string;
      low: string;
      vol: string;
      changeRate: string;
    };
  };
}

export function parseBookUpdate(msg: KucoinBookSnapshot): OrderBookDelta[] {
  const deltas: OrderBookDelta[] = [];
  for (const [price, size] of msg.data.changes.bids) {
    deltas.push({ side: 'bid', price: parseFloat(price), size: parseFloat(size) });
  }
  for (const [price, size] of msg.data.changes.asks) {
    deltas.push({ side: 'ask', price: parseFloat(price), size: parseFloat(size) });
  }
  return deltas;
}

export function parseTrade(msg: KucoinTrade): Trade {
  return {
    id: msg.data.tradeId,
    price: parseFloat(msg.data.price),
    size: parseFloat(msg.data.size),
    side: msg.data.side as 'buy' | 'sell',
    timestamp: parseInt(msg.data.time.slice(0, 13), 10), // nano → ms
  };
}

export function parseTicker(msg: KucoinSnapshot): TickerData {
  const d = msg.data.data;
  return {
    symbol: d.symbol.replace('-', '/'),
    price: parseFloat(d.lastTradedPrice),
    change24h: parseFloat(d.changeRate) * 100,
    high24h: parseFloat(d.high),
    low24h: parseFloat(d.low),
    volume24h: parseFloat(d.vol),
    timestamp: Date.now(),
  };
}

export const kucoinAdapter: ExchangeAdapter = {
  name: 'kucoin',

  parse(raw: unknown): AdapterMessage | null {
    if (typeof raw !== 'object' || raw === null) return null;
    const msg = raw as Record<string, unknown>;

    const type = msg.type as string | undefined;
    const subject = msg.subject as string | undefined;
    const topic = msg.topic as string | undefined;

    if (type !== 'message' || !topic) return null;

    if (subject === 'trade.l2update') {
      return { type: 'orderbook_delta', data: parseBookUpdate(raw as KucoinBookSnapshot) };
    }

    if (subject === 'trade.l3match') {
      return { type: 'trade', data: parseTrade(raw as KucoinTrade) };
    }

    if (subject === 'trade.snapshot') {
      return { type: 'ticker', data: parseTicker(raw as KucoinSnapshot) };
    }

    return null;
  },
};
