import { describe, it, expect, beforeEach } from 'vitest';
import './wick-alerts.js';
import type { WickAlerts, AlertRule } from './wick-alerts.js';

describe('<wick-alerts>', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  function mount(): WickAlerts {
    const el = document.createElement('wick-alerts') as WickAlerts;
    document.body.appendChild(el);
    return el;
  }

  const rule = (id: string, op: any, value: number, mode: 'once' | 'recurring' = 'once'): AlertRule => ({
    id,
    symbol: 'BTC/USD',
    metric: 'price',
    op,
    value,
    mode,
  });

  it('registers the custom element', () => {
    expect(customElements.get('wick-alerts')).toBeDefined();
  });

  it('triggers a > rule when value exceeds', () => {
    const el = mount();
    el.rules = [rule('1', '>', 70_000)];
    let triggered: any = null;
    el.addEventListener('wick-alert-trigger', (e: any) => (triggered = e.detail));
    el.applyUpdate({ symbol: 'BTC/USD', metric: 'price', value: 70_500 });
    expect(triggered?.observedValue).toBe(70_500);
  });

  it('triggers crosses-above only on the crossing tick', () => {
    const el = mount();
    el.rules = [rule('1', 'crosses-above', 70_000, 'recurring')];
    let count = 0;
    el.addEventListener('wick-alert-trigger', () => count++);
    el.applyUpdate({ symbol: 'BTC/USD', metric: 'price', value: 69_900 }); // below
    el.applyUpdate({ symbol: 'BTC/USD', metric: 'price', value: 70_100 }); // crosses
    el.applyUpdate({ symbol: 'BTC/USD', metric: 'price', value: 70_200 }); // already above
    expect(count).toBe(1);
  });

  it('once mode fires only once', () => {
    const el = mount();
    el.rules = [rule('1', '>', 100, 'once')];
    let count = 0;
    el.addEventListener('wick-alert-trigger', () => count++);
    el.applyUpdate({ symbol: 'BTC/USD', metric: 'price', value: 200 });
    el.applyUpdate({ symbol: 'BTC/USD', metric: 'price', value: 300 });
    expect(count).toBe(1);
  });

  it('addRule and deleteRule emit events', () => {
    const el = mount();
    let createdId: any = null;
    let deletedId: any = null;
    el.addEventListener('wick-alert-create', (e: any) => (createdId = e.detail.rule.id));
    el.addEventListener('wick-alert-delete', (e: any) => (deletedId = e.detail.id));
    el.addRule(rule('1', '>', 100));
    expect(createdId).toBe('1');
    el.deleteRule('1');
    expect(deletedId).toBe('1');
    expect(el.rules.length).toBe(0);
  });
});
