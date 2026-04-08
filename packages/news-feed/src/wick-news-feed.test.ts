import { describe, it, expect, beforeEach } from 'vitest';
import './wick-news-feed.js';
import type { WickNewsFeed, NewsItem } from './wick-news-feed.js';

describe('<wick-news-feed>', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  function mount(): WickNewsFeed {
    const el = document.createElement('wick-news-feed') as WickNewsFeed;
    document.body.appendChild(el);
    return el;
  }

  const mk = (id: string, opts: Partial<NewsItem> = {}): NewsItem => ({
    id,
    source: 'Reuters',
    headline: `Headline ${id}`,
    timestamp: Date.now(),
    ...opts,
  });

  it('registers the custom element', () => {
    expect(customElements.get('wick-news-feed')).toBeDefined();
  });

  it('adds items to the front of the list', () => {
    const el = mount();
    el.addItem(mk('a'));
    el.addItem(mk('b'));
    expect(el.items[0].id).toBe('b');
  });

  it('caps the list at max-items', () => {
    const el = mount();
    el.maxItems = 2;
    for (let i = 0; i < 5; i++) el.addItem(mk(String(i)));
    expect(el.items.length).toBe(2);
  });

  it('filters by symbol', () => {
    const el = mount();
    el.addItem(mk('a', { symbols: ['BTC'] }));
    el.addItem(mk('b', { symbols: ['ETH'] }));
    el.filterSymbol = 'BTC';
    expect(el.filteredItems.length).toBe(1);
    expect(el.filteredItems[0].id).toBe('a');
  });

  it('emits news-click on item click', async () => {
    const el = mount();
    el.addItem(mk('a', { url: 'https://example.com/a' }));
    await el.updateComplete;
    let clicked: any = null;
    el.addEventListener('wick-news-click', (e: any) => (clicked = e.detail));
    const item = el.querySelector('[part~="item"]') as HTMLElement;
    item.click();
    expect(clicked?.id).toBe('a');
    expect(clicked?.url).toBe('https://example.com/a');
  });
});
