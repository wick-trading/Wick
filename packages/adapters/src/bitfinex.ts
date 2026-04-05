import type { OrderBookData, OrderBookDelta, Trade, TickerData } from '@wick/core';
import type { ExchangeAdapter, AdapterMessage } from './types.js';

/**
 * Bitfinex WebSocket v2 message types.
 * Bitfinex uses array-based messages with channel IDs.
 * @see https://docs.bitfinex.com/docs/ws-general
 */

/**
 * Parse a Bitfinex order book snapshot.
 * Format: [CHAN_ID, [[PRICE, COUNT, AMOUNT], ...]]
 */
export function parseBookSnapshot(data: [number, number, number][]): OrderBookData {
  const bids: { price: number; size: number }[] = [];
  const asks: { price: number; size: number }[] = [];

  for (const [price, _count, amount] of data) {
    if (amount > 0) {
      bids.push({ price, size: amount });
    } else {
      asks.push({ price, size: Math.abs(amount) });
    }
  }

  return { bids, asks };
}

/**
 * Parse a Bitfinex order book update.
 * Format: [CHAN_ID, [PRICE, COUNT, AMOUNT]]
 */
export function parseBookUpdate(entry: [number, number, number]): OrderBookDelta[] {
  const [price, count, amount] = entry;

  if (count === 0) {
    // Remove level
    return [{ side: amount > 0 ? 'bid' : 'ask', price, size: 0 }];
  }

  return [{
    side: amount > 0 ? 'bid' : 'ask',
    price,
    size: Math.abs(amount),
  }];
}

/**
 * Parse Bitfinex trade update.
 * Format: [CHAN_ID, 'te', [ID, MTS, AMOUNT, PRICE]] (trade executed)
 */
export function parseTrade(entry: [number, number, number, number]): Trade {
  const [id, mts, amount, price] = entry;
  return {
    id: String(id),
    price,
    size: Math.abs(amount),
    side: amount > 0 ? 'buy' : 'sell',
    timestamp: mts,
  };
}

/**
 * Parse Bitfinex ticker.
 * Format: [CHAN_ID, [BID, BID_SIZE, ASK, ASK_SIZE, DAILY_CHANGE, DAILY_CHANGE_RELATIVE, LAST_PRICE, VOLUME, HIGH, LOW]]
 */
export function parseTicker(data: number[], symbol: string): TickerData {
  return {
    symbol,
    price: data[6],  // LAST_PRICE
    change24h: data[5] * 100, // DAILY_CHANGE_RELATIVE (fraction → percent)
    high24h: data[8],  // HIGH
    low24h: data[9],   // LOW
    volume24h: data[7], // VOLUME
    timestamp: Date.now(),
  };
}

export const bitfinexAdapter: ExchangeAdapter = {
  name: 'bitfinex',

  parse(raw: unknown): AdapterMessage | null {
    if (!Array.isArray(raw)) return null;

    // Heartbeat: [CHAN_ID, 'hb']
    if (raw[1] === 'hb') return null;

    // Trade executed: [CHAN_ID, 'te', [ID, MTS, AMOUNT, PRICE]]
    if (raw[1] === 'te' && Array.isArray(raw[2])) {
      return { type: 'trade', data: parseTrade(raw[2] as [number, number, number, number]) };
    }

    // Snapshot vs update: check if payload is array of arrays
    if (Array.isArray(raw[1])) {
      const payload = raw[1];

      // Book snapshot: [[PRICE, COUNT, AMOUNT], ...]
      if (Array.isArray(payload[0]) && payload[0].length === 3) {
        return { type: 'orderbook_snapshot', data: parseBookSnapshot(payload as [number, number, number][]) };
      }

      // Ticker: [BID, BID_SIZE, ASK, ASK_SIZE, ...]  (10 elements)
      if (typeof payload[0] === 'number' && payload.length >= 10) {
        return { type: 'ticker', data: parseTicker(payload as number[], '') };
      }

      // Book update: [PRICE, COUNT, AMOUNT] (single entry)
      if (typeof payload[0] === 'number' && payload.length === 3) {
        return { type: 'orderbook_delta', data: parseBookUpdate(payload as [number, number, number]) };
      }
    }

    return null;
  },
};
