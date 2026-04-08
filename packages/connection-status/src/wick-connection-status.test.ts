import { describe, it, expect, beforeEach, vi } from 'vitest';
import './wick-connection-status.js';
import type { WickConnectionStatus } from './wick-connection-status.js';

const FIXED = 1_700_000_000_000;

describe('<wick-connection-status>', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED);
    document.body.innerHTML = '';
  });

  function mount(): WickConnectionStatus {
    const el = document.createElement('wick-connection-status') as WickConnectionStatus;
    document.body.appendChild(el);
    return el;
  }

  it('registers the custom element', () => {
    expect(customElements.get('wick-connection-status')).toBeDefined();
  });

  it('renders the indicator with the current state', async () => {
    const el = mount();
    el.label = 'BTC stream';
    el.state = 'connected';
    await el.updateComplete;
    expect(el.querySelector('[part="container"]')?.getAttribute('data-state')).toBe('connected');
    expect(el.querySelector('[part="label"]')?.textContent).toBe('BTC stream');
  });

  it('emits state-change when setState is called', async () => {
    const el = mount();
    let detail: any = null;
    el.addEventListener('wick-conn-state-change', (e: any) => (detail = e.detail));
    el.setState('connected');
    expect(detail).toEqual({ prev: 'connecting', next: 'connected' });
  });

  it('switches to stale and fires wick-conn-stale after staleAfterMs', async () => {
    const el = mount();
    el.staleAfterMs = 1000;
    el.setState('connected');
    el.markTick(FIXED);
    let staleDetail: any = null;
    el.addEventListener('wick-conn-stale', (e: any) => (staleDetail = e.detail));
    vi.setSystemTime(FIXED + 2000);
    vi.advanceTimersByTime(600);
    expect(el.state).toBe('stale');
    expect(staleDetail.sinceMs).toBeGreaterThanOrEqual(2000);
  });

  it('reportLatency averages over a rolling window', () => {
    const el = mount();
    el.latencyWindow = 3;
    el.reportLatency(10);
    el.reportLatency(20);
    el.reportLatency(30);
    el.reportLatency(40);
    // window of 3 → [20,30,40] avg=30
    expect((el as any)._latencyAvg).toBe(30);
  });
});
