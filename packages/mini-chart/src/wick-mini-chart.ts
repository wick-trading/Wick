import { LitElement, html, svg } from 'lit';
import { customElement, property } from 'lit/decorators.js';

// Internal viewBox coordinate space. The rendered SVG scales to its host
// element via width/height = 100%, so consumers control visual size via CSS
// on the <wick-mini-chart> element (or inline style attributes).
const VB_W = 100;
const VB_H = 30;
const PAD_Y = 2;

export type MiniChartDirection = 'up' | 'down' | 'flat';

/**
 * `<wick-mini-chart>` — Headless SVG sparkline.
 *
 * Single-purpose inline chart for tables, cards, and watchlist rows.
 * Pure SVG, auto-scales to its container, direction colour inferred from
 * a first-vs-last value comparison. Accepts values as a comma-separated
 * attribute string or as a `number[]` property.
 *
 * Usage:
 *
 *     <wick-mini-chart values="65000,65500,66100,67000,67432" area dot></wick-mini-chart>
 *
 *     const sp = document.querySelector('wick-mini-chart');
 *     sp.values = [65000, 65500, 66100, 67000, 67432];
 *
 * @csspart svg       - The root SVG element
 * @csspart line      - The primary line path (also tagged `line--up|down|flat`)
 * @csspart area      - The area fill below the line (also tagged `area--up|down|flat`)
 * @csspart dot       - Any point marker (`dot--last`, `dot--min`, `dot--max`)
 * @csspart baseline  - The horizontal baseline reference line
 *
 * @cssprop --wick-mc-up-color        - Stroke colour when the series trends up
 * @cssprop --wick-mc-down-color      - Stroke colour when the series trends down
 * @cssprop --wick-mc-flat-color      - Stroke colour when the series is flat
 * @cssprop --wick-mc-up-fill         - Area fill colour when up
 * @cssprop --wick-mc-down-fill       - Area fill colour when down
 * @cssprop --wick-mc-line-width      - Line stroke width (default 1.5)
 * @cssprop --wick-mc-dot-size        - Radius of dot markers (default 2)
 * @cssprop --wick-mc-baseline-color  - Baseline reference line colour
 * @cssprop --wick-mc-baseline-width  - Baseline stroke width (default 1)
 * @cssprop --wick-mc-baseline-dash   - Baseline stroke-dasharray (default `2 2`)
 */
@customElement('wick-mini-chart')
export class WickMiniChart extends LitElement {
  /**
   * The numeric series to plot. Set via the `values` attribute as a
   * comma-separated string, or as `number[]` via the property.
   */
  @property({
    converter: {
      fromAttribute: (value: string | null): number[] => {
        if (!value) return [];
        return value
          .split(',')
          .map((s) => Number(s.trim()))
          .filter((n) => Number.isFinite(n));
      },
      toAttribute: (value: number[]): string =>
        Array.isArray(value) ? value.join(',') : '',
    },
  })
  values: number[] = [];

  /** Render an area fill under the line. */
  @property({ type: Boolean })
  area = false;

  /** Render a dot on the last point. */
  @property({ type: Boolean })
  dot = false;

  /** Use catmull-rom smoothing for the line path. */
  @property({ type: Boolean })
  smooth = false;

  /** Render markers on the min and max points. */
  @property({ type: Boolean, attribute: 'show-extremes' })
  showExtremes = false;

  /**
   * Optional horizontal reference line (in data units). Commonly used as a
   * zero line for P&L sparklines. Rendered only when the baseline falls
   * inside the data range.
   */
  @property({ type: Number })
  baseline?: number;

  // No Shadow DOM — fully headless, like every other Wick component.
  protected override createRenderRoot() {
    return this;
  }

  /** Direction derived from first vs last value. */
  get direction(): MiniChartDirection {
    const vs = this.values;
    if (vs.length < 2) return 'flat';
    const first = vs[0];
    const last = vs[vs.length - 1];
    if (last > first) return 'up';
    if (last < first) return 'down';
    return 'flat';
  }

  private _scale(v: number, min: number, max: number): number {
    const range = max - min || 1;
    const innerH = VB_H - PAD_Y * 2;
    return PAD_Y + (1 - (v - min) / range) * innerH;
  }

  private _points(
    vs: number[],
    min: number,
    max: number,
  ): { x: number; y: number }[] {
    if (vs.length === 0) return [];
    if (vs.length === 1) return [{ x: VB_W / 2, y: VB_H / 2 }];
    return vs.map((v, i) => ({
      x: (i / (vs.length - 1)) * VB_W,
      y: this._scale(v, min, max),
    }));
  }

  private _linePath(pts: { x: number; y: number }[]): string {
    if (pts.length === 0) return '';
    if (pts.length === 1) {
      const p = pts[0];
      return `M ${p.x.toFixed(2)} ${p.y.toFixed(2)} L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
    }
    if (!this.smooth) {
      return pts
        .map(
          (p, i) =>
            `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`,
        )
        .join(' ');
    }
    // Catmull-rom to cubic bezier — one control point set per segment.
    let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = i === 0 ? pts[0] : pts[i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = i + 2 < pts.length ? pts[i + 2] : pts[i + 1];
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
    }
    return d;
  }

  private _areaPath(
    linePath: string,
    pts: { x: number; y: number }[],
  ): string {
    if (pts.length < 2) return '';
    const last = pts[pts.length - 1];
    const first = pts[0];
    return `${linePath} L ${last.x.toFixed(2)} ${VB_H} L ${first.x.toFixed(2)} ${VB_H} Z`;
  }

  protected override render() {
    // Provide host sizing defaults so the component is visible out of the box
    // even with zero theme loaded. Consumers override via CSS or inline style.
    if (!this.style.display) this.style.display = 'inline-block';
    if (!this.style.width) this.style.width = '100px';
    if (!this.style.height) this.style.height = '30px';

    const vs = this.values;

    if (vs.length === 0) {
      return html`
        <svg
          part="svg"
          viewBox="0 0 ${VB_W} ${VB_H}"
          preserveAspectRatio="none"
          width="100%"
          height="100%"
          role="img"
          aria-label="Empty sparkline"
        ></svg>
      `;
    }

    const dir = this.direction;
    const dirClass = `--${dir}`;

    const min = Math.min(...vs);
    const max = Math.max(...vs);
    const pts = this._points(vs, min, max);
    const linePath = this._linePath(pts);
    const areaPath = this.area ? this._areaPath(linePath, pts) : '';

    const strokeVar =
      dir === 'down'
        ? 'var(--wick-mc-down-color, #f6465d)'
        : dir === 'up'
          ? 'var(--wick-mc-up-color, #0ecb81)'
          : 'var(--wick-mc-flat-color, currentColor)';
    const fillVar =
      dir === 'down'
        ? 'var(--wick-mc-down-fill, rgba(246,70,93,0.12))'
        : dir === 'up'
          ? 'var(--wick-mc-up-fill, rgba(14,203,129,0.12))'
          : 'var(--wick-mc-flat-fill, rgba(255,255,255,0.06))';

    const showBaseline =
      this.baseline !== undefined &&
      (this.baseline as number) >= min &&
      (this.baseline as number) <= max;
    const baselineY = showBaseline
      ? this._scale(this.baseline as number, min, max)
      : 0;

    const minIdx = vs.indexOf(min);
    const maxIdx = vs.indexOf(max);
    const lastPt = pts[pts.length - 1];

    return html`
      <svg
        part="svg"
        viewBox="0 0 ${VB_W} ${VB_H}"
        preserveAspectRatio="none"
        width="100%"
        height="100%"
        role="img"
        aria-label="Sparkline of ${vs.length} points, trending ${dir}"
      >
        ${showBaseline
          ? svg`
              <line
                part="baseline"
                x1="0"
                x2="${VB_W}"
                y1="${baselineY.toFixed(2)}"
                y2="${baselineY.toFixed(2)}"
                stroke="var(--wick-mc-baseline-color, rgba(255,255,255,0.15))"
                stroke-width="var(--wick-mc-baseline-width, 1)"
                stroke-dasharray="var(--wick-mc-baseline-dash, 2 2)"
                vector-effect="non-scaling-stroke"
              />
            `
          : ''}
        ${this.area
          ? svg`
              <path
                part="area area${dirClass}"
                d="${areaPath}"
                fill="${fillVar}"
                stroke="none"
              />
            `
          : ''}
        <path
          part="line line${dirClass}"
          d="${linePath}"
          fill="none"
          stroke="${strokeVar}"
          stroke-width="var(--wick-mc-line-width, 1.5)"
          stroke-linecap="round"
          stroke-linejoin="round"
          vector-effect="non-scaling-stroke"
        />
        ${this.showExtremes && vs.length > 1
          ? svg`
              <circle
                part="dot dot--max"
                cx="${pts[maxIdx].x.toFixed(2)}"
                cy="${pts[maxIdx].y.toFixed(2)}"
                r="var(--wick-mc-dot-size, 2)"
                fill="var(--wick-mc-up-color, #0ecb81)"
              />
              <circle
                part="dot dot--min"
                cx="${pts[minIdx].x.toFixed(2)}"
                cy="${pts[minIdx].y.toFixed(2)}"
                r="var(--wick-mc-dot-size, 2)"
                fill="var(--wick-mc-down-color, #f6465d)"
              />
            `
          : ''}
        ${this.dot && lastPt
          ? svg`
              <circle
                part="dot dot--last"
                cx="${lastPt.x.toFixed(2)}"
                cy="${lastPt.y.toFixed(2)}"
                r="var(--wick-mc-dot-size, 2)"
                fill="${strokeVar}"
              />
            `
          : ''}
      </svg>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wick-mini-chart': WickMiniChart;
  }
}
