import type { OrderBookData, OrderBookDelta, Trade, TickerData } from '@vela-trading/core';

/**
 * Standard adapter interface that all exchange adapters implement.
 * Parses raw WebSocket messages into Vela data types.
 */
export interface ExchangeAdapter {
  /** Unique identifier for this exchange */
  readonly name: string;

  /** Parse a raw WebSocket message. Returns null if the message type is unrecognized. */
  parse(raw: unknown): AdapterMessage | null;
}

/** Union of all possible parsed message types */
export type AdapterMessage =
  | { type: 'orderbook_snapshot'; data: OrderBookData }
  | { type: 'orderbook_delta'; data: OrderBookDelta[] }
  | { type: 'trade'; data: Trade }
  | { type: 'trades'; data: Trade[] }
  | { type: 'ticker'; data: TickerData };
