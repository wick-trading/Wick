import { describe, it, expect, beforeEach } from 'vitest';
import './wick-position-sizer.js';
import type { WickPositionSizer } from './wick-position-sizer.js';

describe('<wick-position-sizer>', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  function mount(): WickPositionSizer {
    const el = document.createElement('wick-position-sizer') as WickPositionSizer;
    document.body.appendChild(el);
    return el;
  }

  it('registers the custom element', () => {
    expect(customElements.get('wick-position-sizer')).toBeDefined();
  });

  it('computes position size from risk percent and stop distance', () => {
    const el = mount();
    el.accountBalance = 10000;
    el.riskPercent = 1; // $100 risk
    el.entryPrice = 100;
    el.stopPrice = 95; // $5 distance
    const r = el.compute();
    expect(r.riskUsd).toBe(100);
    expect(r.size).toBe(20); // 100 / 5
  });

  it('computes R-multiple from target', () => {
    const el = mount();
    el.accountBalance = 10000;
    el.riskPercent = 1;
    el.entryPrice = 100;
    el.stopPrice = 95;
    el.targetPrice = 110; // 10 distance, 2x risk
    const r = el.compute();
    expect(r.rMultiple).toBeCloseTo(2);
  });

  it('rounds size down to tick size', () => {
    const el = mount();
    el.accountBalance = 1000;
    el.riskPercent = 1;
    el.entryPrice = 100;
    el.stopPrice = 99.7;
    el.tickSize = 1;
    const r = el.compute();
    expect(r.size).toBe(Math.floor((10 / 0.3) / 1) * 1);
  });

  it('emits wick-sizing-change on update', async () => {
    const el = mount();
    let detail: any = null;
    el.addEventListener('wick-sizing-change', (e: any) => (detail = e.detail));
    el.accountBalance = 5000;
    el.riskPercent = 2;
    el.entryPrice = 100;
    el.stopPrice = 98;
    await el.updateComplete;
    expect(detail).not.toBeNull();
    expect(detail.riskUsd).toBe(100);
    expect(detail.size).toBe(50);
  });
});
