# @wick/mini-chart — Sources & Inspiration

`@wick/mini-chart` is **greenfield**. No OSS code was ported.

The design was informed by studying the following libraries, extracting
the ideas worth keeping, and deliberately avoiding the failure modes
that killed or limited each one.

This file exists so the lineage is visible. Wick is not built in a
vacuum — we stand on the shoulders of projects that tried first.

---

## Libraries studied

### react-sparklines

- **Repo:** https://github.com/borgar/react-sparklines
- **License:** MIT
- **Stars:** ~1.5k
- **Status:** Effectively unmaintained

**Ideas worth keeping:**

- SVG `viewBox` auto-scaling — a sparkline should fit any container
  without hardcoded dimensions
- Single-line as the canonical rendering; bars and pies belong in
  different components
- Catmull-rom smoothing as an opt-in curve mode
- Referenced min/max markers as a first-class option

**What killed its reach:**

- React-only. Useless in Vue, Svelte, Angular, or raw HTML.
- Props API bound rendering to a React component tree, preventing
  server-rendered or static-HTML usage.
- No TypeScript types in the main package; consumers had to rely on
  DefinitelyTyped which lagged behind.
- Abandoned before the React 18 / Server Components era.

---

### peity

- **Repo:** https://github.com/benpickles/peity
- **License:** MIT
- **Stars:** ~4k (historical — peaked around 2015)
- **Status:** Dead

**Ideas worth keeping:**

- **DOM text can be the data source.** `<wick-mini-chart values="1,2,3,4">`
  reads its own attribute. No JS glue required to render a chart from
  static HTML. This is a powerful idea that almost every modern chart
  library forgot.

**What killed its reach:**

- jQuery plugin. Long dead by the time modern frontends arrived.
- Canvas-based. No DOM parts, no styling via CSS, no accessibility hooks.
- Static render only — no reactivity to data changes.

---

### Canvas-based sparkline variants (sparkline.js, jquery.sparkline,
### Chart.js sparkline mode, assorted ad-hoc forks)

- **Status:** Mostly dead or bundled into larger libraries

Studied for API shapes. None worth naming individually; they all share
the same two failure modes:

- Canvas-based rendering. No CSS parts, no theme integration,
  no accessibility, no selection.
- Bound to one framework or a monolithic charting library, so you
  can't use a sparkline without dragging in 200KB of unrelated code.

---

## What Wick adds that the graveyard didn't

1. **Framework-agnostic Web Component.** Works in React, Vue, Svelte,
   Angular, raw HTML, and server-rendered pages with no hydration step.

2. **CSS parts on every visible element.** Style without touching JS.
   The `part` attribute is on `svg`, `line`, `area`, `dot`, `baseline`
   — consumers can restyle any piece.

3. **Theme integration via `--wick-mc-*` custom properties.** Drops into
   the Wick theme system with zero extra config; same dark / glass /
   minimal themes that apply to every other Wick component.

4. **Direction inferred from first-vs-last comparison.** No prop needed
   to tell the component whether the series is up or down. The colour
   updates automatically as data flows in.

5. **Values accepted from attribute OR property.**
   - `<wick-mini-chart values="1,2,3,4">` for static HTML.
   - `el.values = [1, 2, 3, 4]` for JS-driven updates.
   Both are first-class.

6. **Optional extras that stay out of the way:**
   - Area fill under the line
   - Last-point dot
   - Min/max extreme markers
   - Horizontal baseline reference line (e.g. zero line for P&L curves)
   - Catmull-rom smoothing

---

## What this component deliberately does NOT do

- **Axes, legends, labels.** This is a sparkline, not a chart.
- **Tooltips, crosshair, selection.** Use `<wick-candlestick-chart>`
  for interactive primary charts; `<wick-mini-chart>` is contextual.
- **Multiple chart types (bars, pies, donuts).** One component, one job.
- **Data aggregation or time-bucketing.** Pass in the series you want
  to display; the component doesn't reshape your data.

If you need any of the above, reach for a different Wick component.
If none exists, that's a new package — not a feature flag on this one.
