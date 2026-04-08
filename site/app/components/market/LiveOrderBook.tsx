'use client';

/**
 * LiveOrderBook — pure React order book renderer wired to the market engine.
 *
 * Note: this is a temporary visualization layer. In round 2 we swap this for
 * the real <wick-order-book> web component driven by the same engine feed.
 * The engine <-> data contract is identical, so the swap is trivial.
 */

import { useMarketBook, useMarketTick } from './MarketProvider';
import { useMemo } from 'react';

interface Props {
  depth?: number;
  /** Optional hover highlight; price passed from outside (e.g. trade feed hover) */
  highlightPrice?: number | null;
}

export function LiveOrderBook({ depth = 12, highlightPrice }: Props) {
  const book = useMarketBook();
  const tick = useMarketTick();

  const rows = useMemo(() => {
    if (!book) return null;
    const asks = [...book.asks].sort((a, b) => a.price - b.price).slice(0, depth);
    const bids = [...book.bids].sort((a, b) => b.price - a.price).slice(0, depth);

    // Cumulative totals (outward from best price)
    const asksWithTotal: { price: number; size: number; total: number }[] = [];
    let askTotal = 0;
    for (const a of asks) {
      askTotal += a.size;
      asksWithTotal.push({ ...a, total: askTotal });
    }
    const bidsWithTotal: { price: number; size: number; total: number }[] = [];
    let bidTotal = 0;
    for (const b of bids) {
      bidTotal += b.size;
      bidsWithTotal.push({ ...b, total: bidTotal });
    }
    const maxTotal = Math.max(askTotal, bidTotal);

    return {
      asks: asksWithTotal.reverse(), // top of book at bottom
      bids: bidsWithTotal,
      maxTotal,
    };
  }, [book, depth]);

  if (!book || !rows || !tick) {
    return <OrderBookSkeleton depth={depth} />;
  }

  const spread = rows.asks.length
    ? rows.asks[rows.asks.length - 1].price - rows.bids[0].price
    : 0;
  const spreadBps = (spread / tick.mid) * 10_000;

  return (
    <div
      className="rounded-xl border overflow-hidden font-mono text-[12px]"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Header */}
      <div
        className="grid grid-cols-3 gap-2 px-3 py-2 text-[10px] uppercase tracking-wider"
        style={{
          color: 'var(--text-muted)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div>Price (USD)</div>
        <div className="text-right">Size (BTC)</div>
        <div className="text-right">Total</div>
      </div>

      {/* Asks (top to bottom: worst to best) */}
      <div>
        {rows.asks.map((row) => (
          <Row
            key={`a-${row.price}`}
            row={row}
            maxTotal={rows.maxTotal}
            side="ask"
            highlighted={highlightPrice === row.price}
          />
        ))}
      </div>

      {/* Spread bar */}
      <div
        className="flex items-center justify-between px-3 py-2 text-[11px]"
        style={{
          background: 'var(--surface-2)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <span
          className={`font-bold tabular-nums transition-colors ${
            tick.direction === 'up'
              ? ''
              : tick.direction === 'down'
                ? ''
                : ''
          }`}
          style={{
            color:
              tick.direction === 'up'
                ? 'var(--green)'
                : tick.direction === 'down'
                  ? 'var(--red)'
                  : 'var(--foreground)',
          }}
        >
          {tick.mid.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
          <span className="ml-1 text-[9px]" aria-hidden>
            {tick.direction === 'up' ? '↑' : tick.direction === 'down' ? '↓' : '·'}
          </span>
        </span>
        <span
          className="text-[10px] tabular-nums"
          style={{ color: 'var(--text-muted)' }}
        >
          spread {spread.toFixed(2)}{' '}
          <span className="opacity-60">({spreadBps.toFixed(2)} bps)</span>
        </span>
      </div>

      {/* Bids */}
      <div>
        {rows.bids.map((row) => (
          <Row
            key={`b-${row.price}`}
            row={row}
            maxTotal={rows.maxTotal}
            side="bid"
            highlighted={highlightPrice === row.price}
          />
        ))}
      </div>
    </div>
  );
}

function Row({
  row,
  maxTotal,
  side,
  highlighted,
}: {
  row: { price: number; size: number; total: number };
  maxTotal: number;
  side: 'bid' | 'ask';
  highlighted: boolean;
}) {
  const pct = maxTotal > 0 ? (row.total / maxTotal) * 100 : 0;
  const color = side === 'bid' ? 'var(--green)' : 'var(--red)';
  const bg =
    side === 'bid'
      ? 'color-mix(in oklab, var(--green) 15%, transparent)'
      : 'color-mix(in oklab, var(--red) 15%, transparent)';

  const dir = side === 'bid' ? 'left' : 'right';

  return (
    <div
      className="relative grid grid-cols-3 gap-2 px-3 py-[3px] tabular-nums transition-colors"
      style={{
        background: highlighted
          ? `color-mix(in oklab, ${color} 10%, transparent)`
          : `linear-gradient(to ${dir}, ${bg} ${pct}%, transparent ${pct}%)`,
      }}
    >
      <span style={{ color }}>
        {row.price.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </span>
      <span className="text-right" style={{ color: 'var(--foreground)' }}>
        {row.size.toFixed(4)}
      </span>
      <span className="text-right" style={{ color: 'var(--text-2)' }}>
        {row.total.toFixed(4)}
      </span>
    </div>
  );
}

function OrderBookSkeleton({ depth }: { depth: number }) {
  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="px-3 py-2" style={{ borderBottom: '1px solid var(--border)' }}>
        <div
          className="h-3 w-16 rounded animate-pulse"
          style={{ background: 'var(--surface-2)' }}
        />
      </div>
      {Array.from({ length: depth * 2 + 1 }).map((_, i) => (
        <div key={i} className="px-3 py-[3px]">
          <div
            className="h-3 rounded animate-pulse"
            style={{ background: 'var(--surface-2)', opacity: 0.3 + Math.random() * 0.5 }}
          />
        </div>
      ))}
    </div>
  );
}
