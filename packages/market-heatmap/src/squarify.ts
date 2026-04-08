/**
 * Squarified Treemap algorithm — Bruls, Huizing, van Wijk (2000).
 * Pure function: no DOM, no side effects.
 */

export interface SquarifyInput {
  id: string;
  value: number;
}

export interface SquarifyRect {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Rect { x: number; y: number; w: number; h: number; }
interface Item { id: string; area: number; }

/**
 * Worst-case aspect ratio for a row laid along a strip of length `w`.
 * Lower is better. 1.0 = perfectly square tiles.
 */
function worst(row: Item[], w: number): number {
  const s = row.reduce((sum, r) => sum + r.area, 0);
  const maxA = Math.max(...row.map(r => r.area));
  const minA = Math.min(...row.map(r => r.area));
  return Math.max((w * w * maxA) / (s * s), (s * s) / (w * w * minA));
}

function layoutRow(row: Item[], rect: Rect, isHorizontal: boolean): SquarifyRect[] {
  // w = length of the strip direction (long side)
  const w = isHorizontal ? rect.w : rect.h;
  const rowSum = row.reduce((s, r) => s + r.area, 0);
  const thickness = rowSum / w; // strip height (horizontal) or strip width (vertical)

  const out: SquarifyRect[] = [];
  let cursor = isHorizontal ? rect.x : rect.y;
  for (const item of row) {
    const len = item.area / thickness;
    if (isHorizontal) {
      out.push({ id: item.id, x: cursor, y: rect.y, w: len, h: thickness });
      cursor += len;
    } else {
      out.push({ id: item.id, x: rect.x, y: cursor, w: thickness, h: len });
      cursor += len;
    }
  }
  return out;
}

function layoutInto(items: Item[], rect: Rect, out: SquarifyRect[]): void {
  if (items.length === 0) return;
  if (items.length === 1) {
    out.push({ id: items[0].id, ...rect });
    return;
  }

  // Use longer side as strip direction for squarer tiles
  const isHorizontal = rect.w >= rect.h;
  const w = isHorizontal ? rect.w : rect.h; // strip length

  let row: Item[] = [];
  let i = 0;

  for (i = 0; i < items.length; i++) {
    const extended = [...row, items[i]];
    if (row.length === 0 || worst(extended, w) <= worst(row, w)) {
      row = extended;
    } else {
      break;
    }
  }

  // Lay out the current row
  out.push(...layoutRow(row, rect, isHorizontal));

  // Shrink remaining rect
  const rowSum = row.reduce((s, r) => s + r.area, 0);
  const thickness = rowSum / w;
  const remaining: Rect = isHorizontal
    ? { x: rect.x, y: rect.y + thickness, w: rect.w, h: rect.h - thickness }
    : { x: rect.x + thickness, y: rect.y, w: rect.w - thickness, h: rect.h };

  layoutInto(items.slice(i), remaining, out);
}

/**
 * Compute squarified treemap layout.
 *
 * @param items  - Array of {id, value}. Larger value = larger tile.
 * @param width  - Container width in pixels
 * @param height - Container height in pixels
 * @returns Array of {id, x, y, w, h} rectangles filling the container
 */
export function squarify(items: SquarifyInput[], width: number, height: number): SquarifyRect[] {
  if (items.length === 0 || width <= 0 || height <= 0) return [];

  const totalValue = items.reduce((s, t) => s + t.value, 0);
  if (totalValue <= 0) return [];

  const totalArea = width * height;
  const sorted = [...items]
    .sort((a, b) => b.value - a.value)
    .map(t => ({ id: t.id, area: (t.value / totalValue) * totalArea }));

  const out: SquarifyRect[] = [];
  layoutInto(sorted, { x: 0, y: 0, w: width, h: height }, out);
  return out;
}
