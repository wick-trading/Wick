'use client';

/**
 * MarketPulse — the global market control surface.
 *
 * Fixed bar anchored to the bottom of the viewport. Every live component
 * on the page is slaved to this. Users can:
 *  - See the live mid price pulse (flashing on up/down ticks)
 *  - Pick a scenario (Calm / Rally / Flash Crash / Liq Cascade / Whale Wall / Low Liq)
 *  - Speed up or slow down time (0.5× 1× 2× 5×)
 *  - Play / Pause
 *  - Scrub backwards through 30 seconds of history
 *  - Step frame-by-frame
 */

import { useEffect, useRef, useState } from 'react';
import { SCENARIOS, type ScenarioId } from '../../lib/market-engine';
import { useMarketControls, useMarketTick } from './MarketProvider';

const SPEEDS = [0.5, 1, 2, 5];
const SCENARIO_LIST: ScenarioId[] = [
  'calm',
  'rally',
  'flash-crash',
  'liq-cascade',
  'whale-wall',
  'low-liq',
];

export function MarketPulse() {
  const tick = useMarketTick();
  const {
    state,
    toggle,
    setSpeed,
    setScenario,
    scrubTo,
    stepForward,
    stepBackward,
  } = useMarketControls();

  const [scenarioOpen, setScenarioOpen] = useState(false);
  const scenarioRef = useRef<HTMLDivElement>(null);

  // First-visit attention pulse — plays once per session to draw the eye
  const [attentionPulse, setAttentionPulse] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem('wick-pulse-seen')) return;
    const start = setTimeout(() => setAttentionPulse(true), 800);
    const stop = setTimeout(() => {
      setAttentionPulse(false);
      sessionStorage.setItem('wick-pulse-seen', '1');
    }, 4200);
    return () => {
      clearTimeout(start);
      clearTimeout(stop);
    };
  }, []);

  // Close scenario menu on outside click
  useEffect(() => {
    if (!scenarioOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!scenarioRef.current?.contains(e.target as Node)) {
        setScenarioOpen(false);
      }
    };
    window.addEventListener('mousedown', onDown);
    return () => window.removeEventListener('mousedown', onDown);
  }, [scenarioOpen]);

  // Keyboard shortcuts (space, arrows, 1-6 for scenarios)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLElement &&
        (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')
      )
        return;
      if (e.code === 'Space') {
        e.preventDefault();
        toggle();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        stepBackward();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        stepForward();
      } else if (e.key >= '1' && e.key <= '6') {
        const idx = parseInt(e.key, 10) - 1;
        const id = SCENARIO_LIST[idx];
        if (id) setScenario(id);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggle, stepForward, stepBackward, setScenario]);

  if (!state || !tick) {
    return <MarketPulseSkeleton />;
  }

  const isLive = state.scrubIndex === null;
  const historyLen = Math.max(1, state.headSeq - state.tailSeq + 1);
  const currentOffset = state.currentSeq - state.tailSeq;
  const scrubSecondsAgo = Math.round(
    ((state.headSeq - state.currentSeq) * 50) / 1000,
  );
  const scenario = SCENARIOS[state.scenarioId];

  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 px-4 w-full max-w-[880px]">
      {attentionPulse && (
        <div
          aria-hidden
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            animation: 'wick-pulse-ring 1.6s ease-out 2',
            boxShadow: '0 0 0 0 color-mix(in oklab, var(--green) 60%, transparent)',
          }}
        />
      )}
      <style>{`
        @keyframes wick-pulse-ring {
          0%   { box-shadow: 0 0 0 0   color-mix(in oklab, var(--green) 55%, transparent); }
          70%  { box-shadow: 0 0 0 18px color-mix(in oklab, var(--green) 0%, transparent); }
          100% { box-shadow: 0 0 0 0   color-mix(in oklab, var(--green) 0%, transparent); }
        }
      `}</style>
      <div
        className="flex flex-col gap-2 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl relative"
        style={{
          background: 'color-mix(in oklab, var(--surface) 85%, transparent)',
          borderColor: attentionPulse
            ? 'color-mix(in oklab, var(--green) 50%, var(--border))'
            : 'var(--border)',
          boxShadow:
            '0 20px 60px -20px rgba(0,0,0,0.6), 0 0 0 1px color-mix(in oklab, var(--border) 60%, transparent)',
          transition: 'border-color 400ms ease',
        }}
      >
        {/* Row 1 — controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <LivePrice
            mid={tick.mid}
            direction={tick.direction}
            isLive={isLive}
            scrubSecondsAgo={scrubSecondsAgo}
          />

          <div className="h-6 w-px" style={{ background: 'var(--border)' }} />

          <div ref={scenarioRef} className="relative">
            <button
              onClick={() => setScenarioOpen((v) => !v)}
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
              style={{
                background: 'var(--surface-2)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
              }}
              aria-haspopup="menu"
              aria-expanded={scenarioOpen}
            >
              <ScenarioDot id={state.scenarioId} />
              <span>{scenario.label}</span>
              <svg width="10" height="10" viewBox="0 0 10 10" className="opacity-60">
                <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              </svg>
            </button>

            {scenarioOpen && (
              <div
                className="absolute bottom-full left-0 mb-2 w-[280px] rounded-xl border p-1.5 shadow-2xl backdrop-blur-xl"
                style={{
                  background: 'color-mix(in oklab, var(--surface) 95%, transparent)',
                  borderColor: 'var(--border)',
                }}
                role="menu"
              >
                {SCENARIO_LIST.map((id, i) => {
                  const sc = SCENARIOS[id];
                  const active = id === state.scenarioId;
                  return (
                    <button
                      key={id}
                      onClick={() => {
                        setScenario(id);
                        setScenarioOpen(false);
                      }}
                      className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors"
                      style={{
                        background: active
                          ? 'color-mix(in oklab, var(--green) 12%, transparent)'
                          : 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (!active)
                          e.currentTarget.style.background = 'var(--surface-2)';
                      }}
                      onMouseLeave={(e) => {
                        if (!active)
                          e.currentTarget.style.background = 'transparent';
                      }}
                      role="menuitem"
                    >
                      <ScenarioDot id={id} />
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-[13px] font-semibold flex items-center gap-2"
                          style={{
                            color: active ? 'var(--green)' : 'var(--foreground)',
                          }}
                        >
                          {sc.label}
                          <span
                            className="text-[10px] font-mono opacity-50"
                            aria-hidden
                          >
                            {i + 1}
                          </span>
                        </div>
                        <div
                          className="text-[11px] leading-snug mt-0.5"
                          style={{ color: 'var(--text-2)' }}
                        >
                          {sc.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="h-6 w-px" style={{ background: 'var(--border)' }} />

          {/* Transport */}
          <div className="flex items-center gap-1">
            <IconButton
              onClick={stepBackward}
              title="Step back (←)"
              aria-label="Step back"
            >
              <svg width="12" height="12" viewBox="0 0 12 12">
                <path
                  d="M8.5 2.5L4 6l4.5 3.5V2.5zM3 2.5v7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinejoin="round"
                />
              </svg>
            </IconButton>

            <button
              onClick={toggle}
              title={state.playing ? 'Pause (Space)' : 'Play (Space)'}
              aria-label={state.playing ? 'Pause' : 'Play'}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-all"
              style={{
                background: state.playing
                  ? 'color-mix(in oklab, var(--green) 15%, transparent)'
                  : 'var(--surface-2)',
                color: state.playing ? 'var(--green)' : 'var(--foreground)',
                border: `1px solid ${state.playing ? 'color-mix(in oklab, var(--green) 40%, transparent)' : 'var(--border)'}`,
              }}
            >
              {state.playing ? (
                <svg width="10" height="10" viewBox="0 0 10 10">
                  <rect x="2" y="1.5" width="2" height="7" fill="currentColor" />
                  <rect x="6" y="1.5" width="2" height="7" fill="currentColor" />
                </svg>
              ) : (
                <svg width="10" height="10" viewBox="0 0 10 10">
                  <path d="M2.5 1.5v7l6-3.5-6-3.5z" fill="currentColor" />
                </svg>
              )}
            </button>

            <IconButton
              onClick={stepForward}
              title="Step forward (→)"
              aria-label="Step forward"
            >
              <svg width="12" height="12" viewBox="0 0 12 12">
                <path
                  d="M3.5 2.5L8 6l-4.5 3.5V2.5zM9 2.5v7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinejoin="round"
                />
              </svg>
            </IconButton>
          </div>

          <div className="h-6 w-px" style={{ background: 'var(--border)' }} />

          {/* Speed */}
          <div
            className="flex items-center gap-0.5 rounded-lg p-0.5"
            style={{
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
            }}
          >
            {SPEEDS.map((s) => {
              const active = s === state.speed;
              return (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className="px-2 py-1 rounded text-[11px] font-mono font-semibold transition-colors"
                  style={{
                    background: active ? 'var(--green)' : 'transparent',
                    color: active ? '#06060a' : 'var(--text-2)',
                  }}
                >
                  {s}×
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2 — scrubber */}
        <div className="flex items-center gap-3">
          <span
            className="text-[10px] font-mono tabular-nums shrink-0 w-12"
            style={{ color: 'var(--text-muted)' }}
          >
            {isLive ? '−30s' : `−${Math.round(((state.headSeq - state.tailSeq) * 50) / 1000)}s`}
          </span>
          <Scrubber
            value={currentOffset}
            max={historyLen - 1}
            onChange={(v) => scrubTo(v === historyLen - 1 ? null : v)}
            isLive={isLive}
          />
          <button
            onClick={() => scrubTo(null)}
            className="text-[10px] font-mono font-bold shrink-0 w-12 text-right transition-colors"
            style={{
              color: isLive ? 'var(--green)' : 'var(--text-2)',
            }}
            title="Jump to live"
            aria-label="Jump to live"
          >
            {isLive ? 'LIVE' : 'GO LIVE'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

function LivePrice({
  mid,
  direction,
  isLive,
  scrubSecondsAgo,
}: {
  mid: number;
  direction: 'up' | 'down' | 'flat';
  isLive: boolean;
  scrubSecondsAgo: number;
}) {
  const color =
    direction === 'up'
      ? 'var(--green)'
      : direction === 'down'
        ? 'var(--red)'
        : 'var(--foreground)';

  return (
    <div className="flex items-center gap-2.5 min-w-[150px]">
      <span
        className="relative flex h-2 w-2 shrink-0"
        aria-hidden
      >
        {isLive && (
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
            style={{ background: 'var(--green)' }}
          />
        )}
        <span
          className="relative inline-flex h-2 w-2 rounded-full"
          style={{ background: isLive ? 'var(--green)' : 'var(--text-muted)' }}
        />
      </span>
      <div className="flex flex-col leading-none">
        <span
          className="font-mono text-[15px] font-bold tabular-nums tracking-tight transition-colors"
          style={{ color }}
        >
          {mid.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
          <span className="ml-1 text-[11px]" aria-hidden>
            {direction === 'up' ? '↑' : direction === 'down' ? '↓' : '·'}
          </span>
        </span>
        <span
          className="text-[9px] font-semibold uppercase tracking-[0.1em] mt-0.5"
          style={{ color: isLive ? 'var(--green)' : 'var(--text-muted)' }}
        >
          {isLive ? 'Live · BTC/USD' : `Replay −${scrubSecondsAgo}s`}
        </span>
      </div>
    </div>
  );
}

function ScenarioDot({ id }: { id: ScenarioId }) {
  const colors: Record<ScenarioId, string> = {
    calm: '#60a5fa',
    rally: 'var(--green)',
    'flash-crash': 'var(--red)',
    'liq-cascade': '#f97316',
    'whale-wall': '#a78bfa',
    'low-liq': '#94a3b8',
  };
  return (
    <span
      className="inline-block h-2 w-2 rounded-full shrink-0"
      style={{ background: colors[id] }}
      aria-hidden
    />
  );
}

function IconButton({
  children,
  onClick,
  title,
  ...props
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  'aria-label': string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
      style={{
        background: 'var(--surface-2)',
        color: 'var(--text-2)',
        border: '1px solid var(--border)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = 'var(--foreground)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'var(--text-2)';
      }}
      {...props}
    >
      {children}
    </button>
  );
}

function Scrubber({
  value,
  max,
  onChange,
  isLive,
}: {
  value: number;
  max: number;
  onChange: (v: number) => void;
  isLive: boolean;
}) {
  const pct = max > 0 ? (value / max) * 100 : 100;
  return (
    <div className="relative h-6 flex-1 flex items-center group">
      {/* Track background */}
      <div
        className="absolute inset-x-0 h-[3px] rounded-full"
        style={{ background: 'var(--border)' }}
      />
      {/* Track fill */}
      <div
        className="absolute left-0 h-[3px] rounded-full transition-none"
        style={{
          width: `${pct}%`,
          background: isLive
            ? 'linear-gradient(90deg, color-mix(in oklab, var(--green) 40%, transparent), var(--green))'
            : 'linear-gradient(90deg, color-mix(in oklab, var(--text-2) 40%, transparent), var(--text-2))',
        }}
      />
      {/* Playhead */}
      <div
        className="absolute h-4 w-[3px] rounded-full shadow-lg transition-all"
        style={{
          left: `calc(${pct}% - 1.5px)`,
          background: isLive ? 'var(--green)' : 'var(--foreground)',
          boxShadow: isLive
            ? '0 0 12px color-mix(in oklab, var(--green) 70%, transparent)'
            : '0 0 8px rgba(0,0,0,0.4)',
        }}
      />
      <input
        type="range"
        min={0}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="absolute inset-0 w-full cursor-pointer opacity-0"
        aria-label="Time scrubber"
      />
    </div>
  );
}

function MarketPulseSkeleton() {
  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 px-4 w-full max-w-[880px]">
      <div
        className="h-[76px] rounded-2xl border backdrop-blur-xl"
        style={{
          background: 'color-mix(in oklab, var(--surface) 85%, transparent)',
          borderColor: 'var(--border)',
        }}
      />
    </div>
  );
}
