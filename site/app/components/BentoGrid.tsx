// Static server component — no "use client" needed

const GREEN_DARK = "#00ffa3";
const RED_DARK   = "#ff3860";

// Mini SVG illustration: stepped depth curve
function DepthCurveIllustration() {
  const bids = [
    [30, 120], [60, 110], [90, 95], [120, 75], [150, 55], [180, 35], [210, 20],
  ] as [number, number][];
  const asks = [
    [210, 20], [240, 35], [270, 55], [300, 75], [330, 95], [360, 110], [390, 125],
  ] as [number, number][];

  const bidPath =
    `M 30 140 ` +
    bids.map(([x, y], i) => (i === 0 ? `L ${x} ${y}` : `H ${x} V ${y}`)).join(" ") +
    ` V 140 Z`;
  const askPath =
    `M 390 140 ` +
    [...asks].reverse().map(([x, y], i) => (i === 0 ? `L ${x} ${y}` : `H ${x} V ${y}`)).join(" ") +
    ` V 140 Z`;

  return (
    <svg viewBox="0 0 420 150" width="100%" style={{ display: "block", opacity: 0.6 }}>
      <path d={bidPath} fill="rgba(0,255,163,0.12)" stroke={GREEN_DARK} strokeWidth={1.5} strokeLinejoin="round" />
      <path d={askPath} fill="rgba(255,56,96,0.12)" stroke={RED_DARK} strokeWidth={1.5} strokeLinejoin="round" />
      <line x1={210} y1={0} x2={210} y2={140} stroke="rgba(255,255,255,0.08)" strokeWidth={1} strokeDasharray="3,4" />
    </svg>
  );
}

// 3 size rows illustration
function SizesIllustration() {
  const sizes = [
    { label: "sm", height: 16, fontSize: 9, opacity: 0.5 },
    { label: "md", height: 22, fontSize: 10, opacity: 0.75 },
    { label: "lg", height: 30, fontSize: 11, opacity: 1 },
  ];
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {sizes.map((s) => (
        <div key={s.label} className="flex items-center gap-2">
          <span
            className="font-mono shrink-0"
            style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)", width: "16px" }}
          >
            {s.label}
          </span>
          <div
            className="flex-1 rounded flex items-center px-2 font-mono"
            style={{
              height: `${s.height}px`,
              fontSize: `${s.fontSize}px`,
              background: `rgba(0,255,163,${0.04 + s.opacity * 0.06})`,
              border: `1px solid rgba(0,255,163,${0.08 + s.opacity * 0.12})`,
              color: `rgba(0,255,163,${s.opacity})`,
            }}
          >
            67,432.50
          </div>
        </div>
      ))}
    </div>
  );
}

// Theme swatches (always dark — trading UI aesthetic)
function ThemeSwatches() {
  const themes = [
    {
      name: "Dark",
      bg: "#0b0e11",
      accent: "#0ecb81",
      decline: "#f6465d",
    },
    {
      name: "Glass",
      bg: "linear-gradient(135deg, #0f0c29 0%, #302b63 100%)",
      accent: "#00ffa3",
      decline: "#ff3860",
    },
    {
      name: "Minimal",
      bg: "#09090b",
      accent: "#22c55e",
      decline: "#ef4444",
    },
  ];

  return (
    <div className="flex gap-2.5 w-full">
      {themes.map((t) => (
        <div key={t.name} className="flex-1 rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="p-2.5 space-y-1" style={{ background: t.bg }}>
            {[
              { price: "67,434", color: t.decline },
              { price: "67,433", color: t.decline },
              { price: "67,431", color: t.accent },
              { price: "67,430", color: t.accent },
            ].map((r, i) => (
              <div key={i} className="flex justify-between text-[9px] font-mono px-1 py-0.5 rounded-sm" style={{ background: "rgba(255,255,255,0.04)" }}>
                <span style={{ color: r.color }}>{r.price}</span>
                <span style={{ color: "rgba(255,255,255,0.25)" }}>
                  {(1.234 - i * 0.3).toFixed(3)}
                </span>
              </div>
            ))}
          </div>
          <div className="px-2 py-1.5 text-[10px] font-medium" style={{ color: "rgba(255,255,255,0.35)", background: "#111118" }}>
            {t.name}
          </div>
        </div>
      ))}
    </div>
  );
}

// Card shell — adapts to theme
function Card({
  children,
  style,
  className = "",
  forceDark = false,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  forceDark?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{
        background: forceDark ? "#0d0d14" : "var(--surface)",
        border: forceDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid var(--border)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function BentoGrid() {
  return (
    <section className="pb-24">
      <div className="text-center mb-10">
        <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
          Everything you need. Nothing you don&apos;t.
        </p>
      </div>

      {/*
        4-column bento grid:
        Row 1-2:  [60fps — col 1-2] | [< 2KB — col 3] | [3 Sizes — col 4]
                                     | [4 Frameworks — col 3-4]
        Row 3:    [Headless — col 1] | [3 Themes — col 2-4]
      */}
      <div
        className="grid gap-3"
        style={{
          gridTemplateColumns: "repeat(4, 1fr)",
          gridTemplateRows: "200px 160px 180px",
        }}
      >
        {/* 60fps — large hero card, always dark */}
        <Card
          forceDark
          className="p-7 flex flex-col justify-between relative overflow-hidden"
          style={{ gridColumn: "1 / 3", gridRow: "1 / 3" }}
        >
          <div>
            <div
              className="font-mono font-black leading-none tracking-tight"
              style={{ fontSize: "72px", color: GREEN_DARK }}
            >
              60fps
            </div>
            <div className="text-lg font-semibold mt-1.5" style={{ color: "rgba(255,255,255,0.9)" }}>
              Real-time rendering
            </div>
            <p className="text-sm mt-2 leading-relaxed max-w-[240px]" style={{ color: "rgba(255,255,255,0.45)" }}>
              Canvas 2D and requestAnimationFrame. Handles hundreds of WebSocket updates per second without touching the DOM.
            </p>
          </div>
          <DepthCurveIllustration />
        </Card>

        {/* < 2KB */}
        <Card
          className="p-6 flex flex-col justify-between"
          style={{ gridColumn: "3 / 4", gridRow: "1 / 2" }}
        >
          <div
            className="font-mono font-black leading-none tracking-tight"
            style={{ fontSize: "44px", color: "var(--foreground)" }}
          >
            {"<2KB"}
          </div>
          <div>
            <div className="text-sm font-semibold">Per component</div>
            <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              Gzipped. Tree-shakeable. No runtime overhead.
            </div>
          </div>
        </Card>

        {/* 3 Sizes */}
        <Card
          className="p-6 flex flex-col justify-between"
          style={{ gridColumn: "4 / 5", gridRow: "1 / 2" }}
        >
          <div className="text-sm font-semibold">3 Sizes</div>
          <SizesIllustration />
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>
            <code className="font-mono">sm · md · lg</code> — compact to spacious.
          </div>
        </Card>

        {/* 4 Frameworks */}
        <Card
          className="p-6 flex flex-col justify-between"
          style={{ gridColumn: "3 / 5", gridRow: "2 / 3" }}
        >
          <div className="text-sm font-semibold">4 Framework Wrappers</div>
          <div className="flex gap-2 flex-wrap">
            {[
              { name: "React", color: "#61dafb" },
              { name: "Vue", color: "#4fc08d" },
              { name: "Svelte", color: "#ff3e00" },
              { name: "Angular", color: "#dd0031" },
            ].map((f) => (
              <span
                key={f.name}
                className="px-3 py-1.5 rounded-lg text-[13px] font-mono font-medium"
                style={{
                  background: `${f.color}12`,
                  border: `1px solid ${f.color}30`,
                  color: f.color,
                }}
              >
                {f.name}
              </span>
            ))}
          </div>
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>
            Or use bare Web Components in any environment.
          </div>
        </Card>

        {/* Headless */}
        <Card
          className="p-6 flex flex-col justify-between"
          style={{ gridColumn: "1 / 2", gridRow: "3 / 4" }}
        >
          <div className="text-sm font-semibold">Headless &amp; Composable</div>
          <div
            className="rounded-lg p-2.5 font-mono text-[10px] leading-5"
            style={{ background: "var(--surface-2)" }}
          >
            <span style={{ color: "var(--green)" }}>--wick-ob-bid-color</span>
            <span style={{ color: "var(--text-muted)" }}>: </span>
            <span style={{ color: "var(--text-2)" }}>#00ff88</span>
            <br />
            <span style={{ color: "var(--green)" }}>--wick-ob-row-height</span>
            <span style={{ color: "var(--text-muted)" }}>: </span>
            <span style={{ color: "var(--text-2)" }}>28px</span>
            <br />
            <span style={{ color: "var(--green)" }}>--wick-ob-font-size</span>
            <span style={{ color: "var(--text-muted)" }}>: </span>
            <span style={{ color: "var(--text-2)" }}>12px</span>
          </div>
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>
            CSS Parts API. Every element targetable.
          </div>
        </Card>

        {/* 3 Themes — always dark visuals */}
        <Card
          className="p-6 flex flex-col gap-4"
          style={{ gridColumn: "2 / 5", gridRow: "3 / 4" }}
        >
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">3 Built-in Themes</div>
            <code
              className="text-[11px] font-mono px-2 py-1 rounded-lg"
              style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}
            >
              import &apos;@wick/theme/glass&apos;
            </code>
          </div>
          <ThemeSwatches />
        </Card>
      </div>
    </section>
  );
}
