import type { OrderBookData, OrderBookDelta, Trade } from '@vela-trading/core';
import type { ExchangeAdapter, AdapterMessage } from './types.js';

/**
 * dYdX v4 (Cosmos chain) WebSocket message types.
 * @see https://docs.dydx.exchange/api_integration-indexer/indexer_websocket
 */

interface DydxOrderBookSnapshot {
  type: 'subscribed' | 'channel_data';
  channel: 'v4_orderbook';
  contents: {
    bids: { price: string; size: string }[];
    asks: { price: string; size: string }[];
  };
}

interface DydxOrderBookUpdate {
  type: 'channel_batch_data';
  channel: 'v4_orderbook';
  contents: {
    bids: [string, string][];
    asks: [string, string][];
  }[];
}

interface DydxTrade {
  type: 'subscribed' | 'channel_data' | 'channel_batch_data';
  channel: 'v4_trades';
  contents: {
    trades: {
      id: string;
      price: string;
      size: string;
      side: string; // 'BUY' | 'SELL'
      createdAt: string;
    }[];
  };
}

export function parseOrderBookSnapshot(msg: DydxOrderBookSnapshot): OrderBookData {
  return {
    bids: msg.contents.bids.map((b) => ({ price: parseFloat(b.price), size: parseFloat(b.size) })),
    asks: msg.contents.asks.map((a) => ({ price: parseFloat(a.price), size: parseFloat(a.size) })),
  };
}

export function parseOrderBookUpdate(msg: DydxOrderBookUpdate): OrderBookDelta[] {
  const deltas: OrderBookDelta[] = [];
  for (const batch of msg.contents) {
    for (const [price, size] of batch.bids) {
      deltas.push({ side: 'bid', price: parseFloat(price), size: parseFloat(size) });
    }
    for (const [price, size] of batch.asks) {
      deltas.push({ side: 'ask', price: parseFloat(price), size: parseFloat(size) });
    }
  }
  return deltas;
}

export function parseTrades(msg: DydxTrade): Trade[] {
  return msg.contents.trades.map((t) => ({
    id: t.id,
    price: parseFloat(t.price),
    size: parseFloat(t.size),
    side: t.side === 'BUY' ? 'buy' as const : 'sell' as const,
    timestamp: new Date(t.createdAt).getTime(),
  }));
}

export const dydxAdapter: ExchangeAdapter = {
  name: 'dydx',

  parse(raw: unknown): AdapterMessage | null {
    if (typeof raw !== 'object' || raw === null) return null;
    const msg = raw as Record<string, unknown>;

    const channel = msg.channel as string | undefined;
    const type = msg.type as string | undefined;

    if (channel === 'v4_orderbook' && (type === 'subscribed' || type === 'channel_data')) {
      return { type: 'orderbook_snapshot', data: parseOrderBookSnapshot(raw as DydxOrderBookSnapshot) };
    }

    if (channel === 'v4_orderbook' && type === 'channel_batch_data') {
      return { type: 'orderbook_delta', data: parseOrderBookUpdate(raw as DydxOrderBookUpdate) };
    }

    if (channel === 'v4_trades' && (type === 'subscribed' || type === 'channel_data' || type === 'channel_batch_data')) {
      return { type: 'trades', data: parseTrades(raw as DydxTrade) };
    }

    return null;
  },
};
