import { LitElement, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

export type ConnectionState =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'error'
  | 'stale';

/**
 * `<wick-connection-status>` — Headless WebSocket health indicator.
 *
 * Caller pushes lifecycle events (`setState`, `markTick`, `reportLatency`).
 * Component owns its own stale-detection timer and emits stale events when
 * no tick is received within `stale-after-ms`.
 *
 * @fires wick-conn-state-change - { prev, next }
 * @fires wick-conn-stale        - { sinceMs }
 *
 * @csspart container
 * @csspart indicator
 * @csspart indicator--connecting
 * @csspart indicator--connected
 * @csspart indicator--disconnected
 * @csspart indicator--error
 * @csspart indicator--stale
 * @csspart label
 * @csspart latency
 * @csspart last-tick
 */
@customElement('wick-connection-status')
export class WickConnectionStatus extends LitElement {
  @property({ type: String }) label = '';
  @property({ type: String }) state: ConnectionState = 'connecting';
  @property({ type: Number, attribute: 'stale-after-ms' }) staleAfterMs = 3000;
  @property({ type: Boolean, attribute: 'show-latency' }) showLatency = false;
  @property({ type: Boolean, attribute: 'show-last-tick' }) showLastTick = false;
  @property({ type: Number, attribute: 'latency-window' }) latencyWindow = 10;

  @state() private _lastTickAt = 0;
  @state() private _latencyAvg: number | null = null;
  @state() private _now = Date.now();

  private _latencies: number[] = [];
  private _checkId: ReturnType<typeof setInterval> | null = null;
  private _wasStale = false;

  override connectedCallback(): void {
    super.connectedCallback();
    this._checkId = setInterval(() => this._checkStale(), 500);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._checkId !== null) clearInterval(this._checkId);
    this._checkId = null;
  }

  setState(next: ConnectionState): void {
    const prev = this.state;
    if (prev === next) return;
    this.state = next;
    if (next === 'connected') this._wasStale = false;
    this.dispatchEvent(
      new CustomEvent('wick-conn-state-change', {
        detail: { prev, next },
        bubbles: true,
        composed: true,
      }),
    );
  }

  markTick(at: number = Date.now()): void {
    this._lastTickAt = at;
    this._now = at;
    if (this._wasStale) {
      this._wasStale = false;
      this.setState('connected');
    }
  }

  reportLatency(ms: number): void {
    this._latencies.push(ms);
    if (this._latencies.length > this.latencyWindow) this._latencies.shift();
    const sum = this._latencies.reduce((a, b) => a + b, 0);
    this._latencyAvg = sum / this._latencies.length;
  }

  private _checkStale(): void {
    this._now = Date.now();
    if (this.state !== 'connected') return;
    if (this._lastTickAt === 0) return;
    const since = this._now - this._lastTickAt;
    if (since > this.staleAfterMs && !this._wasStale) {
      this._wasStale = true;
      this.setState('stale');
      this.dispatchEvent(
        new CustomEvent('wick-conn-stale', {
          detail: { sinceMs: since },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  protected override createRenderRoot() {
    return this;
  }

  protected override render() {
    const lastAge = this._lastTickAt ? this._now - this._lastTickAt : null;
    return html`
      <div part="container" data-state=${this.state}>
        <span part=${`indicator indicator--${this.state}`} aria-hidden="true"></span>
        ${this.label ? html`<span part="label">${this.label}</span>` : nothing}
        ${this.showLatency && this._latencyAvg !== null
          ? html`<span part="latency">${Math.round(this._latencyAvg)}ms</span>`
          : nothing}
        ${this.showLastTick && lastAge !== null
          ? html`<span part="last-tick">${Math.floor(lastAge / 1000)}s</span>`
          : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wick-connection-status': WickConnectionStatus;
  }
}
