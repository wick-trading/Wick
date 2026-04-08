'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  RealOrderBook,
  RealTradeFeed,
  RealPriceTicker,
} from '../components/market/RealComponents';

export default function LivePage() {
  // Shared highlight state: hovering a trade lights up the same price in the book
  const [highlightPrice, setHighlightPrice] = useState<number | null>(null);

  return (
    <main className="min-h-screen pb-40" style={{ background: 'var(--background)' }}>
      {/* Ambient glow (matches landing aesthetic) */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            'radial-gradient(circle at 80% 0%, color-mix(in oklab, var(--green) 8%, transparent), transparent 40%), radial-gradient(circle at 10% 10%, rgba(124,93,250,0.1), transparent 45%)',
        }}
        aria-hidden
      />

      <div className="mx-auto max-w-[1200px] px-6 pt-20">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Link
                href="/"
                className="text-[11px] font-mono uppercase tracking-wider transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                ← Wick
              </Link>
              <span
                className="text-[11px] font-mono"
                style={{ color: 'var(--text-muted)' }}
              >
                /
              </span>
              <span
                className="text-[11px] font-mono uppercase tracking-wider"
                style={{ color: 'var(--foreground)' }}
              >
                Live
              </span>
            </div>
            <h1
              className="text-[clamp(2rem,4vw,3rem)] font-bold tracking-tight leading-[1.05] mb-3"
              style={{ color: 'var(--foreground)' }}
            >
              Living documentation.
              <br />
              <span style={{ color: 'var(--green)' }}>One market.</span>{' '}
              <span style={{ color: 'var(--text-2)' }}>Every component.</span>
            </h1>
            <p
              className="text-[15px] leading-relaxed max-w-[600px]"
              style={{ color: 'var(--text-2)' }}
            >
              These components are not screenshots. They are live, wired to one
              synthetic market feed running in your browser. Pick a scenario.
              Scrub time. Watch a flash crash replay. Feel the tape.
            </p>
          </div>

          <div
            className="rounded-lg border px-3 py-2 text-[10px] font-mono leading-relaxed"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--text-2)',
            }}
          >
            <div
              className="mb-1.5 font-bold uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}
            >
              Keyboard
            </div>
            <div>
              <kbd className="font-mono" style={{ color: 'var(--foreground)' }}>
                Space
              </kbd>{' '}
              pause / play
            </div>
            <div>
              <kbd className="font-mono" style={{ color: 'var(--foreground)' }}>
                ← →
              </kbd>{' '}
              step frame
            </div>
            <div>
              <kbd className="font-mono" style={{ color: 'var(--foreground)' }}>
                1–6
              </kbd>{' '}
              pick scenario
            </div>
          </div>
        </div>

        {/* Hint banner */}
        <div
          className="mb-8 rounded-xl border px-4 py-3 flex items-center gap-3 flex-wrap"
          style={{
            background:
              'linear-gradient(90deg, color-mix(in oklab, var(--green) 6%, transparent), transparent)',
            borderColor: 'color-mix(in oklab, var(--green) 25%, var(--border))',
          }}
        >
          <span
            className="h-2 w-2 rounded-full shrink-0"
            style={{
              background: 'var(--green)',
              boxShadow:
                '0 0 10px color-mix(in oklab, var(--green) 80%, transparent)',
            }}
            aria-hidden
          />
          <span className="text-[12px]" style={{ color: 'var(--text-2)' }}>
            <span
              className="font-bold"
              style={{ color: 'var(--green)' }}
            >
              Try it:
            </span>{' '}
            Open the market pulse at the bottom of the page. Pick{' '}
            <span
              className="font-mono font-bold"
              style={{ color: 'var(--red)' }}
            >
              Flash Crash
            </span>{' '}
            and watch the book react. Then scrub back and replay it.
          </span>
        </div>

        {/* Ticker full-width */}
        <div className="mb-6 relative">
          <div
            className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[9px] font-mono uppercase tracking-wider"
            style={{
              background: 'color-mix(in oklab, var(--accent) 15%, transparent)',
              border: '1px solid color-mix(in oklab, var(--accent) 40%, transparent)',
              color: 'var(--accent-2)',
            }}
            title="Prices, trades, and book depth are generated in-browser — no real market data."
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
              <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.2" />
              <path d="M5 3v2.5M5 7v.01" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            Synthetic data
          </div>
          <RealPriceTicker />
        </div>

        {/* Book + Feed side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ComponentCard
            title="Order Book"
            pkg="@wick/order-book"
            hint="Hover a trade → the matching level lights up here."
          >
            <RealOrderBook depth={12} highlightPrice={highlightPrice} />
          </ComponentCard>

          <ComponentCard
            title="Trade Feed"
            pkg="@wick/trade-feed"
            hint="Hover any row to cross-highlight the order book."
          >
            <RealTradeFeed max={24} onHoverPrice={setHighlightPrice} />
          </ComponentCard>
        </div>

        {/* Explainer */}
        <section
          className="mt-16 rounded-2xl border p-8"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          <h2
            className="text-xl font-bold mb-4"
            style={{ color: 'var(--foreground)' }}
          >
            Why this is different.
          </h2>
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 text-[13px] leading-relaxed"
            style={{ color: 'var(--text-2)' }}
          >
            <div>
              <div
                className="font-bold mb-2 text-[12px] uppercase tracking-wider"
                style={{ color: 'var(--green)' }}
              >
                01 · One shared feed
              </div>
              <p>
                Every component on this page is subscribed to a single synthetic
                market engine running in your browser. They tick in lockstep.
                That's why the trade feed hover highlights the order book — they
                share state.
              </p>
            </div>
            <div>
              <div
                className="font-bold mb-2 text-[12px] uppercase tracking-wider"
                style={{ color: 'var(--green)' }}
              >
                02 · Replayable scenarios
              </div>
              <p>
                Six hand-tuned market conditions —{' '}
                <span
                  className="font-mono"
                  style={{ color: 'var(--foreground)' }}
                >
                  calm, rally, flash crash, liquidation cascade, whale wall, low
                  liquidity
                </span>
                . Pick one and watch the engine drive the book, spread, and
                trade rate accordingly.
              </p>
            </div>
            <div>
              <div
                className="font-bold mb-2 text-[12px] uppercase tracking-wider"
                style={{ color: 'var(--green)' }}
              >
                03 · Time scrubber
              </div>
              <p>
                30 seconds of history buffered at 20Hz. Rewind the last crash.
                Step frame by frame. Pause on a specific tick to inspect the
                book state. Then hit{' '}
                <span
                  className="font-mono font-bold"
                  style={{ color: 'var(--green)' }}
                >
                  GO LIVE
                </span>{' '}
                to resume.
              </p>
            </div>
          </div>
        </section>

        <p
          className="mt-8 text-center text-[11px] font-mono"
          style={{ color: 'var(--text-muted)' }}
        >
          These are the real{' '}
          <span style={{ color: 'var(--foreground)' }}>
            &lt;wick-*&gt;
          </span>{' '}
          headless web components, driven by one shared synthetic feed.
        </p>
      </div>
    </main>
  );
}

function ComponentCard({
  title,
  pkg,
  hint,
  children,
}: {
  title: string;
  pkg: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-3 px-1">
        <div className="flex items-baseline gap-3">
          <h3
            className="text-[15px] font-bold"
            style={{ color: 'var(--foreground)' }}
          >
            {title}
          </h3>
          <span
            className="text-[11px] font-mono"
            style={{ color: 'var(--text-muted)' }}
          >
            {pkg}
          </span>
        </div>
      </div>
      {children}
      <p
        className="mt-2 px-1 text-[11px]"
        style={{ color: 'var(--text-muted)' }}
      >
        {hint}
      </p>
    </div>
  );
}
