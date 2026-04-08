import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { LineSeries, type ISeriesApi, type UTCTimestamp } from 'lightweight-charts';
import type { Candle } from '@wick/core';
import { calcBollinger } from './math.js';

interface ChartHost extends HTMLElement {
  getChartApi(): import('lightweight-charts').IChartApi | null;
}

/**
 * `<wick-indicator-bollinger>` — Bollinger Bands overlay (upper + middle + lower).
 */
@customElement('wick-indicator-bollinger')
export class WickIndicatorBollinger extends LitElement {
  @property({ type: Array }) candles: Candle[] = [];
  @property({ type: Number }) period = 20;
  @property({ type: Number }) stddev = 2;
  @property() colorUpper = 'rgba(255,193,7,0.8)';
  @property() colorMiddle = 'rgba(255,193,7,0.5)';
  @property() colorLower = 'rgba(255,193,7,0.8)';
  @property() chart = '';

  createRenderRoot() { return this; }

  private _upper: ISeriesApi<'Line'> | null = null;
  private _middle: ISeriesApi<'Line'> | null = null;
  private _lower: ISeriesApi<'Line'> | null = null;
  private _chartHost: ChartHost | null = null;

  override updated() { this._sync(); }

  private _sync() {
    const host = this.chart
      ? (document.querySelector(this.chart) as ChartHost | null)
      : null;
    const api = host?.getChartApi?.() ?? null;
    if (!api) return;
    if (host !== this._chartHost) {
      this._upper = this._middle = this._lower = null;
      this._chartHost = host;
    }
    if (!this._upper) {
      this._upper = api.addSeries(LineSeries, { color: this.colorUpper, lineWidth: 1, lineStyle: 2 });
      this._middle = api.addSeries(LineSeries, { color: this.colorMiddle, lineWidth: 1, lineStyle: 1 });
      this._lower = api.addSeries(LineSeries, { color: this.colorLower, lineWidth: 1, lineStyle: 2 });
    }
    const { upper, middle, lower } = calcBollinger(this.candles, this.period, this.stddev);
    const toData = (values: (number | null)[]) =>
      this.candles
        .map((c, i) => ({ time: (c.time / 1000) as UTCTimestamp, value: values[i] }))
        .filter((d): d is { time: UTCTimestamp; value: number } => d.value !== null);
    this._upper!.setData(toData(upper));
    this._middle!.setData(toData(middle));
    this._lower!.setData(toData(lower));
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this._upper?.setData([]); this._middle?.setData([]); this._lower?.setData([]);
    this._upper = this._middle = this._lower = null;
    this._chartHost = null;
  }
}

declare global {
  interface HTMLElementTagNameMap { 'wick-indicator-bollinger': WickIndicatorBollinger; }
}
