import { describe, it, expect, beforeEach, vi } from 'vitest';
import './wick-equity-curve.js';
import type { WickEquityCurve } from './wick-equity-curve.js';

const NOW = 1_700_000_000_000;

describe('<wick-equity-curve>', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    document.body.innerHTML = '';
  });

  function mount(): WickEquityCurve {
    const el = document.createElement('wick-equity-curve') as WickEquityCurve;
    document.body.appendChild(el);
    return el;
  }

  it('registers the custom element', () => {
    expect(customElements.get('wick-equity-curve')).toBeDefined();
  });

  it('appendPoint adds a new point', () => {
    const el = mount();
    el.appendPoint({ timestamp: NOW, equity: 10000 });
    expect(el.data.length).toBe(1);
  });

  it('filters points by time frame', () => {
    const el = mount();
    el.data = [
      { timestamp: NOW - 2 * 60 * 60 * 1000, equity: 9000 },
      { timestamp: NOW - 30 * 60 * 1000, equity: 9500 },
      { timestamp: NOW, equity: 10000 },
    ];
    el.timeFrame = '1H';
    expect(el.filteredPoints.length).toBe(2);
  });

  it('computes peak drawdown', () => {
    const el = mount();
    el.data = [
      { timestamp: NOW - 4, equity: 100 },
      { timestamp: NOW - 3, equity: 120 }, // peak
      { timestamp: NOW - 2, equity: 90 }, // dd 25%
      { timestamp: NOW - 1, equity: 105 },
    ];
    el.timeFrame = 'ALL';
    expect(el.peakDrawdown).toBeCloseTo(0.25);
  });

  it('emits timeframe-change on setTimeFrame', () => {
    const el = mount();
    let detail: any = null;
    el.addEventListener('wick-pnl-timeframe-change', (e: any) => (detail = e.detail));
    el.setTimeFrame('1W');
    expect(detail?.timeFrame).toBe('1W');
  });
});
