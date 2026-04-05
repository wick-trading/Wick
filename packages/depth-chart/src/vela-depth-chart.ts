import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { OrderBookData } from '@vela-trading/core';
import {
  render as renderChart,
  buildDepthLevels,
  hitTest,
  computeBounds,
  DEFAULT_THEME,
  type DepthChartTheme,
  type CrosshairState,
  type DepthLevel,
} from './renderer.js';

/**
 * `<vela-depth-chart>` — Headless Canvas-based depth chart component.
 *
 * Renders cumulative bid/ask depth as filled step curves on a Canvas element.
 * High-performance: Canvas 2D rendering handles 60fps updates without DOM overhead.
 *
 * @fires vela-depth-chart-hover - When hovering over a price level
 * @fires vela-depth-chart-click - When clicking on a price level
 *
 * @csspart container - The outer wrapper div
 * @csspart canvas - The canvas element
 *
 * @cssprop --vela-dc-bid-line - Bid curve stroke color (default: #4dff88)
 * @cssprop --vela-dc-ask-line - Ask curve stroke color (default: #ff4d4d)
 * @cssprop --vela-dc-bid-fill - Bid area fill color (default: rgba(77,255,136,0.12))
 * @cssprop --vela-dc-ask-fill - Ask area fill color (default: rgba(255,77,77,0.12))
 * @cssprop --vela-dc-crosshair - Crosshair color (default: rgba(255,255,255,0.3))
 * @cssprop --vela-dc-text - Axis text color (default: rgba(255,255,255,0.5))
 * @cssprop --vela-dc-grid - Grid line color (default: rgba(255,255,255,0.06))
 * @cssprop --vela-dc-line-width - Curve line width (default: 1.5)
 */
@customElement('vela-depth-chart')
export class VelaDepthChart extends LitElement {
  /** Order book data to visualize */
  @property({ type: Object })
  data: OrderBookData = { bids: [], asks: [] };

  /** Number of depth levels per side */
  @property({ type: Number })
  depth = 50;

  /** Chart width in CSS pixels (0 = auto-size to container) */
  @property({ type: Number })
  width = 0;

  /** Chart height in CSS pixels (0 = auto-size to container) */
  @property({ type: Number })
  height = 0;

  /** Custom theme overrides */
  @property({ type: Object, attribute: false })
  theme: Partial<DepthChartTheme> = {};

  /** Whether crosshair interaction is enabled */
  @property({ type: Boolean, attribute: 'enable-crosshair' })
  enableCrosshair = true;

  @state()
  private _crosshair: CrosshairState = { x: 0, y: 0, visible: false };

  private _canvas: HTMLCanvasElement | null = null;
  private _ctx: CanvasRenderingContext2D | null = null;
  private _rafId: number | null = null;
  private _resizeObserver: ResizeObserver | null = null;
  private _actualWidth = 0;
  private _actualHeight = 0;

  // Cached computed data
  private _bids: DepthLevel[] = [];
  private _asks: DepthLevel[] = [];

  protected override createRenderRoot() {
    return this;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this._setupResizeObserver();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._rafId !== null) cancelAnimationFrame(this._rafId);
    this._resizeObserver?.disconnect();
  }

  protected override updated(changed: Map<string, unknown>): void {
    if (!this._canvas) {
      this._canvas = this.querySelector('canvas');
      if (this._canvas) {
        this._ctx = this._canvas.getContext('2d');
        this._setupCanvasEvents();
        this._resizeCanvas();
      }
    }

    if (changed.has('data') || changed.has('depth')) {
      const levels = buildDepthLevels(this.data, this.depth);
      this._bids = levels.bids;
      this._asks = levels.asks;
    }

    this._scheduleRender();
  }

  private _setupResizeObserver(): void {
    this._resizeObserver = new ResizeObserver(() => {
      this._resizeCanvas();
      this._scheduleRender();
    });
    this._resizeObserver.observe(this);
  }

  private _resizeCanvas(): void {
    if (!this._canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = this.getBoundingClientRect();

    this._actualWidth = this.width || rect.width || 600;
    this._actualHeight = this.height || rect.height || 300;

    this._canvas.style.width = `${this._actualWidth}px`;
    this._canvas.style.height = `${this._actualHeight}px`;
    this._canvas.width = this._actualWidth * dpr;
    this._canvas.height = this._actualHeight * dpr;
  }

  private _setupCanvasEvents(): void {
    if (!this._canvas) return;

    this._canvas.addEventListener('mousemove', (e: MouseEvent) => {
      if (!this.enableCrosshair) return;
      const rect = this._canvas!.getBoundingClientRect();
      this._crosshair = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        visible: true,
      };
      this._scheduleRender();
      this._emitHover();
    });

    this._canvas.addEventListener('mouseleave', () => {
      this._crosshair = { ...this._crosshair, visible: false };
      this._scheduleRender();
    });

    this._canvas.addEventListener('click', (e: MouseEvent) => {
      const rect = this._canvas!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const padding = { top: 20, right: 50, bottom: 30, left: 10 };
      const plotLeft = padding.left;
      const plotWidth = this._actualWidth - padding.left - padding.right;
      const bounds = computeBounds(this._bids, this._asks);

      const hit = hitTest(
        x, this._bids, this._asks,
        bounds.minPrice, bounds.maxPrice, plotLeft, plotWidth,
      );

      if (hit) {
        this.dispatchEvent(
          new CustomEvent('vela-depth-chart-click', {
            detail: { price: hit.level.price, total: hit.level.total, side: hit.side },
            bubbles: true,
            composed: true,
          }),
        );
      }
    });
  }

  private _emitHover(): void {
    const padding = { top: 20, right: 50, bottom: 30, left: 10 };
    const plotLeft = padding.left;
    const plotWidth = this._actualWidth - padding.left - padding.right;
    const bounds = computeBounds(this._bids, this._asks);

    const hit = hitTest(
      this._crosshair.x, this._bids, this._asks,
      bounds.minPrice, bounds.maxPrice, plotLeft, plotWidth,
    );

    if (hit) {
      this.dispatchEvent(
        new CustomEvent('vela-depth-chart-hover', {
          detail: { price: hit.level.price, total: hit.level.total, side: hit.side },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  private _scheduleRender(): void {
    if (this._rafId !== null) return;
    this._rafId = requestAnimationFrame(() => {
      this._rafId = null;
      this._renderChart();
    });
  }

  private _getTheme(): DepthChartTheme {
    const style = getComputedStyle(this);
    const cssVar = (name: string, fallback: string) =>
      style.getPropertyValue(name).trim() || fallback;

    return {
      ...DEFAULT_THEME,
      bidLineColor: cssVar('--vela-dc-bid-line', DEFAULT_THEME.bidLineColor),
      askLineColor: cssVar('--vela-dc-ask-line', DEFAULT_THEME.askLineColor),
      bidFillColor: cssVar('--vela-dc-bid-fill', DEFAULT_THEME.bidFillColor),
      askFillColor: cssVar('--vela-dc-ask-fill', DEFAULT_THEME.askFillColor),
      crosshairColor: cssVar('--vela-dc-crosshair', DEFAULT_THEME.crosshairColor),
      textColor: cssVar('--vela-dc-text', DEFAULT_THEME.textColor),
      gridColor: cssVar('--vela-dc-grid', DEFAULT_THEME.gridColor),
      ...this.theme,
    };
  }

  private _renderChart(): void {
    if (!this._ctx) return;

    const theme = this._getTheme();
    const layout = {
      width: this._actualWidth,
      height: this._actualHeight,
      padding: { top: 20, right: 50, bottom: 30, left: 10 },
    };

    renderChart(this._ctx, this._bids, this._asks, layout, theme, this._crosshair);
  }

  protected override render() {
    return html`
      <div part="container" style="width: 100%; height: 100%; position: relative;">
        <canvas part="canvas" style="display: block;"></canvas>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vela-depth-chart': VelaDepthChart;
  }
}
