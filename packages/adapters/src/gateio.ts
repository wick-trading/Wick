import type { OrderBookData, Trade, TickerData } from '@vela-trading/core';
import type { ExchangeAdapter, AdapterMessage } from './types.js';

/**
 * Gate.io WebSocket v4 message types.
 * @see https://www.gate.io/docs/developers/apiv4/ws/en/
 */

interface GateBookSnapshot {
  channel: 'spot.order_book';
  event: 'update';
  result: {
    current: number;
    update: number;
    asks: [string, string][]; // [price, size]
    bids: [string, string][];
  };
}

interface GateTrade {
  channel: 'spot.trades';
  event: 'update';
  result: {
    id: number;
    create_time: number;
    side: string;
    amount: string;
    price: string;
    currency_pair: string;
  };
}

interface GateTicker {
  channel: 'spot.tickers';
  event: 'update';
  result: {
    currency_pair: string;
    last: string;
    high_24h: string;
    low_24h: string;
    base_volume: string;
    change_percentage: string;
  };
}

export function parseBookSnapshot(msg: GateBookSnapshot): OrderBookData {
  return {
    bids: msg.result.bids.map(([price, size]) => ({ price: parseFloat(price), size: parseFloat(size) })),
    asks: msg.result.asks.map(([price, size]) => ({ price: parseFloat(price), size: parseFloat(size) })),
  };
}

export function parseTrade(msg: GateTrade): Trade {
  return {
    id: String(msg.result.id),
    price: parseFloat(msg.result.price),
    size: parseFloat(msg.result.amount),
    side: msg.result.side === 'buy' ? 'buy' : 'sell',
    timestamp: msg.result.create_time * 1000,
  };
}

export function parseTicker(msg: GateTicker): TickerData {
  return {
    symbol: msg.result.currency_pair.replace('_', '/'),
    price: parseFloat(msg.result.last),
    change24h: parseFloat(msg.result.change_percentage),
    high24h: parseFloat(msg.result.high_24h),
    low24h: parseFloat(msg.result.low_24h),
    volume24h: parseFloat(msg.result.base_volume),
    timestamp: Date.now(),
  };
}

export const gateioAdapter: ExchangeAdapter = {
  name: 'gateio',

  parse(raw: unknown): AdapterMessage | null {
    if (typeof raw !== 'object' || raw === null) return null;
    const msg = raw as Record<string, unknown>;

    const channel = msg.channel as string | undefined;
    const event = msg.event as string | undefined;

    if (event !== 'update') return null;

    if (channel === 'spot.order_book') {
      return { type: 'orderbook_snapshot', data: parseBookSnapshot(raw as GateBookSnapshot) };
    }

    if (channel === 'spot.trades') {
      return { type: 'trade', data: parseTrade(raw as GateTrade) };
    }

    if (channel === 'spot.tickers') {
      return { type: 'ticker', data: parseTicker(raw as GateTicker) };
    }

    return null;
  },
};
