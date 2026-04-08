import Link from 'next/link';

export default function DocsIndex() {
  return (
    <article>
      <header className="mb-10">
        <div
          className="text-[11px] font-mono uppercase tracking-[0.12em] mb-3"
          style={{ color: 'var(--text-muted)' }}
        >
          Docs
        </div>
        <h1
          className="text-[clamp(2rem,4vw,3rem)] font-bold tracking-tight leading-[1.05] mb-5"
          style={{ color: 'var(--foreground)' }}
        >
          Headless web components
          <br />
          <span style={{ color: 'var(--green)' }}>for traders who ship.</span>
        </h1>
        <p
          className="text-[16px] leading-relaxed max-w-[640px]"
          style={{ color: 'var(--text-2)' }}
        >
          Wick is a set of 31 unstyled, framework-agnostic web components for
          trading interfaces. Bring your own styles, your own data, and your own
          framework. Every example in these docs is wired to one shared
          synthetic market feed running in your browser.
        </p>
      </header>

      <section
        className="rounded-2xl border p-6 mb-8 flex items-center gap-4 flex-wrap"
        style={{
          background:
            'linear-gradient(90deg, color-mix(in oklab, var(--green) 6%, transparent), transparent)',
          borderColor: 'color-mix(in oklab, var(--green) 25%, var(--border))',
        }}
      >
        <span
          className="h-2 w-2 rounded-full"
          style={{
            background: 'var(--green)',
            boxShadow:
              '0 0 10px color-mix(in oklab, var(--green) 80%, transparent)',
          }}
        />
        <span
          className="text-[13px] leading-relaxed flex-1"
          style={{ color: 'var(--text-2)' }}
        >
          <span className="font-bold" style={{ color: 'var(--green)' }}>
            New:
          </span>{' '}
          Living documentation — every component below is wired to one shared
          synthetic market feed. Open the market pulse at the bottom, pick a
          scenario, scrub time.
        </span>
        <Link
          href="/live"
          className="text-[12px] font-mono font-bold px-3 py-1.5 rounded-md transition-colors"
          style={{
            background: 'var(--green)',
            color: '#06060a',
          }}
        >
          OPEN LIVE →
        </Link>
      </section>

      {/* What "headless" means */}
      <section className="mb-12">
        <h2
          className="text-[20px] font-bold mb-5"
          style={{ color: 'var(--foreground)' }}
        >
          What "headless" means
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: 'No styles shipped',
              body: 'Components render semantic HTML with CSS parts and custom properties. You control every color, spacing, and font — nothing to override.',
            },
            {
              title: 'No framework lock-in',
              body: 'Standard web components. Drop them into React, Vue, Svelte, Angular, or plain HTML. The same package works everywhere.',
            },
            {
              title: 'No data opinions',
              body: 'Feed them plain objects — bids, asks, trades, candles. Use any exchange, any WebSocket, any mock. Wick never touches the network.',
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-xl border p-5"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border)',
              }}
            >
              <div
                className="text-[14px] font-bold mb-2"
                style={{ color: 'var(--green)' }}
              >
                {card.title}
              </div>
              <p
                className="text-[13px] leading-relaxed"
                style={{ color: 'var(--text-2)' }}
              >
                {card.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2
          className="text-[20px] font-bold mb-5"
          style={{ color: 'var(--foreground)' }}
        >
          Quick start
        </h2>
        <div
          className="rounded-xl border overflow-hidden"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div
            className="px-4 py-2 text-[11px] font-mono uppercase tracking-wider border-b"
            style={{
              color: 'var(--text-muted)',
              borderColor: 'var(--border)',
            }}
          >
            Terminal
          </div>
          <pre
            className="px-4 py-4 text-[13px] font-mono overflow-x-auto"
            style={{ color: 'var(--foreground)' }}
          >
{`npm install @wick/order-book @wick/trade-feed @wick/price-ticker`}
          </pre>
        </div>
      </section>

      <section>
        <h2
          className="text-[20px] font-bold mb-5"
          style={{ color: 'var(--foreground)' }}
        >
          Start here
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              href: '/docs/order-book',
              title: 'Order Book',
              desc: 'Real-time bid/ask ladder with depth visualization.',
              pkg: '@wick/order-book',
            },
            {
              href: '/live',
              title: 'Live playground',
              desc: 'Every component wired to one shared scenario-driven feed.',
              pkg: '6 scenarios · time scrubber',
            },
          ].map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="rounded-xl border p-5 transition-colors group"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border)',
              }}
            >
              <div
                className="text-[10px] font-mono uppercase tracking-wider mb-2"
                style={{ color: 'var(--text-muted)' }}
              >
                {card.pkg}
              </div>
              <div
                className="text-[16px] font-bold mb-1 group-hover:text-[var(--green)] transition-colors"
                style={{ color: 'var(--foreground)' }}
              >
                {card.title} →
              </div>
              <div
                className="text-[13px] leading-relaxed"
                style={{ color: 'var(--text-2)' }}
              >
                {card.desc}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}
