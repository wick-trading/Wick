import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export interface RiskData {
  equity: number;
  marginUsed: number;
  freeMargin: number;
  maintenanceMargin: number;
  leverage: number;
  quote: string;
}

export type RiskLevel = 'safe' | 'warn' | 'danger';

/**
 * `<wick-risk-panel>` — Account risk display: equity, margin, leverage,
 * health bar with configurable thresholds.
 *
 * @fires wick-risk-threshold-cross - { level: 'safe' | 'warn' | 'danger', utilization: number }
 *
 * @csspart container
 * @csspart stat
 * @csspart stat-label
 * @csspart stat-value
 * @csspart health-bar
 * @csspart health-fill
 * @csspart health-fill--safe
 * @csspart health-fill--warn
 * @csspart health-fill--danger
 */
@customElement('wick-risk-panel')
export class WickRiskPanel extends LitElement {
  @property({ type: Object }) data: RiskData = {
    equity: 0,
    marginUsed: 0,
    freeMargin: 0,
    maintenanceMargin: 0,
    leverage: 0,
    quote: 'USD',
  };

  @property({ type: Number, attribute: 'warn-threshold' }) warnThreshold = 0.4;
  @property({ type: Number, attribute: 'danger-threshold' }) dangerThreshold = 0.7;

  private _lastLevel: RiskLevel = 'safe';

  protected override createRenderRoot() {
    return this;
  }

  get utilization(): number {
    if (this.data.equity <= 0) return 0;
    return Math.min(1, this.data.marginUsed / this.data.equity);
  }

  get level(): RiskLevel {
    const u = this.utilization;
    if (u >= this.dangerThreshold) return 'danger';
    if (u >= this.warnThreshold) return 'warn';
    return 'safe';
  }

  protected override updated() {
    const next = this.level;
    if (next !== this._lastLevel) {
      this._lastLevel = next;
      this.dispatchEvent(
        new CustomEvent('wick-risk-threshold-cross', {
          detail: { level: next, utilization: this.utilization },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  private _fmt(n: number, d = 2): string {
    return n.toFixed(d);
  }

  protected override render() {
    const { equity, marginUsed, freeMargin, maintenanceMargin, leverage, quote } = this.data;
    const u = this.utilization;
    const lvl = this.level;
    return html`
      <div part="container" data-level=${lvl}>
        <div part="stat">
          <span part="stat-label">Equity</span>
          <span part="stat-value">${this._fmt(equity)} ${quote}</span>
        </div>
        <div part="stat">
          <span part="stat-label">Margin Used</span>
          <span part="stat-value">${this._fmt(marginUsed)} ${quote}</span>
        </div>
        <div part="stat">
          <span part="stat-label">Free</span>
          <span part="stat-value">${this._fmt(freeMargin)} ${quote}</span>
        </div>
        <div part="stat">
          <span part="stat-label">Maint.</span>
          <span part="stat-value">${this._fmt(maintenanceMargin)} ${quote}</span>
        </div>
        <div part="stat">
          <span part="stat-label">Leverage</span>
          <span part="stat-value">${this._fmt(leverage, 1)}x</span>
        </div>
        <div part="health-bar">
          <div
            part=${`health-fill health-fill--${lvl}`}
            style=${`width: ${(u * 100).toFixed(1)}%`}
          ></div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wick-risk-panel': WickRiskPanel;
  }
}
