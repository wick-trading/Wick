'use client';

/**
 * LivePriceTicker — big price + 24h-ish stats, driven by the engine.
 *
 * The "24h" stats are computed from the engine's history window as a proxy.
 */

import { useEffect, useState } from 'react';
import { useMarketFrame } from './MarketProvider';

export function LivePriceTicker() {
  const frame = useMarketFrame();
  const [sessionOpen, setSessionOpen] = useState<number | null>(null);
  const [sessionHigh, setSessionHigh] = useState<number | null>(null);
  const [sessionLow, setSessionLow] = useState<number | null>(null);
  const [volume, setVolume] = useState<number>(0);

  // Track session stats from the first frame we see
  useEffect(() => {
    if (!frame) return;
    setSessionOpen((prev) => (prev === null ? frame.mid : prev));
    setSessionHigh((prev) =>
      prev === null ? frame.mid : Math.max(prev, frame.mid),
    );
    setSessionLow((prev) =>
      prev === null ? frame.mid : Math.min(prev, frame.mid),
    );
    if (frame.trades.length > 0) {
      setVolume((v) => v + frame.trades.reduce((a, t) => a + t.size, 0));
    }
  }, [frame]);

  if (!frame || sessionOpen === null) {
    return <TickerSkeleton />;
  }

  const change = frame.mid - sessionOpen;
  const changePct = (change / sessionOpen) * 100;
  const isUp = change >= 0;
  const directionColor =
    frame.direction === 'up'
      ? 'var(--green)'
      : frame.direction === 'down'
        ? 'var(--red)'
        : 'var(--foreground)';

  return (
    <div
      className="rounded-xl border p-5"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-1.5 text-[12px] font-mono font-bold"
            style={{ color: 'var(--foreground)' }}
          >
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ background: '#f59e0b' }}
              aria-hidden
            />
            BTC/USD
          </div>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded font-mono"
            style={{
              background: 'var(--surface-2)',
              color: 'var(--text-muted)',
            }}
          >
            PERP
          </span>
        </div>
        <span
          className="text-[10px] font-mono uppercase tracking-wider"
          style={{ color: 'var(--text-muted)' }}
        >
          Synthetic feed
        </span>
      </div>

      <div className="flex items-baseline gap-3 mb-4">
        <span
          className="font-mono text-[32px] font-bold tabular-nums tracking-tight transition-colors"
          style={{ color: directionColor }}
        >
          {frame.mid.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
        <span
          className="font-mono text-[13px] tabular-nums font-semibold"
          style={{ color: isUp ? 'var(--green)' : 'var(--red)' }}
        >
          {isUp ? '+' : ''}
          {change.toFixed(2)} ({isUp ? '+' : ''}
          {changePct.toFixed(2)}%)
        </span>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Stat label="Open" value={sessionOpen.toFixed(2)} />
        <Stat
          label="High"
          value={sessionHigh !== null ? sessionHigh.toFixed(2) : '—'}
          color="var(--green)"
        />
        <Stat
          label="Low"
          value={sessionLow !== null ? sessionLow.toFixed(2) : '—'}
          color="var(--red)"
        />
        <Stat label="Vol (BTC)" value={volume.toFixed(2)} />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div>
      <div
        className="text-[9px] uppercase tracking-wider mb-1 font-semibold"
        style={{ color: 'var(--text-muted)' }}
      >
        {label}
      </div>
      <div
        className="font-mono text-[13px] font-semibold tabular-nums"
        style={{ color: color ?? 'var(--foreground)' }}
      >
        {value}
      </div>
    </div>
  );
}

function TickerSkeleton() {
  return (
    <div
      className="rounded-xl border p-5 animate-pulse"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
    >
      <div
        className="h-3 w-20 rounded mb-3"
        style={{ background: 'var(--surface-2)' }}
      />
      <div
        className="h-8 w-48 rounded mb-4"
        style={{ background: 'var(--surface-2)' }}
      />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i}>
            <div
              className="h-2 w-10 rounded mb-1"
              style={{ background: 'var(--surface-2)' }}
            />
            <div
              className="h-3 w-14 rounded"
              style={{ background: 'var(--surface-2)' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
