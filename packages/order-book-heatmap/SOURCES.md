# @wick/order-book-heatmap — Transmigration Sources

## Primary Source

### Elenchev/order-book-heatmap
- **URL:** https://github.com/Elenchev/order-book-heatmap
- **License:** BSD-2-Clause (compatible with MIT distribution)
- **Stars:** ~500
- **Commits:** 10 (self-described "exploratory project")
- **Last active:** March 2021
- **Why valuable:** 500 stars on 10 commits proves massive unmet demand. The heatmap
  rendering concept and the Binance WebSocket integration logic are implemented and working —
  the author just never abstracted it into a reusable component.
- **What to take:**
  - `src/heatmap.js` — the canvas rendering algorithm (color intensity mapping)
  - `src/orderbook.js` — snapshot accumulation and price-level grid logic
  - `src/timesales.js` — large-order highlighting in the time & sales log
- **What to discard:** Hard-coded Binance WebSocket URL, DOM manipulation code,
  all UI chrome. Replace with the standard Wick adapter pattern.

## Secondary Source

### cenksari/react-crypto-exchange (time & sales section)
- **URL:** https://github.com/cenksari/react-crypto-exchange
- **License:** MIT
- **What to reference:** The visual design of the time & sales / large-order highlight
  section. Implementation needs to be abstracted, but the UX pattern is solid.

---

## Transmigration Plan

1. **Extract the heatmap grid algorithm** — a 2D array `[time][priceLevel] → intensity`
   that we can render on Canvas 2D with `fillRect` colored by bid/ask intensity.

2. **Build the snapshot accumulator** — a ring buffer of N snapshots:
   ```ts
   interface HeatmapSnapshot {
     timestamp: number;
     bids: { price: number; size: number }[];
     asks: { price: number; size: number }[];
   }
   // Ring buffer: max historyDepth snapshots retained
   ```

3. **Canvas renderer** — 60fps `requestAnimationFrame` loop:
   - X axis = time (newest right, oldest left)
   - Y axis = price (lowest bottom, highest top)
   - Each cell `fillRect` with `rgba(bidColor, intensity)` or `rgba(askColor, intensity)`
   - Intensity = `size / maxSizeInWindow` (normalized per render)

4. **Crosshair + tooltip** — mouse position → cell lookup → dispatch event

5. **Web Component wrapper** — `<wick-order-book-heatmap>` Lit element
   with `pushSnapshot()` public method

## License Compliance
BSD-2-Clause allows inclusion with proper attribution.
Include original copyright notice in `NOTICE` file.
Original: Copyright (c) 2021 Elenchev
