import { LitElement, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import '@wick/mini-chart';

/**
 * Perpetual swap funding rate snapshot.
 *
 * `rate` is the per-interval rate as a decimal (0.0001 = 0.01%).
 * `nextFundingAt` is a unix-ms timestamp.
 */
export interface FundingRate {
  symbol: string;
  rate: number;
  intervalHours: number;
  nextFundingAt: number;
  history?: number[];
}

export type FundingDirection = 'positive' | 'negative' | 'zero';

/**
 * `<wick-funding-rate>` — Headless perpetual funding-rate display.
 *
 * Owns its own 1-second tick loop for the countdown to next funding.
 * Optionally renders a `<wick-mini-chart>` of historical rates.
 *
 * @fires wick-funding-tick    - Every second while countdown is running. detail: { remaining, now }
 * @fires wick-funding-settled - When countdown crosses zero. detail: { symbol, rate }
 *
 * @csspart container        - Outer wrapper
 * @csspart symbol           - Instrument label
 * @csspart rate             - Current rate
 * @csspart rate--positive   - Compound part when rate > 0
 * @csspart rate--negative   - Compound part when rate < 0
 * @csspart rate--zero       - Compound part when rate === 0
 * @csspart countdown        - Countdown wrapper
 * @csspart countdown-label  - "Next funding" label
 * @csspart countdown-value  - HH:MM:SS value
 * @csspart sparkline        - The nested wick-mini-chart element
 *
 * @cssprop --wick-fr-positive-color - Colour for positive rates
 * @cssprop --wick-fr-negative-color - Colour for negative rates
 * @cssprop --wick-fr-zero-color     - Colour for zero rates
 */
@customElement('wick-funding-rate')
export class WickFundingRate extends LitElement {
  /** Funding-rate snapshot to display */
  @property({ type: Object })
  data: FundingRate = { symbol: '', rate: 0, intervalHours: 8, nextFundingAt: 0 };

  /** Show the countdown timer */
  @property({ type: Boolean, attribute: 'show-countdown' })
  showCountdown = false;

  /** Show the historical sparkline (requires `data.history` with >= 2 values) */
  @property({ type: Boolean, attribute: 'show-sparkline' })
  showSparkline = false;

  /** Decimal places for the rate percentage (default 4 → 0.0123%) */
  @property({ type: Number, attribute: 'rate-precision' })
  ratePrecision = 4;

  @state()
  private _now: number = Date.now();

  private _intervalId: ReturnType<typeof setInterval> | null = null;

  override connectedCallback(): void {
    super.connectedCallback();
    this._startTicking();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._stopTicking();
  }

  private _startTicking(): void {
    if (this._intervalId !== null) return;
    this._intervalId = setInterval(() => this._tick(), 1000);
  }

  private _stopTicking(): void {
    if (this._intervalId !== null) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  }

  private _tick(): void {
    const prevRemaining = this._remaining;
    this._now = Date.now();
    const newRemaining = this._remaining;

    this.dispatchEvent(
      new CustomEvent('wick-funding-tick', {
        detail: { remaining: newRemaining, now: this._now },
        bubbles: true,
        composed: true,
      }),
    );

    if (prevRemaining > 0 && newRemaining <= 0) {
      this.dispatchEvent(
        new CustomEvent('wick-funding-settled', {
          detail: { symbol: this.data.symbol, rate: this.data.rate },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  /** Remaining time in milliseconds until next funding (clamped to 0) */
  get _remaining(): number {
    return Math.max(0, this.data.nextFundingAt - this._now);
  }

  /** Sign-of-rate direction */
  get direction(): FundingDirection {
    if (this.data.rate > 0) return 'positive';
    if (this.data.rate < 0) return 'negative';
    return 'zero';
  }

  protected override createRenderRoot() {
    return this;
  }

  private _formatRate(value: number): string {
    const pct = value * 100;
    const sign = pct > 0 ? '+' : '';
    return `${sign}${pct.toFixed(this.ratePrecision)}%`;
  }

  private _formatCountdown(ms: number): string {
    const total = Math.floor(ms / 1000);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }

  protected override render() {
    const { symbol, rate, history } = this.data;
    const dir = this.direction;
    const remaining = this._remaining;

    return html`
      <div
        part="container"
        role="status"
        aria-live="polite"
        aria-label=${`${symbol} funding rate ${this._formatRate(rate)}`}
        data-direction=${dir}
      >
        <span part="symbol">${symbol}</span>
        <span part=${`rate rate--${dir}`}>${this._formatRate(rate)}</span>
        ${this.showCountdown
          ? html`
              <span part="countdown">
                <span part="countdown-label">Next funding</span>
                <span part="countdown-value">${this._formatCountdown(remaining)}</span>
              </span>
            `
          : nothing}
        ${this.showSparkline && history && history.length >= 2
          ? html`
              <wick-mini-chart
                part="sparkline"
                area
                .values=${history}
              ></wick-mini-chart>
            `
          : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wick-funding-rate': WickFundingRate;
  }
}
