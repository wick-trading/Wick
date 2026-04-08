import { LitElement, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

export type OrderType = 'market' | 'limit' | 'stop' | 'stop-limit' | 'oco';
export type OrderStatus = 'open' | 'filled' | 'partial' | 'cancelled' | 'rejected';

export interface OpenOrder {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: OrderType;
  price?: number;
  stopPrice?: number;
  size: number;
  filled: number;
  status: OrderStatus;
  createdAt: number;
}

/**
 * `<wick-order-manager>` — Open orders table with cancel/modify hooks.
 *
 * @fires wick-order-cancel - { id }
 * @fires wick-order-modify - { id, changes: { price?, size? } }
 *
 * @csspart table
 * @csspart header-row
 * @csspart header-cell
 * @csspart row
 * @csspart row--filled-partial
 * @csspart cell--side
 * @csspart cell--side--buy
 * @csspart cell--side--sell
 * @csspart cell--filled-bar
 * @csspart fill-progress
 * @csspart cancel-btn
 * @csspart modify-input
 */
@customElement('wick-order-manager')
export class WickOrderManager extends LitElement {
  @property({ type: Array }) orders: OpenOrder[] = [];
  @property({ type: String, attribute: 'symbol-filter' }) symbolFilter = '';
  @property({ type: String, attribute: 'side-filter' }) sideFilter: 'buy' | 'sell' | '' = '';

  @state() private _editingId: string | null = null;
  @state() private _editPrice: number | null = null;

  protected override createRenderRoot() {
    return this;
  }

  /** Compute fill percentage 0-100. */
  static fillPct(order: OpenOrder): number {
    if (!order.size) return 0;
    return Math.min(100, (order.filled / order.size) * 100);
  }

  get filteredOrders(): OpenOrder[] {
    return this.orders.filter((o) => {
      if (o.status !== 'open' && o.status !== 'partial') return false;
      if (this.symbolFilter && !o.symbol.toLowerCase().includes(this.symbolFilter.toLowerCase()))
        return false;
      if (this.sideFilter && o.side !== this.sideFilter) return false;
      return true;
    });
  }

  cancelOrder(id: string): void {
    this.dispatchEvent(
      new CustomEvent('wick-order-cancel', {
        detail: { id },
        bubbles: true,
        composed: true,
      }),
    );
  }

  modifyOrder(id: string, changes: { price?: number; size?: number }): void {
    this._editingId = null;
    this._editPrice = null;
    this.dispatchEvent(
      new CustomEvent('wick-order-modify', {
        detail: { id, changes },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _startEdit(order: OpenOrder): void {
    this._editingId = order.id;
    this._editPrice = order.price ?? null;
  }

  protected override render() {
    const rows = this.filteredOrders;
    return html`
      <table part="table">
        <thead>
          <tr part="header-row">
            <th part="header-cell">Symbol</th>
            <th part="header-cell">Side</th>
            <th part="header-cell">Type</th>
            <th part="header-cell">Price</th>
            <th part="header-cell">Size</th>
            <th part="header-cell">Fill</th>
            <th part="header-cell">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map((order) => {
            const fillPct = WickOrderManager.fillPct(order);
            const isPartial = order.status === 'partial';
            const isEditing = this._editingId === order.id;
            return html`
              <tr
                part=${`row${isPartial ? ' row--filled-partial' : ''}`}
              >
                <td part="cell">${order.symbol}</td>
                <td part=${`cell--side cell--side--${order.side}`}>${order.side}</td>
                <td part="cell">${order.type}</td>
                <td part="cell">
                  ${isEditing
                    ? html`
                        <input
                          part="modify-input"
                          type="number"
                          .value=${String(this._editPrice ?? '')}
                          @input=${(e: Event) => {
                            this._editPrice =
                              parseFloat((e.target as HTMLInputElement).value) || null;
                          }}
                          @change=${() => {
                            if (this._editPrice !== null)
                              this.modifyOrder(order.id, { price: this._editPrice });
                          }}
                        />
                      `
                    : html`<span @dblclick=${() => this._startEdit(order)}
                        >${order.price ?? '—'}</span
                      >`}
                </td>
                <td part="cell">${order.size}</td>
                <td part="cell--filled-bar">
                  <div
                    part="fill-progress"
                    style=${`--wick-om-fill: ${fillPct}%`}
                  >
                    ${fillPct.toFixed(0)}%
                  </div>
                </td>
                <td part="cell">
                  <button
                    part="cancel-btn"
                    @click=${() => this.cancelOrder(order.id)}
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            `;
          })}
          ${rows.length === 0
            ? html`<tr><td colspan="7" part="empty-state">No open orders</td></tr>`
            : nothing}
        </tbody>
      </table>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wick-order-manager': WickOrderManager;
  }
}
