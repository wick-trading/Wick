import { describe, it, expect, beforeEach } from 'vitest';
import './wick-liquidation-feed.js';
import type { WickLiquidationFeed, LiquidationEvent } from './wick-liquidation-feed.js';

describe('<wick-liquidation-feed>', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  function mount(): WickLiquidationFeed {
    const el = document.createElement('wick-liquidation-feed') as WickLiquidationFeed;
    document.body.appendChild(el);
    return el;
  }

  const mk = (id: string, sizeUsd: number): LiquidationEvent => ({
    id,
    symbol: 'BTC/USD',
    side: 'long',
    price: 67000,
    size: 1,
    sizeUsd,
    timestamp: Date.now(),
  });

  it('registers the custom element', () => {
    expect(customElements.get('wick-liquidation-feed')).toBeDefined();
  });

  it('adds events to the front of the list', () => {
    const el = mount();
    el.addEvent(mk('1', 50_000));
    el.addEvent(mk('2', 60_000));
    expect(el.events[0].id).toBe('2');
    expect(el.events[1].id).toBe('1');
  });

  it('caps the list at maxEvents', () => {
    const el = mount();
    el.maxEvents = 3;
    for (let i = 0; i < 5; i++) el.addEvent(mk(String(i), 50_000));
    expect(el.events.length).toBe(3);
  });

  it('filters events under min-size-usd', () => {
    const el = mount();
    el.minSizeUsd = 10_000;
    el.addEvent(mk('small', 5_000));
    el.addEvent(mk('big', 50_000));
    expect(el.events.length).toBe(1);
    expect(el.events[0].id).toBe('big');
  });

  it('emits row-click event', async () => {
    const el = mount();
    el.addEvent(mk('1', 50_000));
    await el.updateComplete;
    let clicked: any = null;
    el.addEventListener('wick-liquidation-row-click', (e: any) => (clicked = e.detail));
    const row = el.querySelector('[part~="row"]') as HTMLElement;
    row.click();
    expect(clicked?.id).toBe('1');
  });
});
