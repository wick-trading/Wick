import { describe, it, expect, beforeEach, vi } from 'vitest';
import './wick-market-clock.js';
import type { WickMarketClock, MarketDef } from './wick-market-clock.js';

const MONDAY_NOON_UTC = Date.UTC(2024, 0, 1, 12, 0, 0); // 2024-01-01 was a Monday

describe('<wick-market-clock>', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(MONDAY_NOON_UTC);
    document.body.innerHTML = '';
  });

  function mount(): WickMarketClock {
    const el = document.createElement('wick-market-clock') as WickMarketClock;
    document.body.appendChild(el);
    return el;
  }

  it('registers the custom element', () => {
    expect(customElements.get('wick-market-clock')).toBeDefined();
  });

  it('returns alwaysOpen markets as open', () => {
    const el = mount();
    const m: MarketDef = { id: 'CRYPTO', label: 'Crypto', timezone: 'UTC', alwaysOpen: true };
    expect(el.statusFor(m).state).toBe('open');
  });

  it('returns open during market hours', () => {
    const el = mount();
    const m: MarketDef = {
      id: 'TEST',
      label: 'Test',
      timezone: 'UTC',
      sessions: [{ open: '09:30', close: '16:00', days: [1, 2, 3, 4, 5] }],
    };
    expect(el.statusFor(m, MONDAY_NOON_UTC).state).toBe('open');
  });

  it('returns closed outside market hours', () => {
    const el = mount();
    const m: MarketDef = {
      id: 'TEST',
      label: 'Test',
      timezone: 'UTC',
      sessions: [{ open: '09:30', close: '16:00', days: [1, 2, 3, 4, 5] }],
    };
    const earlyMorning = Date.UTC(2024, 0, 1, 6, 0, 0);
    expect(el.statusFor(m, earlyMorning).state).toBe('closed');
  });

  it('returns closed on holidays', () => {
    const el = mount();
    const m: MarketDef = {
      id: 'TEST',
      label: 'Test',
      timezone: 'UTC',
      sessions: [{ open: '09:30', close: '16:00', days: [1, 2, 3, 4, 5] }],
      holidays: ['2024-01-01'],
    };
    expect(el.statusFor(m, MONDAY_NOON_UTC).state).toBe('closed');
  });
});
