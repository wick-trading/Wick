import { describe, it, expect, beforeEach } from 'vitest';
import './wick-positions.js';
import { WickPositions } from './wick-positions.js';
import type { Position } from './wick-positions.js';

describe('<wick-positions>', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  function mount(): WickPositions {
    const el = document.createElement('wick-positions') as WickPositions;
    document.body.appendChild(el);
    return el;
  }

  const long: Position = {
    id: '1',
    symbol: 'BTC/USD',
    side: 'long',
    qty: 1,
    entryPrice: 100,
    currentPrice: 110,
    timestamp: 0,
  };
  const short: Position = {
    id: '2',
    symbol: 'ETH/USD',
    side: 'short',
    qty: 2,
    entryPrice: 100,
    currentPrice: 90,
    timestamp: 0,
  };

  it('registers the custom element', () => {
    expect(customElements.get('wick-positions')).toBeDefined();
  });

  it('computes unrealized for longs and shorts', () => {
    expect(WickPositions.unrealized(long)).toBe(10);
    expect(WickPositions.unrealized(short)).toBe(20);
  });

  it('computes unrealizedPct correctly', () => {
    expect(WickPositions.unrealizedPct(long)).toBeCloseTo(10);
    expect(WickPositions.unrealizedPct(short)).toBeCloseTo(10);
  });

  it('updatePrice patches all positions for the symbol', () => {
    const el = mount();
    el.positions = [long, short, { ...long, id: '3' }];
    el.updatePrice('BTC/USD', 120);
    expect(el.positions[0].currentPrice).toBe(120);
    expect(el.positions[2].currentPrice).toBe(120);
    expect(el.positions[1].currentPrice).toBe(90); // ETH untouched
  });

  it('emits position-close from the close button', async () => {
    const el = mount();
    el.positions = [long];
    await el.updateComplete;
    let detail: any = null;
    el.addEventListener('wick-position-close', (e: any) => (detail = e.detail));
    const btn = el.querySelector('[part="cell-close-btn"]') as HTMLButtonElement;
    btn.dispatchEvent(new Event('click', { bubbles: true }));
    expect(detail?.id).toBe('1');
  });
});
