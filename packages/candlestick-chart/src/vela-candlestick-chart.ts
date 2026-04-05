import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { createChart, CandlestickSeries, HistogramSeries, type IChartApi, type ISeriesApi } from 'lightweight-charts';
import type { Candle } from '@vela-trading/core';

/**
 * Map a Vela Candle to a Lightweight Charts data point.
 */
function toChartCandle(c: Candle) {
  return {
    time: (c.time / 1000) as import('lightweight-charts').UTCTimestamp,
    open: c.open,
    high: c.high,
    low: c.low,
    close: c.close,
  };
}

/**
 * `<vela-candlestick-chart>` — Headless candlestick chart Web Component.
 *
 * Wraps TradingView Lightweight Charts (~35KB) in a Web Component with a clean API.
 * Supports real-time candle updates, volume overlay, and theming via CSS custom properties.
 *
 * @fires vela-candlestick-crosshair - When crosshair moves, includes price/time
 * @fires vela-candlestick-click - When chart is clicked
 *
 * @csspart container - The outer wrapper div
 * @csspart chart - The chart container div
 *
 * @cssprop --vela-cc-bg - Chart background color (default: transparent)
 * @cssprop --vela-cc-text - Text/label color (default: rgba(255,255,255,0.5))
 * @cssprop --vela-cc-grid - Grid line color (default: rgba(255,255,255,0.06))
 * @cssprop --vela-cc-up-color - Bullish candle color (default: #4dff88)
 * @cssprop --vela-cc-down-color - Bearish candle color (default: #ff4d4d)
 * @cssprop --vela-cc-wick-up - Bullish wick color (default: #4dff88)
 * @cssprop --vela-cc-wick-down - Bearish wick color (default: #ff4d4d)
 */
@customElement('vela-candlestick-chart')
export class VelaCandlestickChart extends LitElement {
  /** Array of OHLCV candles (must be sorted by time ascending) */
  @property({ type: Array })
  candles: Candle[] = [];

  /** Chart width in CSS pixels (0 = auto-size to container) */
  @property({ type: Number })
  width = 0;

  /** Chart height in CSS pixels (0 = auto-size to container) */
  @property({ type: Number })
  height = 0;

  /** Whether to show the volume histogram */
  @property({ type: Boolean, attribute: 'show-volume' })
  showVolume = false;

  /** Time scale visible range — number of candles from the right to show */
  @property({ type: Number, attribute: 'visible-range' })
  visibleRange = 0;

  /** Whether to auto-scroll to the latest candle on update */
  @property({ type: Boolean, attribute: 'auto-scroll' })
  autoScroll = true;

  @state()
  private _initialized = false;

  private _chart: IChartApi | null = null;
  private _candleSeries: ISeriesApi<'Candlestick'> | null = null;
  private _volumeSeries: ISeriesApi<'Histogram'> | null = null;
  private _chartContainer: HTMLDivElement | null = null;
  private _resizeObserver: ResizeObserver | null = null;

  protected override createRenderRoot() {
    return this;
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._resizeObserver?.disconnect();
    this._chart?.remove();
    this._chart = null;
    this._candleSeries = null;
    this._volumeSeries = null;
    this._initialized = false;
  }

  protected override updated(changed: Map<string, unknown>): void {
    if (!this._initialized) {
      this._chartContainer = this.querySelector('[part="chart"]');
      if (this._chartContainer) {
        this._initChart();
        this._initialized = true;
      }
    }

    if (changed.has('candles') && this._candleSeries) {
      this._updateData();
    }

    if (changed.has('showVolume')) {
      this._toggleVolume();
    }
  }

  private _getChartColors() {
    const style = getComputedStyle(this);
    const css = (name: string, fallback: string) =>
      style.getPropertyValue(name).trim() || fallback;

    return {
      bg: css('--vela-cc-bg', 'transparent'),
      text: css('--vela-cc-text', 'rgba(255,255,255,0.5)'),
      grid: css('--vela-cc-grid', 'rgba(255,255,255,0.06)'),
      upColor: css('--vela-cc-up-color', '#4dff88'),
      downColor: css('--vela-cc-down-color', '#ff4d4d'),
      wickUp: css('--vela-cc-wick-up', '#4dff88'),
      wickDown: css('--vela-cc-wick-down', '#ff4d4d'),
    };
  }

  private _initChart(): void {
    if (!this._chartContainer) return;

    const rect = this.getBoundingClientRect();
    const w = this.width || rect.width || 600;
    const h = this.height || rect.height || 400;
    const colors = this._getChartColors();

    this._chart = createChart(this._chartContainer, {
      width: w,
      height: h,
      layout: {
        background: { color: colors.bg },
        textColor: colors.text,
      },
      grid: {
        vertLines: { color: colors.grid },
        horzLines: { color: colors.grid },
      },
      crosshair: {
        mode: 0, // Normal
      },
      rightPriceScale: {
        borderVisible: false,
      },
      timeScale: {
        borderVisible: false,
      },
    });

    this._candleSeries = this._chart.addSeries(CandlestickSeries, {
      upColor: colors.upColor,
      downColor: colors.downColor,
      wickUpColor: colors.wickUp,
      wickDownColor: colors.wickDown,
      borderVisible: false,
    });

    if (this.showVolume) {
      this._createVolumeSeries();
    }

    // Crosshair event
    this._chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.point) return;
      const data = param.seriesData.get(this._candleSeries!);
      if (data) {
        this.dispatchEvent(
          new CustomEvent('vela-candlestick-crosshair', {
            detail: { time: param.time, point: param.point, data },
            bubbles: true,
            composed: true,
          }),
        );
      }
    });

    // Click event
    this._chart.subscribeClick((param) => {
      if (!param.time) return;
      const data = param.seriesData.get(this._candleSeries!);
      this.dispatchEvent(
        new CustomEvent('vela-candlestick-click', {
          detail: { time: param.time, point: param.point, data },
          bubbles: true,
          composed: true,
        }),
      );
    });

    // Auto-resize
    this._resizeObserver = new ResizeObserver(() => {
      if (!this._chart || this.width > 0) return;
      const r = this.getBoundingClientRect();
      this._chart.applyOptions({
        width: r.width,
        height: this.height || r.height,
      });
    });
    this._resizeObserver.observe(this);

    // Set initial data
    if (this.candles.length > 0) {
      this._updateData();
    }
  }

  private _createVolumeSeries(): void {
    if (!this._chart) return;

    this._volumeSeries = this._chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    });

    this._chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });
  }

  private _toggleVolume(): void {
    if (this.showVolume && !this._volumeSeries && this._chart) {
      this._createVolumeSeries();
      this._updateVolumeData();
    } else if (!this.showVolume && this._volumeSeries && this._chart) {
      this._chart.removeSeries(this._volumeSeries);
      this._volumeSeries = null;
    }
  }

  private _updateData(): void {
    if (!this._candleSeries) return;

    const chartData = this.candles.map(toChartCandle);
    this._candleSeries.setData(chartData);

    this._updateVolumeData();

    if (this.autoScroll && this._chart) {
      this._chart.timeScale().scrollToRealTime();
    }
  }

  private _updateVolumeData(): void {
    if (!this._volumeSeries || this.candles.length === 0) return;

    const colors = this._getChartColors();
    const volumeData = this.candles.map((c) => ({
      time: (c.time / 1000) as import('lightweight-charts').UTCTimestamp,
      value: c.volume,
      color: c.close >= c.open
        ? colors.upColor + '40'  // 25% opacity
        : colors.downColor + '40',
    }));

    this._volumeSeries.setData(volumeData);
  }

  /**
   * Add or update the latest candle in real-time.
   * If the candle's time matches the last candle, it updates in place.
   * Otherwise, a new candle is appended.
   */
  updateCandle(candle: Candle): void {
    if (!this._candleSeries) return;

    this._candleSeries.update(toChartCandle(candle));

    if (this._volumeSeries) {
      const colors = this._getChartColors();
      this._volumeSeries.update({
        time: (candle.time / 1000) as import('lightweight-charts').UTCTimestamp,
        value: candle.volume,
        color: candle.close >= candle.open
          ? colors.upColor + '40'
          : colors.downColor + '40',
      });
    }
  }

  /**
   * Get the underlying Lightweight Charts API for advanced usage.
   */
  getChartApi(): IChartApi | null {
    return this._chart;
  }

  /**
   * Fit all data into the visible area.
   */
  fitContent(): void {
    this._chart?.timeScale().fitContent();
  }

  protected override render() {
    return html`
      <div part="container" style="width: 100%; height: 100%; position: relative;">
        <div part="chart" style="width: 100%; height: 100%;"></div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vela-candlestick-chart': VelaCandlestickChart;
  }
}
