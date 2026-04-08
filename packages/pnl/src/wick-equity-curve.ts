import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '@wick/mini-chart';

export interface EquityPoint {
  timestamp: number;
  equity: number;
}

export type TimeFrame = '1H' | '1D' | '1W' | '1M' | 'ALL';

const TF_MS: Record<TimeFrame, number> = {
  '1H': 60 * 60 * 1000,
  '1D': 24 * 60 * 60 * 1000,
  '1W': 7 * 24 * 60 * 60 * 1000,
  '1M': 30 * 24 * 60 * 60 * 1000,
  'ALL': Infinity,
};

/**
 * `<wick-equity-curve>` — Account equity over time. Composes `<wick-mini-chart>`
 * for the visual.
 *
 * @fires wick-pnl-timeframe-change - { timeFrame }
 *
 * @csspart container
 * @csspart canvas
 * @csspart timeframe-bar
 * @csspart timeframe-btn
 * @csspart timeframe-btn--active
 */
@customElement('wick-equity-curve')
export class WickEquityCurve extends LitElement {
  @property({ type: Array }) data: EquityPoint[] = [];
  @property({ type: String, attribute: 'time-frame' }) timeFrame: TimeFrame = '1D';
  @property({ type: Boolean, attribute: 'show-drawdown' }) showDrawdown = false;
  @property({ type: Boolean, attribute: 'show-controls' }) showControls = false;

  protected override createRenderRoot() {
    return this;
  }

  appendPoint(p: EquityPoint): void {
    this.data = [...this.data, p];
  }

  get filteredPoints(): EquityPoint[] {
    if (this.timeFrame === 'ALL' || this.data.length === 0) return this.data;
    const cutoff = Date.now() - TF_MS[this.timeFrame];
    return this.data.filter((p) => p.timestamp >= cutoff);
  }

  get peakDrawdown(): number {
    let peak = -Infinity;
    let maxDd = 0;
    for (const p of this.filteredPoints) {
      if (p.equity > peak) peak = p.equity;
      const dd = (peak - p.equity) / peak;
      if (dd > maxDd) maxDd = dd;
    }
    return maxDd;
  }

  setTimeFrame(tf: TimeFrame): void {
    this.timeFrame = tf;
    this.dispatchEvent(
      new CustomEvent('wick-pnl-timeframe-change', {
        detail: { timeFrame: tf },
        bubbles: true,
        composed: true,
      }),
    );
  }

  protected override render() {
    const points = this.filteredPoints;
    const series = points.map((p) => p.equity);
    const tfs: TimeFrame[] = ['1H', '1D', '1W', '1M', 'ALL'];
    return html`
      <div part="container">
        ${this.showControls
          ? html`
              <div part="timeframe-bar">
                ${tfs.map(
                  (tf) => html`
                    <button
                      part=${`timeframe-btn${tf === this.timeFrame ? ' timeframe-btn--active' : ''}`}
                      @click=${() => this.setTimeFrame(tf)}
                    >
                      ${tf}
                    </button>
                  `,
                )}
              </div>
            `
          : ''}
        ${series.length >= 2
          ? html`<wick-mini-chart part="canvas" area smooth .values=${series}></wick-mini-chart>`
          : html`<div part="canvas"></div>`}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wick-equity-curve': WickEquityCurve;
  }
}
