import { LitElement, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import '@wick/mini-chart';

export interface OpenInterestSample {
  t: number;
  value: number;
}

export interface OpenInterestData {
  symbol: string;
  value: number;
  samples: OpenInterestSample[];
}

/**
 * `<wick-open-interest>` — OI display with current value + historical sparkline.
 * Composes `<wick-mini-chart>` for the history visualization.
 *
 * @fires wick-oi-change - { symbol, prev, value, deltaPct }
 *
 * @csspart container
 * @csspart current
 * @csspart current-label
 * @csspart current-value
 * @csspart chart
 */
@customElement('wick-open-interest')
export class WickOpenInterest extends LitElement {
  @property({ type: Object }) data: OpenInterestData = { symbol: '', value: 0, samples: [] };
  @property({ type: Number }) lookback = 288;
  @property({ type: Number, attribute: 'flash-threshold' }) flashThreshold = 0.01;
  @property({ type: Boolean, attribute: 'show-chart' }) showChart = false;

  @state() private _flashing = false;
  private _flashTimer: ReturnType<typeof setTimeout> | null = null;
  private _lastValue = 0;

  protected override createRenderRoot() {
    return this;
  }

  pushSample(sample: OpenInterestSample): void {
    const samples = [...this.data.samples, sample].slice(-this.lookback);
    const prev = this.data.value;
    this.data = { ...this.data, value: sample.value, samples };
    this._maybeFlash(prev, sample.value);
  }

  protected override willUpdate(changed: Map<string, unknown>): void {
    if (changed.has('data')) {
      const prev = this._lastValue;
      this._lastValue = this.data.value;
      this._maybeFlash(prev, this.data.value);
    }
  }

  private _maybeFlash(prev: number, curr: number): void {
    if (prev === 0) return;
    const delta = (curr - prev) / prev;
    if (Math.abs(delta) >= this.flashThreshold) {
      this._flashing = true;
      if (this._flashTimer) clearTimeout(this._flashTimer);
      this._flashTimer = setTimeout(() => (this._flashing = false), 400);
      this.dispatchEvent(
        new CustomEvent('wick-oi-change', {
          detail: { symbol: this.data.symbol, prev, value: curr, deltaPct: delta },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  private _formatValue(n: number): string {
    if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
    if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
    return n.toFixed(0);
  }

  protected override render() {
    const series = this.data.samples.map((s) => s.value);
    return html`
      <div part="container" data-flashing=${this._flashing ? 'true' : 'false'}>
        <div part="current">
          <span part="current-label">${this.data.symbol} Open Interest</span>
          <span part="current-value">${this._formatValue(this.data.value)}</span>
        </div>
        ${this.showChart && series.length >= 2
          ? html`<wick-mini-chart part="chart" area .values=${series}></wick-mini-chart>`
          : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wick-open-interest': WickOpenInterest;
  }
}
