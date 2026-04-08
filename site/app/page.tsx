import { FloatingNav } from "./components/FloatingNav";
import { AnimatedTradingCard } from "./components/AnimatedTradingCard";
import { BentoGrid } from "./components/BentoGrid";
import { ComponentCards } from "./components/ComponentCards";
import { CodeTabs } from "./components/CodeTabs";
import { ThemesShowcase } from "./components/ThemesShowcase";
import { SkipNav } from "./components/ui/SkipNav";
import { GITHUB, DOCS_BASE, VERSION } from "./lib/constants";

export default function HomePage() {
  return (
    <>
      <SkipNav />
      <FloatingNav />

      <main id="main-content" className="relative overflow-x-hidden">
        {/* Ambient background glows */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div
            style={{
              position: "absolute",
              top: "-20%",
              left: "60%",
              width: "700px",
              height: "700px",
              background: "radial-gradient(circle, rgba(0,255,163,0.05) 0%, transparent 70%)",
              transform: "translateX(-50%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "40%",
              left: "10%",
              width: "500px",
              height: "500px",
              background: "radial-gradient(circle, rgba(124,93,250,0.04) 0%, transparent 70%)",
            }}
          />
        </div>

        <div className="relative z-10 max-w-[1180px] mx-auto px-6">

          {/* ── Hero ── */}
          <section aria-labelledby="hero-heading" className="min-h-screen flex items-center pt-24 pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">

              {/* Left — copy */}
              <div className="space-y-8">
                {/* Badge */}
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
                  style={{
                    background: "rgba(0,255,163,0.06)",
                    border: "1px solid rgba(0,255,163,0.18)",
                    color: "var(--green)",
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ background: "var(--green)" }}
                  />
                  Open Source · MIT License
                </div>

                {/* Headline */}
                <h1
                  id="hero-heading"
                  className="font-extrabold leading-[1.04] tracking-[-0.04em]"
                  style={{ fontSize: "clamp(44px, 5.5vw, 76px)" }}
                >
                  Build trading UIs
                  <br />
                  <span style={{ color: "var(--green)" }}>without the baggage.</span>
                </h1>

                {/* Subtext */}
                <p
                  className="text-lg leading-relaxed max-w-[500px]"
                  style={{ color: "var(--text-2)", fontSize: "clamp(15px, 1.6vw, 18px)" }}
                >
                  31 headless web components for trading UIs. Bring your own
                  styles, data, and framework. Every doc example is wired to
                  one live synthetic market feed — pick a scenario, scrub time,
                  watch them all react.
                </p>

                {/* CTAs */}
                <div className="flex gap-3 flex-wrap">
                  <a
                    href="/Wick/docs"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[15px] font-semibold transition-opacity hover:opacity-85"
                    style={{ background: "var(--green)", color: "#06060a" }}
                  >
                    Read the docs
                    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                  <a
                    href="/Wick/live"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[15px] font-semibold transition-colors"
                    style={{
                      border: "1px solid color-mix(in oklab, var(--green) 35%, transparent)",
                      color: "var(--green)",
                      background: "color-mix(in oklab, var(--green) 6%, transparent)",
                    }}
                  >
                    <span
                      aria-hidden="true"
                      className="h-1.5 w-1.5 rounded-full animate-pulse"
                      style={{ background: "var(--green)", boxShadow: "0 0 8px var(--green)" }}
                    />
                    See it live
                  </a>
                  <a
                    href={GITHUB}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-[15px] font-semibold transition-colors"
                    style={{
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "var(--foreground)",
                      background: "rgba(255,255,255,0.03)",
                    }}
                  >
                    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
                    </svg>
                    GitHub
                  </a>
                </div>

                {/* Install snippet */}
                <div
                  className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl font-mono text-sm"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <span aria-hidden="true" style={{ color: "var(--text-muted)" }}>$</span>
                  <span style={{ color: "var(--text-2)" }}>
                    npm install{" "}
                    <span style={{ color: "var(--foreground)" }}>@wick/order-book</span>
                  </span>
                </div>
              </div>

              {/* Right — animated trading card */}
              <div className="relative" aria-hidden="true">
                <div
                  className="absolute pointer-events-none"
                  style={{
                    inset: "-40px",
                    background: "radial-gradient(ellipse at 50% 50%, rgba(0,255,163,0.06) 0%, transparent 65%)",
                  }}
                />
                <AnimatedTradingCard />
              </div>
            </div>
          </section>

          {/* ── Bento stats ── */}
          <BentoGrid />

          {/* ── Component showcase ── */}
          <ComponentCards />

          {/* ── Framework code examples ── */}
          <CodeTabs />

          {/* ── Themes showcase ── */}
          <ThemesShowcase />

          {/* ── CTA ── */}
          <section
            aria-labelledby="cta-heading"
            className="py-28 text-center"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            <p className="text-sm font-medium mb-5" style={{ color: "var(--text-muted)" }}>
              Ready to ship?
            </p>
            <h2
              id="cta-heading"
              className="font-extrabold tracking-tight mb-4"
              style={{ fontSize: "clamp(36px, 4.5vw, 60px)" }}
            >
              Start building today.
            </h2>
            <p
              className="text-lg mb-10 max-w-[380px] mx-auto leading-relaxed"
              style={{ color: "var(--text-2)" }}
            >
              The trading UI community finally has the primitives it deserves. Open source. MIT licensed.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <a
                href={DOCS_BASE}
                className="inline-flex items-center px-8 py-3.5 rounded-xl text-[15px] font-semibold transition-opacity hover:opacity-85"
                style={{ background: "var(--green)", color: "#06060a" }}
              >
                Read the Docs
              </a>
              <a
                href={GITHUB}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-[15px] font-semibold transition-colors"
                style={{
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "var(--foreground)",
                  background: "rgba(255,255,255,0.03)",
                }}
              >
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
                </svg>
                Star on GitHub
              </a>
            </div>
          </section>

          {/* ── Footer ── */}
          <footer
            className="py-10 flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            {/* Author */}
            <div className="flex items-center gap-3">
              <div
                aria-hidden="true"
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ background: "var(--surface-2)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                A
              </div>
              <div>
                <a
                  href="https://github.com/astralchemist"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium transition-colors hover:opacity-70"
                  style={{ color: "var(--foreground)" }}
                >
                  astralchemist
                </a>
                <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                  Creator of Wick
                </div>
              </div>
            </div>

            {/* Right side links */}
            <div
              className="flex items-center gap-4 text-sm flex-wrap justify-center"
              style={{ color: "var(--text-muted)" }}
            >
              <span
                className="font-mono text-[12px] px-2 py-1 rounded"
                style={{ background: "var(--surface-2)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                v{VERSION}
              </span>
              <a
                href={`${GITHUB}/blob/main/CHANGELOG.md`}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:opacity-70"
                style={{ color: "var(--text-muted)" }}
              >
                Changelog
              </a>
              <span aria-hidden="true">·</span>
              <span>MIT License</span>
              <span aria-hidden="true">·</span>
              <a
                href={GITHUB}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:opacity-70"
                style={{ color: "var(--text-muted)" }}
              >
                GitHub
              </a>
            </div>
          </footer>

        </div>
      </main>
    </>
  );
}
