import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { WickFundingRate } from './wick-funding-rate.js';

if (!customElements.get('wick-funding-rate')) {
  customElements.define('wick-funding-rate', WickFundingRate);
}

function createElement(): WickFundingRate {
  const el = document.createElement('wick-funding-rate') as WickFundingRate;
  document.body.appendChild(el);
  return el;
}

const FIXED_NOW = 1_700_000_000_000;

describe('WickFundingRate', () => {
  let el: WickFundingRate;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    el?.remove();
    vi.useRealTimers();
  });

  it('registers as a custom element', () => {
    expect(customElements.get('wick-funding-rate')).toBeDefined();
  });

  it('renders symbol and formatted rate', async () => {
    el = createElement();
    el.data = {
      symbol: 'BTC-PERP',
      rate: 0.0001,
      intervalHours: 8,
      nextFundingAt: FIXED_NOW + 3_600_000,
    };
    await el.updateComplete;

    const symbol = el.querySelector('[part="symbol"]');
    expect(symbol?.textContent).toBe('BTC-PERP');

    const rate = el.querySelector('[part~="rate"]');
    expect(rate?.textContent).toBe('+0.0100%');
  });

  it('formats negative rates with a minus sign', async () => {
    el = createElement();
    el.data = {
      symbol: 'ETH-PERP',
      rate: -0.00025,
      intervalHours: 8,
      nextFundingAt: FIXED_NOW,
    };
    await el.updateComplete;

    const rate = el.querySelector('[part~="rate"]');
    expect(rate?.textContent).toBe('-0.0250%');
  });

  it('derives direction positive/negative/zero', async () => {
    el = createElement();
    el.data = { symbol: 'X', rate: 0.001, intervalHours: 8, nextFundingAt: 0 };
    await el.updateComplete;
    expect(el.direction).toBe('positive');
    expect(el.querySelector('[part~="rate--positive"]')).toBeTruthy();

    el.data = { symbol: 'X', rate: -0.001, intervalHours: 8, nextFundingAt: 0 };
    await el.updateComplete;
    expect(el.direction).toBe('negative');
    expect(el.querySelector('[part~="rate--negative"]')).toBeTruthy();

    el.data = { symbol: 'X', rate: 0, intervalHours: 8, nextFundingAt: 0 };
    await el.updateComplete;
    expect(el.direction).toBe('zero');
    expect(el.querySelector('[part~="rate--zero"]')).toBeTruthy();
  });

  it('hides the countdown by default', async () => {
    el = createElement();
    el.data = { symbol: 'X', rate: 0, intervalHours: 8, nextFundingAt: FIXED_NOW + 1000 };
    await el.updateComplete;

    expect(el.querySelector('[part="countdown"]')).toBeFalsy();
  });

  it('renders the countdown when show-countdown is set', async () => {
    el = createElement();
    el.showCountdown = true;
    el.data = {
      symbol: 'X',
      rate: 0,
      intervalHours: 8,
      // 2 hours, 30 minutes, 15 seconds away
      nextFundingAt: FIXED_NOW + (2 * 3600 + 30 * 60 + 15) * 1000,
    };
    await el.updateComplete;

    const value = el.querySelector('[part="countdown-value"]');
    expect(value?.textContent).toBe('02:30:15');
  });

  it('clamps the countdown to 00:00:00 when nextFundingAt is in the past', async () => {
    el = createElement();
    el.showCountdown = true;
    el.data = {
      symbol: 'X',
      rate: 0,
      intervalHours: 8,
      nextFundingAt: FIXED_NOW - 60_000,
    };
    await el.updateComplete;

    const value = el.querySelector('[part="countdown-value"]');
    expect(value?.textContent).toBe('00:00:00');
  });

  it('fires wick-funding-tick every second', async () => {
    el = createElement();
    el.data = {
      symbol: 'X',
      rate: 0,
      intervalHours: 8,
      nextFundingAt: FIXED_NOW + 5_000,
    };
    await el.updateComplete;

    const handler = vi.fn();
    el.addEventListener('wick-funding-tick', handler);

    vi.advanceTimersByTime(3_000);
    expect(handler).toHaveBeenCalledTimes(3);

    const lastCall = handler.mock.calls[handler.mock.calls.length - 1][0] as CustomEvent;
    expect(lastCall.detail.remaining).toBe(2_000);
  });

  it('fires wick-funding-settled when the countdown crosses zero', async () => {
    el = createElement();
    el.data = {
      symbol: 'BTC-PERP',
      rate: 0.0001,
      intervalHours: 8,
      nextFundingAt: FIXED_NOW + 2_000,
    };
    await el.updateComplete;

    const settled = vi.fn();
    el.addEventListener('wick-funding-settled', settled);

    vi.advanceTimersByTime(1_500);
    expect(settled).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1_000); // total 2.5s — crosses zero
    expect(settled).toHaveBeenCalledTimes(1);
    const evt = settled.mock.calls[0][0] as CustomEvent;
    expect(evt.detail.symbol).toBe('BTC-PERP');
    expect(evt.detail.rate).toBe(0.0001);
  });

  it('does not fire wick-funding-settled twice', async () => {
    el = createElement();
    el.data = {
      symbol: 'X',
      rate: 0,
      intervalHours: 8,
      nextFundingAt: FIXED_NOW + 1_000,
    };
    await el.updateComplete;

    const settled = vi.fn();
    el.addEventListener('wick-funding-settled', settled);

    vi.advanceTimersByTime(5_000);
    expect(settled).toHaveBeenCalledTimes(1);
  });

  it('stops ticking when removed from the DOM', async () => {
    el = createElement();
    el.data = { symbol: 'X', rate: 0, intervalHours: 8, nextFundingAt: FIXED_NOW + 10_000 };
    await el.updateComplete;

    const handler = vi.fn();
    el.addEventListener('wick-funding-tick', handler);

    vi.advanceTimersByTime(2_000);
    expect(handler).toHaveBeenCalledTimes(2);

    el.remove();
    vi.advanceTimersByTime(5_000);
    expect(handler).toHaveBeenCalledTimes(2); // no further ticks
  });

  it('hides the sparkline by default', async () => {
    el = createElement();
    el.data = {
      symbol: 'X',
      rate: 0,
      intervalHours: 8,
      nextFundingAt: 0,
      history: [0.0001, 0.0002, 0.00015],
    };
    await el.updateComplete;

    expect(el.querySelector('wick-mini-chart')).toBeFalsy();
  });

  it('renders the nested wick-mini-chart sparkline when show-sparkline is set', async () => {
    el = createElement();
    el.showSparkline = true;
    el.data = {
      symbol: 'X',
      rate: 0,
      intervalHours: 8,
      nextFundingAt: 0,
      history: [0.0001, 0.0002, 0.00015],
    };
    await el.updateComplete;

    const sparkline = el.querySelector('wick-mini-chart');
    expect(sparkline).toBeTruthy();
    expect(sparkline?.getAttribute('part')).toBe('sparkline');
  });

  it('omits the sparkline when history has fewer than 2 points', async () => {
    el = createElement();
    el.showSparkline = true;
    el.data = {
      symbol: 'X',
      rate: 0,
      intervalHours: 8,
      nextFundingAt: 0,
      history: [0.0001],
    };
    await el.updateComplete;

    expect(el.querySelector('wick-mini-chart')).toBeFalsy();
  });

  it('respects rate-precision', async () => {
    el = createElement();
    el.ratePrecision = 2;
    el.data = { symbol: 'X', rate: 0.012345, intervalHours: 8, nextFundingAt: 0 };
    await el.updateComplete;

    const rate = el.querySelector('[part~="rate"]');
    expect(rate?.textContent).toBe('+1.23%');
  });
});
