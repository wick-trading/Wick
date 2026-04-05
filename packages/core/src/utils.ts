import type { PriceFormatOptions, OrderBookData, OrderBookDelta } from './types.js';

/**
 * Format a price value for display.
 */
export function formatPrice(value: number, options: PriceFormatOptions = {}): string {
  const { precision = 2, locale = 'en-US', currencySymbol = '' } = options;
  const formatted = value.toLocaleString(locale, {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  });
  return currencySymbol ? `${currencySymbol}${formatted}` : formatted;
}

/**
 * Format a size/quantity value for display.
 */
export function formatSize(value: number, precision = 4): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(2)}K`;
  return value.toFixed(precision);
}

/**
 * Apply a delta update to an order book snapshot.
 * Returns a new OrderBookData (immutable).
 */
export function applyOrderBookDelta(
  book: OrderBookData,
  delta: OrderBookDelta,
): OrderBookData {
  const side = delta.side === 'bid' ? 'bids' : 'asks';
  const levels = [...book[side]];

  const idx = levels.findIndex((l) => l.price === delta.price);

  if (delta.size === 0) {
    // Remove level
    if (idx !== -1) levels.splice(idx, 1);
  } else if (idx !== -1) {
    // Update existing level
    levels[idx] = { price: delta.price, size: delta.size };
  } else {
    // Insert new level
    levels.push({ price: delta.price, size: delta.size });
  }

  // Sort: bids descending, asks ascending
  if (side === 'bids') {
    levels.sort((a, b) => b.price - a.price);
  } else {
    levels.sort((a, b) => a.price - b.price);
  }

  return { ...book, [side]: levels };
}

/**
 * Calculate cumulative totals for order book depth visualization.
 */
export function cumulativeTotals(
  levels: { price: number; size: number }[],
): { price: number; size: number; total: number }[] {
  let running = 0;
  return levels.map((level) => {
    running += level.size;
    return { ...level, total: running };
  });
}
