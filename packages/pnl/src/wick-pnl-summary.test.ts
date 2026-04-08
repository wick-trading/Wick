import { describe, it, expect, beforeEach } from 'vitest';
import './wick-pnl-summary.js';
import type { WickPnlSummary } from './wick-pnl-summary.js';

describe('<wick-pnl-summary>', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  function mount(): WickPnlSummary {
    const el = document.createElement('wick-pnl-summary') as WickPnlSummary;
    document.body.appendChild(el);
    return el;
  }

  it('registers the custom element', () => {
    expect(customElements.get('wick-pnl-summary')).toBeDefined();
  });

  it('renders all four tiles by default', async () => {
    const el = mount();
    el.data = {
      realizedPnl: 100,
      unrealizedPnl: -50,
      dailyPnl: 25,
      totalEquity: 10000,
      currency: 'USD',
    };
    await el.updateComplete;
    expect(el.querySelectorAll('[part="stat-tile"]').length).toBe(4);
  });

  it('hides tiles via show-* flags', async () => {
    const el = mount();
    el.showRealized = false;
    el.showDaily = false;
    el.data = { realizedPnl: 0, unrealizedPnl: 0, dailyPnl: 0, totalEquity: 0 };
    await el.updateComplete;
    expect(el.querySelectorAll('[part="stat-tile"]').length).toBe(2);
  });

  it('updates partial data via patch()', () => {
    const el = mount();
    el.data = { realizedPnl: 0, unrealizedPnl: 0, dailyPnl: 0, totalEquity: 1000 };
    el.patch({ unrealizedPnl: 50 });
    expect(el.data.unrealizedPnl).toBe(50);
    expect(el.data.totalEquity).toBe(1000);
  });

  it('marks positive values with positive part class', async () => {
    const el = mount();
    el.data = { realizedPnl: 100, unrealizedPnl: -50, dailyPnl: 0, totalEquity: 1000 };
    await el.updateComplete;
    expect(el.querySelector('[part~="stat-value--positive"]')).not.toBeNull();
    expect(el.querySelector('[part~="stat-value--negative"]')).not.toBeNull();
  });
});
