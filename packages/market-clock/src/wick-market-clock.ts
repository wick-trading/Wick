import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

export interface MarketSession {
  open: string;
  close: string;
  days: number[];
}

export interface MarketDef {
  id: string;
  label: string;
  timezone: string;
  sessions?: MarketSession[];
  holidays?: string[];
  alwaysOpen?: boolean;
}

export type MarketState = 'open' | 'closed';

interface MarketStatus {
  id: string;
  label: string;
  state: MarketState;
  countdownMs: number;
}

/**
 * `<wick-market-clock>` — Multi-market session clock with countdowns.
 *
 * @fires wick-market-state-change - { id, state }
 *
 * @csspart container
 * @csspart market
 * @csspart market--open
 * @csspart market--closed
 * @csspart market-label
 * @csspart market-state
 * @csspart market-countdown
 * @csspart indicator
 * @csspart indicator--open
 * @csspart indicator--closed
 */
@customElement('wick-market-clock')
export class WickMarketClock extends LitElement {
  @property({ type: Array }) markets: MarketDef[] = [];

  @state() private _now = Date.now();
  private _intervalId: ReturnType<typeof setInterval> | null = null;
  private _lastStates = new Map<string, MarketState>();

  override connectedCallback(): void {
    super.connectedCallback();
    this._intervalId = setInterval(() => (this._now = Date.now()), 1000);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._intervalId !== null) clearInterval(this._intervalId);
    this._intervalId = null;
  }

  protected override createRenderRoot() {
    return this;
  }

  /** Get current status for a market — exposed for tests and external use. */
  statusFor(market: MarketDef, now: number = this._now): MarketStatus {
    if (market.alwaysOpen) {
      return { id: market.id, label: market.label, state: 'open', countdownMs: 0 };
    }
    const date = new Date(now);
    const today = date.toISOString().slice(0, 10);
    if (market.holidays?.includes(today)) {
      return {
        id: market.id,
        label: market.label,
        state: 'closed',
        countdownMs: this._msUntilNextDay(now),
      };
    }
    const day = date.getUTCDay();
    const session = market.sessions?.find((s) => s.days.includes(day));
    if (!session) {
      return {
        id: market.id,
        label: market.label,
        state: 'closed',
        countdownMs: this._msUntilNextDay(now),
      };
    }
    const minutesNow = date.getUTCHours() * 60 + date.getUTCMinutes();
    const open = this._parseTime(session.open);
    const close = this._parseTime(session.close);
    const isOpen = minutesNow >= open && minutesNow < close;
    const target = isOpen ? close : open >= minutesNow ? open : open + 1440;
    const remainingMs = (target - minutesNow) * 60_000 - date.getUTCSeconds() * 1000;
    return {
      id: market.id,
      label: market.label,
      state: isOpen ? 'open' : 'closed',
      countdownMs: Math.max(0, remainingMs),
    };
  }

  private _parseTime(t: string): number {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  }

  private _msUntilNextDay(now: number): number {
    const d = new Date(now);
    d.setUTCHours(24, 0, 0, 0);
    return d.getTime() - now;
  }

  private _formatCountdown(ms: number): string {
    const total = Math.floor(ms / 1000);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }

  protected override updated() {
    for (const m of this.markets) {
      const status = this.statusFor(m);
      const last = this._lastStates.get(m.id);
      if (last !== undefined && last !== status.state) {
        this.dispatchEvent(
          new CustomEvent('wick-market-state-change', {
            detail: { id: m.id, state: status.state },
            bubbles: true,
            composed: true,
          }),
        );
      }
      this._lastStates.set(m.id, status.state);
    }
  }

  protected override render() {
    return html`
      <div part="container">
        ${this.markets.map((m) => {
          const s = this.statusFor(m);
          return html`
            <div part=${`market market--${s.state}`}>
              <span part=${`indicator indicator--${s.state}`} aria-hidden="true"></span>
              <span part="market-label">${s.label}</span>
              <span part="market-state">${s.state}</span>
              ${m.alwaysOpen
                ? ''
                : html`<span part="market-countdown">${this._formatCountdown(s.countdownMs)}</span>`}
            </div>
          `;
        })}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wick-market-clock': WickMarketClock;
  }
}
