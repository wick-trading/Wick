import { LitElement, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

export interface DomLevel {
  price: number;
  size: number;
}

export interface DomData {
  bids: DomLevel[];
  asks: DomLevel[];
}

export interface DomDelta {
  side: 'bid' | 'ask';
  price: number;
  size: number;
}

/**
 * `<wick-dom-ladder>` — Depth-of-market ladder. Fixed price column, sizes
 * update in place. Click any row to fire an order intent event.
 *
 * @fires wick-dom-row-click - { price, side, intent: 'buy' | 'sell' }
 *
 * @csspart container
 * @csspart row
 * @csspart row--best-bid
 * @csspart row--best-ask
 * @csspart bid-cell
 * @csspart ask-cell
 * @csspart price-cell
 */
@customElement('wick-dom-ladder')
export class WickDomLadder extends LitElement {
  @property({ type: Object }) data: DomData = { bids: [], asks: [] };
  @property({ type: Number, attribute: 'tick-size' }) tickSize = 0.5;
  @property({ type: Number, attribute: 'row-count' }) rowCount = 20;

  @state() private _bidMap: Map<number, number> = new Map();
  @state() private _askMap: Map<number, number> = new Map();

  protected override createRenderRoot() {
    return this;
  }

  override updated(changed: Map<string, unknown>) {
    if (changed.has('data')) {
      this._bidMap = new Map(this.data.bids.map((l) => [l.price, l.size]));
      this._askMap = new Map(this.data.asks.map((l) => [l.price, l.size]));
    }
  }

  /** Apply an incremental delta. Size of 0 removes the level. */
  applyDelta(delta: DomDelta): void {
    const map = delta.side === 'bid' ? new Map(this._bidMap) : new Map(this._askMap);
    if (delta.size === 0) {
      map.delete(delta.price);
    } else {
      map.set(delta.price, delta.size);
    }
    if (delta.side === 'bid') {
      this._bidMap = map;
      this.data = {
        bids: Array.from(map, ([price, size]) => ({ price, size })),
        asks: this.data.asks,
      };
    } else {
      this._askMap = map;
      this.data = {
        bids: this.data.bids,
        asks: Array.from(map, ([price, size]) => ({ price, size })),
      };
    }
  }

  /** Best bid price (highest bid). */
  get bestBid(): number | null {
    if (this.data.bids.length === 0) return null;
    return Math.max(...this.data.bids.map((l) => l.price));
  }

  /** Best ask price (lowest ask). */
  get bestAsk(): number | null {
    if (this.data.asks.length === 0) return null;
    return Math.min(...this.data.asks.map((l) => l.price));
  }

  /** Mid price. */
  get midPrice(): number | null {
    const bid = this.bestBid;
    const ask = this.bestAsk;
    if (bid === null || ask === null) return null;
    return (bid + ask) / 2;
  }

  private _rows(): { price: number; bidSize: number | null; askSize: number | null }[] {
    const mid = this.midPrice;
    if (mid === null) return [];
    const half = Math.floor(this.rowCount / 2);
    const rows = [];
    for (let i = half; i >= -half; i--) {
      const price = Math.round((mid + i * this.tickSize) / this.tickSize) * this.tickSize;
      rows.push({
        price,
        bidSize: this._bidMap.get(price) ?? null,
        askSize: this._askMap.get(price) ?? null,
      });
    }
    return rows;
  }

  private _onRowClick(price: number, bidSize: number | null) {
    const side = bidSize !== null ? 'bid' : 'ask';
    const intent = side === 'bid' ? 'sell' : 'buy';
    this.dispatchEvent(
      new CustomEvent('wick-dom-row-click', {
        detail: { price, side, intent },
        bubbles: true,
        composed: true,
      }),
    );
  }

  protected override render() {
    const rows = this._rows();
    const best = this.bestBid;
    const bestAsk = this.bestAsk;
    if (rows.length === 0) {
      return html`<div part="container"><div part="empty-state">No data</div></div>`;
    }
    return html`
      <div part="container">
        ${rows.map((row) => {
          const isBestBid = best !== null && row.price === best;
          const isBestAsk = bestAsk !== null && row.price === bestAsk;
          return html`
            <div
              part=${`row${isBestBid ? ' row--best-bid' : ''}${isBestAsk ? ' row--best-ask' : ''}`}
              @click=${() => this._onRowClick(row.price, row.bidSize)}
            >
              <span part="bid-cell">${row.bidSize !== null ? row.bidSize : nothing}</span>
              <span part="price-cell">${row.price.toFixed(1)}</span>
              <span part="ask-cell">${row.askSize !== null ? row.askSize : nothing}</span>
            </div>
          `;
        })}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wick-dom-ladder': WickDomLadder;
  }
}
