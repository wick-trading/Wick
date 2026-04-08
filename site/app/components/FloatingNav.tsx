"use client";

import { useState, useEffect, useRef } from "react";
import { GITHUB, DOCS_BASE, VERSION } from "../lib/constants";
import { useTheme } from "./ThemeProvider";

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

// Slugify category label to match landing-page hash: "Market Data" → "market-data"
const catSlug = (label: string) =>
  label.toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "");

// Target href: takes users to the landing #components section with category preselected
const catHref = (label: string) => `/Wick/#components?cat=${catSlug(label)}`;

// ── Icons ──────────────────────────────────────────────────────────────────────

function GitHubIcon() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

// ── FloatingNav ────────────────────────────────────────────────────────────────

export function FloatingNav() {
  const [open, setOpen]         = useState(false);
  const [mobileOpen, setMobile] = useState(false);
  const [mobileExp, setExp]     = useState<string | null>(null);
  const triggerRef              = useRef<HTMLDivElement>(null);
  const { theme, toggle }       = useTheme();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); setMobile(false); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

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

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const isLight = theme === "light";

  return (
    <>
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-[800px]">
        <nav
          aria-label="Main navigation"
          className="flex items-center px-3 py-2 rounded-2xl"
          style={{
            background: isLight ? "rgba(244,244,248,0.92)" : "rgba(6,6,10,0.88)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: `1px solid ${isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.07)"}`,
            boxShadow: isLight ? "0 8px 32px rgba(0,0,0,0.12)" : "0 8px 32px rgba(0,0,0,0.4)",
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

              {/* Category-only dropdown */}
              {open && (
                <div
                  id="components-menu"
                  role="menu"
                  aria-label="Component categories"
                  className="absolute top-full left-0 mt-2 p-2 rounded-2xl"
                  style={{
                    background: isLight ? "rgba(255,255,255,0.98)" : "rgba(9,9,14,0.98)",
                    backdropFilter: "blur(20px)",
                    border: `1px solid ${isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)"}`,
                    boxShadow: isLight ? "0 24px 48px rgba(0,0,0,0.15)" : "0 24px 48px rgba(0,0,0,0.55)",
                    minWidth: "260px",
                  }}
                >
                  {CATEGORIES.map((cat) => (
                    <a
                      key={cat.label}
                      href={catHref(cat.label)}
                      role="menuitem"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors"
                      style={{ color: "var(--foreground)" }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.background = "rgba(128,128,180,0.08)")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.background = "transparent")
                      }
                    >
                      <span className="text-[13px] font-medium">{cat.label}</span>
                      <span
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded-md shrink-0"
                        style={{
                          background: "color-mix(in oklab, var(--green) 12%, transparent)",
                          color: "var(--green)",
                        }}
                      >
                        {cat.items.length}
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Docs */}
            <a
              href={DOCS_BASE}
              className="px-3 py-1.5 rounded-xl text-sm transition-colors"
              style={{ color: "var(--text-2)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--foreground)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-2)")}
            >
              Docs
            </a>

            {/* Playground */}
            <a
              href="/Wick/playground"
              className="px-3 py-1.5 rounded-xl text-sm transition-colors"
              style={{ color: "var(--text-2)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--foreground)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-2)")}
            >
              Playground
            </a>

            {/* Themes */}
            <a
              href="#themes"
              className="px-3 py-1.5 rounded-xl text-sm transition-colors"
              style={{ color: "var(--text-2)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--foreground)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-2)")}
            >
              Themes
            </a>
          </div>

          {/* ── Right side: version + GitHub + theme toggle ── */}
          <div className="hidden md:flex ml-auto items-center gap-1">
            <span
              className="font-mono text-[11px] px-2.5 py-1 rounded-lg mr-1"
              style={{
                color: "var(--text-muted)",
                background: isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.06)"}`,
              }}
            >
              v{VERSION}
            </span>

            {/* GitHub icon */}
            <a
              href={GITHUB}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View Wick on GitHub"
              className="p-2 rounded-xl transition-colors"
              style={{ color: "var(--text-2)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--foreground)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-2)")}
            >
              <GitHubIcon />
            </a>

            {/* Theme toggle */}
            <button
              aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
              onClick={toggle}
              className="p-2 rounded-xl transition-colors"
              style={{ color: "var(--text-2)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--foreground)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-2)")}
            >
              {isLight ? <MoonIcon /> : <SunIcon />}
            </button>
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
          style={{ background: isLight ? "rgba(244,244,248,0.97)" : "rgba(6,6,10,0.97)", paddingTop: "80px" }}
        >
          <nav aria-label="Mobile navigation" className="px-5 pb-10">
            <p
              className="text-[10px] font-semibold uppercase tracking-widest px-3 pt-2 pb-2"
              style={{ color: "var(--text-muted)" }}
            >
              Components
            </p>
            {CATEGORIES.map((cat) => (
              <a
                key={cat.label}
                href={catHref(cat.label)}
                className="flex items-center justify-between px-3 py-3 rounded-xl"
                style={{ color: "var(--foreground)" }}
                onClick={() => setMobile(false)}
              >
                <span className="text-sm font-medium">{cat.label}</span>
                <span
                  className="text-[10px] font-mono px-1.5 py-0.5 rounded-md"
                  style={{
                    background: "color-mix(in oklab, var(--green) 12%, transparent)",
                    color: "var(--green)",
                  }}
                >
                  {cat.items.length}
                </span>
              </a>
            ))}

            <div
              className="mt-4 pt-4 space-y-1"
              style={{ borderTop: `1px solid ${isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)"}` }}
            >
              <a href={DOCS_BASE} className="block px-3 py-2.5 rounded-xl text-sm font-medium" style={{ color: "var(--text-2)" }} onClick={() => setMobile(false)}>Docs</a>
              <a href="/Wick/playground" className="block px-3 py-2.5 rounded-xl text-sm font-medium" style={{ color: "var(--text-2)" }} onClick={() => setMobile(false)}>Playground</a>
              <a href="#themes" className="block px-3 py-2.5 rounded-xl text-sm font-medium" style={{ color: "var(--text-2)" }} onClick={() => setMobile(false)}>Themes</a>
              <a href={GITHUB} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium" style={{ color: "var(--text-2)" }} onClick={() => setMobile(false)}>
                <GitHubIcon />
                GitHub
              </a>
              <button onClick={() => { toggle(); setMobile(false); }} className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-left" style={{ color: "var(--text-2)" }}>
                {isLight ? <MoonIcon /> : <SunIcon />}
                {isLight ? "Dark mode" : "Light mode"}
              </button>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
