import { describe, it, expect } from 'vitest';
import { applyOrderBookDelta, cumulativeTotals } from './utils.js';
import type { OrderBookData, OrderBookDelta } from './types.js';

/**
 * Performance benchmarks for core operations.
 * These aren't speed tests per se — they verify that critical-path operations
 * complete within acceptable thresholds for real-time use.
 */

function generateBook(levels: number): OrderBookData {
  const bids = [];
  const asks = [];
  for (let i = 0; i < levels; i++) {
    bids.push({ price: 67000 - i * 0.5, size: Math.random() * 10 });
    asks.push({ price: 67000.5 + i * 0.5, size: Math.random() * 10 });
  }
  return { bids, asks };
}

function generateDeltas(count: number): OrderBookDelta[] {
  const deltas: OrderBookDelta[] = [];
  for (let i = 0; i < count; i++) {
    deltas.push({
      side: Math.random() > 0.5 ? 'bid' : 'ask',
      price: 67000 + (Math.random() - 0.5) * 100,
      size: Math.random() > 0.1 ? Math.random() * 10 : 0, // 10% removals
    });
  }
  return deltas;
}

describe('Performance: applyOrderBookDelta', () => {
  it('handles 1000 sequential deltas on a 100-level book in < 100ms', () => {
    let book = generateBook(100);
    const deltas = generateDeltas(1000);

    const start = performance.now();
    for (const delta of deltas) {
      book = applyOrderBookDelta(book, delta);
    }
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(100);
    expect(book.bids.length).toBeGreaterThan(0);
    expect(book.asks.length).toBeGreaterThan(0);
  });

  it('handles 5000 sequential deltas on a 500-level book in < 500ms', () => {
    let book = generateBook(500);
    const deltas = generateDeltas(5000);

    const start = performance.now();
    for (const delta of deltas) {
      book = applyOrderBookDelta(book, delta);
    }
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(500);
  });

  it('handles rapid-fire updates (simulating 100 updates/sec for 1 second)', () => {
    let book = generateBook(50);
    const deltas = generateDeltas(100);

    const start = performance.now();
    for (const delta of deltas) {
      book = applyOrderBookDelta(book, delta);
    }
    const elapsed = performance.now() - start;

    // 100 deltas should process in well under 16ms (one frame)
    expect(elapsed).toBeLessThan(16);
  });
});

describe('Performance: cumulativeTotals', () => {
  it('computes cumulative totals for 1000 levels in < 5ms', () => {
    const levels = Array.from({ length: 1000 }, (_, i) => ({
      price: 67000 - i * 0.5,
      size: Math.random() * 10,
    }));

    const start = performance.now();
    const result = cumulativeTotals(levels);
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(5);
    expect(result).toHaveLength(1000);
    // Last total should equal sum of all sizes
    const expectedTotal = levels.reduce((sum, l) => sum + l.size, 0);
    expect(result[result.length - 1].total).toBeCloseTo(expectedTotal, 5);
  });
});

describe('Performance: combined order book pipeline', () => {
  it('snapshot → 100 deltas → cumulative totals in < 10ms', () => {
    let book = generateBook(100);
    const deltas = generateDeltas(100);

    const start = performance.now();

    for (const delta of deltas) {
      book = applyOrderBookDelta(book, delta);
    }
    const bidsWithTotals = cumulativeTotals(book.bids);
    const asksWithTotals = cumulativeTotals(book.asks);

    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(10);
    expect(bidsWithTotals.length).toBeGreaterThan(0);
    expect(asksWithTotals.length).toBeGreaterThan(0);
  });
});
