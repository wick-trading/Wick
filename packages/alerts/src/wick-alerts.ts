import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

export type AlertOp =
  | '>'
  | '<'
  | '>='
  | '<='
  | '=='
  | 'crosses-above'
  | 'crosses-below';

export interface AlertRule {
  id: string;
  symbol: string;
  metric: 'price' | 'volume' | 'change24h' | string;
  op: AlertOp;
  value: number;
  mode: 'once' | 'recurring';
  enabled?: boolean;
}

interface MetricUpdate {
  symbol: string;
  metric: string;
  value: number;
}

/**
 * `<wick-alerts>` — Price/condition alerts engine + display.
 *
 * @fires wick-alert-trigger - { rule, observedValue, timestamp }
 * @fires wick-alert-create  - { rule }
 * @fires wick-alert-delete  - { id }
 *
 * @csspart container
 * @csspart list
 * @csspart rule
 * @csspart rule--triggered
 * @csspart rule-symbol
 * @csspart rule-condition
 * @csspart rule-value
 * @csspart rule-delete
 */
@customElement('wick-alerts')
export class WickAlerts extends LitElement {
  @property({ type: Array }) rules: AlertRule[] = [];

  @state() private _triggered = new Set<string>();
  private _lastValues = new Map<string, number>();

  protected override createRenderRoot() {
    return this;
  }

  addRule(rule: AlertRule): void {
    this.rules = [...this.rules, rule];
    this.dispatchEvent(
      new CustomEvent('wick-alert-create', { detail: { rule }, bubbles: true, composed: true }),
    );
  }

  deleteRule(id: string): void {
    this.rules = this.rules.filter((r) => r.id !== id);
    this._triggered.delete(id);
    this.dispatchEvent(
      new CustomEvent('wick-alert-delete', { detail: { id }, bubbles: true, composed: true }),
    );
  }

  /** Push a metric value. Evaluates all matching rules. */
  applyUpdate(u: MetricUpdate): void {
    const key = `${u.symbol}:${u.metric}`;
    const prev = this._lastValues.get(key);
    this._lastValues.set(key, u.value);

    for (const rule of this.rules) {
      if (rule.enabled === false) continue;
      if (rule.symbol !== u.symbol) continue;
      if (rule.metric !== u.metric) continue;
      if (rule.mode === 'once' && this._triggered.has(rule.id)) continue;

      if (this._matches(rule, u.value, prev)) {
        this._triggered.add(rule.id);
        this.requestUpdate();
        this.dispatchEvent(
          new CustomEvent('wick-alert-trigger', {
            detail: { rule, observedValue: u.value, timestamp: Date.now() },
            bubbles: true,
            composed: true,
          }),
        );
      }
    }
  }

  private _matches(rule: AlertRule, value: number, prev: number | undefined): boolean {
    switch (rule.op) {
      case '>':
        return value > rule.value;
      case '<':
        return value < rule.value;
      case '>=':
        return value >= rule.value;
      case '<=':
        return value <= rule.value;
      case '==':
        return value === rule.value;
      case 'crosses-above':
        return prev !== undefined && prev <= rule.value && value > rule.value;
      case 'crosses-below':
        return prev !== undefined && prev >= rule.value && value < rule.value;
    }
  }

  protected override render() {
    return html`
      <div part="container">
        <div part="list">
          ${this.rules.map((r) => {
            const triggered = this._triggered.has(r.id);
            return html`
              <div part=${`rule${triggered ? ' rule--triggered' : ''}`}>
                <span part="rule-symbol">${r.symbol}</span>
                <span part="rule-condition">${r.metric} ${r.op}</span>
                <span part="rule-value">${r.value}</span>
                <button part="rule-delete" @click=${() => this.deleteRule(r.id)}>×</button>
              </div>
            `;
          })}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wick-alerts': WickAlerts;
  }
}
