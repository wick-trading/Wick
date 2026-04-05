import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { TickerData, PriceFormatOptions } from '@vela-trading/core';
import { formatPrice } from '@vela-trading/core';

/**
 * `<vela-price-ticker>` — Headless price ticker component.
 *
 * Displays a single instrument's price with flash-on-change behavior.
 * Fully unstyled — use CSS parts and custom properties to theme.
 *
 * @fires vela-price-change - When the price changes, includes direction
 *
 * @csspart container - Outer wrapper
 * @csspart symbol - Symbol/instrument name
 * @csspart price - Current price display
 * @csspart change - 24h change percentage
 * @csspart high - 24h high
 * @csspart low - 24h low
 * @csspart volume - 24h volume
 *
 * @cssprop --vela-ticker-up-color - Color for price increase (default: inherit)
 * @cssprop --vela-ticker-down-color - Color for price decrease (default: inherit)
 * @cssprop --vela-ticker-flash-duration - Flash animation duration (default: 300ms)
 */
@customElement('vela-price-ticker')
export class VelaPriceTicker extends LitElement {
  /** Ticker data to display */
  @property({ type: Object })
  data: TickerData = { symbol: '', price: 0, timestamp: 0 };

  /** Price formatting options */
  @property({ type: Object, attribute: false })
  priceFormat: PriceFormatOptions = {};

  /** Whether to show extended info (high, low, volume) */
  @property({ type: Boolean, attribute: 'show-details' })
  showDetails = false;

  /** Flash direction state */
  @state()
  private _direction: 'up' | 'down' | 'neutral' = 'neutral';

  @state()
  private _flashing = false;

  private _flashTimeout: ReturnType<typeof setTimeout> | null = null;
  private _prevPrice = 0;

  protected override willUpdate(changedProps: Map<string, unknown>): void {
    if (changedProps.has('data') && this._prevPrice !== 0) {
      if (this.data.price > this._prevPrice) {
        this._direction = 'up';
      } else if (this.data.price < this._prevPrice) {
        this._direction = 'down';
      }

      this._flashing = true;
      if (this._flashTimeout) clearTimeout(this._flashTimeout);
      this._flashTimeout = setTimeout(() => {
        this._flashing = false;
      }, 300);
    }

    this._prevPrice = this.data.price;
  }

  protected override updated(changedProps: Map<string, unknown>): void {
    if (changedProps.has('data') && this._prevPrice !== 0) {
      this.dispatchEvent(
        new CustomEvent('vela-price-change', {
          detail: {
            price: this.data.price,
            prevPrice: (changedProps.get('data') as typeof this.data)?.price ?? 0,
            direction: this._direction,
          },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._flashTimeout) clearTimeout(this._flashTimeout);
  }

  protected override createRenderRoot() {
    return this;
  }

  private _priceColor(): string {
    if (this._direction === 'up') return 'var(--vela-ticker-up-color, inherit)';
    if (this._direction === 'down') return 'var(--vela-ticker-down-color, inherit)';
    return 'inherit';
  }

  private _changeColor(): string {
    const change = this.data.change24h ?? 0;
    if (change > 0) return 'var(--vela-ticker-up-color, inherit)';
    if (change < 0) return 'var(--vela-ticker-down-color, inherit)';
    return 'inherit';
  }

  protected override render() {
    const { symbol, price, change24h, high24h, low24h, volume24h } = this.data;

    return html`
      <div part="container" data-direction=${this._direction} ?data-flashing=${this._flashing}>
        <span part="symbol">${symbol}</span>
        <span part="price" style="color: ${this._priceColor()}">
          ${formatPrice(price, this.priceFormat)}
        </span>
        ${change24h !== undefined
          ? html`<span part="change" style="color: ${this._changeColor()}">
              ${change24h >= 0 ? '+' : ''}${change24h.toFixed(2)}%
            </span>`
          : ''}
        ${this.showDetails
          ? html`
              ${high24h !== undefined
                ? html`<span part="high">H: ${formatPrice(high24h, this.priceFormat)}</span>`
                : ''}
              ${low24h !== undefined
                ? html`<span part="low">L: ${formatPrice(low24h, this.priceFormat)}</span>`
                : ''}
              ${volume24h !== undefined
                ? html`<span part="volume">Vol: ${volume24h.toLocaleString()}</span>`
                : ''}
            `
          : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vela-price-ticker': VelaPriceTicker;
  }
}
