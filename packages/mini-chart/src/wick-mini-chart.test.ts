import { describe, it, expect, afterEach } from 'vitest';
import { WickMiniChart } from './wick-mini-chart.js';

// Ensure custom element is registered
if (!customElements.get('wick-mini-chart')) {
  customElements.define('wick-mini-chart', WickMiniChart);
}

function createElement(): WickMiniChart {
  const el = document.createElement('wick-mini-chart') as WickMiniChart;
  document.body.appendChild(el);
  return el;
}

describe('WickMiniChart', () => {
  let el: WickMiniChart;

  afterEach(() => {
    el?.remove();
  });

  it('registers as a custom element', () => {
    expect(customElements.get('wick-mini-chart')).toBeDefined();
  });

  it('renders an empty svg when no values are set', async () => {
    el = createElement();
    await el.updateComplete;

    const svg = el.querySelector('[part="svg"]');
    expect(svg).toBeTruthy();

    const line = el.querySelector('[part~="line"]');
    expect(line).toBeFalsy();
  });

  it('renders a line path when values are set', async () => {
    el = createElement();
    el.values = [1, 2, 3, 4, 5];
    await el.updateComplete;

    const line = el.querySelector('[part~="line"]') as SVGPathElement | null;
    expect(line).toBeTruthy();
    const d = line?.getAttribute('d') ?? '';
    expect(d).toMatch(/^M /);
    // 5 points = 1 moveTo + 4 lineTo segments
    expect((d.match(/L /g) ?? []).length).toBe(4);
  });

  it('parses values from a comma-separated attribute', async () => {
    el = createElement();
    el.setAttribute('values', '10, 20, 30, 40');
    await el.updateComplete;

    expect(el.values).toEqual([10, 20, 30, 40]);
    const line = el.querySelector('[part~="line"]');
    expect(line).toBeTruthy();
  });

  it('ignores non-numeric values in the attribute string', async () => {
    el = createElement();
    el.setAttribute('values', '1, foo, 3, NaN, 5');
    await el.updateComplete;

    expect(el.values).toEqual([1, 3, 5]);
  });

  it('derives direction up when last > first', async () => {
    el = createElement();
    el.values = [10, 15, 20];
    await el.updateComplete;

    expect(el.direction).toBe('up');
    const line = el.querySelector('[part~="line--up"]');
    expect(line).toBeTruthy();
  });

  it('derives direction down when last < first', async () => {
    el = createElement();
    el.values = [20, 15, 10];
    await el.updateComplete;

    expect(el.direction).toBe('down');
    const line = el.querySelector('[part~="line--down"]');
    expect(line).toBeTruthy();
  });

  it('derives direction flat when first === last', async () => {
    el = createElement();
    el.values = [10, 15, 10];
    await el.updateComplete;

    expect(el.direction).toBe('flat');
    const line = el.querySelector('[part~="line--flat"]');
    expect(line).toBeTruthy();
  });

  it('renders an area path when `area` is set', async () => {
    el = createElement();
    el.area = true;
    el.values = [1, 2, 3, 4];
    await el.updateComplete;

    const area = el.querySelector('[part~="area"]') as SVGPathElement | null;
    expect(area).toBeTruthy();
    const d = area?.getAttribute('d') ?? '';
    expect(d).toMatch(/Z$/); // closed path
  });

  it('renders a last-point dot when `dot` is set', async () => {
    el = createElement();
    el.dot = true;
    el.values = [1, 2, 3, 4];
    await el.updateComplete;

    const dot = el.querySelector('[part~="dot--last"]');
    expect(dot).toBeTruthy();
  });

  it('renders min and max markers when `show-extremes` is set', async () => {
    el = createElement();
    el.showExtremes = true;
    el.values = [3, 10, 5, 1, 7];
    await el.updateComplete;

    const minDot = el.querySelector('[part~="dot--min"]');
    const maxDot = el.querySelector('[part~="dot--max"]');
    expect(minDot).toBeTruthy();
    expect(maxDot).toBeTruthy();
  });

  it('uses cubic bezier segments when smoothing is enabled', async () => {
    el = createElement();
    el.smooth = true;
    el.values = [1, 2, 3, 4, 5];
    await el.updateComplete;

    const line = el.querySelector('[part~="line"]') as SVGPathElement | null;
    const d = line?.getAttribute('d') ?? '';
    expect(d).toMatch(/ C /); // catmull-rom → bezier produces C segments
  });

  it('renders a baseline line when the baseline falls inside the data range', async () => {
    el = createElement();
    el.values = [10, 20, 30];
    el.baseline = 20;
    await el.updateComplete;

    const baseline = el.querySelector('[part="baseline"]');
    expect(baseline).toBeTruthy();
  });

  it('omits the baseline when outside the data range', async () => {
    el = createElement();
    el.values = [10, 20, 30];
    el.baseline = 999;
    await el.updateComplete;

    const baseline = el.querySelector('[part="baseline"]');
    expect(baseline).toBeFalsy();
  });

  it('renders a single point without crashing', async () => {
    el = createElement();
    el.values = [42];
    await el.updateComplete;

    const line = el.querySelector('[part~="line"]');
    expect(line).toBeTruthy();
  });

  it('sets default host dimensions when none are provided', async () => {
    el = createElement();
    el.values = [1, 2, 3];
    await el.updateComplete;

    expect(el.style.display).toBe('inline-block');
    expect(el.style.width).toBe('100px');
    expect(el.style.height).toBe('30px');
  });
});
