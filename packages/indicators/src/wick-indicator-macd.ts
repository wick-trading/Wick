import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { LineSeries, HistogramSeries, type ISeriesApi, type UTCTimestamp } from 'lightweight-charts';
import type { Candle } from '@wick/core';
import { calcMACD } from './math.js';

interface ChartHost extends HTMLElement {
  getChartApi(): import('lightweight-charts').IChartApi | null;
}

/**
 * `<wick-indicator-macd>` — MACD indicator (MACD line + signal line + histogram).
 *
 * Renders in the main chart pane. Use CSS height on the chart to make room.
 */
@customElement('wick-indicator-macd')
export class WickIndicatorMacd extends LitElement {
  @property({ type: Array }) candles: Candle[] = [];
  @property({ type: Number }) fast = 12;
  @property({ type: Number }) slow = 26;
  @property({ type: Number }) signal = 9;
  @property() colorMacd = '#2196f3';
  @property() colorSignal = '#ff9800';
  @property() colorHistPositive = 'rgba(0,255,163,0.6)';
  @property() colorHistNegative = 'rgba(255,56,96,0.6)';
  @property() chart = '';

  createRenderRoot() { return this; }

  private _macdSeries: ISeriesApi<'Line'> | null = null;
  private _signalSeries: ISeriesApi<'Line'> | null = null;
  private _histSeries: ISeriesApi<'Histogram'> | null = null;
  private _chartHost: ChartHost | null = null;

  override updated() { this._sync(); }

  private _sync() {
    const host = this.chart
      ? (document.querySelector(this.chart) as ChartHost | null)
      : null;
    const api = host?.getChartApi?.() ?? null;
    if (!api) return;
    if (host !== this._chartHost) {
      this._macdSeries = this._signalSeries = this._histSeries = null;
      this._chartHost = host;
    }
    if (!this._macdSeries) {
      this._histSeries = api.addSeries(HistogramSeries, {
        color: this.colorHistPositive,
        priceScaleId: 'macd',
      });
      this._macdSeries = api.addSeries(LineSeries, {
        color: this.colorMacd,
        lineWidth: 1,
        priceScaleId: 'macd',
      });
      this._signalSeries = api.addSeries(LineSeries, {
        color: this.colorSignal,
        lineWidth: 1,
        priceScaleId: 'macd',
      });
    }
    const { macd, signal, histogram } = calcMACD(this.candles, this.fast, this.slow, this.signal);
    const toLine = (values: (number | null)[]) =>
      this.candles
        .map((c, i) => ({ time: (c.time / 1000) as UTCTimestamp, value: values[i] }))
        .filter((d): d is { time: UTCTimestamp; value: number } => d.value !== null);
    const histData = this.candles
      .map((c, i) => ({
        time: (c.time / 1000) as UTCTimestamp,
        value: histogram[i],
        color: (histogram[i] ?? 0) >= 0 ? this.colorHistPositive : this.colorHistNegative,
      }))
      .filter((d): d is { time: UTCTimestamp; value: number; color: string } => d.value !== null);
    this._histSeries!.setData(histData);
    this._macdSeries!.setData(toLine(macd));
    this._signalSeries!.setData(toLine(signal));
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this._macdSeries?.setData([]); this._signalSeries?.setData([]); this._histSeries?.setData([]);
    this._macdSeries = this._signalSeries = this._histSeries = null;
    this._chartHost = null;
  }
}

declare global {
  interface HTMLElementTagNameMap { 'wick-indicator-macd': WickIndicatorMacd; }
}
