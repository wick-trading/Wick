"use client";

import { useState } from "react";
import { GREEN, RED } from "../lib/colors";
import { DOCS_BASE } from "../lib/constants";

// ── Existing detailed SVG previews ────────────────────────────────────────────

function OrderBookPreview() {
  const bids = [
    { price: "67,432", size: "1.234", depth: 60 },
    { price: "67,431", size: "0.891", depth: 45 },
    { price: "67,430", size: "2.456", depth: 85 },
    { price: "67,429", size: "1.123", depth: 35 },
  ];
  const asks = [
    { price: "67,433", size: "0.567", depth: 40 },
    { price: "67,434", size: "1.890", depth: 70 },
    { price: "67,435", size: "0.234", depth: 20 },
    { price: "67,436", size: "3.012", depth: 90 },
  ];
  return (
    <div className="w-full font-mono text-[10px]">
      <div className="space-y-0.5 mb-1">
        {[...asks].reverse().map((a, i) => (
          <div key={i} className="relative flex justify-between px-2 py-0.5 rounded-sm overflow-hidden">
            <div className="absolute inset-y-0 right-0" style={{ width: `${a.depth}%`, background: "rgba(255,56,96,0.12)" }} />
            <span className="relative" style={{ color: RED }}>{a.price}</span>
            <span className="relative" style={{ color: "rgba(255,255,255,0.3)" }}>{a.size}</span>
          </div>
        ))}
      </div>
      <div className="text-center py-0.5 text-[9px] font-semibold mb-1" style={{ color: "rgba(255,255,255,0.2)", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        spread $1.00
      </div>
      <div className="space-y-0.5">
        {bids.map((b, i) => (
          <div key={i} className="relative flex justify-between px-2 py-0.5 rounded-sm overflow-hidden">
            <div className="absolute inset-y-0 right-0" style={{ width: `${b.depth}%`, background: "rgba(0,255,163,0.10)" }} />
            <span className="relative" style={{ color: GREEN }}>{b.price}</span>
            <span className="relative" style={{ color: "rgba(255,255,255,0.3)" }}>{b.size}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PriceTickerPreview() {
  return (
    <div className="w-full space-y-3">
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[11px]" style={{ color: "var(--text-muted)" }}>BTC/USD</span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xl font-bold" style={{ color: GREEN }}>$67,432.50</span>
          <span className="text-[10px] font-mono" style={{ color: GREEN }}>▲ +2.34%</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        {[{ label: "24h High", value: "$68,200" }, { label: "24h Low", value: "$66,100" }, { label: "Volume", value: "42.1K" }].map((s) => (
          <div key={s.label}>
            <div className="text-[9px]" style={{ color: "var(--text-muted)" }}>{s.label}</div>
            <div className="font-mono text-[11px] font-medium mt-0.5" style={{ color: "var(--foreground)" }}>{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TradeFeedPreview() {
  const trades = [
    { price: "67,435.00", size: "0.234", side: "buy",  time: "12:34:21" },
    { price: "67,432.50", size: "1.120", side: "sell", time: "12:34:20" },
    { price: "67,433.00", size: "0.456", side: "buy",  time: "12:34:19" },
    { price: "67,431.50", size: "2.001", side: "sell", time: "12:34:18" },
    { price: "67,434.00", size: "0.089", side: "buy",  time: "12:34:17" },
  ];
  return (
    <div className="w-full font-mono text-[10px] space-y-1">
      {trades.map((t, i) => (
        <div key={i} className="flex items-center justify-between">
          <span style={{ color: t.side === "buy" ? GREEN : RED }}>{t.price}</span>
          <span style={{ color: "rgba(255,255,255,0.4)" }}>{t.size}</span>
          <span className="px-1.5 py-0.5 rounded text-[8px] uppercase font-bold" style={{ background: t.side === "buy" ? "rgba(0,255,163,0.1)" : "rgba(255,56,96,0.1)", color: t.side === "buy" ? GREEN : RED }}>{t.side}</span>
          <span style={{ color: "rgba(255,255,255,0.2)" }}>{t.time}</span>
        </div>
      ))}
    </div>
  );
}

function DepthChartPreview() {
  const bidSteps = [[10,80],[40,70],[70,58],[100,44],[130,30],[160,18],[190,10]] as [number,number][];
  const askSteps = [[190,10],[220,20],[250,35],[280,50],[310,65],[340,76],[370,84]] as [number,number][];
  const bidPath = `M 10 90 L 10 80 ` + bidSteps.slice(1).map(([x,y]) => `H ${x} V ${y}`).join(" ") + ` V 90 Z`;
  const askPath = `M 190 10 ` + askSteps.slice(1).map(([x,y]) => `H ${x} V ${y}`).join(" ") + ` V 90 H 190 Z`;
  return (
    <svg viewBox="0 0 380 95" width="100%" style={{ display: "block" }}>
      <path d={bidPath} fill="rgba(0,255,163,0.12)" stroke={GREEN} strokeWidth={1.5} />
      <path d={askPath} fill="rgba(255,56,96,0.12)" stroke={RED} strokeWidth={1.5} />
      <line x1={190} y1={0} x2={190} y2={95} stroke="rgba(255,255,255,0.08)" strokeWidth={1} strokeDasharray="3,4" />
    </svg>
  );
}

function FundingRatePreview() {
  const VB_W = 100, VB_H = 30, PAD_Y = 3;
  const history = [8,12,10,15,18,14,19,22,18,24,28,32];
  const min = Math.min(...history), max = Math.max(...history), range = max - min || 1;
  const xStep = VB_W / (history.length - 1);
  const linePath = history.map((v, i) => {
    const x = i * xStep;
    const y = VB_H - PAD_Y - ((v - min) / range) * (VB_H - PAD_Y * 2);
    return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(" ");
  const areaPath = `${linePath} L${VB_W},${VB_H} L0,${VB_H} Z`;
  return (
    <div className="w-full">
      <div className="flex items-center gap-4 pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>BTC-PERP</span>
        <span className="font-mono text-base font-semibold tabular-nums" style={{ color: GREEN }}>+0.0124%</span>
        <div className="flex flex-col gap-0.5 pl-3" style={{ borderLeft: "1px solid rgba(255,255,255,0.08)" }}>
          <span className="text-[8px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Next funding</span>
          <span className="font-mono text-[11px] tabular-nums" style={{ color: "var(--foreground)" }}>02:47:13</span>
        </div>
      </div>
      <div className="flex items-center gap-2 pt-2">
        <span className="text-[9px] uppercase tracking-wider shrink-0" style={{ color: "var(--text-muted)" }}>8h history</span>
        <svg viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="none" width="100%" height="22" style={{ display: "block" }}>
          <path d={areaPath} fill="rgba(0,255,163,0.10)" />
          <path d={linePath} fill="none" stroke={GREEN} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

function MiniChartPreview() {
  const VB_W = 100, VB_H = 30, PAD_Y = 3;
  const buildPath = (values: number[]) => {
    const min = Math.min(...values), max = Math.max(...values), range = max - min || 1;
    const xStep = VB_W / (values.length - 1);
    return values.map((v, i) => {
      const x = i * xStep, y = VB_H - PAD_Y - ((v - min) / range) * (VB_H - PAD_Y * 2);
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(" ");
  };
  const buildArea = (lp: string) => `${lp} L${VB_W},${VB_H} L0,${VB_H} Z`;
  const series: [number[], string, string, string][] = [
    [[12,14,13,18,17,22,25,24,28,32,30,36], GREEN, "rgba(0,255,163,0.10)", "BTC"],
    [[34,30,32,28,24,26,22,18,20,16,14,12], RED, "rgba(255,56,96,0.10)", "ETH"],
    [[22,21,23,22,24,21,23,22,24,21,23,22], "rgba(255,255,255,0.32)", "rgba(255,255,255,0.04)", "SOL"],
  ];
  return (
    <div className="w-full space-y-2">
      {series.map(([values, color, fill, label], i) => {
        const lp = buildPath(values);
        const ap = buildArea(lp);
        const lastY = parseFloat(lp.split(" ").pop()!.split(",")[1]);
        return (
          <div key={i} className="flex items-center gap-3">
            <span className="font-mono text-[10px] w-8 shrink-0" style={{ color: "var(--text-muted)" }}>{label}</span>
            <svg viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="none" width="100%" height="22" style={{ display: "block" }}>
              <path d={ap} fill={fill} />
              <path d={lp} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
              <circle cx={VB_W} cy={lastY} r={1.8} fill={color} />
            </svg>
            <span className="font-mono text-[10px] w-10 shrink-0 text-right" style={{ color }}>
              {i === 0 ? "+12%" : i === 1 ? "−8%" : "0.0%"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function CandlestickPreview() {
  const candles = [{ o:65,h:30,l:75,c:40 },{ o:40,h:20,l:55,c:35 },{ o:35,h:10,l:50,c:45 },{ o:45,h:30,l:60,c:35 },{ o:35,h:15,l:45,c:25 },{ o:25,h:10,l:40,c:30 },{ o:30,h:15,l:50,c:20 }];
  return (
    <svg viewBox="0 0 280 85" width="100%" style={{ display: "block" }}>
      {[25,50,75].map((y) => <line key={y} x1={0} y1={y} x2={280} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth={1} />)}
      {candles.map((c, i) => {
        const isUp = c.c <= c.o, color = isUp ? GREEN : RED, x = 20 + i * 38;
        return (
          <g key={i}>
            <line x1={x} y1={c.h} x2={x} y2={c.l} stroke={color} strokeWidth={1} opacity={0.6} />
            <rect x={x-8} y={Math.min(c.o,c.c)} width={16} height={Math.max(2,Math.abs(c.c-c.o))} fill={color} rx={1} opacity={0.85} />
          </g>
        );
      })}
    </svg>
  );
}

// ── Placeholder preview for components without custom previews ─────────────────

function PlaceholderPreview({ tag, category }: { tag: string; category: string }) {
  const icons: Record<string, React.ReactNode> = {
    "Market Data": (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <polyline points="2,22 8,14 13,18 20,8 26,12" stroke={GREEN} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    ),
    Charts: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        {[[4,20,8,12],[10,20,14,8],[16,20,20,16],[22,20,26,6]].map(([x1,y1,x2,y2],i) => (
          <rect key={i} x={x1} y={y2} width={x2-x1} height={y1-y2} rx="1" fill={i % 2 === 0 ? GREEN : RED} opacity="0.7" />
        ))}
      </svg>
    ),
    Heatmaps: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        {[0,1,2,3].flatMap((r) => [0,1,2,3].map((c) => (
          <rect key={`${r}-${c}`} x={2+c*7} y={2+r*7} width={6} height={6} rx="1"
            fill={`rgba(0,255,163,${0.1 + (r+c) * 0.06})`} />
        )))}
      </svg>
    ),
    Execution: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <rect x="3" y="6" width="22" height="16" rx="2" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
        <rect x="7" y="10" width="8" height="2" rx="1" fill="rgba(255,255,255,0.3)" />
        <rect x="7" y="14" width="5" height="2" rx="1" fill="rgba(255,255,255,0.2)" />
        <rect x="17" y="9" width="5" height="8" rx="1" fill={GREEN} opacity="0.7" />
      </svg>
    ),
    Portfolio: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <circle cx="14" cy="14" r="10" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
        <circle cx="14" cy="14" r="10" stroke={GREEN} strokeWidth="6" strokeDasharray="22 42" strokeDashoffset="0" />
        <circle cx="14" cy="14" r="10" stroke={RED} strokeWidth="6" strokeDasharray="14 50" strokeDashoffset="-22" />
      </svg>
    ),
    "Market Overview": (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        {[4,10,16,22].map((y, i) => (
          <g key={y}>
            <rect x="3" y={y} width={8 + i * 3} height="4" rx="1" fill="rgba(255,255,255,0.08)" />
            <rect x="18" y={y} width="7" height="4" rx="1" fill={i % 2 === 0 ? "rgba(0,255,163,0.3)" : "rgba(255,56,96,0.3)"} />
          </g>
        ))}
      </svg>
    ),
    "Alerts & Intel": (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <path d="M14 4 C9 4 6 8 6 12 L6 18 L4 20 L24 20 L22 18 L22 12 C22 8 19 4 14 4Z" stroke={GREEN} strokeWidth="1.5" fill="rgba(0,255,163,0.08)" />
        <line x1="11" y1="23" x2="17" y2="23" stroke={GREEN} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  };

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center gap-3 py-2"
      style={{ color: "var(--text-muted)" }}
    >
      {icons[category] ?? null}
      <code className="text-[9px] font-mono text-center" style={{ color: "var(--green)" }}>
        &lt;{tag}&gt;
      </code>
    </div>
  );
}

// ── Component data organized by category ──────────────────────────────────────

type ComponentEntry = {
  name: string;
  tag: string;
  desc: string;
  preview?: React.ReactNode;
};

type Category = {
  label: string;
  components: ComponentEntry[];
};

const CATEGORIES: Category[] = [
  {
    label: "Market Data",
    components: [
      { name: "Order Book",       tag: "wick-order-book",         desc: "Live bids & asks with cumulative depth bars. Supports delta streaming via applyDelta(), price grouping, and click events.", preview: <OrderBookPreview /> },
      { name: "Price Ticker",     tag: "wick-price-ticker",       desc: "Flash-on-change with configurable up/down colors. 24h stats: high, low, volume, change. Fires wick-price-change events.", preview: <PriceTickerPreview /> },
      { name: "Trade Feed",       tag: "wick-trade-feed",         desc: "Scrolling list of executed trades. Stream via addTrade(). Configurable max-trades, time formats, and side coloring.", preview: <TradeFeedPreview /> },
      { name: "Depth Chart",      tag: "wick-depth-chart",        desc: "Canvas 2D cumulative bid/ask depth curves. Crosshair tooltip, hover events, 60fps via requestAnimationFrame.", preview: <DepthChartPreview /> },
      { name: "Funding Rate",     tag: "wick-funding-rate",       desc: "Perpetual swap funding display with countdown loop. Fires tick and settled events. Composes wick-mini-chart for funding history.", preview: <FundingRatePreview /> },
      { name: "Open Interest",    tag: "wick-open-interest",      desc: "Open interest over time with long/short ratio bar. Streams via addPoint(). Supports OI aggregation across exchanges." },
      { name: "Liquidation Feed", tag: "wick-liquidation-feed",   desc: "Real-time liquidation events with side, size, and price. Flash-on-large-liq highlight, configurable threshold." },
      { name: "DOM Ladder",       tag: "wick-dom-ladder",         desc: "Depth-of-market price ladder with bid/ask sizes, spread row, and one-click order placement events." },
    ],
  },
  {
    label: "Charts",
    components: [
      { name: "Candlestick",        tag: "wick-candlestick-chart",  desc: "OHLCV candles via TradingView Lightweight Charts. Real-time updateCandle(). Volume histogram overlay. Auto-resize.", preview: <CandlestickPreview /> },
      { name: "Mini Chart",         tag: "wick-mini-chart",         desc: "Pure SVG sparklines. Auto up/down coloring, area fill, baseline, smoothing, last/min/max dots. Zero dependencies, ~2 KB gzip.", preview: <MiniChartPreview /> },
      { name: "Volume Profile",     tag: "wick-volume-profile",     desc: "Horizontal price × volume histogram rendered over a time range. Canvas 2D, configurable bucket count, value area highlight." },
      { name: "Drawing Tools",      tag: "wick-drawing-overlay",    desc: "SVG overlay for trend lines, horizontal rays, rectangles, and text annotations. Snap-to-price, serialisable state." },
      { name: "Correlation Matrix", tag: "wick-correlation-matrix", desc: "NxN correlation heatmap for up to 20 assets. Configurable color scale, diagonal labels, click-to-inspect events." },
      { name: "Indicators",         tag: "wick-indicators",         desc: "EMA, SMA, RSI, MACD, and Bollinger Bands as composable overlay + panel components. Attach to any OHLCV data source." },
    ],
  },
  {
    label: "Heatmaps",
    components: [
      { name: "Order Book Heatmap", tag: "wick-order-book-heatmap", desc: "Time-scrolling order book density map. Large walls visible as color bands. Canvas 2D, configurable color scale." },
      { name: "Market Heatmap",     tag: "wick-market-heatmap",     desc: "Treemap of asset performance by 24h change %. Configurable size metric, color thresholds, and click events." },
    ],
  },
  {
    label: "Execution",
    components: [
      { name: "Order Ticket",   tag: "wick-order-ticket",   desc: "Buy/sell form with market/limit/stop toggle, quantity input, margin calculation, and configurable fee display." },
      { name: "Order Manager",  tag: "wick-order-manager",  desc: "Open orders table with cancel, modify, and fill events. Supports limit, stop, and conditional order types." },
      { name: "Position Sizer", tag: "wick-position-sizer", desc: "Risk-based position size calculator. Takes account size, risk %, entry, and stop-loss — outputs quantity and dollar risk." },
    ],
  },
  {
    label: "Portfolio",
    components: [
      { name: "Positions",     tag: "wick-positions",     desc: "Open positions table with live mark price, PnL, and liquidation price. Streaming via patch() for per-field updates." },
      { name: "P&L",           tag: "wick-pnl",           desc: "PnL summary widget plus equity curve sparkline. Displays realised/unrealised split, daily/weekly/monthly views." },
      { name: "Trade History", tag: "wick-trade-history", desc: "Closed trades log with filtering and sorting. Exports TradeRecord[]. Pagination and infinite-scroll modes." },
      { name: "Risk Panel",    tag: "wick-risk-panel",    desc: "Portfolio risk metrics: margin usage, drawdown, Sharpe, win rate, avg R. Updates via streaming patch." },
    ],
  },
  {
    label: "Market Overview",
    components: [
      { name: "Watchlist",     tag: "wick-watchlist",     desc: "Symbol list with live price, 24h change, and volume. Add/remove symbols, drag-to-reorder, click events." },
      { name: "Screener",      tag: "wick-screener",      desc: "Multi-criteria symbol screener with filter row and sortable results table. Configurable column set." },
      { name: "Symbol Search", tag: "wick-symbol-search", desc: "Fuzzy-search input with dropdown results. Supports exchange filter, symbol type filter, keyboard navigation." },
      { name: "Market Clock",  tag: "wick-market-clock",  desc: "Global trading session clock. Shows open/closed status and local time for major exchanges. Self-ticking." },
    ],
  },
  {
    label: "Alerts & Intel",
    components: [
      { name: "Alerts",            tag: "wick-alerts",            desc: "Price and condition alert manager. Create, activate, and dismiss alerts. Fires wick-alert-triggered events." },
      { name: "News Feed",         tag: "wick-news-feed",         desc: "Real-time market news list. Stream via addItem(). Configurable source filter, keyword highlight, link-out." },
      { name: "Economic Calendar", tag: "wick-economic-calendar", desc: "Macro event calendar with impact filter (high/med/low), actual vs forecast display, and countdown to next event." },
      { name: "Connection Status", tag: "wick-connection-status", desc: "WebSocket health indicator with latency, reconnect count, and status badge. Fires connect/disconnect events." },
    ],
  },
];

// ── ComponentCards ─────────────────────────────────────────────────────────────

export function ComponentCards() {
  const [activeTab, setActiveTab] = useState(0);
  const activeCat = CATEGORIES[activeTab];

  const totalComponents = CATEGORIES.reduce((n, c) => n + c.components.length, 0);

  return (
    <section id="components" className="pb-24">
      {/* Section header */}
      <div className="text-center mb-10">
        <p className="text-sm font-medium mb-3" style={{ color: "var(--text-muted)" }}>
          Components
        </p>
        <h2 className="font-bold tracking-tight" style={{ fontSize: "clamp(28px, 3.5vw, 44px)" }}>
          {totalComponents} primitives. Infinite possibilities.
        </h2>
        <p className="text-base mt-3 max-w-[480px] mx-auto" style={{ color: "var(--text-2)" }}>
          Every component is headless — unstyled, fully composable, and ready for your design system.
        </p>
      </div>

      {/* Category tabs */}
      <div
        role="tablist"
        aria-label="Component categories"
        className="flex gap-1.5 flex-wrap mb-8"
      >
        {CATEGORIES.map((cat, i) => {
          const isActive = i === activeTab;
          return (
            <button
              key={cat.label}
              role="tab"
              aria-selected={isActive}
              aria-controls={`cat-panel-${i}`}
              id={`cat-tab-${i}`}
              onClick={() => setActiveTab(i)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors"
              style={{
                background: isActive ? "rgba(0,255,163,0.1)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${isActive ? "rgba(0,255,163,0.25)" : "rgba(255,255,255,0.06)"}`,
                color: isActive ? "var(--green)" : "var(--text-2)",
              }}
            >
              {cat.label}
              <span
                className="text-[10px] font-mono px-1.5 py-0.5 rounded-md"
                style={{
                  background: isActive ? "rgba(0,255,163,0.15)" : "rgba(255,255,255,0.06)",
                  color: isActive ? "var(--green)" : "var(--text-muted)",
                }}
              >
                {cat.components.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Component grid for active category */}
      {CATEGORIES.map((cat, i) => (
        <div
          key={cat.label}
          role="tabpanel"
          id={`cat-panel-${i}`}
          aria-labelledby={`cat-tab-${i}`}
          hidden={i !== activeTab}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cat.components.map((c) => {
              const hasPreview = !!c.preview;
              return (
                <div
                  key={c.tag}
                  className="rounded-2xl overflow-hidden flex flex-col"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {/* Preview area */}
                  <div
                    className="p-5 flex items-center justify-center"
                    style={{
                      background: "var(--surface-2)",
                      minHeight: "130px",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    {hasPreview
                      ? c.preview
                      : <PlaceholderPreview tag={c.tag} category={cat.label} />
                    }
                  </div>

                  {/* Info */}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-[15px] font-semibold">{c.name}</h3>
                      <code
                        className="text-[10px] font-mono px-2 py-1 rounded-lg shrink-0 ml-2"
                        style={{
                          background: "rgba(0,255,163,0.08)",
                          color: GREEN,
                          border: "1px solid rgba(0,255,163,0.15)",
                        }}
                      >
                        &lt;{c.tag}&gt;
                      </code>
                    </div>
                    <p className="text-sm leading-relaxed flex-1" style={{ color: "var(--text-2)" }}>
                      {c.desc}
                    </p>
                    <a
                      href={`${DOCS_BASE}/${c.tag}`}
                      className="inline-flex items-center gap-1 text-sm font-medium mt-4 transition-opacity hover:opacity-70"
                      style={{ color: GREEN }}
                      aria-label={`Explore ${c.name} documentation`}
                    >
                      Explore docs
                      <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Adapters card — full width below the grid */}
      <div
        className="mt-4 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5"
        style={{ background: "var(--surface)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-[15px] font-semibold">Exchange Adapters</h3>
            <code className="text-[10px] font-mono px-2 py-1 rounded-lg" style={{ background: "rgba(255,255,255,0.04)", color: "var(--text-2)", border: "1px solid rgba(255,255,255,0.08)" }}>
              adapter.parse(msg)
            </code>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>
            Drop-in adapters that normalise raw WebSocket messages from 10 exchanges into Wick types. One interface, everywhere.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:max-w-[340px]">
          {["Binance","Coinbase","Kraken","Bybit","OKX","dYdX","Bitfinex","Gate.io","MEXC","KuCoin"].map((ex) => (
            <span key={ex} className="px-3 py-1.5 rounded-lg text-[13px] font-medium" style={{ background: "var(--surface-2)", border: "1px solid rgba(255,255,255,0.06)", color: "var(--text-2)" }}>
              {ex}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
