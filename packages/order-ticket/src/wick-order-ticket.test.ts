import { describe, it, expect, beforeEach } from 'vitest';
import './wick-order-ticket.js';
import { WickOrderTicket } from './wick-order-ticket.js';

describe('<wick-order-ticket>', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  function mount(): WickOrderTicket {
    const el = document.createElement('wick-order-ticket') as WickOrderTicket;
    el.symbol = 'BTC/USD';
    el.tickSize = 0.5;
    el.lotSize = 0.001;
    el.minQty = 0.001;
    document.body.appendChild(el);
    return el;
  }

  it('registers the custom element', () => {
    expect(customElements.get('wick-order-ticket')).toBeDefined();
  });

  it('roundToTick rounds to nearest tick', () => {
    expect(WickOrderTicket.roundToTick(67432.3, 0.5)).toBeCloseTo(67432.5);
    expect(WickOrderTicket.roundToTick(67432.1, 0.5)).toBeCloseTo(67432.0);
  });

  it('roundToLot truncates to lot size', () => {
    expect(WickOrderTicket.roundToLot(0.1234, 0.001)).toBeCloseTo(0.123);
  });

  it('validate returns error when qty is zero', () => {
    const el = mount();
    // _qty defaults to 0
    const err = el.validate();
    expect(err).not.toBeNull();
  });

  it('emits wick-side-change when side toggles', () => {
    const el = mount();
    let detail: any = null;
    el.addEventListener('wick-side-change', (e: any) => (detail = e.detail));
    el.setSide('sell');
    expect(detail?.side).toBe('sell');
  });
});
