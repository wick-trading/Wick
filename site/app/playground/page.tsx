import { GITHUB, DOCS_BASE } from "../lib/constants";

const COMPONENTS = [
  { category: "Market Data",    items: ["Order Book","Price Ticker","Trade Feed","Depth Chart","Funding Rate","Open Interest","Liquidation Feed","DOM Ladder"] },
  { category: "Charts",         items: ["Candlestick","Mini Chart","Volume Profile","Drawing Tools","Correlation Matrix","Indicators"] },
  { category: "Heatmaps",       items: ["Order Book Heatmap","Market Heatmap"] },
  { category: "Execution",      items: ["Order Ticket","Order Manager","Position Sizer"] },
  { category: "Portfolio",      items: ["Positions","P&L","Trade History","Risk Panel"] },
  { category: "Market Overview",items: ["Watchlist","Screener","Symbol Search","Market Clock"] },
  { category: "Alerts & Intel", items: ["Alerts","News Feed","Economic Calendar","Connection Status"] },
];

export default function PlaygroundPage() {
  return (
    <main
      className="min-h-screen flex flex-col"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      {/* Back nav */}
      <div className="px-6 py-4 max-w-[1180px] mx-auto w-full">
        <a
          href="/Wick/"
          className="inline-flex items-center gap-1.5 text-sm transition-opacity hover:opacity-70"
          style={{ color: "var(--text-muted)" }}
        >
          <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M11 7H3M7 11l-4-4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Wick
        </a>
      </div>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mb-8"
          style={{
            background: "rgba(0,255,163,0.06)",
            border: "1px solid rgba(0,255,163,0.15)",
            color: "var(--green)",
          }}
        >
          <span
            aria-hidden="true"
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "var(--green)" }}
          />
          Coming soon
        </div>

        <h1
          className="font-extrabold tracking-tight mb-5"
          style={{ fontSize: "clamp(36px, 5vw, 64px)", lineHeight: 1.05 }}
        >
          Interactive Playground
        </h1>

        <p
          className="text-lg leading-relaxed max-w-[500px] mb-10"
          style={{ color: "var(--text-2)" }}
        >
          Live component demos with editable props, real-time data simulation, and
          copy-paste code for React, Vue, Svelte, and Angular.
        </p>

        <div className="flex gap-3 flex-wrap justify-center mb-20">
          <a
            href={DOCS_BASE}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[15px] font-semibold transition-opacity hover:opacity-85"
            style={{ background: "var(--green)", color: "#06060a" }}
          >
            Read the Docs
          </a>
          <a
            href={GITHUB}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[15px] font-semibold"
            style={{
              border: "1px solid var(--border)",
              color: "var(--foreground)",
              background: "rgba(128,128,180,0.04)",
            }}
          >
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
            </svg>
            Star on GitHub
          </a>
        </div>

        {/* Component index */}
        <div className="w-full max-w-[900px] text-left">
          <p className="text-sm font-medium mb-6 text-center" style={{ color: "var(--text-muted)" }}>
            31 components — all coming to the playground
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {COMPONENTS.map((cat) => (
              <div
                key={cat.category}
                className="rounded-2xl p-5"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <p
                  className="text-[10px] font-semibold uppercase tracking-widest mb-3"
                  style={{ color: "var(--text-muted)" }}
                >
                  {cat.category}
                </p>
                <ul className="space-y-1.5">
                  {cat.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-sm"
                      style={{ color: "var(--text-2)" }}
                    >
                      <span
                        aria-hidden="true"
                        className="w-1 h-1 rounded-full shrink-0"
                        style={{ background: "var(--green)", opacity: 0.5 }}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
