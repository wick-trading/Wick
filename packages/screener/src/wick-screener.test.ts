import { describe, it, expect, beforeEach } from 'vitest';
import './wick-screener.js';
import { WickScreener } from './wick-screener.js';
import type { FilterDef, ScreenableInstrument } from './wick-screener.js';

describe('<wick-screener>', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  function mount(): WickScreener {
    const el = document.createElement('wick-screener') as WickScreener;
    document.body.appendChild(el);
    return el;
  }

  const instruments: ScreenableInstrument[] = [
    { id: 'BTC', symbol: 'BTC/USD', change24h: 5.2, volume24h: 1_000_000 },
    { id: 'ETH', symbol: 'ETH/USD', change24h: -1.3, volume24h: 500_000 },
    { id: 'SOL', symbol: 'SOL/USD', change24h: 12.0, volume24h: 200_000 },
  ];

  const filters: FilterDef[] = [
    { id: 'change24h', label: '24h Change', type: 'range', min: -100, max: 100 },
    { id: 'volume24h', label: 'Volume', type: 'range', min: 0, max: 1e12 },
  ];

  it('registers the custom element', () => {
    expect(customElements.get('wick-screener')).toBeDefined();
  });

  it('testFilter passes range correctly', () => {
    const def: FilterDef = { id: 'change24h', label: '', type: 'range' };
    expect(WickScreener.testFilter(instruments[0], def, { min: 0 })).toBe(true);
    expect(WickScreener.testFilter(instruments[1], def, { min: 0 })).toBe(false);
  });

  it('setFilter narrows results and emits event', () => {
    const el = mount();
    el.filters = filters;
    el.universe = instruments;
    let detail: any = null;
    el.addEventListener('wick-screener-results', (e: any) => (detail = e.detail));
    el.setFilter('change24h', { min: 0 });
    expect(detail?.count).toBe(2); // BTC + SOL
  });

  it('resetFilters restores all results', () => {
    const el = mount();
    el.filters = filters;
    el.universe = instruments;
    el.setFilter('change24h', { min: 10 });
    el.resetFilters();
    expect(el.results.length).toBe(3);
  });

  it('select-type filter matches by inclusion', () => {
    const selectDef: FilterDef = {
      id: 'id',
      label: 'ID',
      type: 'select',
      options: ['BTC', 'ETH', 'SOL'],
    };
    expect(
      WickScreener.testFilter(instruments[0], selectDef, { selected: ['BTC', 'SOL'] }),
    ).toBe(true);
    expect(
      WickScreener.testFilter(instruments[1], selectDef, { selected: ['BTC', 'SOL'] }),
    ).toBe(false);
  });
});
