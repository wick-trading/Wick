import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export interface PositionSizingResult {
  size: number;
  riskUsd: number;
  rewardUsd: number;
  rMultiple: number;
  riskRewardRatio: number;
}

/**
 * `<wick-position-sizer>` — Pure risk-based position sizing calculator.
 *
 * @fires wick-sizing-change - Whenever any input changes. detail: PositionSizingResult
 *
 * @csspart container
 * @csspart input-group
 * @csspart input-label
 * @csspart input-control
 * @csspart result
 * @csspart result-row
 * @csspart result-label
 * @csspart result-value
 * @csspart result-value--positive
 * @csspart result-value--negative
 */
@customElement('wick-position-sizer')
export class WickPositionSizer extends LitElement {
  @property({ type: Number, attribute: 'account-balance' }) accountBalance = 0;
  @property({ type: Number, attribute: 'risk-percent' }) riskPercent = 1;
  @property({ type: Number, attribute: 'entry-price' }) entryPrice = 0;
  @property({ type: Number, attribute: 'stop-price' }) stopPrice = 0;
  @property({ type: Number, attribute: 'target-price' }) targetPrice = 0;
  @property({ type: Number, attribute: 'tick-size' }) tickSize = 0;
  @property({ type: String }) quote = 'USD';

  protected override createRenderRoot() {
    return this;
  }

  compute(): PositionSizingResult {
    const distance = Math.abs(this.entryPrice - this.stopPrice);
    const riskUsd = (this.accountBalance * this.riskPercent) / 100;
    let size = distance > 0 ? riskUsd / distance : 0;
    if (this.tickSize > 0) size = Math.floor(size / this.tickSize) * this.tickSize;
    const rewardDistance = this.targetPrice > 0 ? Math.abs(this.targetPrice - this.entryPrice) : 0;
    const rewardUsd = rewardDistance * size;
    const rMultiple = riskUsd > 0 ? rewardUsd / riskUsd : 0;
    return {
      size,
      riskUsd,
      rewardUsd,
      rMultiple,
      riskRewardRatio: rMultiple,
    };
  }

  protected override updated() {
    const result = this.compute();
    this.dispatchEvent(
      new CustomEvent('wick-sizing-change', {
        detail: result,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _onInput(field: string, e: Event) {
    const value = parseFloat((e.target as HTMLInputElement).value);
    (this as any)[field] = isNaN(value) ? 0 : value;
  }

  private _fmt(n: number, d = 2): string {
    return n.toFixed(d);
  }

  protected override render() {
    const r = this.compute();
    const rrPositive = r.rMultiple >= 1;
    return html`
      <div part="container">
        <div part="input-group">
          <label part="input-label">Account ${this.quote}</label>
          <input part="input-control" type="number" .value=${String(this.accountBalance)}
            @input=${(e: Event) => this._onInput('accountBalance', e)} />
        </div>
        <div part="input-group">
          <label part="input-label">Risk %</label>
          <input part="input-control" type="number" step="0.1" .value=${String(this.riskPercent)}
            @input=${(e: Event) => this._onInput('riskPercent', e)} />
        </div>
        <div part="input-group">
          <label part="input-label">Entry</label>
          <input part="input-control" type="number" .value=${String(this.entryPrice)}
            @input=${(e: Event) => this._onInput('entryPrice', e)} />
        </div>
        <div part="input-group">
          <label part="input-label">Stop</label>
          <input part="input-control" type="number" .value=${String(this.stopPrice)}
            @input=${(e: Event) => this._onInput('stopPrice', e)} />
        </div>
        <div part="input-group">
          <label part="input-label">Target</label>
          <input part="input-control" type="number" .value=${String(this.targetPrice)}
            @input=${(e: Event) => this._onInput('targetPrice', e)} />
        </div>
        <div part="result">
          <div part="result-row">
            <span part="result-label">Size</span>
            <span part="result-value">${this._fmt(r.size, 4)}</span>
          </div>
          <div part="result-row">
            <span part="result-label">Risk</span>
            <span part="result-value">${this._fmt(r.riskUsd)} ${this.quote}</span>
          </div>
          <div part="result-row">
            <span part="result-label">Reward</span>
            <span part="result-value">${this._fmt(r.rewardUsd)} ${this.quote}</span>
          </div>
          <div part="result-row">
            <span part="result-label">R-Multiple</span>
            <span part=${`result-value result-value--${rrPositive ? 'positive' : 'negative'}`}>
              ${this._fmt(r.rMultiple)}R
            </span>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wick-position-sizer': WickPositionSizer;
  }
}
