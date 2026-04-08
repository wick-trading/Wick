import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export interface Position {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  qty: number;
  entryPrice: number;
  currentPrice: number;
  liquidationPrice?: number;
  leverage?: number;
  timestamp: number;
}

/**
 * `<wick-positions>` — Open positions table with live P&L.
 *
 * @fires wick-position-close - { id, symbol, side, qty }
 * @fires wick-position-click - { id }
 *
 * @csspart table
 * @csspart header-row
 * @csspart header-cell
 * @csspart position-row
 * @csspart position-row--long
 * @csspart position-row--short
 * @csspart cell-symbol
 * @csspart cell-side
 * @csspart cell-qty
 * @csspart cell-entry
 * @csspart cell-current
 * @csspart cell-pnl
 * @csspart cell-pnl--positive
 * @csspart cell-pnl--negative
 * @csspart cell-liq
 * @csspart cell-leverage
 * @csspart cell-close-btn
 */
@customElement('wick-positions')
export class WickPositions extends LitElement {
  @property({ type: Array }) positions: Position[] = [];
  @property({ type: Boolean, attribute: 'show-unrealized' }) showUnrealized = true;
  @property({ type: Boolean, attribute: 'show-percentage' }) showPercentage = true;
  @property({ type: Boolean, attribute: 'show-liq-price' }) showLiqPrice = true;

  protected override createRenderRoot() {
    return this;
  }

  /** Update the current price for all positions of a given symbol. */
  updatePrice(symbol: string, price: number): void {
    this.positions = this.positions.map((p) =>
      p.symbol === symbol ? { ...p, currentPrice: price } : p,
    );
  }

  /** Compute unrealized P&L for a position. */
  static unrealized(p: Position): number {
    const direction = p.side === 'long' ? 1 : -1;
    return (p.currentPrice - p.entryPrice) * p.qty * direction;
  }

  /** Compute unrealized P&L percentage for a position. */
  static unrealizedPct(p: Position): number {
    const direction = p.side === 'long' ? 1 : -1;
    if (p.entryPrice === 0) return 0;
    return ((p.currentPrice - p.entryPrice) / p.entryPrice) * direction * 100;
  }

  private _onClose(p: Position) {
    this.dispatchEvent(
      new CustomEvent('wick-position-close', {
        detail: { id: p.id, symbol: p.symbol, side: p.side, qty: p.qty },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _onRow(p: Position) {
    this.dispatchEvent(
      new CustomEvent('wick-position-click', {
        detail: { id: p.id },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _fmt(n: number, d = 2): string {
    return n.toFixed(d);
  }

  protected override render() {
    return html`
      <table part="table">
        <thead>
          <tr part="header-row">
            <th part="header-cell">Symbol</th>
            <th part="header-cell">Side</th>
            <th part="header-cell">Qty</th>
            <th part="header-cell">Entry</th>
            <th part="header-cell">Mark</th>
            ${this.showUnrealized ? html`<th part="header-cell">PnL</th>` : ''}
            ${this.showPercentage ? html`<th part="header-cell">%</th>` : ''}
            ${this.showLiqPrice ? html`<th part="header-cell">Liq.</th>` : ''}
            <th part="header-cell"></th>
          </tr>
        </thead>
        <tbody>
          ${this.positions.map((p) => {
            const pnl = WickPositions.unrealized(p);
            const pct = WickPositions.unrealizedPct(p);
            const positive = pnl >= 0;
            return html`
              <tr
                part=${`position-row position-row--${p.side}`}
                @click=${() => this._onRow(p)}
              >
                <td part="cell-symbol">${p.symbol}</td>
                <td part="cell-side">${p.side}</td>
                <td part="cell-qty">${p.qty}</td>
                <td part="cell-entry">${this._fmt(p.entryPrice)}</td>
                <td part="cell-current">${this._fmt(p.currentPrice)}</td>
                ${this.showUnrealized
                  ? html`<td part=${`cell-pnl cell-pnl--${positive ? 'positive' : 'negative'}`}>
                      ${this._fmt(pnl)}
                    </td>`
                  : ''}
                ${this.showPercentage
                  ? html`<td part=${`cell-pnl cell-pnl--${positive ? 'positive' : 'negative'}`}>
                      ${this._fmt(pct)}%
                    </td>`
                  : ''}
                ${this.showLiqPrice
                  ? html`<td part="cell-liq">
                      ${p.liquidationPrice !== undefined ? this._fmt(p.liquidationPrice) : '—'}
                    </td>`
                  : ''}
                <td>
                  <button
                    part="cell-close-btn"
                    @click=${(ev: Event) => {
                      ev.stopPropagation();
                      this._onClose(p);
                    }}
                  >
                    Close
                  </button>
                </td>
              </tr>
            `;
          })}
        </tbody>
      </table>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wick-positions': WickPositions;
  }
}
