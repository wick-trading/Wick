# @wick/market-heatmap — Transmigration Sources

## Primary Sources

### rongmz/react-stock-heatmap
- **URL:** https://github.com/rongmz/react-stock-heatmap
- **npm:** https://www.npmjs.com/package/@rongmz/react-stock-heatmap
- **License:** MIT
- **Stars:** 13
- **Last active:** September 2020 (5+ years stale)
- **Why valuable:** Only npm-published market heatmap component in existence.
  The API surface (`setData()` / `appendData()`) is clean and worth preserving.
- **What to take:**
  - The squarified treemap layout algorithm (Bruls et al. 2000)
  - The `setData()` / `appendData()` update API pattern
  - Color scale interpolation logic (green → neutral → red)
- **What to discard:** React rendering, synchronous DOM updates (causes jank),
  the hardcoded data source.

### Hzsen/StockHeatMap
- **URL:** https://github.com/Hzsen/StockHeatMap
- **License:** MIT (assumed — no explicit license file but standard GitHub MIT default)
- **Why valuable:** Has working zoom/pan interaction on the treemap — the only open
  source implementation of zoomable market heatmap found.
- **What to take:**
  - Zoom/pan interaction model (d3-zoom or equivalent)
  - The label visibility threshold logic (hide labels on small tiles)

---

## Transmigration Plan

### Rendering approach: Canvas 2D
DOM-based treemaps lag with 500+ tiles at 1-second price updates.
We render to Canvas 2D with dirty-checking: only re-draw tiles that changed.

```ts
// Data flow:
// 1. squarify(tiles, containerRect) → LayoutRect[]
// 2. On update: diffTiles(prev, next) → changedIds[]
// 3. Only repaint changed cells (dirty rect invalidation)
// 4. Mouse hit-test via geometry lookup (no DOM events on canvas)
```

### Squarified treemap algorithm
Reference: "Squarified Treemaps" — Bruls, Huizing, van Wijk (2000)
Implementation: port from react-stock-heatmap's layout.js — it's already
a pure function `squarify(data, rect) → LayoutRect[]`.

### Color scale
```ts
// change % → color
// -10% and below → full red (--wick-mh-negative-color)
//  0%           → neutral (--wick-mh-neutral-color)
// +10% and above → full green (--wick-mh-positive-color)
// Linear interpolation between these anchors
```

### Web Component wrapper
`<wick-market-heatmap>` Lit element with:
- `data` property (setter triggers layout + full redraw)
- `updateTile(id, patch)` method (triggers dirty repaint of single cell)
- ResizeObserver → re-layout on container resize

## License Compliance
All sources MIT licensed. Attribution in package README.
