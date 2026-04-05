import { describe, it, expect } from 'vitest';
import { buildDepthLevels, computeBounds, hitTest } from './renderer.js';
import type { OrderBookData } from '@vela-trading/core';

const MOCK_BOOK: OrderBookData = {
  bids: [
    { price: 100, size: 5 },
    { price: 99, size: 3 },
    { price: 98, size: 7 },
    { price: 97, size: 2 },
    { price: 96, size: 4 },
  ],
  asks: [
    { price: 101, size: 4 },
    { price: 102, size: 6 },
    { price: 103, size: 2 },
    { price: 104, size: 8 },
    { price: 105, size: 1 },
  ],
};

describe('buildDepthLevels', () => {
  it('builds cumulative bid levels sorted descending', () => {
    const { bids } = buildDepthLevels(MOCK_BOOK, 50);
    expect(bids.length).toBe(5);
    // Bids sorted descending by price
    expect(bids[0].price).toBe(100);
    expect(bids[4].price).toBe(96);
    // Cumulative totals
    expect(bids[0].total).toBe(5);
    expect(bids[1].total).toBe(8); // 5+3
    expect(bids[2].total).toBe(15); // 5+3+7
    expect(bids[4].total).toBe(21); // 5+3+7+2+4
  });

  it('builds cumulative ask levels sorted ascending', () => {
    const { asks } = buildDepthLevels(MOCK_BOOK, 50);
    expect(asks.length).toBe(5);
    expect(asks[0].price).toBe(101);
    expect(asks[4].price).toBe(105);
    expect(asks[0].total).toBe(4);
    expect(asks[1].total).toBe(10); // 4+6
    expect(asks[4].total).toBe(21); // 4+6+2+8+1
  });

  it('respects depth limit', () => {
    const { bids, asks } = buildDepthLevels(MOCK_BOOK, 3);
    expect(bids.length).toBe(3);
    expect(asks.length).toBe(3);
  });

  it('handles empty book', () => {
    const { bids, asks } = buildDepthLevels({ bids: [], asks: [] }, 50);
    expect(bids.length).toBe(0);
    expect(asks.length).toBe(0);
  });
});

describe('computeBounds', () => {
  it('computes correct price range and max total', () => {
    const { bids, asks } = buildDepthLevels(MOCK_BOOK, 50);
    const bounds = computeBounds(bids, asks);

    expect(bounds.minPrice).toBe(96);
    expect(bounds.maxPrice).toBe(105);
    expect(bounds.midPrice).toBe(100.5); // (100 + 101) / 2
    expect(bounds.maxTotal).toBe(21);
  });

  it('handles empty bids', () => {
    const { asks } = buildDepthLevels({ bids: [], asks: MOCK_BOOK.asks }, 50);
    const bounds = computeBounds([], asks);

    expect(bounds.maxPrice).toBe(105);
    expect(bounds.maxTotal).toBeGreaterThan(0);
  });

  it('handles empty asks', () => {
    const { bids } = buildDepthLevels({ bids: MOCK_BOOK.bids, asks: [] }, 50);
    const bounds = computeBounds(bids, []);

    expect(bounds.minPrice).toBe(96);
    expect(bounds.maxTotal).toBeGreaterThan(0);
  });

  it('handles fully empty book', () => {
    const bounds = computeBounds([], []);
    expect(bounds.maxTotal).toBe(1); // Avoids division by zero
  });
});

describe('hitTest', () => {
  const { bids, asks } = buildDepthLevels(MOCK_BOOK, 50);
  const bounds = computeBounds(bids, asks);
  const plotLeft = 10;
  const plotWidth = 500;

  it('hits a bid level on the left side', () => {
    // x position corresponding to price ~99 (bid territory)
    const x = plotLeft + ((99 - bounds.minPrice) / (bounds.maxPrice - bounds.minPrice)) * plotWidth;
    const hit = hitTest(x, bids, asks, bounds.minPrice, bounds.maxPrice, plotLeft, plotWidth);

    expect(hit).toBeTruthy();
    expect(hit!.side).toBe('bid');
    expect(hit!.level.price).toBe(99);
  });

  it('hits an ask level on the right side', () => {
    // x position corresponding to price ~102 (ask territory)
    const x = plotLeft + ((102 - bounds.minPrice) / (bounds.maxPrice - bounds.minPrice)) * plotWidth;
    const hit = hitTest(x, bids, asks, bounds.minPrice, bounds.maxPrice, plotLeft, plotWidth);

    expect(hit).toBeTruthy();
    expect(hit!.side).toBe('ask');
    expect(hit!.level.price).toBe(102);
  });

  it('hits the nearest side in the spread', () => {
    // Mid-spread: between highest bid (100) and lowest ask (101)
    const x = plotLeft + ((100.3 - bounds.minPrice) / (bounds.maxPrice - bounds.minPrice)) * plotWidth;
    const hit = hitTest(x, bids, asks, bounds.minPrice, bounds.maxPrice, plotLeft, plotWidth);

    expect(hit).toBeTruthy();
    // 100.3 is closer to bid 100 than ask 101
    expect(hit!.side).toBe('bid');
  });

  it('returns null for empty book', () => {
    const hit = hitTest(250, [], [], 0, 1, plotLeft, plotWidth);
    expect(hit).toBeNull();
  });
});
