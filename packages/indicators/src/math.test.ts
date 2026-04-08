import { describe, it, expect } from 'vitest';
import { calcEMA, calcSMA, calcBollinger, calcMACD, calcRSI, calcVWAP } from './math.js';
import type { Candle } from '@wick/core';

function makeCandles(closes: number[], volumes?: number[]): Candle[] {
  return closes.map((close, i) => ({
    time: (1_700_000_000 + i * 60) * 1000,
    open: close,
    high: close,
    low: close,
    close,
    volume: volumes?.[i] ?? 1000,
  }));
}

describe('calcEMA', () => {
  it('returns nulls until period is reached', () => {
    const candles = makeCandles([1, 2, 3, 4, 5]);
    const result = calcEMA(candles, 3);
    expect(result[0]).toBeNull();
    expect(result[1]).toBeNull();
    expect(result[2]).not.toBeNull();
  });

  it('seeds from SMA then applies EMA smoothing', () => {
    const candles = makeCandles([10, 10, 10, 20]); // seed = 10, then 20 applied
    const result = calcEMA(candles, 3);
    expect(result[2]).toBe(10);
    // k = 2/(3+1) = 0.5  →  ema = 20*0.5 + 10*0.5 = 15
    expect(result[3]).toBe(15);
  });

  it('returns all nulls when insufficient candles', () => {
    const candles = makeCandles([1, 2]);
    expect(calcEMA(candles, 5).every(v => v === null)).toBe(true);
  });
});

describe('calcSMA', () => {
  it('returns correct rolling average', () => {
    const candles = makeCandles([2, 4, 6, 8]);
    const result = calcSMA(candles, 3);
    expect(result[2]).toBeCloseTo(4);
    expect(result[3]).toBeCloseTo(6);
  });

  it('leading values are null', () => {
    const candles = makeCandles([1, 2, 3, 4]);
    const result = calcSMA(candles, 3);
    expect(result[0]).toBeNull();
    expect(result[1]).toBeNull();
  });
});

describe('calcBollinger', () => {
  it('middle band equals SMA', () => {
    const candles = makeCandles([10, 10, 10, 10, 10]);
    const { middle } = calcBollinger(candles, 3, 2);
    expect(middle[2]).toBeCloseTo(10);
  });

  it('upper > middle > lower when there is variance', () => {
    const candles = makeCandles([8, 10, 12, 10, 8, 10, 12]);
    const { upper, middle, lower } = calcBollinger(candles, 3, 2);
    const i = 4;
    expect(upper[i]!).toBeGreaterThan(middle[i]!);
    expect(middle[i]!).toBeGreaterThan(lower[i]!);
  });

  it('upper === lower === middle when all closes are equal', () => {
    const candles = makeCandles([5, 5, 5, 5, 5]);
    const { upper, middle, lower } = calcBollinger(candles, 3, 2);
    expect(upper[4]).toBeCloseTo(middle[4]!);
    expect(lower[4]).toBeCloseTo(middle[4]!);
  });
});

describe('calcMACD', () => {
  it('returns null arrays for insufficient data', () => {
    const candles = makeCandles([1, 2, 3]);
    const { macd, signal, histogram } = calcMACD(candles, 12, 26, 9);
    expect(macd.every(v => v === null)).toBe(true);
    expect(signal.every(v => v === null)).toBe(true);
    expect(histogram.every(v => v === null)).toBe(true);
  });

  it('produces macd values once slow EMA is available', () => {
    const closes = Array.from({ length: 40 }, (_, i) => 100 + i);
    const candles = makeCandles(closes);
    const { macd } = calcMACD(candles, 3, 6, 3);
    const firstValid = macd.findIndex(v => v !== null);
    expect(firstValid).toBeGreaterThan(-1);
  });

  it('histogram = macd - signal when both are defined', () => {
    const closes = Array.from({ length: 40 }, (_, i) => 100 + i * 0.5);
    const candles = makeCandles(closes);
    const { macd, signal, histogram } = calcMACD(candles, 3, 6, 3);
    for (let i = 0; i < candles.length; i++) {
      if (macd[i] !== null && signal[i] !== null) {
        expect(histogram[i]).toBeCloseTo(macd[i]! - signal[i]!);
      }
    }
  });
});

describe('calcRSI', () => {
  it('returns null until period+1 candles available', () => {
    const candles = makeCandles([1, 2, 3, 4, 5]);
    const result = calcRSI(candles, 14);
    expect(result.every(v => v === null)).toBe(true);
  });

  it('RSI = 100 when all moves are gains', () => {
    const closes = Array.from({ length: 20 }, (_, i) => 100 + i);
    const candles = makeCandles(closes);
    const result = calcRSI(candles, 14);
    const last = result[result.length - 1];
    expect(last).toBeCloseTo(100, 0);
  });

  it('RSI = 0 when all moves are losses', () => {
    const closes = Array.from({ length: 20 }, (_, i) => 100 - i);
    const candles = makeCandles(closes);
    const result = calcRSI(candles, 14);
    const last = result[result.length - 1];
    expect(last).toBeCloseTo(0, 0);
  });

  it('RSI stays between 0 and 100', () => {
    const closes = [100, 102, 98, 103, 97, 105, 95, 110, 90, 115, 85, 120, 80, 125, 75, 130];
    const candles = makeCandles(closes);
    const result = calcRSI(candles, 5);
    result.filter(v => v !== null).forEach(v => {
      expect(v!).toBeGreaterThanOrEqual(0);
      expect(v!).toBeLessThanOrEqual(100);
    });
  });
});

describe('calcVWAP', () => {
  it('equals typical price when all volumes are equal', () => {
    const candles: Candle[] = [
      { time: 1000, open: 10, high: 12, low: 8, close: 10, volume: 100 },
      { time: 2000, open: 10, high: 12, low: 8, close: 10, volume: 100 },
    ];
    const result = calcVWAP(candles);
    // typical = (12+8+10)/3 ≈ 10
    expect(result[1]).toBeCloseTo(10);
  });

  it('returns null when volume is zero', () => {
    const candles: Candle[] = [
      { time: 1000, open: 10, high: 12, low: 8, close: 10, volume: 0 },
    ];
    expect(calcVWAP(candles)[0]).toBeNull();
  });

  it('is cumulative — later value changes as more data is added', () => {
    const candles: Candle[] = [
      { time: 1000, open: 100, high: 110, low: 90, close: 100, volume: 1000 },
      { time: 2000, open: 200, high: 210, low: 190, close: 200, volume: 1000 },
    ];
    const result = calcVWAP(candles);
    expect(result[0]).toBeCloseTo(100);
    // midpoint between typical(100) and typical(200) = 150
    expect(result[1]).toBeCloseTo(150);
  });
});
