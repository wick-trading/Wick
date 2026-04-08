import { describe, it, expect, beforeEach } from 'vitest';
import './wick-trade-history.js';
import type { WickTradeHistory, TradeRecord } from './wick-trade-history.js';

describe('<wick-trade-history>', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  function mount(): WickTradeHistory {
    const el = document.createElement('wick-trade-history') as WickTradeHistory;
    document.body.appendChild(el);
    return el;
  }

  const trade = (id: string, pnl: number, opts: Partial<TradeRecord> = {}): TradeRecord => ({
    id,
    symbol: 'BTC/USD',
    side: 'long',
    entry: 100,
    exit: 100 + pnl / 1,
    size: 1,
    openedAt: 1700000000000,
    closedAt: 1700003600000,
    pnl,
    ...opts,
  });

  it('registers the custom element', () => {
    expect(customElements.get('wick-trade-history')).toBeDefined();
  });

  it('computes summary stats correctly', () => {
    const el = mount();
    el.trades = [
      trade('1', 100),
      trade('2', 200),
      trade('3', -50),
      trade('4', -50),
    ];
    const s = el.computeSummary();
    expect(s.totalTrades).toBe(4);
    expect(s.totalPnl).toBe(200);
    expect(s.winRate).toBe(0.5);
    expect(s.avgWin).toBe(150);
    expect(s.avgLoss).toBe(-50);
    expect(s.profitFactor).toBe(3);
  });

  it('returns zero stats for empty list', () => {
    const el = mount();
    const s = el.computeSummary();
    expect(s.totalTrades).toBe(0);
    expect(s.winRate).toBe(0);
  });

  it('sorts by pnl descending by default', () => {
    const el = mount();
    el.trades = [trade('a', 100), trade('b', -50), trade('c', 200)];
    el.sortKey = 'pnl';
    el.sortDir = 'desc';
    expect(el.sortedTrades[0].id).toBe('c');
    expect(el.sortedTrades[2].id).toBe('b');
  });

  it('emits row-click on row click', async () => {
    const el = mount();
    el.trades = [trade('1', 100)];
    await el.updateComplete;
    let clicked: any = null;
    el.addEventListener('wick-trade-row-click', (e: any) => (clicked = e.detail));
    const row = el.querySelector('tbody tr') as HTMLElement;
    row.dispatchEvent(new Event('click', { bubbles: true }));
    expect(clicked?.id).toBe('1');
  });
});
