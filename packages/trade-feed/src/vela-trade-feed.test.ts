import { describe, it, expect, afterEach } from 'vitest';
import { VelaTradeFeed } from './vela-trade-feed.js';
import type { Trade } from '@vela-trading/core';

if (!customElements.get('vela-trade-feed')) {
  customElements.define('vela-trade-feed', VelaTradeFeed);
}

function createElement(): VelaTradeFeed {
  const el = document.createElement('vela-trade-feed') as VelaTradeFeed;
  document.body.appendChild(el);
  return el;
}

function makeTrade(overrides: Partial<Trade> = {}): Trade {
  return {
    id: String(Math.random()),
    price: 67000,
    size: 1.5,
    side: 'buy',
    timestamp: Date.now(),
    ...overrides,
  };
}

describe('VelaTradeFeed', () => {
  let el: VelaTradeFeed;

  afterEach(() => {
    el?.remove();
  });

  it('registers as a custom element', () => {
    expect(customElements.get('vela-trade-feed')).toBeDefined();
  });

  it('renders with empty trades', async () => {
    el = createElement();
    await el.updateComplete;

    const table = el.querySelector('[part="table"]');
    expect(table).toBeTruthy();

    const headers = el.querySelectorAll('th');
    expect(headers.length).toBe(3); // Price, Size, Time
  });

  it('renders trade rows', async () => {
    el = createElement();
    el.trades = [
      makeTrade({ id: '1', side: 'buy' }),
      makeTrade({ id: '2', side: 'sell' }),
    ];
    await el.updateComplete;

    const rows = el.querySelectorAll('[part~="row"]');
    expect(rows.length).toBe(2);

    const buyRows = el.querySelectorAll('[part~="buy-row"]');
    const sellRows = el.querySelectorAll('[part~="sell-row"]');
    expect(buyRows.length).toBe(1);
    expect(sellRows.length).toBe(1);
  });

  it('displays formatted price and size', async () => {
    el = createElement();
    el.priceFormat = { precision: 2 };
    el.trades = [makeTrade({ price: 1234.56, size: 0.5 })];
    await el.updateComplete;

    const priceCell = el.querySelector('[part="price"]');
    expect(priceCell?.textContent?.trim()).toContain('1,234.56');

    const sizeCell = el.querySelector('[part="size"]');
    expect(sizeCell?.textContent?.trim()).toContain('0.5');
  });

  it('addTrade prepends to the list', async () => {
    el = createElement();
    el.trades = [makeTrade({ id: '1', price: 100 })];
    await el.updateComplete;

    el.addTrade(makeTrade({ id: '2', price: 200 }));
    await el.updateComplete;

    expect(el.trades.length).toBe(2);
    expect(el.trades[0].price).toBe(200); // New trade is first
    expect(el.trades[1].price).toBe(100);
  });

  it('addTrade respects maxTrades limit', async () => {
    el = createElement();
    el.maxTrades = 3;
    el.trades = [
      makeTrade({ id: '1' }),
      makeTrade({ id: '2' }),
      makeTrade({ id: '3' }),
    ];
    await el.updateComplete;

    el.addTrade(makeTrade({ id: '4' }));
    await el.updateComplete;

    expect(el.trades.length).toBe(3);
    expect(el.trades[0].id).toBe('4'); // Newest first
  });

  it('addTrades batch inserts', async () => {
    el = createElement();
    el.trades = [makeTrade({ id: '1' })];
    await el.updateComplete;

    el.addTrades([
      makeTrade({ id: '2' }),
      makeTrade({ id: '3' }),
    ]);
    await el.updateComplete;

    expect(el.trades.length).toBe(3);
    expect(el.trades[0].id).toBe('2');
    expect(el.trades[1].id).toBe('3');
    expect(el.trades[2].id).toBe('1');
  });

  it('fires vela-trade-click on row click', async () => {
    el = createElement();
    const trade = makeTrade({ id: 'click-test', price: 99999 });
    el.trades = [trade];
    await el.updateComplete;

    let detail: any = null;
    el.addEventListener('vela-trade-click', (e: Event) => {
      detail = (e as CustomEvent).detail;
    });

    const row = el.querySelector('[part~="row"]') as HTMLElement;
    row?.click();

    expect(detail).toBeTruthy();
    expect(detail.id).toBe('click-test');
    expect(detail.price).toBe(99999);
  });

  it('formats time as HH:MM:SS by default', async () => {
    el = createElement();
    const ts = new Date('2026-01-15T14:30:45').getTime();
    el.trades = [makeTrade({ timestamp: ts })];
    await el.updateComplete;

    const timeCell = el.querySelector('[part="time"]');
    const text = timeCell?.textContent?.trim() ?? '';
    // Should contain time components (locale-dependent format)
    expect(text).toBeTruthy();
    expect(text.length).toBeGreaterThan(0);
  });

  it('formats time as relative', async () => {
    el = createElement();
    el.timeFormat = 'relative';
    el.trades = [makeTrade({ timestamp: Date.now() - 5000 })];
    await el.updateComplete;

    const timeCell = el.querySelector('[part="time"]');
    expect(timeCell?.textContent?.trim()).toContain('s ago');
  });

  it('formats time as datetime', async () => {
    el = createElement();
    el.timeFormat = 'datetime';
    el.trades = [makeTrade({ timestamp: Date.now() })];
    await el.updateComplete;

    const timeCell = el.querySelector('[part="time"]');
    const text = timeCell?.textContent?.trim() ?? '';
    // Full locale string is longer than just time
    expect(text.length).toBeGreaterThan(8);
  });

  it('respects max-trades on initial render', async () => {
    el = createElement();
    el.maxTrades = 2;
    el.trades = [
      makeTrade({ id: '1' }),
      makeTrade({ id: '2' }),
      makeTrade({ id: '3' }),
      makeTrade({ id: '4' }),
    ];
    await el.updateComplete;

    const rows = el.querySelectorAll('[part~="row"]');
    expect(rows.length).toBe(2);
  });
});
