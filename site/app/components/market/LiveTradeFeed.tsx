'use client';

/**
 * LiveTradeFeed — rolling tape of recent prints driven by the market engine.
 */

import { useMarketTrades } from './MarketProvider';

interface Props {
  max?: number;
  onHoverPrice?: (price: number | null) => void;
}

export function LiveTradeFeed({ max = 20, onHoverPrice }: Props) {
  const trades = useMarketTrades(max);

  return (
    <div
      className="rounded-xl border overflow-hidden font-mono text-[12px]"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
    >
      <div
        className="grid grid-cols-3 gap-2 px-3 py-2 text-[10px] uppercase tracking-wider"
        style={{
          color: 'var(--text-muted)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div>Price</div>
        <div className="text-right">Size</div>
        <div className="text-right">Time</div>
      </div>

      <div>
        {trades.length === 0 ? (
          <div
            className="px-3 py-4 text-center text-[11px]"
            style={{ color: 'var(--text-muted)' }}
          >
            Waiting for prints…
          </div>
        ) : (
          trades.map((t, i) => {
            const color = t.side === 'buy' ? 'var(--green)' : 'var(--red)';
            // Opacity decays as prints get older
            const opacity = Math.max(0.5, 1 - i * 0.025);
            return (
              <div
                key={t.id}
                className="grid grid-cols-3 gap-2 px-3 py-[3px] tabular-nums cursor-default transition-colors"
                style={{ opacity }}
                onMouseEnter={() => onHoverPrice?.(t.price)}
                onMouseLeave={() => onHoverPrice?.(null)}
              >
                <span
                  className="flex items-center gap-1.5"
                  style={{ color }}
                >
                  <span
                    className="inline-block h-1 w-1 rounded-full"
                    style={{ background: color }}
                    aria-hidden
                  />
                  {t.price.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
                <span
                  className="text-right"
                  style={{ color: 'var(--foreground)' }}
                >
                  {t.size.toFixed(4)}
                </span>
                <span
                  className="text-right text-[10px]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {formatTime(t.ts)}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function formatTime(simTs: number): string {
  // simTs is simulation time in ms; show as MM:SS.mmm
  const totalMs = simTs;
  const s = Math.floor(totalMs / 1000) % 60;
  const m = Math.floor(totalMs / 60_000) % 60;
  const ms = Math.floor(totalMs % 1000);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(3, '0').slice(0, 2)}`;
}
