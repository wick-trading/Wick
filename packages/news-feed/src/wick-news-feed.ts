import { LitElement, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

export type NewsSentiment = 'positive' | 'neutral' | 'negative';

export interface NewsItem {
  id: string;
  source: string;
  headline: string;
  url?: string;
  symbols?: string[];
  sentiment?: NewsSentiment;
  timestamp: number;
}

/**
 * `<wick-news-feed>` — Streaming financial news headlines.
 *
 * @fires wick-news-click - { id, url }
 *
 * @csspart container
 * @csspart item
 * @csspart item--positive
 * @csspart item--neutral
 * @csspart item--negative
 * @csspart source
 * @csspart headline
 * @csspart time
 * @csspart symbol-tag
 */
@customElement('wick-news-feed')
export class WickNewsFeed extends LitElement {
  @property({ type: Number, attribute: 'max-items' }) maxItems = 100;
  @property({ type: String, attribute: 'filter-symbol' }) filterSymbol = '';
  @property({ type: String, attribute: 'filter-source' }) filterSource = '';

  @state() private _items: NewsItem[] = [];

  protected override createRenderRoot() {
    return this;
  }

  addItem(item: NewsItem): void {
    this._items = [item, ...this._items].slice(0, this.maxItems);
  }

  clear(): void {
    this._items = [];
  }

  get items(): readonly NewsItem[] {
    return this._items;
  }

  get filteredItems(): NewsItem[] {
    return this._items.filter((i) => {
      if (this.filterSymbol && !(i.symbols ?? []).includes(this.filterSymbol)) return false;
      if (this.filterSource && i.source !== this.filterSource) return false;
      return true;
    });
  }

  private _onClick(item: NewsItem) {
    this.dispatchEvent(
      new CustomEvent('wick-news-click', {
        detail: { id: item.id, url: item.url },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _formatTime(ts: number): string {
    const d = new Date(ts);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
  }

  protected override render() {
    return html`
      <div part="container">
        ${this.filteredItems.map(
          (i) => html`
            <div
              part=${`item item--${i.sentiment ?? 'neutral'}`}
              @click=${() => this._onClick(i)}
            >
              <span part="time">${this._formatTime(i.timestamp)}</span>
              <span part="source">${i.source}</span>
              <span part="headline">${i.headline}</span>
              ${i.symbols && i.symbols.length > 0
                ? html`<span part="symbol-tag">${i.symbols.join(' ')}</span>`
                : nothing}
            </div>
          `,
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wick-news-feed': WickNewsFeed;
  }
}
