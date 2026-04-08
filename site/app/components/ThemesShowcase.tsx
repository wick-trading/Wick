// Static server component — no "use client" needed

const THEMES = [
  {
    name: "Dark",
    tagline: "Binance / Bybit aesthetic",
    install: `import '@wick/theme/dark'`,
    bg: "#0b0e11",
    border: "rgba(255,255,255,0.08)",
    green: "#0ecb81",
    red: "#f6465d",
    text: "rgba(255,255,255,0.85)",
    muted: "rgba(255,255,255,0.3)",
    rowBg: "rgba(255,255,255,0.03)",
    desc: "High-contrast greens on near-black. The standard terminal dark theme — recognisable to any crypto trader.",
  },
  {
    name: "Glass",
    tagline: "Glassmorphism",
    install: `import '@wick/theme/glass'`,
    bg: "linear-gradient(135deg, #0f0c29 0%, #302b63 100%)",
    border: "rgba(255,255,255,0.12)",
    green: "#00ffa3",
    red: "#ff3860",
    text: "rgba(255,255,255,0.9)",
    muted: "rgba(255,255,255,0.35)",
    rowBg: "rgba(255,255,255,0.05)",
    desc: "Translucent surfaces over rich purple gradients. Built for dashboard builders who want visual depth.",
  },
  {
    name: "Minimal",
    tagline: "Linear / Stripe aesthetic",
    install: `import '@wick/theme/minimal'`,
    bg: "#09090b",
    border: "rgba(255,255,255,0.07)",
    green: "#22c55e",
    red: "#ef4444",
    text: "rgba(255,255,255,0.88)",
    muted: "rgba(255,255,255,0.28)",
    rowBg: "rgba(255,255,255,0.02)",
    desc: "Monochrome restraint. Near-invisible borders, desaturated accents. Disappears behind your data.",
  },
];

function OrderBookMini({
  bg,
  border,
  green,
  red,
  text,
  muted,
  rowBg,
}: (typeof THEMES)[0]) {
  const asks = [
    { price: "67,435", size: "0.234" },
    { price: "67,434", size: "1.890" },
    { price: "67,433", size: "0.567" },
  ];
  const bids = [
    { price: "67,432", size: "1.234" },
    { price: "67,431", size: "0.891" },
    { price: "67,430", size: "2.456" },
  ];

  return (
    <div
      className="rounded-xl overflow-hidden font-mono text-[11px]"
      style={{
        background: bg,
        border: `1px solid ${border}`,
      }}
    >
      {/* Header */}
      <div
        className="flex justify-between px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wider"
        style={{
          color: muted,
          borderBottom: `1px solid ${border}`,
        }}
      >
        <span>Price (USD)</span>
        <span>Amount</span>
      </div>

      <div className="px-0.5 py-0.5">
        {/* Asks */}
        {[...asks].reverse().map((a, i) => (
          <div
            key={i}
            className="relative flex justify-between px-2.5 py-[3px]"
          >
            <div
              className="absolute inset-y-0 right-0"
              style={{
                width: `${30 + i * 18}%`,
                background: `${red}18`,
              }}
            />
            <span className="relative" style={{ color: red }}>
              {a.price}
            </span>
            <span className="relative" style={{ color: muted }}>
              {a.size}
            </span>
          </div>
        ))}

        {/* Spread */}
        <div
          className="flex items-center justify-center py-1 text-[9px]"
          style={{
            color: muted,
            borderTop: `1px solid ${border}`,
            borderBottom: `1px solid ${border}`,
          }}
        >
          <span style={{ color: text, fontWeight: 600 }}>67,432.50</span>
          <span className="ml-1.5" style={{ color: green }}>
            ▲
          </span>
        </div>

        {/* Bids */}
        {bids.map((b, i) => (
          <div
            key={i}
            className="relative flex justify-between px-2.5 py-[3px]"
          >
            <div
              className="absolute inset-y-0 right-0"
              style={{
                width: `${35 + i * 14}%`,
                background: `${green}14`,
              }}
            />
            <span className="relative" style={{ color: green }}>
              {b.price}
            </span>
            <span className="relative" style={{ color: muted }}>
              {b.size}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ThemesShowcase() {
  return (
    <section
      id="themes"
      className="pb-24"
      style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "5rem" }}
    >
      <div className="text-center mb-14">
        <p className="text-sm font-medium mb-3" style={{ color: "var(--text-muted)" }}>
          Themes
        </p>
        <h2
          className="font-bold tracking-tight"
          style={{ fontSize: "clamp(28px, 3.5vw, 44px)" }}
        >
          One component. Three personalities.
        </h2>
        <p
          className="text-base mt-3 max-w-[480px] mx-auto leading-relaxed"
          style={{ color: "var(--text-2)" }}
        >
          Drop in a theme CSS file and every component inherits it. Override any token at the{" "}
          <code
            className="text-[13px] px-1.5 py-0.5 rounded"
            style={{
              background: "rgba(255,255,255,0.06)",
              color: "var(--foreground)",
            }}
          >
            :root
          </code>{" "}
          or component level.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {THEMES.map((theme) => (
          <div
            key={theme.name}
            className="rounded-2xl overflow-hidden flex flex-col"
            style={{
              background: "var(--surface)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {/* Preview */}
            <div
              className="p-5"
              style={{
                background: "var(--surface-2)",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <OrderBookMini {...theme} />
            </div>

            {/* Info */}
            <div className="p-5 flex flex-col gap-3 flex-1">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-[15px] font-semibold">{theme.name}</h3>
                  <span
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      color: "var(--text-muted)",
                    }}
                  >
                    {theme.tagline}
                  </span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>
                  {theme.desc}
                </p>
              </div>

              <code
                className="mt-auto inline-block text-[11px] font-mono px-3 py-2 rounded-lg"
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  color: "var(--green)",
                }}
              >
                {theme.install}
              </code>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
