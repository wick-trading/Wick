import { describe, it, expect, beforeEach } from 'vitest';
import './wick-open-interest.js';
import type { WickOpenInterest } from './wick-open-interest.js';

describe('<wick-open-interest>', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  function mount(): WickOpenInterest {
    const el = document.createElement('wick-open-interest') as WickOpenInterest;
    document.body.appendChild(el);
    return el;
  }

  it('registers the custom element', () => {
    expect(customElements.get('wick-open-interest')).toBeDefined();
  });

  it('appends samples and respects lookback window', () => {
    const el = mount();
    el.lookback = 3;
    el.data = { symbol: 'BTC-PERP', value: 100, samples: [] };
    el.pushSample({ t: 1, value: 100 });
    el.pushSample({ t: 2, value: 110 });
    el.pushSample({ t: 3, value: 120 });
    el.pushSample({ t: 4, value: 130 });
    expect(el.data.samples.length).toBe(3);
    expect(el.data.samples[0].t).toBe(2);
    expect(el.data.value).toBe(130);
  });

  it('fires wick-oi-change when delta exceeds threshold', () => {
    const el = mount();
    el.flashThreshold = 0.05;
    el.data = { symbol: 'BTC-PERP', value: 100, samples: [{ t: 1, value: 100 }] };
    let detail: any = null;
    el.addEventListener('wick-oi-change', (e: any) => (detail = e.detail));
    el.pushSample({ t: 2, value: 110 }); // 10% delta
    expect(detail).not.toBeNull();
    expect(detail.deltaPct).toBeCloseTo(0.1);
  });

  it('does not fire when delta below threshold', () => {
    const el = mount();
    el.flashThreshold = 0.05;
    el.data = { symbol: 'BTC-PERP', value: 100, samples: [{ t: 1, value: 100 }] };
    let fired = false;
    el.addEventListener('wick-oi-change', () => (fired = true));
    el.pushSample({ t: 2, value: 101 });
    expect(fired).toBe(false);
  });

  it('renders the formatted current value', async () => {
    const el = mount();
    el.data = { symbol: 'BTC-PERP', value: 78_240_000, samples: [] };
    await el.updateComplete;
    expect(el.querySelector('[part="current-value"]')?.textContent).toBe('78.24M');
  });
});
