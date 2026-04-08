import { LitElement, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

export type OrderSide = 'buy' | 'sell';
export type OrderType =
  | 'market'
  | 'limit'
  | 'stop-market'
  | 'stop-limit'
  | 'take-profit'
  | 'oco';
export type TimeInForce = 'GTC' | 'IOC' | 'FOK' | 'GTD';

export interface OrderRequest {
  symbol: string;
  side: OrderSide;
  type: OrderType;
  qty: number;
  price?: number;
  stopPrice?: number;
  timeInForce?: TimeInForce;
}

/**
 * `<wick-order-ticket>` — Headless order entry form.
 *
 * @fires wick-order-submit - OrderRequest
 * @fires wick-side-change  - { side }
 * @fires wick-type-change  - { type }
 *
 * @csspart container
 * @csspart side-toggle
 * @csspart side-buy
 * @csspart side-sell
 * @csspart type-selector
 * @csspart type-option
 * @csspart field-price
 * @csspart field-qty
 * @csspart field-stop
 * @csspart input-price
 * @csspart input-qty
 * @csspart input-stop
 * @csspart submit-btn
 * @csspart error-message
 * @csspart summary-row
 */
@customElement('wick-order-ticket')
export class WickOrderTicket extends LitElement {
  @property({ type: String }) symbol = '';
  @property({ type: Number }) price = 0;
  @property({ type: Number, attribute: 'tick-size' }) tickSize = 0.01;
  @property({ type: Number, attribute: 'lot-size' }) lotSize = 0.001;
  @property({ type: Number, attribute: 'min-qty' }) minQty = 0;
  @property({ type: Number, attribute: 'max-qty' }) maxQty = Infinity;

  @state() private _side: OrderSide = 'buy';
  @state() private _type: OrderType = 'limit';
  @state() private _qty = 0;
  @state() private _limitPrice = 0;
  @state() private _stopPrice = 0;
  @state() private _tif: TimeInForce = 'GTC';

  protected override createRenderRoot() {
    return this;
  }

  /** Round to the nearest tick size, away from zero. */
  static roundToTick(value: number, tick: number): number {
    if (tick <= 0) return value;
    return Math.round(value / tick) * tick;
  }

  /** Round qty down to lot size. */
  static roundToLot(value: number, lot: number): number {
    if (lot <= 0) return value;
    return Math.floor(value / lot) * lot;
  }

  /** Build a normalized OrderRequest from current state. */
  buildOrder(): OrderRequest {
    const order: OrderRequest = {
      symbol: this.symbol,
      side: this._side,
      type: this._type,
      qty: WickOrderTicket.roundToLot(this._qty, this.lotSize),
    };
    if (this._type !== 'market') {
      order.price = WickOrderTicket.roundToTick(this._limitPrice, this.tickSize);
    }
    if (this._type.startsWith('stop') || this._type === 'take-profit' || this._type === 'oco') {
      order.stopPrice = WickOrderTicket.roundToTick(this._stopPrice, this.tickSize);
    }
    if (this._type !== 'market') {
      order.timeInForce = this._tif;
    }
    return order;
  }

  /** Returns null if valid, otherwise an error message. */
  validate(): string | null {
    const order = this.buildOrder();
    if (!order.symbol) return 'Missing symbol';
    if (!order.qty || order.qty <= 0) return 'Quantity must be > 0';
    if (order.qty < this.minQty) return `Quantity below minimum (${this.minQty})`;
    if (order.qty > this.maxQty) return `Quantity above maximum (${this.maxQty})`;
    if (order.type !== 'market' && (!order.price || order.price <= 0)) {
      return 'Price required for non-market orders';
    }
    return null;
  }

  setSide(side: OrderSide): void {
    if (side === this._side) return;
    this._side = side;
    this.dispatchEvent(
      new CustomEvent('wick-side-change', {
        detail: { side },
        bubbles: true,
        composed: true,
      }),
    );
  }

  setType(type: OrderType): void {
    if (type === this._type) return;
    this._type = type;
    this.dispatchEvent(
      new CustomEvent('wick-type-change', {
        detail: { type },
        bubbles: true,
        composed: true,
      }),
    );
  }

  submit(): void {
    const error = this.validate();
    if (error) return;
    this.dispatchEvent(
      new CustomEvent('wick-order-submit', {
        detail: this.buildOrder(),
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _onQty = (e: Event) => {
    this._qty = parseFloat((e.target as HTMLInputElement).value) || 0;
  };
  private _onPrice = (e: Event) => {
    this._limitPrice = parseFloat((e.target as HTMLInputElement).value) || 0;
  };
  private _onStop = (e: Event) => {
    this._stopPrice = parseFloat((e.target as HTMLInputElement).value) || 0;
  };

  protected override render() {
    const needsPrice = this._type !== 'market';
    const needsStop =
      this._type.startsWith('stop') || this._type === 'take-profit' || this._type === 'oco';
    const error = this.validate();
    return html`
      <div part="container">
        <div part="side-toggle">
          <button
            part=${`side-buy${this._side === 'buy' ? ' side-buy--active' : ''}`}
            @click=${() => this.setSide('buy')}
          >
            Buy
          </button>
          <button
            part=${`side-sell${this._side === 'sell' ? ' side-sell--active' : ''}`}
            @click=${() => this.setSide('sell')}
          >
            Sell
          </button>
        </div>
        <div part="type-selector">
          ${(['market', 'limit', 'stop-market', 'stop-limit'] as OrderType[]).map(
            (t) => html`
              <button
                part=${`type-option${this._type === t ? ' type-option--active' : ''}`}
                @click=${() => this.setType(t)}
              >
                ${t}
              </button>
            `,
          )}
        </div>
        ${needsPrice
          ? html`
              <div part="field-price">
                <label>Price</label>
                <input
                  part="input-price"
                  type="number"
                  step=${this.tickSize}
                  .value=${String(this._limitPrice)}
                  @input=${this._onPrice}
                />
              </div>
            `
          : nothing}
        ${needsStop
          ? html`
              <div part="field-stop">
                <label>Stop</label>
                <input
                  part="input-stop"
                  type="number"
                  step=${this.tickSize}
                  .value=${String(this._stopPrice)}
                  @input=${this._onStop}
                />
              </div>
            `
          : nothing}
        <div part="field-qty">
          <label>Qty</label>
          <input
            part="input-qty"
            type="number"
            step=${this.lotSize}
            .value=${String(this._qty)}
            @input=${this._onQty}
          />
        </div>
        ${error ? html`<div part="error-message">${error}</div>` : nothing}
        <div part="summary-row">${this.symbol} ${this._side} ${this._type}</div>
        <button part="submit-btn" ?disabled=${!!error} @click=${() => this.submit()}>
          Submit
        </button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wick-order-ticket': WickOrderTicket;
  }
}
