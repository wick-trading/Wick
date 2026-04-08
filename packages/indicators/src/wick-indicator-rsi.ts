import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { LineSeries, type ISeriesApi, type UTCTimestamp } from 'lightweight-charts';
import type { Candle } from '@wick/core';
import { calcRSI } from './math.js';

interface ChartHost extends HTMLElement {
  getChartApi(): import('lightweight-charts').IChartApi | null;
}

/**
 * `<wick-indicator-rsi>` — Relative Strength Index overlay.
 *
 * Renders RSI (0–100) in the main chart area. Use a separate
 * `priceScaleId` configuration on the chart side to keep it bounded.
 */
@customElement('wick-indicator-rsi')
export class WickIndicatorRsi extends LitElement {
  @property({ type: Array }) candles: Candle[] = [];
  @property({ type: Number }) period = 14;
  @property() color = '#9c27b0';
  @property() chart = '';

  createRenderRoot() { return this; }

  private _series: ISeriesApi<'Line'> | null = null;
  private _chartHost: ChartHost | null = null;

  override updated() { this._sync(); }

  private _sync() {
    const host = this.chart
      ? (document.querySelector(this.chart) as ChartHost | null)
      : null;
    const api = host?.getChartApi?.() ?? null;
    if (!api) return;
    if (host !== this._chartHost) { this._series = null; this._chartHost = host; }
    if (!this._series) {
      this._series = api.addSeries(LineSeries, {
        color: this.color,
        lineWidth: 1,
        priceScaleId: 'rsi',
      });
    }
    const values = calcRSI(this.candles, this.period);
    const data = this.candles
      .map((c, i) => ({ time: (c.time / 1000) as UTCTimestamp, value: values[i] }))
      .filter((d): d is { time: UTCTimestamp; value: number } => d.value !== null);
    this._series.setData(data);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this._series?.setData([]);
    this._series = null;
    this._chartHost = null;
  }
}

declare global {
  interface HTMLElementTagNameMap { 'wick-indicator-rsi': WickIndicatorRsi; }
}
