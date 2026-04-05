import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { OrderBookData, OrderBookDelta, PriceFormatOptions } from '@vela-trading/core';
import { applyOrderBookDelta, cumulativeTotals, formatPrice, formatSize } from '@vela-trading/core';

/**
 * `<vela-order-book>` — Headless order book component.
 *
 * Renders bids and asks with depth visualization via CSS custom properties.
 * Fully unstyled — use CSS parts and custom properties to theme.
 *
 * @fires vela-order-book-level-click - When a price level is clicked
 *
 * @csspart container - The outer wrapper
 * @csspart header - Column headers row
 * @csspart asks - Asks section
 * @csspart bids - Bids section
 * @csspart row - Each price level row
 * @csspart price - Price cell
 * @csspart size - Size cell
 * @csspart total - Total/cumulative cell
 * @csspart depth-bar - Background depth visualization bar
 *
 * @cssprop --vela-ob-ask-color - Ask text color (default: inherit)
 * @cssprop --vela-ob-bid-color - Bid text color (default: inherit)
 * @cssprop --vela-ob-ask-depth-color - Ask depth bar color (default: rgba(255,77,77,0.15))
 * @cssprop --vela-ob-bid-depth-color - Bid depth bar color (default: rgba(77,255,77,0.15))
 * @cssprop --vela-ob-row-height - Row height (default: 24px)
 * @cssprop --vela-ob-font-size - Font size (default: 13px)
 */
@customElement('vela-order-book')
export class VelaOrderBook extends LitElement {
  /** The full order book snapshot */
  @property({ type: Object })
  data: OrderBookData = { bids: [], asks: [] };

  /** Number of visible levels per side */
  @property({ type: Number })
  depth = 15;

  /** Price formatting options */
  @property({ type: Object, attribute: false })
  priceFormat: PriceFormatOptions = {};

  /** Size decimal precision */
  @property({ type: Number, attribute: 'size-precision' })
  sizePrecision = 4;

  /** Whether to show the cumulative total column */
  @property({ type: Boolean, attribute: 'show-total' })
  showTotal = true;

  /** Whether to show depth visualization bars */
  @property({ type: Boolean, attribute: 'show-depth' })
  showDepth = true;

  /** Grouping/tick size (e.g. 0.01, 0.1, 1, 10) */
  @property({ type: Number })
  grouping = 0;

  @state()
  private _flash: Map<number, 'up' | 'down'> = new Map();

  /**
   * Apply a delta update to the current order book state.
   * Useful for streaming WebSocket updates.
   */
  applyDelta(delta: OrderBookDelta): void {
    this.data = applyOrderBookDelta(this.data, delta);
  }

  /**
   * Apply multiple deltas at once (batch update).
   */
  applyDeltas(deltas: OrderBookDelta[]): void {
    let book = this.data;
    for (const delta of deltas) {
      book = applyOrderBookDelta(book, delta);
    }
    this.data = book;
  }

  // No Shadow DOM — fully headless, styles come from the consumer
  protected override createRenderRoot() {
    return this;
  }

  private _groupLevels(
    levels: { price: number; size: number }[],
    tickSize: number,
  ): { price: number; size: number }[] {
    if (tickSize <= 0) return levels;
    const grouped = new Map<number, number>();
    for (const level of levels) {
      const key = Math.round(level.price / tickSize) * tickSize;
      grouped.set(key, (grouped.get(key) ?? 0) + level.size);
    }
    return Array.from(grouped.entries()).map(([price, size]) => ({ price, size }));
  }

  private _handleRowClick(price: number, side: 'bid' | 'ask') {
    this.dispatchEvent(
      new CustomEvent('vela-order-book-level-click', {
        detail: { price, side },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _renderRow(
    level: { price: number; size: number; total: number },
    maxTotal: number,
    side: 'bid' | 'ask',
  ) {
    const depthPct = maxTotal > 0 ? (level.total / maxTotal) * 100 : 0;
    const depthColor =
      side === 'bid'
        ? 'var(--vela-ob-bid-depth-color, rgba(77,255,77,0.15))'
        : 'var(--vela-ob-ask-depth-color, rgba(255,77,77,0.15))';
    const textColor =
      side === 'bid'
        ? 'var(--vela-ob-bid-color, inherit)'
        : 'var(--vela-ob-ask-color, inherit)';

    const depthStyle = this.showDepth
      ? `background: linear-gradient(to ${side === 'bid' ? 'left' : 'right'}, ${depthColor} ${depthPct}%, transparent ${depthPct}%);`
      : '';

    return html`
      <tr
        part="row ${side}-row"
        style="height: var(--vela-ob-row-height, 24px); font-size: var(--vela-ob-font-size, 13px); cursor: pointer; ${depthStyle}"
        @click=${() => this._handleRowClick(level.price, side)}
      >
        <td part="price" style="color: ${textColor}">
          ${formatPrice(level.price, this.priceFormat)}
        </td>
        <td part="size">${formatSize(level.size, this.sizePrecision)}</td>
        ${this.showTotal
          ? html`<td part="total">${formatSize(level.total, this.sizePrecision)}</td>`
          : ''}
      </tr>
    `;
  }

  protected override render() {
    // Process asks
    let asks = this.grouping > 0
      ? this._groupLevels(this.data.asks, this.grouping)
      : [...this.data.asks];
    asks.sort((a, b) => a.price - b.price);
    asks = asks.slice(0, this.depth);
    const asksWithTotals = cumulativeTotals(asks.slice().reverse()).reverse();
    const askMaxTotal = asksWithTotals.length > 0 ? asksWithTotals[0].total : 0;

    // Process bids
    let bids = this.grouping > 0
      ? this._groupLevels(this.data.bids, this.grouping)
      : [...this.data.bids];
    bids.sort((a, b) => b.price - a.price);
    bids = bids.slice(0, this.depth);
    const bidsWithTotals = cumulativeTotals(bids);
    const bidMaxTotal = bidsWithTotals.length > 0 ? bidsWithTotals[bidsWithTotals.length - 1].total : 0;

    const maxTotal = Math.max(askMaxTotal, bidMaxTotal);

    return html`
      <div part="container">
        <table part="table" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr part="header">
              <th part="header-price">Price</th>
              <th part="header-size">Size</th>
              ${this.showTotal ? html`<th part="header-total">Total</th>` : ''}
            </tr>
          </thead>
          <tbody part="asks">
            ${asksWithTotals.map((level) => this._renderRow(level, maxTotal, 'ask'))}
          </tbody>
          <tbody part="bids">
            ${bidsWithTotals.map((level) => this._renderRow(level, maxTotal, 'bid'))}
          </tbody>
        </table>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vela-order-book': VelaOrderBook;
  }
}
