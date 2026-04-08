import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

export interface LiquidationEvent {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  price: number;
  size: number;
  sizeUsd?: number;
  exchange?: string;
  timestamp: number;
}

/**
 * `<wick-liquidation-feed>` — Streaming liquidation events.
 *
 * @fires wick-liquidation-row-click - { id }
 *
 * @csspart container
 * @csspart row
 * @csspart row--long
 * @csspart row--short
 * @csspart row--whale
 * @csspart symbol
 * @csspart side
 * @csspart size
 * @csspart price
 * @csspart exchange
 * @csspart time
 */
@customElement('wick-liquidation-feed')
export class WickLiquidationFeed extends LitElement {
  @property({ type: Number, attribute: 'max-events' }) maxEvents = 100;
  @property({ type: Number, attribute: 'min-size-usd' }) minSizeUsd = 0;
  @property({ type: Number, attribute: 'whale-size-usd' }) whaleSizeUsd = 100_000;

  @state() private _events: LiquidationEvent[] = [];

  protected override createRenderRoot() {
    return this;
  }

  addEvent(e: LiquidationEvent): void {
    if (e.sizeUsd !== undefined && e.sizeUsd < this.minSizeUsd) return;
    this._events = [e, ...this._events].slice(0, this.maxEvents);
  }

  clear(): void {
    this._events = [];
  }

  get events(): readonly LiquidationEvent[] {
    return this._events;
  }

  private _onClick(id: string) {
    this.dispatchEvent(
      new CustomEvent('wick-liquidation-row-click', {
        detail: { id },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _formatTime(ts: number): string {
    const d = new Date(ts);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
  }

  private _formatUsd(n?: number): string {
    if (n === undefined) return '';
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
    return `$${n.toFixed(0)}`;
  }

  protected override render() {
    return html`
      <div part="container">
        ${this._events.map((e) => {
          const isWhale = (e.sizeUsd ?? 0) >= this.whaleSizeUsd;
          const parts = `row row--${e.side}${isWhale ? ' row--whale' : ''}`;
          return html`
            <div part=${parts} @click=${() => this._onClick(e.id)}>
              <span part="time">${this._formatTime(e.timestamp)}</span>
              <span part="symbol">${e.symbol}</span>
              <span part="side">${e.side === 'long' ? 'LONG' : 'SHORT'}</span>
              <span part="price">${e.price}</span>
              <span part="size">${e.size}</span>
              <span part="size">${this._formatUsd(e.sizeUsd)}</span>
              ${e.exchange ? html`<span part="exchange">${e.exchange}</span>` : ''}
            </div>
          `;
        })}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wick-liquidation-feed': WickLiquidationFeed;
  }
}
