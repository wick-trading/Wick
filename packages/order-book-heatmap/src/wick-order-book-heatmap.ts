import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export interface HeatmapSnapshot {
  timestamp: number;
  bids: { price: number; size: number }[];
  asks: { price: number; size: number }[];
}

/** Parse a CSS rgba/hex color into [r, g, b] components (0–255). */
function parseRGB(color: string): [number, number, number] {
  const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (m) return [+m[1], +m[2], +m[3]];
  // hex fallback
  const hex = color.replace('#', '');
  const n = parseInt(hex.length === 3
    ? hex.split('').map(c => c + c).join('')
    : hex, 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

/**
 * `<wick-order-book-heatmap>` — Canvas-rendered order book liquidity heatmap.
 *
 * Feed order book snapshots via `pushSnapshot()`. Each column = one snapshot in
 * time. Each row = one price level. Color intensity = normalized resting order size.
 *
 * @fires wick-heatmap-click  - `{ price, timestamp, side, size }`
 * @fires wick-heatmap-hover  - `{ price, timestamp, side, size }`
 *
 * @cssprop --wick-hm-bid-color   - Bid base color  (default: #00ffa3)
 * @cssprop --wick-hm-ask-color   - Ask base color  (default: #ff3860)
 * @cssprop --wick-hm-bg          - Background      (default: transparent)
 * @cssprop --wick-hm-crosshair   - Crosshair color (default: rgba(255,255,255,0.3))
 */
@customElement('wick-order-book-heatmap')
export class WickOrderBookHeatmap extends LitElement {
  @property({ type: Number, attribute: 'history-depth' }) historyDepth = 200;
  @property({ type: Number, attribute: 'price-levels' }) priceLevels = 100;
  @property({ attribute: 'color-bid' }) colorBid = '#00ffa3';
  @property({ attribute: 'color-ask' }) colorAsk = '#ff3860';

  createRenderRoot() { return this; }

  private _snapshots: HeatmapSnapshot[] = [];
  private _canvas: HTMLCanvasElement | null = null;
  private _ctx: CanvasRenderingContext2D | null = null;
  private _rafId = 0;
  private _dirty = false;
  private _crosshair: { col: number; row: number } | null = null;
  private _resizeObserver: ResizeObserver | null = null;

  override connectedCallback() {
    super.connectedCallback();
    this._canvas = document.createElement('canvas');
    this._canvas.style.cssText = 'display:block;width:100%;height:100%;cursor:crosshair;';
    this.appendChild(this._canvas);
    this._ctx = this._canvas.getContext('2d');
    this._resizeObserver = new ResizeObserver(() => this._resize());
    this._resizeObserver.observe(this);
    this._resize();
    this._canvas.addEventListener('mousemove', this._onMouseMove);
    this._canvas.addEventListener('mouseleave', this._onMouseLeave);
    this._canvas.addEventListener('click', this._onCanvasClick);
    this._startLoop();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this._resizeObserver?.disconnect();
    cancelAnimationFrame(this._rafId);
    this._canvas?.removeEventListener('mousemove', this._onMouseMove);
    this._canvas?.removeEventListener('mouseleave', this._onMouseLeave);
    this._canvas?.removeEventListener('click', this._onCanvasClick);
  }

  /** Push a new order book snapshot into the ring buffer. */
  pushSnapshot(snapshot: HeatmapSnapshot): void {
    this._snapshots.push(snapshot);
    if (this._snapshots.length > this.historyDepth) this._snapshots.shift();
    this._dirty = true;
  }

  private _resize() {
    if (!this._canvas) return;
    const { width, height } = this.getBoundingClientRect();
    this._canvas.width = Math.max(1, Math.round(width));
    this._canvas.height = Math.max(1, Math.round(height));
    this._dirty = true;
  }

  private _startLoop() {
    const loop = () => {
      if (this._dirty) { this._draw(); this._dirty = false; }
      this._rafId = requestAnimationFrame(loop);
    };
    this._rafId = requestAnimationFrame(loop);
  }

  private _draw() {
    const canvas = this._canvas;
    const ctx = this._ctx;
    if (!canvas || !ctx || this._snapshots.length === 0) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const snaps = this._snapshots;
    const numCols = snaps.length;

    // Build price range across all snapshots
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    for (const s of snaps) {
      for (const b of s.bids) { if (b.price < minPrice) minPrice = b.price; if (b.price > maxPrice) maxPrice = b.price; }
      for (const a of s.asks) { if (a.price < minPrice) minPrice = a.price; if (a.price > maxPrice) maxPrice = a.price; }
    }
    if (minPrice === Infinity || maxPrice === minPrice) return;

    // Build max size for normalization
    let maxSize = 0;
    for (const s of snaps) {
      for (const b of s.bids) if (b.size > maxSize) maxSize = b.size;
      for (const a of s.asks) if (a.size > maxSize) maxSize = a.size;
    }
    if (maxSize === 0) return;

    const cellW = W / numCols;
    const cellH = H / this.priceLevels;
    const priceRange = maxPrice - minPrice;
    const [br, bg, bb] = parseRGB(this.colorBid);
    const [ar, ag, ab] = parseRGB(this.colorAsk);

    for (let col = 0; col < numCols; col++) {
      const snap = snaps[col];
      const x = col * cellW;

      // Build price → size maps for this snapshot
      const bidMap = new Map<number, number>();
      const askMap = new Map<number, number>();
      for (const b of snap.bids) bidMap.set(b.price, b.size);
      for (const a of snap.asks) askMap.set(a.price, a.size);

      for (let row = 0; row < this.priceLevels; row++) {
        const price = maxPrice - (row / this.priceLevels) * priceRange;
        const y = row * cellH;

        // Find closest price level in maps
        const bucketSize = priceRange / this.priceLevels;
        let bidSize = 0;
        let askSize = 0;
        for (const [p, s] of bidMap) if (Math.abs(p - price) < bucketSize) bidSize += s;
        for (const [p, s] of askMap) if (Math.abs(p - price) < bucketSize) askSize += s;

        if (bidSize > 0) {
          const alpha = Math.min(1, bidSize / maxSize);
          ctx.fillStyle = `rgba(${br},${bg},${bb},${alpha})`;
          ctx.fillRect(x, y, Math.ceil(cellW), Math.ceil(cellH));
        } else if (askSize > 0) {
          const alpha = Math.min(1, askSize / maxSize);
          ctx.fillStyle = `rgba(${ar},${ag},${ab},${alpha})`;
          ctx.fillRect(x, y, Math.ceil(cellW), Math.ceil(cellH));
        }
      }
    }

    // Draw crosshair
    if (this._crosshair) {
      const { col, row } = this._crosshair;
      const crossColor = getComputedStyle(this).getPropertyValue('--wick-hm-crosshair').trim()
        || 'rgba(255,255,255,0.3)';
      ctx.strokeStyle = crossColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(col * cellW + cellW / 2, 0);
      ctx.lineTo(col * cellW + cellW / 2, H);
      ctx.moveTo(0, row * cellH + cellH / 2);
      ctx.lineTo(W, row * cellH + cellH / 2);
      ctx.stroke();
    }
  }

  private _hitTest(e: MouseEvent): { col: number; row: number; price: number; timestamp: number; side: 'bid' | 'ask'; size: number } | null {
    const canvas = this._canvas;
    if (!canvas || this._snapshots.length === 0) return null;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const W = canvas.width;
    const H = canvas.height;
    const col = Math.floor((x / rect.width) * this._snapshots.length);
    const row = Math.floor((y / rect.height) * this.priceLevels);
    if (col < 0 || col >= this._snapshots.length || row < 0 || row >= this.priceLevels) return null;

    let minPrice = Infinity;
    let maxPrice = -Infinity;
    for (const s of this._snapshots) {
      for (const b of s.bids) { if (b.price < minPrice) minPrice = b.price; if (b.price > maxPrice) maxPrice = b.price; }
      for (const a of s.asks) { if (a.price < minPrice) minPrice = a.price; if (a.price > maxPrice) maxPrice = a.price; }
    }
    if (minPrice === Infinity) return null;

    const priceRange = maxPrice - minPrice;
    const price = maxPrice - (row / this.priceLevels) * priceRange;
    const snap = this._snapshots[col];
    const bucketSize = priceRange / this.priceLevels;

    let bidSize = 0;
    let askSize = 0;
    for (const b of snap.bids) if (Math.abs(b.price - price) < bucketSize) bidSize += b.size;
    for (const a of snap.asks) if (Math.abs(a.price - price) < bucketSize) askSize += a.size;

    const side: 'bid' | 'ask' = bidSize >= askSize ? 'bid' : 'ask';
    const size = side === 'bid' ? bidSize : askSize;
    void W; void H;
    return { col, row, price, timestamp: snap.timestamp, side, size };
  }

  private _onMouseMove = (e: MouseEvent) => {
    const hit = this._hitTest(e);
    if (hit) {
      this._crosshair = { col: hit.col, row: hit.row };
      this._dirty = true;
      this.dispatchEvent(new CustomEvent('wick-heatmap-hover', {
        detail: { price: hit.price, timestamp: hit.timestamp, side: hit.side, size: hit.size },
        bubbles: true, composed: true,
      }));
    }
  };

  private _onMouseLeave = () => {
    this._crosshair = null;
    this._dirty = true;
  };

  private _onCanvasClick = (e: MouseEvent) => {
    const hit = this._hitTest(e);
    if (hit) {
      this.dispatchEvent(new CustomEvent('wick-heatmap-click', {
        detail: { price: hit.price, timestamp: hit.timestamp, side: hit.side, size: hit.size },
        bubbles: true, composed: true,
      }));
    }
  };
}

declare global {
  interface HTMLElementTagNameMap { 'wick-order-book-heatmap': WickOrderBookHeatmap; }
}
