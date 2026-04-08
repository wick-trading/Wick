import { describe, it, expect, beforeEach, vi } from 'vitest';
import './wick-economic-calendar.js';
import type { WickEconomicCalendar, EconomicEvent } from './wick-economic-calendar.js';

const NOW = 1_700_000_000_000;

describe('<wick-economic-calendar>', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    document.body.innerHTML = '';
  });

  function mount(): WickEconomicCalendar {
    const el = document.createElement('wick-economic-calendar') as WickEconomicCalendar;
    document.body.appendChild(el);
    return el;
  }

  const sample: EconomicEvent[] = [
    { id: 'a', title: 'CPI', country: 'US', impact: 'high', timestamp: NOW + 60_000 },
    { id: 'b', title: 'PPI', country: 'EU', impact: 'medium', timestamp: NOW + 120_000 },
    { id: 'c', title: 'Retail Sales', country: 'US', impact: 'low', timestamp: NOW + 180_000 },
  ];

  it('registers the custom element', () => {
    expect(customElements.get('wick-economic-calendar')).toBeDefined();
  });

  it('filters by min impact', () => {
    const el = mount();
    el.events = sample;
    el.minImpact = 'medium';
    expect(el.filteredEvents.length).toBe(2);
  });

  it('filters by region', () => {
    const el = mount();
    el.events = sample;
    el.filterRegion = 'US';
    expect(el.filteredEvents.length).toBe(2);
  });

  it('emits event-click on row click', async () => {
    const el = mount();
    el.events = sample;
    await el.updateComplete;
    let clicked: any = null;
    el.addEventListener('wick-event-click', (e: any) => (clicked = e.detail));
    const row = el.querySelector('[part~="event"]') as HTMLElement;
    row.click();
    expect(clicked?.id).toBe('a');
  });

  it('fires imminent event when timestamp is within window', async () => {
    const el = mount();
    el.imminentMinutes = 5;
    el.events = [
      { id: 'soon', title: 'X', country: 'US', impact: 'high', timestamp: NOW + 60_000 },
    ];
    await el.updateComplete;
    let imminent: any = null;
    el.addEventListener('wick-event-imminent', (e: any) => (imminent = e.detail));
    vi.advanceTimersByTime(1100);
    expect(imminent?.id).toBe('soon');
  });
});
