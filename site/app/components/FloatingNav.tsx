"use client";

import { useState, useEffect, useRef } from "react";
import { GITHUB, DOCS_BASE, VERSION } from "../lib/constants";

// ── All 31 components across 8 categories ─────────────────────────────────────

const CATEGORIES = [
  {
    label: "Market Data",
    items: [
      { name: "Order Book",       tag: "wick-order-book",         desc: "Live bids & asks with depth bars" },
      { name: "Price Ticker",     tag: "wick-price-ticker",       desc: "Flash-on-change, 24h stats" },
      { name: "Trade Feed",       tag: "wick-trade-feed",         desc: "Scrolling executed trades" },
      { name: "Depth Chart",      tag: "wick-depth-chart",        desc: "Cumulative bid/ask curves" },
      { name: "Funding Rate",     tag: "wick-funding-rate",       desc: "Perp funding + countdown" },
      { name: "Open Interest",    tag: "wick-open-interest",      desc: "OI over time, long/short ratio" },
      { name: "Liquidation Feed", tag: "wick-liquidation-feed",   desc: "Real-time liquidations" },
      { name: "DOM Ladder",       tag: "wick-dom-ladder",         desc: "Depth of market ladder" },
    ],
  },
  {
    label: "Charts",
    items: [
      { name: "Candlestick",        tag: "wick-candlestick-chart",  desc: "OHLCV with volume histogram" },
      { name: "Mini Chart",         tag: "wick-mini-chart",         desc: "Pure SVG sparklines, ~2 KB" },
      { name: "Volume Profile",     tag: "wick-volume-profile",     desc: "Price × volume histogram" },
      { name: "Drawing Tools",      tag: "wick-drawing-overlay",    desc: "Lines, channels, annotations" },
      { name: "Correlation Matrix", tag: "wick-correlation-matrix", desc: "Asset correlation heatmap" },
      { name: "Indicators",         tag: "wick-indicators",         desc: "EMA, RSI, MACD, Bollinger" },
    ],
  },
  {
    label: "Heatmaps",
    items: [
      { name: "Order Book Heatmap", tag: "wick-order-book-heatmap", desc: "Time-based order book density" },
      { name: "Market Heatmap",     tag: "wick-market-heatmap",     desc: "Asset performance treemap" },
    ],
  },
  {
    label: "Execution",
    items: [
      { name: "Order Ticket",    tag: "wick-order-ticket",    desc: "Buy/sell form with margin calc" },
      { name: "Order Manager",   tag: "wick-order-manager",   desc: "Open orders with cancel/modify" },
      { name: "Position Sizer",  tag: "wick-position-sizer",  desc: "Risk-based position calculator" },
    ],
  },
  {
    label: "Portfolio",
    items: [
      { name: "Positions",      tag: "wick-positions",      desc: "Open positions with live PnL" },
      { name: "P&L",            tag: "wick-pnl",            desc: "PnL summary + equity curve" },
      { name: "Trade History",  tag: "wick-trade-history",  desc: "Closed trades log" },
      { name: "Risk Panel",     tag: "wick-risk-panel",     desc: "Portfolio risk metrics" },
    ],
  },
  {
    label: "Market Overview",
    items: [
      { name: "Watchlist",     tag: "wick-watchlist",      desc: "Symbol list with live prices" },
      { name: "Screener",      tag: "wick-screener",       desc: "Multi-criteria symbol screener" },
      { name: "Symbol Search", tag: "wick-symbol-search",  desc: "Fuzzy search with exchange filter" },
      { name: "Market Clock",  tag: "wick-market-clock",   desc: "Global trading session times" },
    ],
  },
  {
    label: "Alerts & Intel",
    items: [
      { name: "Alerts",              tag: "wick-alerts",             desc: "Price and condition alerts" },
      { name: "News Feed",           tag: "wick-news-feed",          desc: "Real-time market news" },
      { name: "Economic Calendar",   tag: "wick-economic-calendar",  desc: "Macro events & forecasts" },
      { name: "Connection Status",   tag: "wick-connection-status",  desc: "WebSocket health indicator" },
    ],
  },
] as const;

// Split into 3 columns for the mega-menu layout
const COL_LEFT   = [CATEGORIES[0]];                        // Market Data
const COL_CENTER = [CATEGORIES[1], CATEGORIES[2]];         // Charts, Heatmaps
const COL_RIGHT  = [CATEGORIES[3], CATEGORIES[4], CATEGORIES[5], CATEGORIES[6]]; // Execution, Portfolio, Overview, Alerts

// ── Nav links ──────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "Docs",    href: DOCS_BASE },
  { label: "Themes",  href: "#themes" },
  { label: "GitHub",  href: GITHUB, external: true },
] as const;

// ── CategoryColumn ─────────────────────────────────────────────────────────────

function CategoryColumn({
  categories,
}: {
  categories: readonly (typeof CATEGORIES)[number][];
}) {
  return (
    <div className="space-y-5">
      {categories.map((cat) => (
        <div key={cat.label}>
          <p
            className="text-[10px] font-semibold uppercase tracking-widest px-2 mb-1.5"
            style={{ color: "var(--text-muted)" }}
          >
            {cat.label}
          </p>
          <div className="space-y-0.5">
            {cat.items.map((item) => (
              <a
                key={item.tag}
                href={`${DOCS_BASE}/${item.tag}`}
                className="flex items-center justify-between px-2 py-1.5 rounded-xl transition-colors group"
                style={{ color: "var(--foreground)" }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.background = "transparent")
                }
              >
                <div>
                  <div className="text-[13px] font-medium leading-tight">{item.name}</div>
                  <div className="text-[11px] mt-0.5 leading-tight" style={{ color: "var(--text-muted)" }}>
                    {item.desc}
                  </div>
                </div>
                <code
                  className="text-[9px] font-mono ml-3 shrink-0"
                  style={{ color: "var(--green)" }}
                >
                  &lt;{item.tag}&gt;
                </code>
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── FloatingNav ────────────────────────────────────────────────────────────────

export function FloatingNav() {
  const [open, setOpen]         = useState(false);
  const [mobileOpen, setMobile] = useState(false);
  const [mobileExp, setExp]     = useState<string | null>(null);
  const triggerRef              = useRef<HTMLDivElement>(null);

  // Close dropdown on Escape; close mobile drawer on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); setMobile(false); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  // Lock scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-[740px]">
        <nav
          aria-label="Main navigation"
          className="flex items-center px-3 py-2 rounded-2xl"
          style={{
            background: "rgba(6,6,10,0.88)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          {/* ── Logo ── */}
          <a
            href="/"
            className="flex items-center gap-2 px-2 mr-4 shrink-0"
            aria-label="Wick home"
          >
            <span
              aria-hidden="true"
              className="w-2 h-2 rounded-full"
              style={{ background: "var(--green)", boxShadow: "0 0 8px var(--green)" }}
            />
            <span className="font-bold text-[15px] tracking-tight" style={{ color: "var(--foreground)" }}>
              Wick
            </span>
          </a>

          {/* ── Desktop links ── */}
          <div className="hidden md:flex items-center gap-0.5 flex-1">
            {/* Components dropdown */}
            <div
              ref={triggerRef}
              className="relative"
              onMouseEnter={() => setOpen(true)}
              onMouseLeave={() => setOpen(false)}
            >
              <button
                aria-haspopup="true"
                aria-expanded={open}
                aria-controls="components-menu"
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition-colors"
                style={{ color: open ? "var(--foreground)" : "var(--text-2)" }}
              >
                Components
                <svg
                  aria-hidden="true"
                  width="10"
                  height="6"
                  viewBox="0 0 10 6"
                  fill="none"
                  style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
                >
                  <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* Mega-menu */}
              {open && (
                <div
                  id="components-menu"
                  role="region"
                  aria-label="Components menu"
                  className="absolute top-full left-0 mt-2 p-5 rounded-2xl"
                  style={{
                    background: "rgba(9,9,14,0.98)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: "0 24px 48px rgba(0,0,0,0.55)",
                    minWidth: "720px",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "1.25rem",
                  }}
                >
                  <CategoryColumn categories={COL_LEFT} />
                  <CategoryColumn categories={COL_CENTER} />
                  <CategoryColumn categories={COL_RIGHT} />
                </div>
              )}
            </div>

            {/* Other nav links */}
            {NAV_LINKS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target={"external" in item && item.external ? "_blank" : undefined}
                rel={"external" in item && item.external ? "noopener noreferrer" : undefined}
                className="px-3 py-1.5 rounded-xl text-sm transition-colors"
                style={{ color: "var(--text-2)" }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = "var(--foreground)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = "var(--text-2)")
                }
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* ── Version badge (desktop) ── */}
          <div className="hidden md:flex ml-auto items-center gap-2">
            <span
              className="font-mono text-[11px] px-2.5 py-1 rounded-lg"
              style={{
                color: "var(--text-muted)",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              v{VERSION}
            </span>
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            className="md:hidden ml-auto p-2 rounded-xl"
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobile((v) => !v)}
            style={{ color: "var(--text-2)" }}
          >
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none">
              {mobileOpen ? (
                <>
                  <line x1="4" y1="4" x2="16" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="16" y1="4" x2="4" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="17" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="3" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="3" y1="14" x2="17" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </>
              )}
            </svg>
          </button>
        </nav>
      </div>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div
          id="mobile-nav"
          className="fixed inset-0 z-40 md:hidden overflow-y-auto"
          style={{ background: "rgba(6,6,10,0.97)", paddingTop: "80px" }}
        >
          <nav aria-label="Mobile navigation" className="px-5 pb-10">
            {/* All categories */}
            {CATEGORIES.map((cat) => (
              <div key={cat.label} className="mb-1">
                <button
                  className="w-full flex items-center justify-between px-3 py-3 text-sm font-semibold"
                  style={{ color: "var(--foreground)" }}
                  aria-expanded={mobileExp === cat.label}
                  onClick={() =>
                    setExp((prev) => (prev === cat.label ? null : cat.label))
                  }
                >
                  <span>{cat.label}</span>
                  <span
                    aria-hidden="true"
                    style={{
                      color: "var(--text-muted)",
                      transform: mobileExp === cat.label ? "rotate(180deg)" : "none",
                      transition: "transform 0.2s",
                      display: "inline-block",
                    }}
                  >
                    ↓
                  </span>
                </button>

                {mobileExp === cat.label && (
                  <div className="pb-2 pl-3 space-y-0.5">
                    {cat.items.map((item) => (
                      <a
                        key={item.tag}
                        href={`${DOCS_BASE}/${item.tag}`}
                        className="flex items-center justify-between px-2 py-2 rounded-xl"
                        style={{ color: "var(--text-2)" }}
                        onClick={() => setMobile(false)}
                      >
                        <span className="text-sm">{item.name}</span>
                        <code
                          className="text-[9px] font-mono"
                          style={{ color: "var(--green)" }}
                        >
                          &lt;{item.tag}&gt;
                        </code>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Other links */}
            <div
              className="mt-4 pt-4 space-y-1"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              {NAV_LINKS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target={"external" in item && item.external ? "_blank" : undefined}
                  rel={"external" in item && item.external ? "noopener noreferrer" : undefined}
                  className="block px-3 py-2.5 rounded-xl text-sm font-medium"
                  style={{ color: "var(--text-2)" }}
                  onClick={() => setMobile(false)}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
