import { describe, it, expect, beforeEach } from 'vitest';
import './wick-order-manager.js';
import { WickOrderManager } from './wick-order-manager.js';
import type { OpenOrder } from './wick-order-manager.js';

describe('<wick-order-manager>', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  function mount(): WickOrderManager {
    const el = document.createElement('wick-order-manager') as WickOrderManager;
    document.body.appendChild(el);
    return el;
  }

  const orders: OpenOrder[] = [
    {
      id: '1',
      symbol: 'BTC/USD',
      side: 'buy',
      type: 'limit',
      price: 67000,
      size: 0.5,
      filled: 0.1,
      status: 'partial',
      createdAt: 0,
    },
    {
      id: '2',
      symbol: 'ETH/USD',
      side: 'sell',
      type: 'limit',
      price: 3500,
      size: 1,
      filled: 0,
      status: 'open',
      createdAt: 1,
    },
    {
      id: '3',
      symbol: 'SOL/USD',
      side: 'buy',
      type: 'market',
      size: 10,
      filled: 10,
      status: 'filled', // should be excluded
      createdAt: 2,
    },
  ];

  it('registers the custom element', () => {
    expect(customElements.get('wick-order-manager')).toBeDefined();
  });

  it('fillPct computes correct percentage', () => {
    expect(WickOrderManager.fillPct(orders[0])).toBeCloseTo(20);
    expect(WickOrderManager.fillPct(orders[1])).toBe(0);
  });

  it('excludes filled/cancelled from filteredOrders', () => {
    const el = mount();
    el.orders = orders;
    expect(el.filteredOrders.length).toBe(2);
  });

  it('filters by symbolFilter', () => {
    const el = mount();
    el.orders = orders;
    el.symbolFilter = 'ETH';
    expect(el.filteredOrders.length).toBe(1);
    expect(el.filteredOrders[0].id).toBe('2');
  });

  it('emits wick-order-cancel on cancelOrder()', () => {
    const el = mount();
    el.orders = orders;
    let detail: any = null;
    el.addEventListener('wick-order-cancel', (e: any) => (detail = e.detail));
    el.cancelOrder('1');
    expect(detail?.id).toBe('1');
  });
});
