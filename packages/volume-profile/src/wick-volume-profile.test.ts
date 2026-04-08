import { describe, it, expect, beforeEach } from 'vitest';
import './wick-volume-profile.js';
import { WickVolumeProfile } from './wick-volume-profile.js';

describe('<wick-volume-profile>', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  function mount(): WickVolumeProfile {
    const el = document.createElement('wick-volume-profile') as WickVolumeProfile;
    document.body.appendChild(el);
    return el;
  }

  const bars = [
    { price: 100, volume: 10 },
    { price: 110, volume: 50 }, // POC
    { price: 120, volume: 30 },
    { price: 130, volume: 20 },
    { price: 140, volume: 5 },
  ];

  it('registers the custom element', () => {
    expect(customElements.get('wick-volume-profile')).toBeDefined();
  });

  it('computeLevels returns null for empty data', () => {
    const el = mount();
    expect(el.computeLevels()).toBeNull();
  });

  it('POC is the highest-volume bar', () => {
    const el = mount();
    el.data = { bars };
    const levels = el.computeLevels();
    expect(levels?.poc).toBe(110);
  });

  it('VAH >= POC and VAL <= POC', () => {
    const el = mount();
    el.data = { bars };
    const levels = el.computeLevels();
    expect(levels!.vah).toBeGreaterThanOrEqual(levels!.poc);
    expect(levels!.val).toBeLessThanOrEqual(levels!.poc);
  });

  it('emits wick-vp-poc-change when data changes', async () => {
    const el = mount();
    let detail: any = null;
    el.addEventListener('wick-vp-poc-change', (e: any) => (detail = e.detail));
    el.data = { bars };
    await el.updateComplete;
    expect(detail?.poc).toBe(110);
  });
});
