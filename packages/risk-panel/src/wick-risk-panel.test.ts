import { describe, it, expect, beforeEach } from 'vitest';
import './wick-risk-panel.js';
import type { WickRiskPanel } from './wick-risk-panel.js';

describe('<wick-risk-panel>', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  function mount(): WickRiskPanel {
    const el = document.createElement('wick-risk-panel') as WickRiskPanel;
    document.body.appendChild(el);
    return el;
  }

  it('registers the custom element', () => {
    expect(customElements.get('wick-risk-panel')).toBeDefined();
  });

  it('computes utilization correctly', () => {
    const el = mount();
    el.data = {
      equity: 10000,
      marginUsed: 4000,
      freeMargin: 6000,
      maintenanceMargin: 1000,
      leverage: 2,
      quote: 'USD',
    };
    expect(el.utilization).toBe(0.4);
    expect(el.level).toBe('warn');
  });

  it('returns danger level above threshold', () => {
    const el = mount();
    el.data = {
      equity: 1000,
      marginUsed: 800,
      freeMargin: 200,
      maintenanceMargin: 100,
      leverage: 5,
      quote: 'USD',
    };
    expect(el.level).toBe('danger');
  });

  it('emits threshold cross event when level changes', async () => {
    const el = mount();
    let detail: any = null;
    el.addEventListener('wick-risk-threshold-cross', (e: any) => (detail = e.detail));
    // Start safe — no event fired (initial state matches)
    el.data = {
      equity: 1000,
      marginUsed: 100,
      freeMargin: 900,
      maintenanceMargin: 50,
      leverage: 1,
      quote: 'USD',
    };
    await el.updateComplete;
    // Now jump to danger
    el.data = { ...el.data, marginUsed: 800 };
    await el.updateComplete;
    expect(detail?.level).toBe('danger');
  });

  it('renders health-fill with correct width', async () => {
    const el = mount();
    el.data = {
      equity: 1000,
      marginUsed: 300,
      freeMargin: 700,
      maintenanceMargin: 50,
      leverage: 1,
      quote: 'USD',
    };
    await el.updateComplete;
    const fill = el.querySelector('[part~="health-fill"]') as HTMLElement;
    expect(fill).not.toBeNull();
    expect(fill.style.width).toBe('30.0%');
  });
});
