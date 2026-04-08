'use client';

/**
 * Real Wick web-component wrappers, driven by the shared MarketEngine.
 *
 * Each wrapper dynamically imports its @wick/* package on the client so the
 * `@customElement()` decorator runs, then syncs engine data onto the custom
 * element's properties via ref. We read a named export to defeat the
 * `sideEffects: false` tree-shaking hint.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useMarketBook, useMarketFrame, useMarketTrades } from './MarketProvider';
import type { Book, Trade as EngineTrade } from '../../lib/market-engine';

// ─── JSX typings for the custom elements ─────────────────────────────────────
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'wick-order-book': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          depth?: number;
          grouping?: number;
          size?: 'sm' | 'md' | 'lg';
          'show-depth'?: boolean;
        },
        HTMLElement
      >;
      'wick-price-ticker': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          size?: 'sm' | 'md' | 'lg';
          'show-details'?: boolean;
        },
        HTMLElement
      >;
      'wick-trade-feed': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          'max-trades'?: number;
          size?: 'sm' | 'md' | 'lg';
        },
        HTMLElement
      >;
    }
  }
}

// ─── Session stat tracking (for the ticker) ──────────────────────────────────
function useSessionStats() {
  const frame = useMarketFrame();
  const statsRef = useRef<{
    open: number | null;
    high: number;
    low: number;
    vol: number;
    lastSeq: number;
  }>({ open: null, high: 0, low: Infinity, vol: 0, lastSeq: -1 });

  if (frame && statsRef.current.open === null) {
    statsRef.current.open = frame.mid;
    statsRef.current.high = frame.mid;
    statsRef.current.low = frame.mid;
  }
  if (frame && frame.seq !== statsRef.current.lastSeq) {
    const s = statsRef.current;
    if (frame.mid > s.high) s.high = frame.mid;
    if (frame.mid < s.low) s.low = frame.mid;
    for (const t of frame.trades) s.vol += t.size;
    s.lastSeq = frame.seq;
  }

  const s = statsRef.current;
  if (!frame || s.open === null) return null;
  const open = s.open;
  return {
    price: frame.mid,
    open,
    high: s.high,
    low: s.low,
    vol: s.vol,
    change24h: ((frame.mid - open) / open) * 100,
  };
}

// ─── Loader hook ─────────────────────────────────────────────────────────────
type LoaderFn = () => Promise<unknown>;
function useCustomElement(tagName: string, loader: LoaderFn) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.customElements.get(tagName)) {
      setReady(true);
      return;
    }
    let cancelled = false;
    loader()
      .then((mod) => {
        // Touch the module to defeat tree-shaking of `sideEffects: false`.
        void mod;
        if (!cancelled) setReady(true);
      })
      .catch((err) => {
        console.error(`[wick] failed to load ${tagName}`, err);
      });
    return () => {
      cancelled = true;
    };
  }, [tagName, loader]);
  return ready;
}

// ─── Shared skeleton ─────────────────────────────────────────────────────────
function Skeleton({ height }: { height: number }) {
  return (
    <div
      className="rounded-lg border animate-pulse"
      style={{
        height,
        background: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
    />
  );
}

// ─── RealOrderBook ───────────────────────────────────────────────────────────
interface OrderBookProps {
  depth?: number;
  highlightPrice?: number | null;
}

export function RealOrderBook({ depth = 12, highlightPrice }: OrderBookProps) {
  const ready = useCustomElement('wick-order-book', () => import('@wick/order-book'));
  const ref = useRef<HTMLElement>(null);
  const book = useMarketBook();

  useEffect(() => {
    if (!ready || !ref.current || !book) return;
    // Sort/trim here so the element gets a stable, bounded snapshot.
    const asks = [...book.asks].sort((a, b) => a.price - b.price).slice(0, depth);
    const bids = [...book.bids].sort((a, b) => b.price - a.price).slice(0, depth);
    (ref.current as unknown as { data: Book }).data = { bids, asks };
  }, [ready, book, depth]);

  useEffect(() => {
    if (!ready || !ref.current) return;
    const el = ref.current;
    // Optional highlight: mark the matching level via a data attribute on rows.
    // We key off CSS parts below in wick-components.css.
    el.setAttribute(
      'data-highlight-price',
      highlightPrice != null ? String(highlightPrice) : '',
    );
  }, [ready, highlightPrice]);

  if (!ready) return <Skeleton height={420} />;
  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <wick-order-book ref={ref} depth={depth} size="md" show-depth />
    </div>
  );
}

// ─── RealPriceTicker ─────────────────────────────────────────────────────────
export function RealPriceTicker() {
  const ready = useCustomElement('wick-price-ticker', () => import('@wick/price-ticker'));
  const ref = useRef<HTMLElement>(null);
  const stats = useSessionStats();

  useEffect(() => {
    if (!ready || !ref.current || !stats) return;
    (ref.current as unknown as { data: unknown }).data = {
      symbol: 'BTC/USD PERP',
      price: stats.price,
      high24h: stats.high,
      low24h: stats.low,
      volume24h: stats.vol,
      change24h: stats.change24h,
      timestamp: Date.now(),
    };
  }, [ready, stats]);

  if (!ready) return <Skeleton height={96} />;
  return (
    <div
      className="rounded-lg border px-6 py-5"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <wick-price-ticker ref={ref} size="lg" show-details />
    </div>
  );
}

// ─── RealTradeFeed ───────────────────────────────────────────────────────────
interface TradeFeedProps {
  max?: number;
  onHoverPrice?: (price: number | null) => void;
}

export function RealTradeFeed({ max = 24, onHoverPrice }: TradeFeedProps) {
  const ready = useCustomElement('wick-trade-feed', () => import('@wick/trade-feed'));
  const ref = useRef<HTMLElement>(null);
  const trades = useMarketTrades(max);

  // Map engine trades (ts) -> core Trade (timestamp).
  const mapped = useMemo(
    () =>
      trades.map((t: EngineTrade) => ({
        id: t.id,
        price: t.price,
        size: t.size,
        side: t.side,
        timestamp: t.ts,
      })),
    [trades],
  );

  useEffect(() => {
    if (!ready || !ref.current) return;
    (ref.current as unknown as { trades: unknown }).trades = mapped;
  }, [ready, mapped]);

  useEffect(() => {
    if (!ready || !ref.current || !onHoverPrice) return;
    const el = ref.current;
    const handleOver = (e: Event) => {
      const row = (e.target as HTMLElement).closest('tr[part~="row"]');
      if (!row) return;
      const priceCell = row.querySelector('td[part~="price"]');
      const text = priceCell?.textContent?.trim().replace(/,/g, '');
      const price = text ? Number(text) : NaN;
      if (!Number.isNaN(price)) onHoverPrice(price);
    };
    const handleOut = () => onHoverPrice(null);
    el.addEventListener('mouseover', handleOver);
    el.addEventListener('mouseleave', handleOut);
    return () => {
      el.removeEventListener('mouseover', handleOver);
      el.removeEventListener('mouseleave', handleOut);
    };
  }, [ready, onHoverPrice]);

  if (!ready) return <Skeleton height={420} />;
  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <wick-trade-feed ref={ref} max-trades={max} size="md" />
    </div>
  );
}
