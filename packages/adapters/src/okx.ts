import type { OrderBookData, OrderBookDelta, Trade, TickerData } from '@vela-trading/core';
import type { ExchangeAdapter, AdapterMessage } from './types.js';

/**
 * Raw OKX WebSocket v5 message types.
 * @see https://www.okx.com/docs-v5/en/#websocket-api
 */

interface OkxBookSnapshot {
  arg: { channel: 'books' | 'books5'; instId: string };
  action: 'snapshot';
  data: {
    bids: [string, string, string, string][]; // [price, size, _, numOrders]
    asks: [string, string, string, string][];
    ts: string;
  }[];
}

interface OkxBookUpdate {
  arg: { channel: 'books' | 'books5'; instId: string };
  action: 'update';
  data: {
    bids: [string, string, string, string][];
    asks: [string, string, string, string][];
    ts: string;
  }[];
}

interface OkxTrade {
  arg: { channel: 'trades'; instId: string };
  data: {
    instId: string;
    tradeId: string;
    px: string;   // price
    sz: string;   // size
    side: string;  // 'buy' | 'sell'
    ts: string;    // timestamp ms
  }[];
}

interface OkxTicker {
  arg: { channel: 'tickers'; instId: string };
  data: {
    instId: string;
    last: string;
    high24h: string;
    low24h: string;
    vol24h: string;    // base volume
    open24h: string;
    ts: string;
  }[];
}

export function parseBookSnapshot(msg: OkxBookSnapshot): OrderBookData {
  const snap = msg.data[0];
  return {
    bids: snap.bids.map(([price, size]) => ({
      price: parseFloat(price),
      size: parseFloat(size),
    })),
    asks: snap.asks.map(([price, size]) => ({
      price: parseFloat(price),
      size: parseFloat(size),
    })),
  };
}

export function parseBookUpdate(msg: OkxBookUpdate): OrderBookDelta[] {
  const update = msg.data[0];
  const deltas: OrderBookDelta[] = [];
  for (const [price, size] of update.bids) {
    deltas.push({ side: 'bid', price: parseFloat(price), size: parseFloat(size) });
  }
  for (const [price, size] of update.asks) {
    deltas.push({ side: 'ask', price: parseFloat(price), size: parseFloat(size) });
  }
  return deltas;
}

export function parseTrades(msg: OkxTrade): Trade[] {
  return msg.data.map((t) => ({
    id: t.tradeId,
    price: parseFloat(t.px),
    size: parseFloat(t.sz),
    side: t.side as 'buy' | 'sell',
    timestamp: parseInt(t.ts, 10),
  }));
}

export function parseTicker(msg: OkxTicker): TickerData {
  const t = msg.data[0];
  const price = parseFloat(t.last);
  const open = parseFloat(t.open24h);
  const change = open > 0 ? ((price - open) / open) * 100 : 0;

  return {
    symbol: t.instId.replace('-', '/'),
    price,
    change24h: change,
    high24h: parseFloat(t.high24h),
    low24h: parseFloat(t.low24h),
    volume24h: parseFloat(t.vol24h),
    timestamp: parseInt(t.ts, 10),
  };
}

/**
 * Full OKX adapter — auto-detects message type and parses accordingly.
 *
 * @example
 * ```ts
 * import { okxAdapter } from '@vela-trading/adapters/okx';
 *
 * const ws = new WebSocket('wss://ws.okx.com:8443/ws/v5/public');
 * ws.onopen = () => {
 *   ws.send(JSON.stringify({
 *     op: 'subscribe',
 *     args: [
 *       { channel: 'books', instId: 'BTC-USDT' },
 *       { channel: 'trades', instId: 'BTC-USDT' },
 *       { channel: 'tickers', instId: 'BTC-USDT' },
 *     ],
 *   }));
 * };
 *
 * ws.onmessage = (event) => {
 *   const msg = okxAdapter.parse(JSON.parse(event.data));
 *   if (!msg) return;
 *   // ... handle msg.type
 * };
 * ```
 */
export const okxAdapter: ExchangeAdapter = {
  name: 'okx',

  parse(raw: unknown): AdapterMessage | null {
    if (typeof raw !== 'object' || raw === null) return null;
    const msg = raw as Record<string, unknown>;

    const arg = msg.arg as { channel?: string } | undefined;
    if (!arg?.channel) return null;

    const channel = arg.channel;
    const action = msg.action as string | undefined;

    if ((channel === 'books' || channel === 'books5') && action === 'snapshot') {
      return {
        type: 'orderbook_snapshot',
        data: parseBookSnapshot(raw as OkxBookSnapshot),
      };
    }

    if ((channel === 'books' || channel === 'books5') && action === 'update') {
      return {
        type: 'orderbook_delta',
        data: parseBookUpdate(raw as OkxBookUpdate),
      };
    }

    if (channel === 'trades') {
      return {
        type: 'trades',
        data: parseTrades(raw as OkxTrade),
      };
    }

    if (channel === 'tickers') {
      return {
        type: 'ticker',
        data: parseTicker(raw as OkxTicker),
      };
    }

    return null;
  },
};
