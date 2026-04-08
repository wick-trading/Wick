import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { LineSeries, type ISeriesApi, type UTCTimestamp } from 'lightweight-charts';
import type { Candle } from '@wick/core';
import { calcVWAP } from './math.js';

interface ChartHost extends HTMLElement {
  getChartApi(): import('lightweight-charts').IChartApi | null;
}

/**
 * `<wick-indicator-vwap>` — Volume-Weighted Average Price overlay.
 *
 * Requires candles with a `volume` field. Resets per session (cumulative from
 * first candle in the provided array).
 */
@customElement('wick-indicator-vwap')
export class WickIndicatorVwap extends LitElement {
  @property({ type: Array }) candles: Candle[] = [];
  @property() color = '#00e5ff';
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
        lineWidth: 2,
        lineStyle: 3,
      });
    }
    const values = calcVWAP(this.candles);
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
  interface HTMLElementTagNameMap { 'wick-indicator-vwap': WickIndicatorVwap; }
}
