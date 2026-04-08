import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '@wick/mini-chart';

export interface WatchlistInstrument {
  id: string;
  symbol: string;
  price: number;
  change24h?: number;
  volume24h?: number;
  high24h?: number;
  low24h?: number;
  sparkline?: number[];
}

export type WatchlistSort = 'symbol' | 'price' | 'change24h' | 'volume24h';

interface PriceUpdate {
  id: string;
  price?: number;
  change24h?: number;
}

/**
 * `<wick-watchlist>` — Instrument table with live updates and optional sparkline column.
 *
 * @fires wick-watchlist-row-click - { id, symbol }
 * @fires wick-watchlist-sort-change - { sortBy, sortDir }
 *
 * @csspart table
 * @csspart header-row
 * @csspart header-cell
 * @csspart header-cell--sortable
 * @csspart header-cell--sorted
 * @csspart row
 * @csspart row--hovered
 * @csspart cell
 * @csspart cell--symbol
 * @csspart cell--price
 * @csspart cell--change
 * @csspart cell--change--positive
 * @csspart cell--change--negative
 * @csspart cell--volume
 * @csspart cell--sparkline
 * @csspart sort-icon
 */
@customElement('wick-watchlist')
export class WickWatchlist extends LitElement {
  @property({ type: Array }) instruments: WatchlistInstrument[] = [];
  @property({ type: String }) columns = 'symbol,price,change24h,volume,sparkline';
  @property({ type: String, attribute: 'sort-by' }) sortBy: WatchlistSort = 'symbol';
  @property({ type: String, attribute: 'sort-dir' }) sortDir: 'asc' | 'desc' = 'asc';

  protected override createRenderRoot() {
    return this;
  }

  /** Bulk-apply price updates without re-rendering each one. */
  updatePrices(updates: PriceUpdate[]): void {
    const map = new Map(updates.map((u) => [u.id, u]));
    this.instruments = this.instruments.map((inst) => {
      const u = map.get(inst.id);
      if (!u) return inst;
      return { ...inst, ...(u.price !== undefined ? { price: u.price } : {}), ...(u.change24h !== undefined ? { change24h: u.change24h } : {}) };
    });
  }

  get sortedInstruments(): WatchlistInstrument[] {
    const dir = this.sortDir === 'asc' ? 1 : -1;
    const key = this.sortBy;
    return [...this.instruments].sort((a, b) => {
      const av = (a as any)[key];
      const bv = (b as any)[key];
      if (av === undefined || bv === undefined) return 0;
      if (typeof av === 'string') return dir * av.localeCompare(bv);
      return dir * (av - bv);
    });
  }

  setSort(key: WatchlistSort): void {
    if (this.sortBy === key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = key;
      this.sortDir = 'desc';
    }
    this.dispatchEvent(
      new CustomEvent('wick-watchlist-sort-change', {
        detail: { sortBy: this.sortBy, sortDir: this.sortDir },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _onRow(inst: WatchlistInstrument) {
    this.dispatchEvent(
      new CustomEvent('wick-watchlist-row-click', {
        detail: { id: inst.id, symbol: inst.symbol },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _fmt(n: number, d = 2): string {
    return n.toFixed(d);
  }

  private _formatVolume(n: number): string {
    if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
    if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
    return n.toFixed(0);
  }

  protected override render() {
    const cols = this.columns.split(',').map((c) => c.trim());
    return html`
      <table part="table">
        <thead>
          <tr part="header-row">
            ${cols.map((c) => {
              const sorted = this.sortBy === c;
              const partName = `header-cell header-cell--sortable${sorted ? ' header-cell--sorted' : ''}`;
              return html`
                <th part=${partName} @click=${() => this.setSort(c as WatchlistSort)}>
                  ${c}
                  ${sorted ? html`<span part="sort-icon">${this.sortDir === 'asc' ? '↑' : '↓'}</span>` : nothing}
                </th>
              `;
            })}
          </tr>
        </thead>
        <tbody>
          ${this.sortedInstruments.map(
            (inst) => html`
              <tr part="row" @click=${() => this._onRow(inst)}>
                ${cols.map((c) => {
                  switch (c) {
                    case 'symbol':
                      return html`<td part="cell cell--symbol">${inst.symbol}</td>`;
                    case 'price':
                      return html`<td part="cell cell--price">${this._fmt(inst.price)}</td>`;
                    case 'change24h':
                      const ch = inst.change24h ?? 0;
                      return html`<td
                        part=${`cell cell--change cell--change--${ch >= 0 ? 'positive' : 'negative'}`}
                      >
                        ${ch >= 0 ? '+' : ''}${this._fmt(ch)}%
                      </td>`;
                    case 'volume':
                    case 'volume24h':
                      return html`<td part="cell cell--volume">
                        ${inst.volume24h !== undefined ? this._formatVolume(inst.volume24h) : '—'}
                      </td>`;
                    case 'sparkline':
                      return html`<td part="cell cell--sparkline">
                        ${inst.sparkline && inst.sparkline.length >= 2
                          ? html`<wick-mini-chart .values=${inst.sparkline}></wick-mini-chart>`
                          : '—'}
                      </td>`;
                    default:
                      return html`<td part="cell">${(inst as any)[c] ?? ''}</td>`;
                  }
                })}
              </tr>
            `,
          )}
        </tbody>
      </table>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wick-watchlist': WickWatchlist;
  }
}
