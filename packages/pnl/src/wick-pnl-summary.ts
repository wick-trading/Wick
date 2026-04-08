import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export interface PnlSummaryData {
  realizedPnl: number;
  unrealizedPnl: number;
  dailyPnl: number;
  totalEquity: number;
  currency?: string;
}

/**
 * `<wick-pnl-summary>` — Stat tiles for realized/unrealized/daily/total P&L.
 *
 * @csspart summary-grid
 * @csspart stat-tile
 * @csspart stat-label
 * @csspart stat-value
 * @csspart stat-value--positive
 * @csspart stat-value--negative
 */
@customElement('wick-pnl-summary')
export class WickPnlSummary extends LitElement {
  @property({ type: Object }) data: PnlSummaryData = {
    realizedPnl: 0,
    unrealizedPnl: 0,
    dailyPnl: 0,
    totalEquity: 0,
  };

  @property({ type: Boolean, attribute: 'show-realized' }) showRealized = true;
  @property({ type: Boolean, attribute: 'show-unrealized' }) showUnrealized = true;
  @property({ type: Boolean, attribute: 'show-daily' }) showDaily = true;
  @property({ type: Boolean, attribute: 'show-total' }) showTotal = true;

  protected override createRenderRoot() {
    return this;
  }

  /** Merge a partial update into the current data. */
  patch(update: Partial<PnlSummaryData>): this {
    this.data = { ...this.data, ...update };
    return this;
  }

  private _fmt(n: number): string {
    const sign = n > 0 ? '+' : '';
    return `${sign}${n.toFixed(2)}`;
  }

  private _tile(label: string, value: number, alwaysNeutral = false) {
    const cls = alwaysNeutral
      ? ''
      : value > 0
        ? 'stat-value--positive'
        : value < 0
          ? 'stat-value--negative'
          : '';
    return html`
      <div part="stat-tile">
        <span part="stat-label">${label}</span>
        <span part=${`stat-value ${cls}`.trim()}>
          ${this._fmt(value)} ${this.data.currency ?? ''}
        </span>
      </div>
    `;
  }

  protected override render() {
    return html`
      <div part="summary-grid">
        ${this.showRealized ? this._tile('Realized', this.data.realizedPnl) : ''}
        ${this.showUnrealized ? this._tile('Unrealized', this.data.unrealizedPnl) : ''}
        ${this.showDaily ? this._tile('Daily', this.data.dailyPnl) : ''}
        ${this.showTotal ? this._tile('Equity', this.data.totalEquity, true) : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wick-pnl-summary': WickPnlSummary;
  }
}
