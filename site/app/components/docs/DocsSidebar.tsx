'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  label: string;
  href: string;
  status?: 'ready' | 'soon';
}
interface NavSection {
  title: string;
  items: NavItem[];
}

const SECTIONS: NavSection[] = [
  {
    title: 'Getting Started',
    items: [
      { label: 'Introduction', href: '/docs', status: 'ready' },
      { label: 'Installation', href: '/docs/installation', status: 'soon' },
      { label: 'Theming', href: '/docs/theming', status: 'soon' },
      { label: 'Live playground', href: '/live', status: 'ready' },
    ],
  },
  {
    title: 'Market Data',
    items: [
      { label: 'Order Book', href: '/docs/order-book', status: 'ready' },
      { label: 'Price Ticker', href: '/docs/price-ticker', status: 'soon' },
      { label: 'Trade Feed', href: '/docs/trade-feed', status: 'soon' },
      { label: 'Depth Chart', href: '/docs/depth-chart', status: 'soon' },
      { label: 'Funding Rate', href: '/docs/funding-rate', status: 'soon' },
      { label: 'Open Interest', href: '/docs/open-interest', status: 'soon' },
      { label: 'Liquidation Feed', href: '/docs/liquidation-feed', status: 'soon' },
      { label: 'DOM Ladder', href: '/docs/dom-ladder', status: 'soon' },
    ],
  },
  {
    title: 'Charts',
    items: [
      { label: 'Candlestick', href: '/docs/candlestick-chart', status: 'soon' },
      { label: 'Mini Chart', href: '/docs/mini-chart', status: 'soon' },
      { label: 'Volume Profile', href: '/docs/volume-profile', status: 'soon' },
      { label: 'Indicators', href: '/docs/indicators', status: 'soon' },
    ],
  },
  {
    title: 'Execution',
    items: [
      { label: 'Order Ticket', href: '/docs/order-ticket', status: 'soon' },
      { label: 'Order Manager', href: '/docs/order-manager', status: 'soon' },
      { label: 'Position Sizer', href: '/docs/position-sizer', status: 'soon' },
    ],
  },
  {
    title: 'Portfolio',
    items: [
      { label: 'Positions', href: '/docs/positions', status: 'soon' },
      { label: 'PnL', href: '/docs/pnl', status: 'soon' },
      { label: 'Trade History', href: '/docs/trade-history', status: 'soon' },
      { label: 'Risk Panel', href: '/docs/risk-panel', status: 'soon' },
    ],
  },
];

export function DocsSidebar() {
  const pathname = usePathname();
  const [roadmapOpen, setRoadmapOpen] = useState(false);

  // Split into "ready" sections (shown normally) and a flat "soon" list (collapsed)
  const readySections: NavSection[] = SECTIONS.map((s) => ({
    title: s.title,
    items: s.items.filter((i) => i.status !== 'soon'),
  })).filter((s) => s.items.length > 0);

  const soonItems = SECTIONS.flatMap((s) =>
    s.items.filter((i) => i.status === 'soon').map((i) => ({ ...i, section: s.title })),
  );

  return (
    <aside className="hidden lg:block w-[220px] shrink-0">
      <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
        <Link
          href="/"
          className="text-[11px] font-mono uppercase tracking-wider mb-8 block transition-colors hover:opacity-80"
          style={{ color: 'var(--text-muted)' }}
        >
          ← Wick
        </Link>

        {readySections.map((section) => (
          <div key={section.title} className="mb-7">
            <div
              className="text-[10px] font-mono uppercase tracking-[0.12em] font-bold mb-2.5 px-2"
              style={{ color: 'var(--text-muted)' }}
            >
              {section.title}
            </div>
            <ul className="space-y-[2px]">
              {section.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="flex items-center justify-between gap-2 rounded-md px-2 py-[6px] text-[13px] transition-colors"
                      style={{
                        background: active
                          ? 'color-mix(in oklab, var(--green) 8%, transparent)'
                          : 'transparent',
                        color: active ? 'var(--green)' : 'var(--text-2)',
                        fontWeight: active ? 600 : 400,
                      }}
                    >
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        {/* Roadmap (collapsed by default) */}
        {soonItems.length > 0 && (
          <div className="mb-7 mt-2 pt-5" style={{ borderTop: '1px solid var(--border)' }}>
            <button
              onClick={() => setRoadmapOpen((v) => !v)}
              aria-expanded={roadmapOpen}
              className="w-full flex items-center justify-between gap-2 rounded-md px-2 py-[6px] text-[10px] font-mono uppercase tracking-[0.12em] font-bold transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              <span className="flex items-center gap-2">
                Roadmap
                <span
                  className="text-[9px] font-mono normal-case tracking-normal px-1.5 py-[1px] rounded"
                  style={{
                    background: 'color-mix(in oklab, var(--foreground) 4%, transparent)',
                    color: 'var(--text-muted)',
                  }}
                >
                  {soonItems.length}
                </span>
              </span>
              <span
                aria-hidden
                style={{
                  transform: roadmapOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s',
                  display: 'inline-block',
                }}
              >
                ↓
              </span>
            </button>
            {roadmapOpen && (
              <ul className="mt-2 space-y-[2px]">
                {soonItems.map((item) => (
                  <li key={item.href}>
                    <span
                      className="flex items-center justify-between gap-2 rounded-md px-2 py-[6px] text-[13px]"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <span className="truncate">{item.label}</span>
                      <span className="text-[9px] font-mono opacity-60">
                        {item.section.split(' ')[0]}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
