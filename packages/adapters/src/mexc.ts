import type { OrderBookData, Trade, TickerData } from '@wick/core';
import type { ExchangeAdapter, AdapterMessage } from './types.js';

/**
 * MEXC WebSocket v3 message types.
 * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/
 */

interface MexcBookUpdate {
  c: string; // channel: 'spot@public.limit.depth.v3.api@BTCUSDT@5'
  d: {
    asks: { p: string; v: string }[];
    bids: { p: string; v: string }[];
  };
  t: number; // timestamp
}

interface MexcTrade {
  c: string; // channel: 'spot@public.deals.v3.api@BTCUSDT'
  d: {
    deals: {
      p: string;  // price
      v: string;  // volume
      S: number;  // 1=buy, 2=sell
      t: number;  // timestamp
    }[];
  };
}

interface MexcTicker {
  c: string; // channel: 'spot@public.miniTicker.v3.api@BTCUSDT'
  d: {
    s: string;  // symbol
    p: string;  // last price
    r: string;  // price change rate
    h: string;  // high
    l: string;  // low
    v: string;  // volume
    tr: string; // turnover
  };
}

export function parseBookUpdate(msg: MexcBookUpdate): OrderBookData {
  return {
    bids: msg.d.bids.map((b) => ({ price: parseFloat(b.p), size: parseFloat(b.v) })),
    asks: msg.d.asks.map((a) => ({ price: parseFloat(a.p), size: parseFloat(a.v) })),
  };
}

export function parseTrades(msg: MexcTrade): Trade[] {
  return msg.d.deals.map((t, i) => ({
    id: `${msg.c}-${t.t}-${i}`,
    price: parseFloat(t.p),
    size: parseFloat(t.v),
    side: t.S === 1 ? 'buy' as const : 'sell' as const,
    timestamp: t.t,
  }));
}

export function parseTicker(msg: MexcTicker): TickerData {
  return {
    symbol: msg.d.s,
    price: parseFloat(msg.d.p),
    change24h: parseFloat(msg.d.r) * 100,
    high24h: parseFloat(msg.d.h),
    low24h: parseFloat(msg.d.l),
    volume24h: parseFloat(msg.d.v),
    timestamp: Date.now(),
  };
}

export const mexcAdapter: ExchangeAdapter = {
  name: 'mexc',

  parse(raw: unknown): AdapterMessage | null {
    if (typeof raw !== 'object' || raw === null) return null;
    const msg = raw as Record<string, unknown>;

    const channel = msg.c as string | undefined;
    if (!channel) return null;

    if (channel.includes('limit.depth')) {
      return { type: 'orderbook_snapshot', data: parseBookUpdate(raw as MexcBookUpdate) };
    }

    if (channel.includes('deals')) {
      return { type: 'trades', data: parseTrades(raw as MexcTrade) };
    }

    if (channel.includes('miniTicker') || channel.includes('Ticker')) {
      return { type: 'ticker', data: parseTicker(raw as MexcTicker) };
    }

    return null;
  },
};
