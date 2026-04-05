import { describe, it, expect, afterEach } from 'vitest';
import { VelaOrderBook } from './vela-order-book.js';

// Ensure custom element is registered
if (!customElements.get('vela-order-book')) {
  customElements.define('vela-order-book', VelaOrderBook);
}

function createElement(): VelaOrderBook {
  const el = document.createElement('vela-order-book') as VelaOrderBook;
  document.body.appendChild(el);
  return el;
}

describe('VelaOrderBook', () => {
  let el: VelaOrderBook;

  afterEach(() => {
    el?.remove();
  });

  it('registers as a custom element', () => {
    expect(customElements.get('vela-order-book')).toBeDefined();
  });

  it('renders with empty data', async () => {
    el = createElement();
    await el.updateComplete;

    const table = el.querySelector('[part="table"]');
    expect(table).toBeTruthy();

    const headers = el.querySelectorAll('th');
    expect(headers.length).toBe(3); // Price, Size, Total
  });

  it('renders bid and ask rows', async () => {
    el = createElement();
    el.data = {
      bids: [
        { price: 100, size: 5 },
        { price: 99, size: 3 },
      ],
      asks: [
        { price: 101, size: 4 },
        { price: 102, size: 2 },
      ],
    };
    await el.updateComplete;

    const askRows = el.querySelectorAll('[part~="ask-row"]');
    const bidRows = el.querySelectorAll('[part~="bid-row"]');
    expect(askRows.length).toBe(2);
    expect(bidRows.length).toBe(2);
  });

  it('respects depth property', async () => {
    el = createElement();
    el.depth = 2;
    el.data = {
      bids: [
        { price: 100, size: 5 },
        { price: 99, size: 3 },
        { price: 98, size: 1 },
      ],
      asks: [
        { price: 101, size: 4 },
        { price: 102, size: 2 },
        { price: 103, size: 1 },
      ],
    };
    await el.updateComplete;

    const askRows = el.querySelectorAll('[part~="ask-row"]');
    const bidRows = el.querySelectorAll('[part~="bid-row"]');
    expect(askRows.length).toBe(2);
    expect(bidRows.length).toBe(2);
  });

  it('hides total column when show-total is false', async () => {
    el = createElement();
    el.showTotal = false;
    el.data = {
      bids: [{ price: 100, size: 5 }],
      asks: [{ price: 101, size: 4 }],
    };
    await el.updateComplete;

    const totalHeaders = el.querySelectorAll('[part="header-total"]');
    expect(totalHeaders.length).toBe(0);

    const totalCells = el.querySelectorAll('[part="total"]');
    expect(totalCells.length).toBe(0);
  });

  it('displays formatted prices', async () => {
    el = createElement();
    el.priceFormat = { precision: 2 };
    el.data = {
      bids: [{ price: 1234.5, size: 1 }],
      asks: [],
    };
    await el.updateComplete;

    const priceCell = el.querySelector('[part~="bid-row"] [part="price"]');
    expect(priceCell?.textContent?.trim()).toContain('1,234.50');
  });

  it('sorts asks ascending, bids descending', async () => {
    el = createElement();
    el.data = {
      bids: [
        { price: 98, size: 1 },
        { price: 100, size: 5 },
        { price: 99, size: 3 },
      ],
      asks: [
        { price: 103, size: 1 },
        { price: 101, size: 4 },
        { price: 102, size: 2 },
      ],
    };
    await el.updateComplete;

    const askPrices = Array.from(el.querySelectorAll('[part~="ask-row"] [part="price"]'))
      .map((td) => td.textContent?.trim() ?? '');
    const bidPrices = Array.from(el.querySelectorAll('[part~="bid-row"] [part="price"]'))
      .map((td) => td.textContent?.trim() ?? '');

    // Asks should be ascending
    expect(askPrices[0]).toContain('101');
    expect(askPrices[1]).toContain('102');
    expect(askPrices[2]).toContain('103');

    // Bids should be descending
    expect(bidPrices[0]).toContain('100');
    expect(bidPrices[1]).toContain('99');
    expect(bidPrices[2]).toContain('98');
  });

  it('applyDelta updates a bid level', async () => {
    el = createElement();
    el.data = {
      bids: [{ price: 100, size: 5 }],
      asks: [{ price: 101, size: 4 }],
    };
    await el.updateComplete;

    el.applyDelta({ side: 'bid', price: 100, size: 10 });
    await el.updateComplete;

    const sizeCell = el.querySelector('[part~="bid-row"] [part="size"]');
    expect(sizeCell?.textContent?.trim()).toContain('10');
  });

  it('applyDelta removes a level when size is 0', async () => {
    el = createElement();
    el.data = {
      bids: [
        { price: 100, size: 5 },
        { price: 99, size: 3 },
      ],
      asks: [],
    };
    await el.updateComplete;

    el.applyDelta({ side: 'bid', price: 99, size: 0 });
    await el.updateComplete;

    const bidRows = el.querySelectorAll('[part~="bid-row"]');
    expect(bidRows.length).toBe(1);
  });

  it('applyDeltas applies multiple deltas', async () => {
    el = createElement();
    el.data = {
      bids: [{ price: 100, size: 5 }],
      asks: [{ price: 101, size: 4 }],
    };
    await el.updateComplete;

    el.applyDeltas([
      { side: 'bid', price: 100, size: 8 },
      { side: 'ask', price: 102, size: 3 },
    ]);
    await el.updateComplete;

    const bidRows = el.querySelectorAll('[part~="bid-row"]');
    const askRows = el.querySelectorAll('[part~="ask-row"]');
    expect(bidRows.length).toBe(1);
    expect(askRows.length).toBe(2);
  });

  it('fires vela-order-book-level-click on row click', async () => {
    el = createElement();
    el.data = {
      bids: [{ price: 100, size: 5 }],
      asks: [],
    };
    await el.updateComplete;

    let detail: any = null;
    el.addEventListener('vela-order-book-level-click', (e: Event) => {
      detail = (e as CustomEvent).detail;
    });

    const row = el.querySelector('[part~="bid-row"]') as HTMLElement;
    row?.click();

    expect(detail).toEqual({ price: 100, side: 'bid' });
  });

  it('groups levels when grouping > 0', async () => {
    el = createElement();
    el.grouping = 10;
    el.data = {
      bids: [
        { price: 101, size: 2 },
        { price: 105, size: 3 },
        { price: 109, size: 1 },
      ],
      asks: [],
    };
    await el.updateComplete;

    // All three should group into ~100 or ~110 range
    const bidRows = el.querySelectorAll('[part~="bid-row"]');
    // Grouping by 10: 101→100, 105→110, 109→110 → 2 groups
    expect(bidRows.length).toBeLessThanOrEqual(2);
  });
});
