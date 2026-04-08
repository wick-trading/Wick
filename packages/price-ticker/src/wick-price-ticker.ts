import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { TickerData, PriceFormatOptions } from '@wick/core';
import { formatPrice } from '@wick/core';

/**
 * `<wick-price-ticker>` — Headless price ticker component.
 *
 * Displays a single instrument's price with flash-on-change behavior.
 * Fully unstyled — use CSS parts and custom properties to theme.
 *
 * @fires wick-price-change - When the price changes, includes direction
 *
 * @csspart container - Outer wrapper
 * @csspart symbol - Symbol/instrument name
 * @csspart price - Current price display
 * @csspart change - 24h change percentage
 * @csspart high - 24h high
 * @csspart low - 24h low
 * @csspart volume - 24h volume
 *
 * @cssprop --wick-ticker-up-color - Color for price increase (default: inherit)
 * @cssprop --wick-ticker-down-color - Color for price decrease (default: inherit)
 * @cssprop --wick-ticker-flash-duration - Flash animation duration (default: 300ms)
 * @cssprop --wick-ticker-price-size - Font size for the price (default: 1.5rem)
 * @cssprop --wick-ticker-symbol-size - Font size for the symbol label (default: 0.75rem)
 *
 * @attr {sm|md|lg} size - Preset size: sm (compact), md (default), lg (prominent)
 */
@customElement('wick-price-ticker')
export class WickPriceTicker extends LitElement {
  /** Ticker data to display */
  @property({ type: Object })
  data: TickerData = { symbol: '', price: 0, timestamp: 0 };

  /** Price formatting options */
  @property({ type: Object, attribute: false })
  priceFormat: PriceFormatOptions = {};

  /** Whether to show extended info (high, low, volume) */
  @property({ type: Boolean, attribute: 'show-details' })
  showDetails = false;

  /**
   * Preset size variant.
   * - sm: symbol 0.65rem, price 1.1rem
   * - md: symbol 0.75rem, price 1.5rem (default)
   * - lg: symbol 0.85rem, price 2rem
   */
  @property({ type: String })
  size: 'sm' | 'md' | 'lg' = 'md';

  private _sizeVars(): string {
    if (this.size === 'sm') return '--wick-ticker-price-size: 1.1rem; --wick-ticker-symbol-size: 0.65rem;';
    if (this.size === 'lg') return '--wick-ticker-price-size: 2rem; --wick-ticker-symbol-size: 0.85rem;';
    return '';
  }

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
        new CustomEvent('wick-price-change', {
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
    if (this._direction === 'up') return 'var(--wick-ticker-up-color, inherit)';
    if (this._direction === 'down') return 'var(--wick-ticker-down-color, inherit)';
    return 'inherit';
  }

  private _changeColor(): string {
    const change = this.data.change24h ?? 0;
    if (change > 0) return 'var(--wick-ticker-up-color, inherit)';
    if (change < 0) return 'var(--wick-ticker-down-color, inherit)';
    return 'inherit';
  }

  protected override render() {
    const { symbol, price, change24h, high24h, low24h, volume24h } = this.data;

    return html`
      <div part="container" role="status" aria-live="polite" aria-label="${symbol} price ticker" data-direction=${this._direction} ?data-flashing=${this._flashing} style=${this._sizeVars()}>
        <span part="symbol" aria-hidden="true" style="font-size: var(--wick-ticker-symbol-size, 0.75rem)">${symbol}</span>
        <span part="price" style="color: ${this._priceColor()}; font-size: var(--wick-ticker-price-size, 1.5rem)" aria-label="Price ${formatPrice(price, this.priceFormat)}">
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
    'wick-price-ticker': WickPriceTicker;
  }
}
