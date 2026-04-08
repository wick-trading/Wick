import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { squarify, type SquarifyRect } from './squarify.js';

export type { HeatmapTile } from './types.js';
import type { HeatmapTile } from './types.js';

/** Linearly interpolate between two [r,g,b] colors by t ∈ [0,1]. */
function lerpColor(a: [number, number, number], b: [number, number, number], t: number): string {
  const r = Math.round(a[0] + (b[0] - a[0]) * t);
  const g = Math.round(a[1] + (b[1] - a[1]) * t);
  const bl = Math.round(a[2] + (b[2] - a[2]) * t);
  return `rgb(${r},${g},${bl})`;
}

function parseRGB(color: string): [number, number, number] {
  const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (m) return [+m[1], +m[2], +m[3]];
  const hex = color.replace('#', '');
  const n = parseInt(hex.length === 3 ? hex.split('').map(c => c + c).join('') : hex, 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

/**
 * `<wick-market-heatmap>` — Canvas-rendered squarified treemap heatmap.
 *
 * Tile size = `value` (market cap / volume / any scalar).
 * Tile color = `change` percentage mapped from negative → neutral → positive.
 *
 * @fires wick-heatmap-tile-click  - `{ id, label, value, change }`
 * @fires wick-heatmap-tile-hover  - `{ id, label, value, change }`
 *
 * @cssprop --wick-mh-positive-color - Max positive color (default: #00ffa3)
 * @cssprop --wick-mh-negative-color - Max negative color (default: #ff3860)
 * @cssprop --wick-mh-neutral-color  - Zero change color  (default: #1a1a2e)
 * @cssprop --wick-mh-text-color     - Label text color   (default: rgba(255,255,255,0.9))
 * @cssprop --wick-mh-border-color   - Tile border color  (default: rgba(0,0,0,0.3))
 */
@customElement('wick-market-heatmap')
export class WickMarketHeatmap extends LitElement {
  @property({ type: Array }) data: HeatmapTile[] = [];
  /** Max % change that saturates the color scale (default 10). */
  @property({ type: Number, attribute: 'change-max' }) changeMax = 10;
  /** Min tile width/height in px to show label (default 40). */
  @property({ type: Number, attribute: 'label-threshold' }) labelThreshold = 40;

  createRenderRoot() { return this; }

  private _canvas: HTMLCanvasElement | null = null;
  private _ctx: CanvasRenderingContext2D | null = null;
  private _layout: SquarifyRect[] = [];
  private _dirty = false;
  private _rafId = 0;
  private _resizeObserver: ResizeObserver | null = null;

  override connectedCallback() {
    super.connectedCallback();
    this._canvas = document.createElement('canvas');
    this._canvas.style.cssText = 'display:block;width:100%;height:100%;cursor:pointer;';
    this.appendChild(this._canvas);
    this._ctx = this._canvas.getContext('2d');
    this._resizeObserver = new ResizeObserver(() => this._onResize());
    this._resizeObserver.observe(this);
    this._onResize();
    this._canvas.addEventListener('click', this._onClick);
    this._canvas.addEventListener('mousemove', this._onMouseMove);
    this._startLoop();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this._resizeObserver?.disconnect();
    cancelAnimationFrame(this._rafId);
    this._canvas?.removeEventListener('click', this._onClick);
    this._canvas?.removeEventListener('mousemove', this._onMouseMove);
  }

  override updated() {
    this._relayout();
  }

  /** Update a single tile's mutable fields without a full relayout. */
  updateTile(id: string, patch: Partial<Pick<HeatmapTile, 'change' | 'value' | 'sublabel'>>): void {
    const idx = this.data.findIndex(t => t.id === id);
    if (idx === -1) return;
    this.data = this.data.map((t, i) => i === idx ? { ...t, ...patch } : t);
    if ('value' in patch) {
      this._relayout();
    } else {
      this._dirty = true;
    }
  }

  private _onResize() {
    if (!this._canvas) return;
    const { width, height } = this.getBoundingClientRect();
    this._canvas.width = Math.max(1, Math.round(width));
    this._canvas.height = Math.max(1, Math.round(height));
    this._relayout();
  }

  private _relayout() {
    if (!this._canvas) return;
    this._layout = squarify(
      this.data.map(t => ({ id: t.id, value: Math.max(0, t.value) })),
      this._canvas.width,
      this._canvas.height,
    );
    this._dirty = true;
  }

  private _startLoop() {
    const loop = () => {
      if (this._dirty) { this._draw(); this._dirty = false; }
      this._rafId = requestAnimationFrame(loop);
    };
    this._rafId = requestAnimationFrame(loop);
  }

  private _tileColor(change: number): string {
    const style = getComputedStyle(this);
    const pos = style.getPropertyValue('--wick-mh-positive-color').trim() || '#00ffa3';
    const neg = style.getPropertyValue('--wick-mh-negative-color').trim() || '#ff3860';
    const neu = style.getPropertyValue('--wick-mh-neutral-color').trim() || '#1a1a2e';
    const t = Math.max(-1, Math.min(1, change / this.changeMax));
    if (t >= 0) return lerpColor(parseRGB(neu), parseRGB(pos), t);
    return lerpColor(parseRGB(neu), parseRGB(neg), -t);
  }

  private _draw() {
    const canvas = this._canvas;
    const ctx = this._ctx;
    if (!canvas || !ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const style = getComputedStyle(this);
    const textColor = style.getPropertyValue('--wick-mh-text-color').trim() || 'rgba(255,255,255,0.9)';
    const borderColor = style.getPropertyValue('--wick-mh-border-color').trim() || 'rgba(0,0,0,0.3)';

    const tileMap = new Map(this.data.map(t => [t.id, t]));

    for (const rect of this._layout) {
      const tile = tileMap.get(rect.id);
      if (!tile) continue;

      const gap = 1;
      const x = rect.x + gap;
      const y = rect.y + gap;
      const w = rect.w - gap * 2;
      const h = rect.h - gap * 2;
      if (w <= 0 || h <= 0) continue;

      ctx.fillStyle = this._tileColor(tile.change);
      ctx.fillRect(x, y, w, h);

      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 0.5;
      ctx.strokeRect(x, y, w, h);

      // Labels — only if tile is large enough
      if (w >= this.labelThreshold && h >= this.labelThreshold) {
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const fontSize = Math.min(16, Math.floor(Math.min(w, h) * 0.22));
        ctx.font = `600 ${fontSize}px system-ui, sans-serif`;
        ctx.fillText(tile.label, x + w / 2, y + h / 2 - fontSize * 0.6);

        const changeStr = (tile.change >= 0 ? '+' : '') + tile.change.toFixed(2) + '%';
        ctx.font = `${Math.max(10, fontSize - 2)}px system-ui, sans-serif`;
        ctx.fillText(changeStr, x + w / 2, y + h / 2 + fontSize * 0.6);

        if (tile.sublabel && h >= this.labelThreshold * 1.5) {
          ctx.font = `${Math.max(9, fontSize - 4)}px system-ui, sans-serif`;
          ctx.fillStyle = textColor.replace('0.9', '0.5');
          ctx.fillText(tile.sublabel, x + w / 2, y + h / 2 + fontSize * 1.8);
        }
      }
    }
  }

  private _hitTest(e: MouseEvent): HeatmapTile | null {
    const canvas = this._canvas;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    const tileMap = new Map(this.data.map(t => [t.id, t]));
    for (const r of this._layout) {
      if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) {
        return tileMap.get(r.id) ?? null;
      }
    }
    return null;
  }

  private _onClick = (e: MouseEvent) => {
    const tile = this._hitTest(e);
    if (tile) {
      this.dispatchEvent(new CustomEvent('wick-heatmap-tile-click', {
        detail: { id: tile.id, label: tile.label, value: tile.value, change: tile.change },
        bubbles: true, composed: true,
      }));
    }
  };

  private _onMouseMove = (e: MouseEvent) => {
    const tile = this._hitTest(e);
    if (tile) {
      this.dispatchEvent(new CustomEvent('wick-heatmap-tile-hover', {
        detail: { id: tile.id, label: tile.label, value: tile.value, change: tile.change },
        bubbles: true, composed: true,
      }));
    }
  };
}

declare global {
  interface HTMLElementTagNameMap { 'wick-market-heatmap': WickMarketHeatmap; }
}
