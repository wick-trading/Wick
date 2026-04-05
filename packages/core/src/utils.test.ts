import { describe, it, expect } from 'vitest';
import {
  formatPrice,
  formatSize,
  applyOrderBookDelta,
  cumulativeTotals,
} from './utils.js';
import type { OrderBookData } from './types.js';

describe('formatPrice', () => {
  it('formats with default precision', () => {
    expect(formatPrice(1234.5)).toBe('1,234.50');
  });

  it('formats with custom precision', () => {
    expect(formatPrice(1234.5678, { precision: 4 })).toBe('1,234.5678');
  });

  it('prepends currency symbol', () => {
    expect(formatPrice(99.99, { currencySymbol: '$' })).toBe('$99.99');
  });
});

describe('formatSize', () => {
  it('formats small values with precision', () => {
    expect(formatSize(0.1234, 4)).toBe('0.1234');
  });

  it('abbreviates thousands', () => {
    expect(formatSize(1500)).toBe('1.50K');
  });

  it('abbreviates millions', () => {
    expect(formatSize(2_500_000)).toBe('2.50M');
  });
});

describe('applyOrderBookDelta', () => {
  const baseBook: OrderBookData = {
    bids: [
      { price: 100, size: 5 },
      { price: 99, size: 3 },
    ],
    asks: [
      { price: 101, size: 4 },
      { price: 102, size: 2 },
    ],
  };

  it('updates an existing bid level', () => {
    const result = applyOrderBookDelta(baseBook, { side: 'bid', price: 100, size: 10 });
    expect(result.bids[0]).toEqual({ price: 100, size: 10 });
  });

  it('removes a level when size is 0', () => {
    const result = applyOrderBookDelta(baseBook, { side: 'bid', price: 99, size: 0 });
    expect(result.bids).toHaveLength(1);
    expect(result.bids[0].price).toBe(100);
  });

  it('inserts a new bid level in sorted position', () => {
    const result = applyOrderBookDelta(baseBook, { side: 'bid', price: 99.5, size: 7 });
    expect(result.bids).toHaveLength(3);
    // Bids sorted descending
    expect(result.bids.map((b) => b.price)).toEqual([100, 99.5, 99]);
  });

  it('inserts a new ask level in sorted position', () => {
    const result = applyOrderBookDelta(baseBook, { side: 'ask', price: 101.5, size: 1 });
    expect(result.asks).toHaveLength(3);
    // Asks sorted ascending
    expect(result.asks.map((a) => a.price)).toEqual([101, 101.5, 102]);
  });

  it('does not mutate the original book', () => {
    const result = applyOrderBookDelta(baseBook, { side: 'bid', price: 100, size: 10 });
    expect(baseBook.bids[0].size).toBe(5);
    expect(result).not.toBe(baseBook);
  });

  it('ignores removal of non-existent level', () => {
    const result = applyOrderBookDelta(baseBook, { side: 'bid', price: 50, size: 0 });
    expect(result.bids).toHaveLength(2);
  });
});

describe('cumulativeTotals', () => {
  it('calculates running totals', () => {
    const levels = [
      { price: 100, size: 5 },
      { price: 99, size: 3 },
      { price: 98, size: 2 },
    ];
    const result = cumulativeTotals(levels);
    expect(result.map((r) => r.total)).toEqual([5, 8, 10]);
  });

  it('returns empty array for empty input', () => {
    expect(cumulativeTotals([])).toEqual([]);
  });

  it('preserves original price and size', () => {
    const levels = [{ price: 50, size: 10 }];
    const result = cumulativeTotals(levels);
    expect(result[0]).toEqual({ price: 50, size: 10, total: 10 });
  });
});
