import type { OrderBookData, OrderBookDelta, Trade, TickerData } from '@vela-trading/core';
import type { ExchangeAdapter, AdapterMessage } from './types.js';

/**
 * Raw Kraken WebSocket v2 message types.
 * @see https://docs.kraken.com/api/docs/websocket-v2/book
 */

interface KrakenBookSnapshot {
  channel: 'book';
  type: 'snapshot';
  data: [{
    bids: { price: number; qty: number }[];
    asks: { price: number; qty: number }[];
    symbol: string;
  }];
}

interface KrakenBookUpdate {
  channel: 'book';
  type: 'update';
  data: [{
    bids: { price: number; qty: number }[];
    asks: { price: number; qty: number }[];
    symbol: string;
  }];
}

interface KrakenTrade {
  channel: 'trade';
  type: 'update';
  data: {
    ord_type: string;
    price: number;
    qty: number;
    side: string; // 'buy' or 'sell'
    symbol: string;
    timestamp: string;
    trade_id: number;
  }[];
}

interface KrakenTicker {
  channel: 'ticker';
  type: 'update';
  data: [{
    symbol: string;
    last: number;
    high: number;
    low: number;
    volume: number;
    change: number;
    change_pct: number;
  }];
}

/**
 * Parse a Kraken book snapshot into Vela OrderBookData.
 */
export function parseBookSnapshot(msg: KrakenBookSnapshot): OrderBookData {
  const snap = msg.data[0];
  return {
    bids: snap.bids.map((b) => ({ price: b.price, size: b.qty })),
    asks: snap.asks.map((a) => ({ price: a.price, size: a.qty })),
  };
}

/**
 * Parse a Kraken book update into Vela OrderBookDelta[].
 */
export function parseBookUpdate(msg: KrakenBookUpdate): OrderBookDelta[] {
  const update = msg.data[0];
  const deltas: OrderBookDelta[] = [];

  for (const b of update.bids) {
    deltas.push({ side: 'bid', price: b.price, size: b.qty });
  }
  for (const a of update.asks) {
    deltas.push({ side: 'ask', price: a.price, size: a.qty });
  }

  return deltas;
}

/**
 * Parse Kraken trade messages into Vela Trade[].
 */
export function parseTrades(msg: KrakenTrade): Trade[] {
  return msg.data.map((t) => ({
    id: String(t.trade_id),
    price: t.price,
    size: t.qty,
    side: t.side as 'buy' | 'sell',
    timestamp: new Date(t.timestamp).getTime(),
  }));
}

/**
 * Parse a Kraken ticker update into Vela TickerData.
 */
export function parseTicker(msg: KrakenTicker): TickerData {
  const t = msg.data[0];
  return {
    symbol: t.symbol.replace('/', '/'),
    price: t.last,
    change24h: t.change_pct,
    high24h: t.high,
    low24h: t.low,
    volume24h: t.volume,
    timestamp: Date.now(),
  };
}

/**
 * Full Kraken adapter — auto-detects message type and parses accordingly.
 *
 * @example
 * ```ts
 * import { krakenAdapter } from '@vela-trading/adapters/kraken';
 *
 * const ws = new WebSocket('wss://ws.kraken.com/v2');
 * ws.onopen = () => {
 *   ws.send(JSON.stringify({
 *     method: 'subscribe',
 *     params: { channel: 'book', symbol: ['BTC/USD'], depth: 25 },
 *   }));
 * };
 *
 * ws.onmessage = (event) => {
 *   const msg = krakenAdapter.parse(JSON.parse(event.data));
 *   if (!msg) return;
 *
 *   switch (msg.type) {
 *     case 'orderbook_snapshot': orderBook.data = msg.data; break;
 *     case 'orderbook_delta': orderBook.applyDeltas(msg.data); break;
 *     case 'trades': feed.addTrades(msg.data); break;
 *     case 'ticker': ticker.data = msg.data; break;
 *   }
 * };
 * ```
 */
export const krakenAdapter: ExchangeAdapter = {
  name: 'kraken',

  parse(raw: unknown): AdapterMessage | null {
    if (typeof raw !== 'object' || raw === null) return null;
    const msg = raw as Record<string, unknown>;

    const channel = msg.channel as string | undefined;
    const type = msg.type as string | undefined;

    if (channel === 'book' && type === 'snapshot') {
      return {
        type: 'orderbook_snapshot',
        data: parseBookSnapshot(raw as KrakenBookSnapshot),
      };
    }

    if (channel === 'book' && type === 'update') {
      return {
        type: 'orderbook_delta',
        data: parseBookUpdate(raw as KrakenBookUpdate),
      };
    }

    if (channel === 'trade' && type === 'update') {
      return {
        type: 'trades',
        data: parseTrades(raw as KrakenTrade),
      };
    }

    if (channel === 'ticker' && type === 'update') {
      return {
        type: 'ticker',
        data: parseTicker(raw as KrakenTicker),
      };
    }

    return null;
  },
};
