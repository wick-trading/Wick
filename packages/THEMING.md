# Wick — Theming Architecture

**TL;DR — Yes, the UI styles are shared and reused.** Every Wick component
reads from the same set of CSS custom properties. You import one theme file
(`@wick/theme/dark`, `/glass`, or `/minimal`) and **every** Wick component
on the page picks up the look automatically — order book, ticker, chart,
heatmap, watchlist, all of them.

This document explains how it works, the naming convention every new
package must follow, and how a new component plugs into the shared system
without forcing the theme team to rewrite anything.

---

## The two-layer model

Wick theming has exactly two layers. There is no third.

```
┌──────────────────────────────────────────────────────────────┐
│  Layer 1 — Global tokens                                     │
│  Defined once on :root inside @wick/theme/dark.css           │
│                                                              │
│    --wick-bg, --wick-surface, --wick-border                  │
│    --wick-text, --wick-text-2, --wick-text-muted             │
│    --wick-green, --wick-green-bg, --wick-green-depth         │
│    --wick-red,   --wick-red-bg,   --wick-red-depth           │
│    --wick-accent, --wick-radius, --wick-font-mono, …         │
└──────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  Layer 2 — Component-scoped variables                        │
│  Each component defines its own --wick-[prefix]-* variables  │
│  that default to the global tokens.                          │
│                                                              │
│    wick-order-book {                                         │
│      --wick-ob-bid-color: var(--wick-green);                 │
│      --wick-ob-ask-color: var(--wick-red);                   │
│      --wick-ob-row-height: 28px;                             │
│    }                                                         │
└──────────────────────────────────────────────────────────────┘
```

Result: changing `--wick-green` once flips the bullish colour across
**every** component. But anyone who wants only their order book to use
a different green can override `--wick-ob-bid-color` on a single element
without touching anything else.

This is the only mental model contributors need to remember.

---

## Naming convention

Every component variable follows this pattern:

```
--wick-<prefix>-<property>
```

| Component | Prefix | Examples |
|-----------|--------|----------|
| `<wick-order-book>` | `ob` | `--wick-ob-bid-color`, `--wick-ob-row-height` |
| `<wick-price-ticker>` | `ticker` | `--wick-ticker-up-color`, `--wick-ticker-flash-duration` |
| `<wick-trade-feed>` | `tf` | `--wick-tf-buy-color`, `--wick-tf-row-height` |
| `<wick-depth-chart>` | `dc` | `--wick-dc-bid-line`, `--wick-dc-crosshair` |
| `<wick-candlestick-chart>` | `cc` | `--wick-cc-up-color`, `--wick-cc-grid` |

When you ship a new component, **pick a 2–4 letter prefix and stick to it**.
Reserve it in the table above (and in `CATEGORIES.md`) so two squads don't
collide.

### Reserved prefixes (current + planned)

| Prefix | Component |
|--------|-----------|
| `ob` | `<wick-order-book>` |
| `ticker` | `<wick-price-ticker>` |
| `tf` | `<wick-trade-feed>` |
| `dc` | `<wick-depth-chart>` |
| `cc` | `<wick-candlestick-chart>` |
| `ind` | `<wick-indicator-*>` |
| `obh` | `<wick-order-book-heatmap>` |
| `mh` | `<wick-market-heatmap>` |
| `fr` | `<wick-funding-rate>` |
| `oi` | `<wick-open-interest>` |
| `lf` | `<wick-liquidation-feed>` |
| `dom` | `<wick-dom-ladder>` |
| `vp` | `<wick-volume-profile>` |
| `dt` | `<wick-drawing-overlay>` |
| `mc` | `<wick-mini-chart>` |
| `cm` | `<wick-correlation-matrix>` |
| `ot` | `<wick-order-ticket>` |
| `om` | `<wick-order-manager>` |
| `ps` | `<wick-position-sizer>` |
| `pos` | `<wick-positions>` |
| `pnl` | `<wick-pnl-summary>` / `<wick-equity-curve>` |
| `th` | `<wick-trade-history>` |
| `rp` | `<wick-risk-panel>` |
| `wl` | `<wick-watchlist>` |
| `scr` | `<wick-screener>` |
| `ss` | `<wick-symbol-search>` |
| `mkc` | `<wick-market-clock>` |
| `al` | `<wick-alerts>` |
| `nf` | `<wick-news-feed>` |
| `ec` | `<wick-economic-calendar>` |
| `cs` | `<wick-connection-status>` |

If a prefix you want is taken, pick another. Don't double-assign.

---

## How a new component plugs in

When the squad owning a category ships a new component, they make
**two** edits to `@wick/theme`:

### 1. Add a section to each theme file

```css
/* ── Funding Rate ───────────────────────────────────────── */

wick-funding-rate {
  --wick-fr-positive: var(--wick-green);
  --wick-fr-negative: var(--wick-red);
  --wick-fr-countdown-color: var(--wick-text-muted);
  font-family: var(--wick-font-mono);
  color: var(--wick-text);
}

wick-funding-rate [part="container"] {
  background: var(--wick-surface);
  border-radius: var(--wick-radius);
  padding: 12px 16px;
}
```

That's all the theme team needs. Every other style is the component's
internal default and inherits global tokens automatically.

### 2. Repeat the section in `glass.css` and `minimal.css`

Each theme is a sibling file. `dark` is the canonical reference;
the others override **only the visual layer** (background, borders,
typography). Token semantics (bid = green, ask = red) stay identical.

---

## What the component author does

Inside a component's render template, **never** hardcode colours or
spacing. Always reach for a variable, with a sensible literal default
in case the page hasn't imported a theme:

```ts
// inside the component's CSS
.bid {
  color: var(--wick-fr-positive, #0ecb81);
  font-family: var(--wick-fr-font-mono, monospace);
  height: var(--wick-fr-row-height, 28px);
}
```

The literal default after the comma means the component is still
usable on a page with **zero** theme imports. The theme just makes
it pretty.

---

## What is NOT shared

These are intentionally per-component:

- **Layout dimensions** (`row-height`, `font-size`, `radius`) — every
  component sets its own defaults so visual rhythm is consistent
  *within* a component but flexible *across* layouts.
- **Animations and durations** — flash timings, fade-ins, etc., are
  scoped so retuning a feed doesn't break a chart's crosshair.

Everything else (colours, surfaces, borders, fonts) is shared.

---

## Theming a single instance vs the whole app

```css
/* Whole app — load one theme file */
@import '@wick/theme/dark';

/* Single instance — override component variables on the element */
wick-order-book.my-special-book {
  --wick-ob-bid-color: hotpink;
  --wick-ob-row-height: 36px;
}

/* Or even override a global token in a sub-tree */
.dark-but-purple {
  --wick-green: #b07cff;
}
```

Because everything cascades through standard CSS variables, no Wick
APIs are involved in any of this. It's just CSS.

---

## Why this design

Three forces shaped it:

1. **Consistency by default.** A trader who imports `@wick/theme/dark`
   should never see a chart that looks foreign next to the order book.
   Sharing tokens at layer 1 guarantees this without any per-component work.

2. **Override granularity when needed.** Trading desks have opinions.
   A user must be able to retune a single number (one row's height,
   one chart's wick colour) without forking the theme.

3. **Org scaling.** Teams own categories. They must be able to ship a
   new component that *looks like Wick* without ever touching the
   theme team. The convention above lets them do that: define your
   prefix, default it from the global tokens, ship.

---

## Checklist before shipping a new component

- [ ] Prefix reserved in the table above
- [ ] Component defaults all colours to `var(--wick-…)` global tokens
- [ ] Component defines its own `--wick-<prefix>-*` for per-instance overrides
- [ ] All three theme files (`dark.css`, `glass.css`, `minimal.css`) have a
      matching section
- [ ] At least one CSS part on every visible element (so users can override
      without variables if they want to)
- [ ] Demo in `site/` shows the component under all three themes
