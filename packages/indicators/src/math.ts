import type { Candle } from '@wick/core';

// ── EMA ───────────────────────────────────────────────────────────────────────

export function calcEMA(candles: Candle[], period: number): (number | null)[] {
  const result: (number | null)[] = new Array(candles.length).fill(null);
  if (candles.length < period) return result;
  const k = 2 / (period + 1);
  let ema = candles.slice(0, period).reduce((s, c) => s + c.close, 0) / period;
  result[period - 1] = ema;
  for (let i = period; i < candles.length; i++) {
    ema = candles[i].close * k + ema * (1 - k);
    result[i] = ema;
  }
  return result;
}

// ── SMA ───────────────────────────────────────────────────────────────────────

export function calcSMA(candles: Candle[], period: number): (number | null)[] {
  const result: (number | null)[] = new Array(candles.length).fill(null);
  for (let i = period - 1; i < candles.length; i++) {
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) sum += candles[j].close;
    result[i] = sum / period;
  }
  return result;
}

// ── Bollinger Bands ───────────────────────────────────────────────────────────

export interface BollingerResult {
  upper: (number | null)[];
  middle: (number | null)[];
  lower: (number | null)[];
}

export function calcBollinger(candles: Candle[], period: number, stddev: number): BollingerResult {
  const middle = calcSMA(candles, period);
  const upper: (number | null)[] = new Array(candles.length).fill(null);
  const lower: (number | null)[] = new Array(candles.length).fill(null);
  for (let i = period - 1; i < candles.length; i++) {
    const mid = middle[i]!;
    const slice = candles.slice(i - period + 1, i + 1);
    const variance = slice.reduce((s, c) => s + Math.pow(c.close - mid, 2), 0) / period;
    const sd = Math.sqrt(variance) * stddev;
    upper[i] = mid + sd;
    lower[i] = mid - sd;
  }
  return { upper, middle, lower };
}

// ── MACD ──────────────────────────────────────────────────────────────────────

export interface MACDResult {
  macd: (number | null)[];
  signal: (number | null)[];
  histogram: (number | null)[];
}

export function calcMACD(candles: Candle[], fast: number, slow: number, signal: number): MACDResult {
  const emaFast = calcEMA(candles, fast);
  const emaSlow = calcEMA(candles, slow);
  const macd: (number | null)[] = candles.map((_, i) =>
    emaFast[i] !== null && emaSlow[i] !== null ? emaFast[i]! - emaSlow[i]! : null,
  );

  const signalLine: (number | null)[] = new Array(candles.length).fill(null);
  const histogram: (number | null)[] = new Array(candles.length).fill(null);

  // Find first valid macd index and collect enough values for signal EMA seed
  const firstIdx = macd.findIndex(v => v !== null);
  if (firstIdx === -1) return { macd, signal: signalLine, histogram };

  const macdValues: number[] = [];
  for (let i = firstIdx; i < candles.length; i++) {
    if (macd[i] !== null) macdValues.push(macd[i]!);
    if (macdValues.length === signal) {
      const sigIdx = i;
      const k = 2 / (signal + 1);
      let sig = macdValues.reduce((s, v) => s + v, 0) / signal;
      signalLine[sigIdx] = sig;
      histogram[sigIdx] = macd[sigIdx]! - sig;
      for (let j = sigIdx + 1; j < candles.length; j++) {
        if (macd[j] === null) continue;
        sig = macd[j]! * k + sig * (1 - k);
        signalLine[j] = sig;
        histogram[j] = macd[j]! - sig;
      }
      break;
    }
  }
  return { macd, signal: signalLine, histogram };
}

// ── RSI ───────────────────────────────────────────────────────────────────────

export function calcRSI(candles: Candle[], period: number): (number | null)[] {
  const result: (number | null)[] = new Array(candles.length).fill(null);
  if (candles.length <= period) return result;
  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 1; i <= period; i++) {
    const diff = candles[i].close - candles[i - 1].close;
    if (diff > 0) avgGain += diff;
    else avgLoss -= diff;
  }
  avgGain /= period;
  avgLoss /= period;
  result[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  for (let i = period + 1; i < candles.length; i++) {
    const diff = candles[i].close - candles[i - 1].close;
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    result[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  }
  return result;
}

// ── VWAP ──────────────────────────────────────────────────────────────────────

export function calcVWAP(candles: Candle[]): (number | null)[] {
  let cumPV = 0;
  let cumVol = 0;
  return candles.map(c => {
    const typical = (c.high + c.low + c.close) / 3;
    const vol = c.volume ?? 0;
    cumPV += typical * vol;
    cumVol += vol;
    return cumVol > 0 ? cumPV / cumVol : null;
  });
}
