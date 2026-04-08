import { LitElement, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

export interface SymbolEntry {
  id: string;
  symbol: string;
  name?: string;
  exchange?: string;
  type?: 'spot' | 'perp' | 'future' | 'option' | 'stock' | 'fx';
}

/**
 * `<wick-symbol-search>` — Headless fuzzy symbol search with keyboard navigation.
 *
 * @fires wick-symbol-pick   - { id, symbol, name?, exchange?, type? }
 * @fires wick-symbol-query  - { query }
 *
 * @csspart container
 * @csspart input
 * @csspart results
 * @csspart result
 * @csspart result--active
 * @csspart result--recent
 * @csspart result-symbol
 * @csspart result-name
 * @csspart result-exchange
 * @csspart empty-state
 */
@customElement('wick-symbol-search')
export class WickSymbolSearch extends LitElement {
  @property({ type: Array }) universe: SymbolEntry[] = [];
  @property({ type: String }) placeholder = 'Search symbols…';
  @property({ type: Number, attribute: 'max-results' }) maxResults = 10;
  @property({ type: Number, attribute: 'recent-limit' }) recentLimit = 5;

  @state() private _query = '';
  @state() private _activeIndex = 0;
  @state() private _recent: SymbolEntry[] = [];

  protected override createRenderRoot() {
    return this;
  }

  /** Fuzzy score: higher is better. 0 = no match. */
  static score(query: string, entry: SymbolEntry): number {
    if (!query) return 0;
    const q = query.toLowerCase();
    const sym = entry.symbol.toLowerCase();
    const name = (entry.name ?? '').toLowerCase();
    if (sym === q) return 1000;
    if (sym.startsWith(q)) return 500 + (q.length / sym.length) * 100;
    if (sym.includes(q)) return 200;
    if (name.startsWith(q)) return 150;
    if (name.includes(q)) return 80;
    return 0;
  }

  /** Returns the matched + sorted result list (capped to maxResults). */
  get results(): SymbolEntry[] {
    if (!this._query) return [];
    const scored = this.universe
      .map((e) => ({ e, s: WickSymbolSearch.score(this._query, e) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, this.maxResults)
      .map((x) => x.e);
    return scored;
  }

  setQuery(q: string): void {
    this._query = q;
    this._activeIndex = 0;
    this.dispatchEvent(
      new CustomEvent('wick-symbol-query', {
        detail: { query: q },
        bubbles: true,
        composed: true,
      }),
    );
  }

  pick(entry: SymbolEntry): void {
    this._recent = [entry, ...this._recent.filter((e) => e.id !== entry.id)].slice(
      0,
      this.recentLimit,
    );
    this.dispatchEvent(
      new CustomEvent('wick-symbol-pick', {
        detail: entry,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _onInput = (e: Event) => {
    this.setQuery((e.target as HTMLInputElement).value);
  };

  private _onKeydown = (e: KeyboardEvent) => {
    const list = this.results.length ? this.results : this._recent;
    if (list.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this._activeIndex = (this._activeIndex + 1) % list.length;
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this._activeIndex = (this._activeIndex - 1 + list.length) % list.length;
    } else if (e.key === 'Enter') {
      e.preventDefault();
      this.pick(list[this._activeIndex]);
    }
  };

  protected override render() {
    const list = this._query ? this.results : this._recent;
    const showingRecent = !this._query;
    return html`
      <div part="container">
        <input
          part="input"
          .value=${this._query}
          @input=${this._onInput}
          @keydown=${this._onKeydown}
          placeholder=${this.placeholder}
        />
        <div part="results">
          ${list.length === 0 && this._query
            ? html`<div part="empty-state">No matches</div>`
            : list.map((entry, i) => {
                const active = i === this._activeIndex;
                const cls = `result${active ? ' result--active' : ''}${
                  showingRecent ? ' result--recent' : ''
                }`;
                return html`
                  <div part=${cls} @click=${() => this.pick(entry)}>
                    <span part="result-symbol">${entry.symbol}</span>
                    ${entry.name
                      ? html`<span part="result-name">${entry.name}</span>`
                      : nothing}
                    ${entry.exchange
                      ? html`<span part="result-exchange">${entry.exchange}</span>`
                      : nothing}
                  </div>
                `;
              })}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wick-symbol-search': WickSymbolSearch;
  }
}
