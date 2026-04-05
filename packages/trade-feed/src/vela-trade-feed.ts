import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import type { Trade, PriceFormatOptions } from '@vela-trading/core';
import { formatPrice, formatSize } from '@vela-trading/core';

/**
 * `<vela-trade-feed>` — Headless scrolling trade feed component.
 *
 * Displays recent trades in a scrollable list with buy/sell indicators.
 * Fully unstyled — use CSS parts and custom properties to theme.
 *
 * @fires vela-trade-click - When a trade row is clicked
 *
 * @csspart container - Outer wrapper
 * @csspart header - Column headers row
 * @csspart list - Trades list wrapper
 * @csspart row - Each trade row
 * @csspart price - Price cell
 * @csspart size - Size cell
 * @csspart time - Time cell
 * @csspart side - Buy/sell indicator
 *
 * @cssprop --vela-tf-buy-color - Buy trade color (default: inherit)
 * @cssprop --vela-tf-sell-color - Sell trade color (default: inherit)
 * @cssprop --vela-tf-row-height - Row height (default: 24px)
 * @cssprop --vela-tf-font-size - Font size (default: 13px)
 * @cssprop --vela-tf-max-height - Max height of the feed (default: 400px)
 */
@customElement('vela-trade-feed')
export class VelaTradeFeed extends LitElement {
  /** Array of trades to display (newest first) */
  @property({ type: Array })
  trades: Trade[] = [];

  /** Maximum number of trades to show */
  @property({ type: Number, attribute: 'max-trades' })
  maxTrades = 50;

  /** Price formatting options */
  @property({ type: Object, attribute: false })
  priceFormat: PriceFormatOptions = {};

  /** Size decimal precision */
  @property({ type: Number, attribute: 'size-precision' })
  sizePrecision = 4;

  /** Time format: 'time' for HH:MM:SS, 'datetime' for full, 'relative' for "2s ago" */
  @property({ type: String, attribute: 'time-format' })
  timeFormat: 'time' | 'datetime' | 'relative' = 'time';

  /**
   * Add a new trade to the top of the feed.
   */
  addTrade(trade: Trade): void {
    const updated = [trade, ...this.trades];
    this.trades = updated.slice(0, this.maxTrades);
  }

  /**
   * Add multiple trades at once (batch update).
   */
  addTrades(trades: Trade[]): void {
    const updated = [...trades, ...this.trades];
    this.trades = updated.slice(0, this.maxTrades);
  }

  protected override createRenderRoot() {
    return this;
  }

  private _formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    if (this.timeFormat === 'datetime') {
      return date.toLocaleString();
    }
    if (this.timeFormat === 'relative') {
      const seconds = Math.floor((Date.now() - timestamp) / 1000);
      if (seconds < 60) return `${seconds}s ago`;
      if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
      return `${Math.floor(seconds / 3600)}h ago`;
    }
    return date.toLocaleTimeString();
  }

  private _handleRowClick(trade: Trade) {
    this.dispatchEvent(
      new CustomEvent('vela-trade-click', {
        detail: trade,
        bubbles: true,
        composed: true,
      }),
    );
  }

  protected override render() {
    const visibleTrades = this.trades.slice(0, this.maxTrades);
    const sideColor = (side: 'buy' | 'sell') =>
      side === 'buy'
        ? 'var(--vela-tf-buy-color, inherit)'
        : 'var(--vela-tf-sell-color, inherit)';

    return html`
      <div part="container" role="region" aria-label="Trade Feed" aria-live="polite">
        <table part="table" style="width: 100%; border-collapse: collapse;" role="grid" aria-label="Recent trades">
          <thead>
            <tr part="header" role="row">
              <th part="header-price" scope="col">Price</th>
              <th part="header-size" scope="col">Size</th>
              <th part="header-time" scope="col">Time</th>
            </tr>
          </thead>
          <tbody
            part="list"
            style="display: block; max-height: var(--vela-tf-max-height, 400px); overflow-y: auto;"
          >
            ${repeat(visibleTrades, (t) => t.id, (trade) => html`
                <tr
                  part="row ${trade.side}-row"
                  role="row"
                  tabindex="0"
                  aria-label="${trade.side === 'buy' ? 'Buy' : 'Sell'} ${formatPrice(trade.price, this.priceFormat)} size ${formatSize(trade.size, this.sizePrecision)}"
                  style="height: var(--vela-tf-row-height, 24px); font-size: var(--vela-tf-font-size, 13px); cursor: pointer; display: table; width: 100%; table-layout: fixed;"
                  @click=${() => this._handleRowClick(trade)}
                  @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._handleRowClick(trade); }}}
                >
                  <td part="price" role="gridcell" style="color: ${sideColor(trade.side)}">
                    ${formatPrice(trade.price, this.priceFormat)}
                  </td>
                  <td part="size" role="gridcell">${formatSize(trade.size, this.sizePrecision)}</td>
                  <td part="time" role="gridcell">${this._formatTime(trade.timestamp)}</td>
                </tr>
              `,
            )}
          </tbody>
        </table>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vela-trade-feed': VelaTradeFeed;
  }
}
