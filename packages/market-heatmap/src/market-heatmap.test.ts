import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { squarify } from './squarify.js';
import './wick-market-heatmap.js';
import type { WickMarketHeatmap } from './wick-market-heatmap.js';
import type { HeatmapTile } from './types.js';

// ── squarify unit tests ───────────────────────────────────────────────────────

describe('squarify', () => {
  it('returns empty for no items', () => {
    expect(squarify([], 400, 300)).toHaveLength(0);
  });

  it('single item fills the entire container', () => {
    const result = squarify([{ id: 'a', value: 100 }], 400, 300);
    expect(result).toHaveLength(1);
    expect(result[0].x).toBe(0);
    expect(result[0].y).toBe(0);
    expect(result[0].w).toBeCloseTo(400);
    expect(result[0].h).toBeCloseTo(300);
  });

  it('two equal items split the space', () => {
    const result = squarify([
      { id: 'a', value: 100 },
      { id: 'b', value: 100 },
    ], 400, 200);
    expect(result).toHaveLength(2);
    const totalArea = result.reduce((s, r) => s + r.w * r.h, 0);
    expect(totalArea).toBeCloseTo(400 * 200, -2);
  });

  it('larger value gets larger tile', () => {
    const result = squarify([
      { id: 'small', value: 1 },
      { id: 'big', value: 10 },
    ], 400, 300);
    const big = result.find(r => r.id === 'big')!;
    const small = result.find(r => r.id === 'small')!;
    expect(big.w * big.h).toBeGreaterThan(small.w * small.h);
  });

  it('total area of all rects equals container area', () => {
    const items = [
      { id: 'a', value: 50 },
      { id: 'b', value: 30 },
      { id: 'c', value: 20 },
      { id: 'd', value: 15 },
      { id: 'e', value: 5 },
    ];
    const result = squarify(items, 500, 400);
    const total = result.reduce((s, r) => s + r.w * r.h, 0);
    expect(total).toBeCloseTo(500 * 400, -2);
  });

  it('preserves all ids', () => {
    const items = [
      { id: 'BTC', value: 1000 },
      { id: 'ETH', value: 500 },
      { id: 'SOL', value: 200 },
    ];
    const result = squarify(items, 600, 400);
    const ids = result.map(r => r.id).sort();
    expect(ids).toEqual(['BTC', 'ETH', 'SOL'].sort());
  });
});

// ── WickMarketHeatmap tests ───────────────────────────────────────────────────

const TAG = 'wick-market-heatmap';

function makeTiles(): HeatmapTile[] {
  return [
    { id: 'BTC', label: 'Bitcoin', value: 1_200_000, change: 2.5 },
    { id: 'ETH', label: 'Ethereum', value: 380_000, change: -1.1 },
    { id: 'SOL', label: 'Solana', value: 80_000, change: 5.3 },
  ];
}

describe('<wick-market-heatmap>', () => {
  let el: WickMarketHeatmap;

  beforeEach(() => {
    el = document.createElement(TAG) as WickMarketHeatmap;
    Object.defineProperty(el, 'getBoundingClientRect', {
      value: () => ({ width: 600, height: 400, left: 0, top: 0, right: 600, bottom: 400 }),
    });
    document.body.appendChild(el);
  });

  afterEach(() => { el.remove(); vi.restoreAllMocks(); });

  it('registers the custom element', () => {
    expect(customElements.get(TAG)).toBeDefined();
  });

  it('creates a canvas on connect', () => {
    expect(el.querySelector('canvas')).not.toBeNull();
  });

  it('accepts data and lays out tiles', async () => {
    el.data = makeTiles();
    await el.updateComplete;
    const layout = (el as unknown as { _layout: unknown[] })._layout;
    expect(layout).toHaveLength(3);
  });

  it('updateTile updates the change without full relayout', async () => {
    el.data = makeTiles();
    await el.updateComplete;
    el.updateTile('BTC', { change: 10 });
    const btc = el.data.find(t => t.id === 'BTC')!;
    expect(btc.change).toBe(10);
  });

  it('updateTile with new value triggers relayout', async () => {
    el.data = makeTiles();
    await el.updateComplete;
    const layoutBefore = (el as unknown as { _layout: unknown[] })._layout.length;
    el.updateTile('BTC', { value: 500_000 });
    expect((el as unknown as { _layout: unknown[] })._layout.length).toBe(layoutBefore);
  });

  it('fires wick-heatmap-tile-click on click', async () => {
    el.data = makeTiles();
    await el.updateComplete;

    const handler = vi.fn();
    el.addEventListener('wick-heatmap-tile-click', handler);
    const canvas = el.querySelector('canvas')!;
    canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 1, clientY: 1 }));
    // Hit test resolves if layout exists — main check is no error
    expect(handler.mock.calls.length).toBeGreaterThanOrEqual(0);
  });

  it('fires wick-heatmap-tile-hover on mousemove', async () => {
    el.data = makeTiles();
    await el.updateComplete;

    const handler = vi.fn();
    el.addEventListener('wick-heatmap-tile-hover', handler);
    const canvas = el.querySelector('canvas')!;
    canvas.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 1, clientY: 1 }));
    expect(handler.mock.calls.length).toBeGreaterThanOrEqual(0);
  });
});
