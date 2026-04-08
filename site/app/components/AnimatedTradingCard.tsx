"use client";

import { useEffect, useState } from "react";
import { GREEN, RED } from "../lib/colors";

interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
}

interface BookLevel {
  offset: number;
  size: number;
}
const CANDLE_COUNT = 26;

function makeCandle(prevClose: number): Candle {
  const move = (Math.random() - 0.47) * 120;
  const open = prevClose;
  const close = open + move;
  const wickUp = Math.random() * 60;
  const wickDown = Math.random() * 60;
  return {
    open,
    high: Math.max(open, close) + wickUp,
    low: Math.min(open, close) - wickDown,
    close,
  };
}

function buildInitialCandles(): Candle[] {
  const result: Candle[] = [];
  let price = 67400;
  for (let i = 0; i < CANDLE_COUNT; i++) {
    const c = makeCandle(price);
    result.push(c);
    price = c.close;
  }
  return result;
}

function buildInitialBook(): { asks: BookLevel[]; bids: BookLevel[] } {
  return {
    asks: [
      { offset: 0.5, size: 1.234 },
      { offset: 1.5, size: 0.567 },
      { offset: 2.5, size: 2.891 },
    ],
    bids: [
      { offset: -0.5, size: 0.891 },
      { offset: -1.5, size: 2.456 },
      { offset: -2.5, size: 1.123 },
    ],
  };
}

export function AnimatedTradingCard() {
  const [mounted, setMounted] = useState(false);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [price, setPrice] = useState(67432.5);
  const [direction, setDirection] = useState<"up" | "down">("up");
  const [flash, setFlash] = useState(false);
  const [book, setBook] = useState(buildInitialBook);
  const change24h = 2.34;

  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Mount init — avoids SSR hydration mismatch
  useEffect(() => {
    setCandles(buildInitialCandles());
    setMounted(true);
  }, []);

  // Live price tick — updates every 180ms
  useEffect(() => {
    if (!mounted || reducedMotion) return;
    const id = setInterval(() => {
      setPrice((prev) => {
        const delta = (Math.random() - 0.49) * 14;
        const next = Math.max(prev + delta, 1);
        setDirection(delta > 0 ? "up" : "down");
        setFlash(true);
        setTimeout(() => setFlash(false), 260);
        setCandles((cs) => {
          if (!cs.length) return cs;
          const updated = [...cs];
          const last = { ...updated[updated.length - 1] };
          last.close = next;
          last.high = Math.max(last.high, next);
          last.low = Math.min(last.low, next);
          updated[updated.length - 1] = last;
          return updated;
        });
        return next;
      });
    }, 180);
    return () => clearInterval(id);
  }, [mounted]);

  // New candle every ~3.5s
  useEffect(() => {
    if (!mounted || reducedMotion) return;
    const id = setInterval(() => {
      setCandles((cs) => {
        if (!cs.length) return cs;
        const last = cs[cs.length - 1];
        return [...cs.slice(1), makeCandle(last.close)];
      });
    }, 3500);
    return () => clearInterval(id);
  }, [mounted]);

  // Order book size drift — every 1.2s
  useEffect(() => {
    if (!mounted || reducedMotion) return;
    const id = setInterval(() => {
      setBook((b) => ({
        asks: b.asks.map((l) => ({ ...l, size: Math.max(0.1, l.size + (Math.random() - 0.5) * 0.3) })),
        bids: b.bids.map((l) => ({ ...l, size: Math.max(0.1, l.size + (Math.random() - 0.5) * 0.3) })),
      }));
    }, 1200);
    return () => clearInterval(id);
  }, [mounted]);

  // SVG layout
  const W = 360;
  const H = 170;
  const PAD = { top: 14, right: 10, bottom: 14, left: 10 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const allPrices = candles.flatMap((c) => [c.high, c.low]);
  const minP = allPrices.length ? Math.min(...allPrices) : 0;
  const maxP = allPrices.length ? Math.max(...allPrices) : 1;
  const range = maxP - minP || 1;

  const toY = (p: number) => PAD.top + ((maxP - p) / range) * plotH;
  const spacing = plotW / CANDLE_COUNT;
  const cw = spacing * 0.52;
  const cx = (i: number) => PAD.left + i * spacing + spacing / 2;

  // Price line path
  const linePath = candles
    .map((c, i) => `${i === 0 ? "M" : "L"} ${cx(i).toFixed(1)} ${toY(c.close).toFixed(1)}`)
    .join(" ");

  // Area fill path (line + bottom close)
  const areaPath =
    candles.length > 0
      ? `${linePath} L ${cx(candles.length - 1).toFixed(1)} ${H - PAD.bottom} L ${cx(0).toFixed(1)} ${H - PAD.bottom} Z`
      : "";

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden"
      style={{
        background: "rgba(10,10,18,0.95)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 0 0 1px rgba(0,255,163,0.04), 0 32px 64px rgba(0,0,0,0.5)",
      }}
    >
      {/* Top glow */}
      <div
        className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgba(0,255,163,0.3), transparent)" }}
      />

      {/* Price header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono" style={{ color: "var(--text-2)" }}>
            BTC/USD
          </span>
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: GREEN }}
          />
          <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
            BINANCE
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <span
            className="font-mono text-[17px] font-bold tabular-nums transition-colors duration-150"
            style={{ color: flash ? (direction === "up" ? GREEN : RED) : "var(--foreground)" }}
          >
            ${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span
            className="text-xs font-mono font-semibold"
            style={{ color: GREEN }}
          >
            +{change24h.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Candlestick chart */}
      <div className="px-1">
        {mounted && candles.length > 0 ? (
          <svg
            viewBox={`0 0 ${W} ${H}`}
            width="100%"
            style={{ display: "block" }}
          >
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={GREEN} stopOpacity="0.07" />
                <stop offset="100%" stopColor={GREEN} stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {[0.25, 0.5, 0.75].map((t) => (
              <line
                key={t}
                x1={PAD.left}
                y1={PAD.top + t * plotH}
                x2={W - PAD.right}
                y2={PAD.top + t * plotH}
                stroke="rgba(255,255,255,0.04)"
                strokeWidth={1}
              />
            ))}

            {/* Area fill */}
            <path d={areaPath} fill="url(#areaGrad)" />

            {/* Candles */}
            {candles.map((c, i) => {
              const isUp = c.close >= c.open;
              const color = isUp ? GREEN : RED;
              const x = cx(i);
              const bodyTop = toY(Math.max(c.open, c.close));
              const bodyBot = toY(Math.min(c.open, c.close));
              const bodyH = Math.max(1.5, bodyBot - bodyTop);
              const isLast = i === candles.length - 1;

              return (
                <g key={i}>
                  {/* Wick */}
                  <line
                    x1={x}
                    y1={toY(c.high)}
                    x2={x}
                    y2={toY(c.low)}
                    stroke={color}
                    strokeWidth={isLast ? 1.5 : 1}
                    opacity={0.7}
                  />
                  {/* Body */}
                  <rect
                    x={x - cw / 2}
                    y={bodyTop}
                    width={cw}
                    height={bodyH}
                    fill={color}
                    rx={0.8}
                    opacity={isLast ? 1 : 0.82}
                  />
                  {/* Last candle glow */}
                  {isLast && (
                    <rect
                      x={x - cw / 2 - 2}
                      y={bodyTop - 2}
                      width={cw + 4}
                      height={bodyH + 4}
                      fill={color}
                      rx={2}
                      opacity={0.12}
                    />
                  )}
                </g>
              );
            })}

            {/* Price line */}
            <path
              d={linePath}
              fill="none"
              stroke={GREEN}
              strokeWidth={1}
              opacity={0.25}
            />
          </svg>
        ) : (
          <div style={{ height: H, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div
              className="w-8 h-8 rounded-full border-2 animate-spin"
              style={{ borderColor: "rgba(0,255,163,0.2)", borderTopColor: GREEN }}
            />
          </div>
        )}
      </div>

      {/* Mini order book */}
      <div
        className="mx-3 mb-3 rounded-xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        {/* Header */}
        <div
          className="flex justify-between px-3 py-1.5 text-[9px] font-mono font-semibold uppercase tracking-wider"
          style={{
            color: "var(--text-muted)",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <span>Price (USD)</span>
          <span>Amount (BTC)</span>
        </div>

        <div className="px-0.5 pt-0.5">
          {/* Asks (reversed — closest to spread at bottom) */}
          {[...book.asks].reverse().map((level, i) => {
            const askPrice = price + level.offset;
            const depthPct = 25 + i * 18;
            return (
              <div
                key={`ask-${i}`}
                className="relative flex justify-between px-2.5 py-[3px]"
              >
                <div
                  className="absolute inset-y-0 right-0 rounded-sm"
                  style={{ width: `${depthPct}%`, background: "rgba(255,56,96,0.1)" }}
                />
                <span className="relative font-mono text-[11px]" style={{ color: RED }}>
                  {askPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span
                  className="relative font-mono text-[11px] tabular-nums"
                  style={{ color: "var(--text-muted)" }}
                >
                  {level.size.toFixed(4)}
                </span>
              </div>
            );
          })}

          {/* Spread */}
          <div
            className="flex items-center justify-center py-1 my-0.5 text-[10px] font-mono"
            style={{
              color: "var(--text-muted)",
              borderTop: "1px solid rgba(255,255,255,0.04)",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <span className="mr-2" style={{ color: "var(--foreground)", fontWeight: 600 }}>
              ${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span style={{ color: GREEN }}>▲</span>
            <span className="ml-2">spread: $1.00</span>
          </div>

          {/* Bids */}
          {book.bids.map((level, i) => {
            const bidPrice = price + level.offset;
            const depthPct = 30 + i * 16;
            return (
              <div
                key={`bid-${i}`}
                className="relative flex justify-between px-2.5 py-[3px]"
              >
                <div
                  className="absolute inset-y-0 right-0 rounded-sm"
                  style={{ width: `${depthPct}%`, background: "rgba(0,255,163,0.08)" }}
                />
                <span className="relative font-mono text-[11px]" style={{ color: GREEN }}>
                  {bidPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span
                  className="relative font-mono text-[11px] tabular-nums"
                  style={{ color: "var(--text-muted)" }}
                >
                  {level.size.toFixed(4)}
                </span>
              </div>
            );
          })}
        </div>

        <div className="h-1" />
      </div>
    </div>
  );
}
