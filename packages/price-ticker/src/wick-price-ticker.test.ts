import { describe, it, expect, afterEach } from 'vitest';
import { WickPriceTicker } from './wick-price-ticker.js';

if (!customElements.get('wick-price-ticker')) {
  customElements.define('wick-price-ticker', WickPriceTicker);
}

function createElement(): WickPriceTicker {
  const el = document.createElement('wick-price-ticker') as WickPriceTicker;
  document.body.appendChild(el);
  return el;
}

describe('WickPriceTicker', () => {
  let el: WickPriceTicker;

  afterEach(() => {
    el?.remove();
  });

  it('registers as a custom element', () => {
    expect(customElements.get('wick-price-ticker')).toBeDefined();
  });

  it('renders with empty data', async () => {
    el = createElement();
    await el.updateComplete;

    const container = el.querySelector('[part="container"]');
    expect(container).toBeTruthy();
  });

  it('displays symbol and price', async () => {
    el = createElement();
    el.data = {
      symbol: 'ETH/USD',
      price: 3456.78,
      timestamp: Date.now(),
    };
    await el.updateComplete;

    const symbol = el.querySelector('[part="symbol"]');
    expect(symbol?.textContent?.trim()).toBe('ETH/USD');

    const price = el.querySelector('[part="price"]');
    expect(price?.textContent?.trim()).toContain('3,456.78');
  });

  it('displays change percentage', async () => {
    el = createElement();
    el.data = {
      symbol: 'BTC/USD',
      price: 67000,
      change24h: 2.5,
      timestamp: Date.now(),
    };
    await el.updateComplete;

    const change = el.querySelector('[part="change"]');
    expect(change?.textContent?.trim()).toContain('+2.50%');
  });

  it('displays negative change', async () => {
    el = createElement();
    el.data = {
      symbol: 'BTC/USD',
      price: 67000,
      change24h: -1.23,
      timestamp: Date.now(),
    };
    await el.updateComplete;

    const change = el.querySelector('[part="change"]');
    expect(change?.textContent?.trim()).toContain('-1.23%');
  });

  it('hides details by default', async () => {
    el = createElement();
    el.data = {
      symbol: 'BTC/USD',
      price: 67000,
      high24h: 68000,
      low24h: 66000,
      volume24h: 50000,
      timestamp: Date.now(),
    };
    await el.updateComplete;

    expect(el.querySelector('[part="high"]')).toBeNull();
    expect(el.querySelector('[part="low"]')).toBeNull();
    expect(el.querySelector('[part="volume"]')).toBeNull();
  });

  it('shows details when show-details is set', async () => {
    el = createElement();
    el.showDetails = true;
    el.data = {
      symbol: 'BTC/USD',
      price: 67000,
      high24h: 68000,
      low24h: 66000,
      volume24h: 50000,
      timestamp: Date.now(),
    };
    await el.updateComplete;

    expect(el.querySelector('[part="high"]')).toBeTruthy();
    expect(el.querySelector('[part="low"]')).toBeTruthy();
    expect(el.querySelector('[part="volume"]')).toBeTruthy();
  });

  it('sets direction attribute on price change', async () => {
    el = createElement();
    el.data = {
      symbol: 'BTC/USD',
      price: 67000,
      timestamp: Date.now(),
    };
    await el.updateComplete;

    // Price goes up
    el.data = {
      symbol: 'BTC/USD',
      price: 67100,
      timestamp: Date.now(),
    };
    await el.updateComplete;

    const container = el.querySelector('[part="container"]');
    expect(container?.getAttribute('data-direction')).toBe('up');

    // Price goes down
    el.data = {
      symbol: 'BTC/USD',
      price: 66900,
      timestamp: Date.now(),
    };
    await el.updateComplete;

    expect(container?.getAttribute('data-direction')).toBe('down');
  });

  it('fires wick-price-change event', async () => {
    el = createElement();
    el.data = {
      symbol: 'BTC/USD',
      price: 67000,
      timestamp: Date.now(),
    };
    await el.updateComplete;

    let detail: any = null;
    el.addEventListener('wick-price-change', (e: Event) => {
      detail = (e as CustomEvent).detail;
    });

    el.data = {
      symbol: 'BTC/USD',
      price: 67100,
      timestamp: Date.now(),
    };
    await el.updateComplete;

    expect(detail).toBeTruthy();
    expect(detail.price).toBe(67100);
    expect(detail.prevPrice).toBe(67000);
    expect(detail.direction).toBe('up');
  });

  it('respects custom price format', async () => {
    el = createElement();
    el.priceFormat = { precision: 4, currencySymbol: '$' };
    el.data = {
      symbol: 'BTC/USD',
      price: 67000.1234,
      timestamp: Date.now(),
    };
    await el.updateComplete;

    const price = el.querySelector('[part="price"]');
    expect(price?.textContent?.trim()).toContain('$67,000.1234');
  });
});
