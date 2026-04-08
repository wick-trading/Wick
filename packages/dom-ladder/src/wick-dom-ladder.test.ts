import { describe, it, expect, beforeEach } from 'vitest';
import './wick-dom-ladder.js';
import { WickDomLadder } from './wick-dom-ladder.js';

describe('<wick-dom-ladder>', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  function mount(): WickDomLadder {
    const el = document.createElement('wick-dom-ladder') as WickDomLadder;
    document.body.appendChild(el);
    return el;
  }

  const data = {
    bids: [
      { price: 99.5, size: 2.0 },
      { price: 99.0, size: 5.0 },
    ],
    asks: [
      { price: 100.0, size: 1.5 },
      { price: 100.5, size: 3.0 },
    ],
  };

  it('registers the custom element', () => {
    expect(customElements.get('wick-dom-ladder')).toBeDefined();
  });

  it('bestBid and bestAsk compute correctly', () => {
    const el = mount();
    el.data = data;
    expect(el.bestBid).toBe(99.5);
    expect(el.bestAsk).toBe(100.0);
  });

  it('midPrice is average of best bid/ask', () => {
    const el = mount();
    el.data = data;
    expect(el.midPrice).toBeCloseTo(99.75);
  });

  it('applyDelta updates bid side', () => {
    const el = mount();
    el.data = data;
    el.applyDelta({ side: 'bid', price: 99.5, size: 10 });
    expect(el.data.bids.find((b) => b.price === 99.5)?.size).toBe(10);
  });

  it('applyDelta with size 0 removes the level', () => {
    const el = mount();
    el.data = data;
    el.applyDelta({ side: 'bid', price: 99.5, size: 0 });
    expect(el.data.bids.find((b) => b.price === 99.5)).toBeUndefined();
  });
});
