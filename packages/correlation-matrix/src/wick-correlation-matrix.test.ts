import { describe, it, expect, beforeEach } from 'vitest';
import './wick-correlation-matrix.js';
import { WickCorrelationMatrix } from './wick-correlation-matrix.js';

describe('<wick-correlation-matrix>', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  function mount(): WickCorrelationMatrix {
    const el = document.createElement('wick-correlation-matrix') as WickCorrelationMatrix;
    document.body.appendChild(el);
    return el;
  }

  it('registers the custom element', () => {
    expect(customElements.get('wick-correlation-matrix')).toBeDefined();
  });

  it('returns array length is N-1', () => {
    expect(WickCorrelationMatrix.returns([100, 110, 120, 130]).length).toBe(3);
  });

  it('pearson of identical series equals 1', () => {
    const a = [0.01, 0.02, -0.01, 0.03];
    expect(WickCorrelationMatrix.pearson(a, a)).toBeCloseTo(1);
  });

  it('pearson of inverted series equals -1', () => {
    const a = [0.01, 0.02, -0.01, 0.03];
    const b = a.map((v) => -v);
    expect(WickCorrelationMatrix.pearson(a, b)).toBeCloseTo(-1);
  });

  it('computeMatrix has 1s on the diagonal', () => {
    const el = mount();
    el.data = {
      symbols: ['A', 'B'],
      prices: [
        [100, 110, 120, 130],
        [200, 220, 240, 260],
      ],
    };
    const m = el.computeMatrix();
    expect(m[0][0]).toBe(1);
    expect(m[1][1]).toBe(1);
    // Perfectly correlated (both linearly increasing)
    expect(m[0][1]).toBeCloseTo(1);
  });

  it('emits cell-click on cell click', async () => {
    const el = mount();
    el.data = {
      symbols: ['A', 'B'],
      prices: [
        [100, 110, 120],
        [50, 55, 60],
      ],
    };
    await el.updateComplete;
    let detail: any = null;
    el.addEventListener('wick-corr-cell-click', (e: any) => (detail = e.detail));
    const cell = el.querySelector('[part~="cell--diagonal"]') as HTMLElement;
    cell.dispatchEvent(new Event('click', { bubbles: true }));
    expect(detail).not.toBeNull();
  });
});
