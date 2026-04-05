import type { OrderBookData } from '@vela-trading/core';

/**
 * Depth chart rendering engine.
 * Pure Canvas 2D — no DOM, no framework, just math and pixels.
 */

export interface DepthChartTheme {
  bidLineColor: string;
  askLineColor: string;
  bidFillColor: string;
  askFillColor: string;
  crosshairColor: string;
  textColor: string;
  gridColor: string;
  lineWidth: number;
  fontSize: number;
  fontFamily: string;
}

export interface DepthChartLayout {
  width: number;
  height: number;
  padding: { top: number; right: number; bottom: number; left: number };
}

export interface CrosshairState {
  x: number;
  y: number;
  visible: boolean;
}

export interface DepthLevel {
  price: number;
  size: number;
  total: number;
}

export const DEFAULT_THEME: DepthChartTheme = {
  bidLineColor: '#4dff88',
  askLineColor: '#ff4d4d',
  bidFillColor: 'rgba(77, 255, 136, 0.12)',
  askFillColor: 'rgba(255, 77, 77, 0.12)',
  crosshairColor: 'rgba(255, 255, 255, 0.3)',
  textColor: 'rgba(255, 255, 255, 0.5)',
  gridColor: 'rgba(255, 255, 255, 0.06)',
  lineWidth: 1.5,
  fontSize: 11,
  fontFamily: 'monospace',
};

/**
 * Process raw order book data into cumulative depth levels.
 */
export function buildDepthLevels(
  data: OrderBookData,
  depth: number,
): { bids: DepthLevel[]; asks: DepthLevel[] } {
  // Bids: sorted descending by price, cumulated top-down
  const rawBids = [...data.bids]
    .sort((a, b) => b.price - a.price)
    .slice(0, depth);
  let bidTotal = 0;
  const bids: DepthLevel[] = rawBids.map((l) => {
    bidTotal += l.size;
    return { price: l.price, size: l.size, total: bidTotal };
  });

  // Asks: sorted ascending by price, cumulated top-down
  const rawAsks = [...data.asks]
    .sort((a, b) => a.price - b.price)
    .slice(0, depth);
  let askTotal = 0;
  const asks: DepthLevel[] = rawAsks.map((l) => {
    askTotal += l.size;
    return { price: l.price, size: l.size, total: askTotal };
  });

  return { bids, asks };
}

/**
 * Compute the visible price range and max total for scaling.
 */
export function computeBounds(
  bids: DepthLevel[],
  asks: DepthLevel[],
): { minPrice: number; maxPrice: number; maxTotal: number; midPrice: number } {
  if (bids.length === 0 && asks.length === 0) {
    return { minPrice: 0, maxPrice: 1, maxTotal: 1, midPrice: 0.5 };
  }

  const bidPrices = bids.map((b) => b.price);
  const askPrices = asks.map((a) => a.price);

  const highestBid = bidPrices.length > 0 ? Math.max(...bidPrices) : 0;
  const lowestAsk = askPrices.length > 0 ? Math.min(...askPrices) : 0;
  const midPrice = (highestBid + lowestAsk) / 2 || highestBid || lowestAsk;

  const minPrice = bidPrices.length > 0 ? Math.min(...bidPrices) : midPrice;
  const maxPrice = askPrices.length > 0 ? Math.max(...askPrices) : midPrice;

  const bidMax = bids.length > 0 ? bids[bids.length - 1].total : 0;
  const askMax = asks.length > 0 ? asks[asks.length - 1].total : 0;
  const maxTotal = Math.max(bidMax, askMax, 1);

  return { minPrice, maxPrice, maxTotal, midPrice };
}

/**
 * Map a price to an x-coordinate on the canvas.
 */
function priceToX(
  price: number,
  minPrice: number,
  maxPrice: number,
  plotLeft: number,
  plotWidth: number,
): number {
  const range = maxPrice - minPrice;
  if (range === 0) return plotLeft + plotWidth / 2;
  return plotLeft + ((price - minPrice) / range) * plotWidth;
}

/**
 * Map a cumulative total to a y-coordinate on the canvas (inverted — 0 is top).
 */
function totalToY(
  total: number,
  maxTotal: number,
  plotTop: number,
  plotHeight: number,
): number {
  return plotTop + plotHeight - (total / maxTotal) * plotHeight;
}

/**
 * Find the closest depth level to a given x position.
 */
export function hitTest(
  x: number,
  bids: DepthLevel[],
  asks: DepthLevel[],
  minPrice: number,
  maxPrice: number,
  plotLeft: number,
  plotWidth: number,
): { side: 'bid' | 'ask'; level: DepthLevel } | null {
  const range = maxPrice - minPrice;
  if (range === 0) return null;

  const price = minPrice + ((x - plotLeft) / plotWidth) * range;

  const highestBid = bids.length > 0 ? bids[0].price : -Infinity;
  const lowestAsk = asks.length > 0 ? asks[0].price : Infinity;
  const mid = (highestBid + lowestAsk) / 2;

  // Determine which side the cursor is on relative to the mid-spread
  if (price <= mid && bids.length > 0) {
    // Bid side — find the closest bid level at or above the cursor price
    for (let i = 0; i < bids.length; i++) {
      if (price >= bids[i].price) {
        return { side: 'bid', level: bids[i] };
      }
    }
    return { side: 'bid', level: bids[bids.length - 1] };
  }

  if (price > mid && asks.length > 0) {
    // Ask side — find the closest ask level at or below the cursor price
    for (let i = 0; i < asks.length; i++) {
      if (price <= asks[i].price) {
        return { side: 'ask', level: asks[i] };
      }
    }
    return { side: 'ask', level: asks[asks.length - 1] };
  }

  // Fallback: return closest side
  if (bids.length > 0) return { side: 'bid', level: bids[0] };
  if (asks.length > 0) return { side: 'ask', level: asks[0] };

  return null;
}

/**
 * Draw a stepped area curve (depth chart style).
 */
function drawSteppedArea(
  ctx: CanvasRenderingContext2D,
  levels: DepthLevel[],
  minPrice: number,
  maxPrice: number,
  maxTotal: number,
  layout: DepthChartLayout,
  lineColor: string,
  fillColor: string,
  lineWidth: number,
  direction: 'bid' | 'ask',
): void {
  if (levels.length === 0) return;

  const { padding } = layout;
  const plotLeft = padding.left;
  const plotTop = padding.top;
  const plotWidth = layout.width - padding.left - padding.right;
  const plotHeight = layout.height - padding.top - padding.bottom;
  const baseY = plotTop + plotHeight;

  ctx.beginPath();

  // Start from the baseline
  const firstX = priceToX(levels[0].price, minPrice, maxPrice, plotLeft, plotWidth);
  ctx.moveTo(firstX, baseY);

  // Draw step curve
  for (let i = 0; i < levels.length; i++) {
    const x = priceToX(levels[i].price, minPrice, maxPrice, plotLeft, plotWidth);
    const y = totalToY(levels[i].total, maxTotal, plotTop, plotHeight);

    if (i === 0) {
      // First point: vertical line from baseline
      ctx.lineTo(x, y);
    } else {
      // Step: horizontal then vertical
      const prevY = totalToY(levels[i - 1].total, maxTotal, plotTop, plotHeight);
      ctx.lineTo(x, prevY);
      ctx.lineTo(x, y);
    }
  }

  // Close the fill area
  const lastY = totalToY(levels[levels.length - 1].total, maxTotal, plotTop, plotHeight);

  // Extend to edge
  if (direction === 'bid') {
    ctx.lineTo(plotLeft, lastY);
    ctx.lineTo(plotLeft, baseY);
  } else {
    ctx.lineTo(plotLeft + plotWidth, lastY);
    ctx.lineTo(plotLeft + plotWidth, baseY);
  }

  ctx.closePath();

  // Fill
  ctx.fillStyle = fillColor;
  ctx.fill();

  // Stroke the line (retrace without the baseline)
  ctx.beginPath();
  ctx.moveTo(firstX, baseY);
  for (let i = 0; i < levels.length; i++) {
    const x = priceToX(levels[i].price, minPrice, maxPrice, plotLeft, plotWidth);
    const y = totalToY(levels[i].total, maxTotal, plotTop, plotHeight);
    if (i === 0) {
      ctx.lineTo(x, y);
    } else {
      const prevY = totalToY(levels[i - 1].total, maxTotal, plotTop, plotHeight);
      ctx.lineTo(x, prevY);
      ctx.lineTo(x, y);
    }
  }

  if (direction === 'bid') {
    ctx.lineTo(plotLeft, lastY);
  } else {
    ctx.lineTo(plotLeft + plotWidth, lastY);
  }

  ctx.strokeStyle = lineColor;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

/**
 * Draw grid lines and axis labels.
 */
function drawGrid(
  ctx: CanvasRenderingContext2D,
  minPrice: number,
  maxPrice: number,
  maxTotal: number,
  layout: DepthChartLayout,
  theme: DepthChartTheme,
): void {
  const { padding } = layout;
  const plotLeft = padding.left;
  const plotTop = padding.top;
  const plotWidth = layout.width - padding.left - padding.right;
  const plotHeight = layout.height - padding.top - padding.bottom;

  ctx.strokeStyle = theme.gridColor;
  ctx.lineWidth = 1;
  ctx.fillStyle = theme.textColor;
  ctx.font = `${theme.fontSize}px ${theme.fontFamily}`;
  ctx.textAlign = 'center';

  // Price axis (bottom) — 5 ticks
  const priceRange = maxPrice - minPrice;
  for (let i = 0; i <= 4; i++) {
    const price = minPrice + (priceRange * i) / 4;
    const x = priceToX(price, minPrice, maxPrice, plotLeft, plotWidth);

    ctx.beginPath();
    ctx.moveTo(x, plotTop);
    ctx.lineTo(x, plotTop + plotHeight);
    ctx.stroke();

    ctx.fillText(
      price.toLocaleString(undefined, { maximumFractionDigits: 2 }),
      x,
      plotTop + plotHeight + theme.fontSize + 4,
    );
  }

  // Total axis (right) — 4 ticks
  ctx.textAlign = 'right';
  for (let i = 0; i <= 3; i++) {
    const total = (maxTotal * i) / 3;
    const y = totalToY(total, maxTotal, plotTop, plotHeight);

    ctx.beginPath();
    ctx.moveTo(plotLeft, y);
    ctx.lineTo(plotLeft + plotWidth, y);
    ctx.stroke();

    if (i > 0) {
      const label = total >= 1000 ? `${(total / 1000).toFixed(1)}K` : total.toFixed(2);
      ctx.fillText(label, layout.width - 4, y + theme.fontSize / 3);
    }
  }
}

/**
 * Draw crosshair and tooltip.
 */
function drawCrosshair(
  ctx: CanvasRenderingContext2D,
  crosshair: CrosshairState,
  hit: { side: 'bid' | 'ask'; level: DepthLevel } | null,
  minPrice: number,
  maxPrice: number,
  maxTotal: number,
  layout: DepthChartLayout,
  theme: DepthChartTheme,
): void {
  if (!crosshair.visible || !hit) return;

  const { padding } = layout;
  const plotLeft = padding.left;
  const plotTop = padding.top;
  const plotWidth = layout.width - padding.left - padding.right;
  const plotHeight = layout.height - padding.top - padding.bottom;

  const x = priceToX(hit.level.price, minPrice, maxPrice, plotLeft, plotWidth);
  const y = totalToY(hit.level.total, maxTotal, plotTop, plotHeight);

  // Crosshair lines
  ctx.strokeStyle = theme.crosshairColor;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);

  ctx.beginPath();
  ctx.moveTo(x, plotTop);
  ctx.lineTo(x, plotTop + plotHeight);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(plotLeft, y);
  ctx.lineTo(plotLeft + plotWidth, y);
  ctx.stroke();

  ctx.setLineDash([]);

  // Dot at intersection
  ctx.beginPath();
  ctx.arc(x, y, 4, 0, Math.PI * 2);
  ctx.fillStyle = hit.side === 'bid' ? theme.bidLineColor : theme.askLineColor;
  ctx.fill();

  // Tooltip
  const priceText = `Price: ${hit.level.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  const totalText = `Total: ${hit.level.total.toFixed(4)}`;
  const sizeText = `Size: ${hit.level.size.toFixed(4)}`;

  ctx.font = `${theme.fontSize}px ${theme.fontFamily}`;
  const textWidth = Math.max(
    ctx.measureText(priceText).width,
    ctx.measureText(totalText).width,
    ctx.measureText(sizeText).width,
  );

  const tooltipW = textWidth + 16;
  const tooltipH = theme.fontSize * 3 + 20;
  let tooltipX = x + 12;
  let tooltipY = y - tooltipH / 2;

  // Keep tooltip in bounds
  if (tooltipX + tooltipW > layout.width - padding.right) {
    tooltipX = x - tooltipW - 12;
  }
  tooltipY = Math.max(plotTop, Math.min(tooltipY, plotTop + plotHeight - tooltipH));

  // Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.beginPath();
  ctx.roundRect(tooltipX, tooltipY, tooltipW, tooltipH, 4);
  ctx.fill();

  // Text
  ctx.fillStyle = theme.textColor;
  ctx.textAlign = 'left';
  const lineH = theme.fontSize + 4;
  ctx.fillText(priceText, tooltipX + 8, tooltipY + lineH);
  ctx.fillText(sizeText, tooltipX + 8, tooltipY + lineH * 2);
  ctx.fillText(totalText, tooltipX + 8, tooltipY + lineH * 3);
}

/**
 * Main render function — draws the full depth chart to a canvas.
 */
export function render(
  ctx: CanvasRenderingContext2D,
  bids: DepthLevel[],
  asks: DepthLevel[],
  layout: DepthChartLayout,
  theme: DepthChartTheme,
  crosshair: CrosshairState,
): void {
  const dpr = window.devicePixelRatio || 1;

  // Clear
  ctx.clearRect(0, 0, layout.width * dpr, layout.height * dpr);

  ctx.save();
  ctx.scale(dpr, dpr);

  const bounds = computeBounds(bids, asks);
  const { minPrice, maxPrice, maxTotal } = bounds;

  const { padding } = layout;
  const plotLeft = padding.left;
  const plotWidth = layout.width - padding.left - padding.right;

  // Grid
  drawGrid(ctx, minPrice, maxPrice, maxTotal, layout, theme);

  // Bid curve (left side — high prices to low)
  drawSteppedArea(
    ctx, bids, minPrice, maxPrice, maxTotal, layout,
    theme.bidLineColor, theme.bidFillColor, theme.lineWidth, 'bid',
  );

  // Ask curve (right side — low prices to high)
  drawSteppedArea(
    ctx, asks, minPrice, maxPrice, maxTotal, layout,
    theme.askLineColor, theme.askFillColor, theme.lineWidth, 'ask',
  );

  // Mid price label
  if (bids.length > 0 && asks.length > 0) {
    const midX = priceToX(bounds.midPrice, minPrice, maxPrice, plotLeft, plotWidth);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 4]);
    ctx.beginPath();
    ctx.moveTo(midX, padding.top);
    ctx.lineTo(midX, layout.height - padding.bottom);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Crosshair
  if (crosshair.visible) {
    const hit = hitTest(crosshair.x, bids, asks, minPrice, maxPrice, plotLeft, plotWidth);
    drawCrosshair(ctx, crosshair, hit, minPrice, maxPrice, maxTotal, layout, theme);
  }

  ctx.restore();
}
