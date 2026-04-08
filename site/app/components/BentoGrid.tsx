// Static server component — no "use client" needed
import { GREEN } from "../lib/colors";

// Mini SVG illustration: stepped depth curve (for the 60fps card)
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
      <path d={bidPath} fill="rgba(0,255,163,0.12)" stroke={GREEN} strokeWidth={1.5} strokeLinejoin="round" />
      <path d={askPath} fill="rgba(255,56,96,0.12)" stroke="#ff3860" strokeWidth={1.5} strokeLinejoin="round" />
      {/* Center line */}
      <line x1={210} y1={0} x2={210} y2={140} stroke="rgba(255,255,255,0.08)" strokeWidth={1} strokeDasharray="3,4" />
    </svg>
  );
}

// Mini SVG: 3 theme swatches
function ThemeSwatches() {
  const themes = [
    {
      name: "Dark",
      bg: "#0b0e11",
      rows: [
        { price: "67,434", color: "#f6465d" },
        { price: "67,433", color: "#f6465d" },
        { price: "67,431", color: "#0ecb81" },
        { price: "67,430", color: "#0ecb81" },
      ],
    },
    {
      name: "Glass",
      bg: "linear-gradient(135deg, #0f0c29 0%, #302b63 100%)",
      rows: [
        { price: "67,434", color: "#ff3860" },
        { price: "67,433", color: "#ff3860" },
        { price: "67,431", color: "#00ffa3" },
        { price: "67,430", color: "#00ffa3" },
      ],
    },
    {
      name: "Minimal",
      bg: "#09090b",
      rows: [
        { price: "67,434", color: "#ef4444" },
        { price: "67,433", color: "#ef4444" },
        { price: "67,431", color: "#22c55e" },
        { price: "67,430", color: "#22c55e" },
      ],
    },
  ];

  return (
    <div className="flex gap-2.5 w-full">
      {themes.map((t) => (
        <div key={t.name} className="flex-1 rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="p-2.5 space-y-1" style={{ background: t.bg }}>
            {t.rows.map((r, i) => (
              <div key={i} className="flex justify-between text-[9px] font-mono px-1 py-0.5 rounded-sm" style={{ background: "rgba(255,255,255,0.04)" }}>
                <span style={{ color: r.color }}>{r.price}</span>
                <span style={{ color: "rgba(255,255,255,0.25)" }}>
                  {(1.234 - i * 0.3).toFixed(3)}
                </span>
              </div>
            ))}
          </div>
          <div className="px-2 py-1.5 text-[10px] font-medium" style={{ color: "var(--text-muted)", background: "var(--surface)" }}>
            {t.name}
          </div>
        </div>
      ))}
    </div>
  );
}

export function BentoGrid() {
  return (
    <section className="pb-24">
      {/* Section label */}
      <div className="text-center mb-10">
        <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
          Why traders & devs choose Wick
        </p>
      </div>

      {/*
        4-column bento grid:
        Row 1-2:  [60fps — col 1-2, row 1-2] | [<2KB — col 3] | [MIT — col 4]
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
        {/* 60fps — large hero card */}
        <div
          className="rounded-2xl p-7 flex flex-col justify-between relative overflow-hidden"
          style={{
            gridColumn: "1 / 3",
            gridRow: "1 / 3",
            background: "var(--surface)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div>
            <div
              className="font-mono font-black leading-none tracking-tight"
              style={{ fontSize: "72px", color: GREEN }}
            >
              60fps
            </div>
            <div className="text-lg font-semibold mt-1.5">Real-time rendering</div>
            <p className="text-sm mt-2 leading-relaxed max-w-[240px]" style={{ color: "var(--text-2)" }}>
              Canvas 2D and requestAnimationFrame. Zero DOM thrashing — components handle hundreds of updates per second.
            </p>
          </div>
          <DepthCurveIllustration />
        </div>

        {/* < 2KB */}
        <div
          className="rounded-2xl p-6 flex flex-col justify-between"
          style={{
            gridColumn: "3 / 4",
            gridRow: "1 / 2",
            background: "var(--surface)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
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
              Gzipped. No runtime bloat.
            </div>
          </div>
        </div>

        {/* MIT */}
        <div
          className="rounded-2xl p-6 flex flex-col justify-between"
          style={{
            gridColumn: "4 / 5",
            gridRow: "1 / 2",
            background: "var(--surface)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect x="4" y="2" width="16" height="22" rx="2" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
            <path d="M8 8h8M8 12h8M8 16h5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="22" cy="22" r="5" fill="rgba(0,255,163,0.15)" stroke={GREEN} strokeWidth="1.5" />
            <path d="M20 22l1.5 1.5L24 20" stroke={GREEN} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div>
            <div className="text-sm font-semibold">MIT License</div>
            <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              Free forever. For everyone.
            </div>
          </div>
        </div>

        {/* 4 Frameworks */}
        <div
          className="rounded-2xl p-6 flex flex-col justify-between"
          style={{
            gridColumn: "3 / 5",
            gridRow: "2 / 3",
            background: "var(--surface)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="text-sm font-semibold">4 Frameworks</div>
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
        </div>

        {/* Headless */}
        <div
          className="rounded-2xl p-6 flex flex-col justify-between"
          style={{
            gridColumn: "1 / 2",
            gridRow: "3 / 4",
            background: "var(--surface)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="text-sm font-semibold">Headless</div>
          <div
            className="rounded-lg p-2.5 font-mono text-[10px] leading-5"
            style={{ background: "var(--surface-2)", color: "var(--text-2)" }}
          >
            <span style={{ color: GREEN }}>--wick-green</span>: #fff
            <br />
            <span style={{ color: GREEN }}>--wick-red</span>: #000
            <br />
            <span style={{ color: GREEN }}>--wick-bg</span>: #fff
          </div>
        </div>

        {/* 3 Themes */}
        <div
          className="rounded-2xl p-6 flex flex-col gap-4"
          style={{
            gridColumn: "2 / 5",
            gridRow: "3 / 4",
            background: "var(--surface)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">3 Themes</div>
            <code
              className="text-[11px] font-mono px-2 py-1 rounded-lg"
              style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}
            >
              import &apos;@wick/theme/dark&apos;
            </code>
          </div>
          <ThemeSwatches />
        </div>
      </div>
    </section>
  );
}
