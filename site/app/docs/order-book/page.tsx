'use client';

import { useState } from 'react';
import {
  RealOrderBook,
  RealTradeFeed,
} from '../../components/market/RealComponents';
import { CodeBlock } from '../../components/docs/CodeBlock';
import { Breadcrumbs } from '../../components/docs/Breadcrumbs';

export default function OrderBookDocs() {
  const [highlightPrice, setHighlightPrice] = useState<number | null>(null);

  return (
    <article>
      <header className="mb-10">
        <Breadcrumbs
          items={[
            { label: 'Docs', href: '/docs' },
            { label: 'Market Data' },
            { label: 'Order Book' },
          ]}
        />
        <div
          className="text-[11px] font-mono uppercase tracking-[0.12em] mb-3"
          style={{ color: 'var(--text-muted)' }}
        >
          @wick/order-book
        </div>
        <h1
          className="text-[clamp(1.8rem,3.5vw,2.5rem)] font-bold tracking-tight leading-[1.1] mb-4"
          style={{ color: 'var(--foreground)' }}
        >
          Order Book
        </h1>
        <p
          className="text-[16px] leading-relaxed max-w-[640px]"
          style={{ color: 'var(--text-2)' }}
        >
          A headless bid/ask ladder with cumulative depth visualization. Feed
          it a <code style={{ color: 'var(--green)' }}>{'{ bids, asks }'}</code>{' '}
          snapshot and it renders. Style it however you want with CSS parts and
          custom properties.
        </p>
      </header>

      {/* Live demo */}
      <section className="mb-12">
        <div className="flex items-baseline justify-between mb-4">
          <h2
            className="text-[18px] font-bold"
            style={{ color: 'var(--foreground)' }}
          >
            Live demo
          </h2>
          <span
            className="text-[11px] font-mono"
            style={{ color: 'var(--text-muted)' }}
          >
            hover trade → highlight book level
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <RealOrderBook depth={12} highlightPrice={highlightPrice} />
          <RealTradeFeed max={20} onHoverPrice={setHighlightPrice} />
        </div>
        <p
          className="mt-3 text-[11px] font-mono"
          style={{ color: 'var(--text-muted)' }}
        >
          Both components are subscribed to the same synthetic feed. Open the
          market pulse below and try <span style={{ color: 'var(--red)' }}>Flash Crash</span>.
        </p>
      </section>

      {/* Install */}
      <section className="mb-12">
        <h2
          className="text-[18px] font-bold mb-4"
          style={{ color: 'var(--foreground)' }}
        >
          Install
        </h2>
        <CodeBlock
          tabs={[
            { label: 'npm', code: 'npm install @wick/order-book' },
            { label: 'pnpm', code: 'pnpm add @wick/order-book' },
            { label: 'yarn', code: 'yarn add @wick/order-book' },
          ]}
        />
      </section>

      {/* Usage */}
      <section className="mb-12">
        <h2
          className="text-[18px] font-bold mb-4"
          style={{ color: 'var(--foreground)' }}
        >
          Usage
        </h2>
        <CodeBlock
          tabs={[
            {
              label: 'Vanilla',
              code: `import '@wick/order-book';

const el = document.querySelector('wick-order-book');
el.data = {
  bids: [{ price: 67000, size: 1.2 }, /* ... */],
  asks: [{ price: 67010, size: 0.8 }, /* ... */],
};

// In HTML:
// <wick-order-book depth="15" size="md" show-depth></wick-order-book>`,
            },
            {
              label: 'React',
              code: `import { WickOrderBook } from '@wick/react';

export function Book({ book }) {
  return (
    <WickOrderBook
      data={book}
      depth={15}
      size="md"
      showDepth
      onLevelClick={(e) => console.log(e.detail)}
    />
  );
}`,
            },
            {
              label: 'Vue',
              code: `<script setup>
import '@wick/order-book';
const book = { bids: [...], asks: [...] };
</script>

<template>
  <wick-order-book :data="book" depth="15" size="md" show-depth />
</template>`,
            },
            {
              label: 'Svelte',
              code: `<script>
  import '@wick/order-book';
  export let book;
</script>

<wick-order-book data={book} depth={15} size="md" show-depth />`,
            },
          ]}
        />
      </section>

      {/* Props */}
      <section className="mb-12">
        <h2
          className="text-[18px] font-bold mb-4"
          style={{ color: 'var(--foreground)' }}
        >
          Properties
        </h2>
        <ApiTable
          rows={[
            ['data', 'OrderBookData', '{ bids: [], asks: [] }', 'Order book snapshot with bid and ask levels.'],
            ['depth', 'number', '15', 'Maximum number of levels to display per side.'],
            ['priceFormat', 'PriceFormatOptions', '{}', 'Price formatting (precision, locale, symbol).'],
            ['sizePrecision', 'number', '4', 'Decimal precision for size values.'],
            ['showTotal', 'boolean', 'false', 'Show cumulative total column.'],
            ['showDepth', 'boolean', 'false', 'Render cumulative depth bars behind rows.'],
            ['grouping', 'number', 'undefined', 'Group levels by price bucket (e.g. 0.5).'],
            ['size', '"sm" | "md" | "lg"', '"md"', 'Preset row height and font size.'],
          ]}
        />
      </section>

      {/* Events */}
      <section className="mb-12">
        <h2
          className="text-[18px] font-bold mb-4"
          style={{ color: 'var(--foreground)' }}
        >
          Events
        </h2>
        <ApiTable
          headers={['Event', 'Detail', 'Description']}
          rows={[
            [
              'wick-order-book-level-click',
              '{ side, price, size }',
              'Fired when the user clicks a bid or ask level row.',
            ],
          ]}
        />
      </section>

      {/* CSS parts */}
      <section className="mb-12">
        <h2
          className="text-[18px] font-bold mb-4"
          style={{ color: 'var(--foreground)' }}
        >
          CSS parts
        </h2>
        <ApiTable
          headers={['Part', 'Description']}
          rows={[
            ['container', 'Outer wrapper element'],
            ['header', 'Column headers row'],
            ['bids', 'Bid side container'],
            ['asks', 'Ask side container'],
            ['row', 'Each level row (also bid-row / ask-row variants)'],
            ['price', 'Price cell'],
            ['size', 'Size cell'],
            ['spread', 'Spread indicator between bids and asks'],
          ]}
        />
      </section>

      {/* CSS custom properties */}
      <section className="mb-12">
        <h2
          className="text-[18px] font-bold mb-4"
          style={{ color: 'var(--foreground)' }}
        >
          CSS custom properties
        </h2>
        <ApiTable
          headers={['Variable', 'Default', 'Description']}
          rows={[
            ['--wick-ob-bid-color', 'inherit', 'Color of bid prices'],
            ['--wick-ob-ask-color', 'inherit', 'Color of ask prices'],
            ['--wick-ob-bid-depth-color', 'rgba(34,197,94,0.12)', 'Cumulative depth bar color on bids'],
            ['--wick-ob-ask-depth-color', 'rgba(239,68,68,0.12)', 'Cumulative depth bar color on asks'],
            ['--wick-ob-row-hover', 'rgba(255,255,255,0.04)', 'Row hover background'],
            ['--wick-ob-font-size', '13px', 'Font size for rows'],
            ['--wick-ob-row-height', '24px', 'Row height'],
          ]}
        />
      </section>
    </article>
  );
}

// ─── Small helper for consistent API tables ──────────────────────────────────
function ApiTable({
  headers = ['Prop', 'Type', 'Default', 'Description'],
  rows,
}: {
  headers?: string[];
  rows: string[][];
}) {
  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <table className="w-full text-[13px]">
        <thead>
          <tr
            className="text-left"
            style={{
              borderBottom: '1px solid var(--border)',
              color: 'var(--text-muted)',
            }}
          >
            {headers.map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-[10px] font-mono uppercase tracking-wider font-bold"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              style={{
                borderBottom:
                  i < rows.length - 1
                    ? '1px solid color-mix(in oklab, var(--border) 60%, transparent)'
                    : 'none',
              }}
            >
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="px-4 py-3 align-top"
                  style={{
                    fontFamily:
                      j === 0 || (headers.length === 4 && j < 3)
                        ? 'var(--font-mono)'
                        : 'inherit',
                    color:
                      j === 0
                        ? 'var(--green)'
                        : j === row.length - 1
                          ? 'var(--text-2)'
                          : 'var(--foreground)',
                    fontSize: j === row.length - 1 ? '13px' : '12px',
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
