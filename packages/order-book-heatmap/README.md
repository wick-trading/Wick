# @wick/order-book-heatmap

> `🚧 Built` — exists in the monorepo with tests, not yet published to npm.
> See [`MILESTONES.md`](../../MILESTONES.md) for the shipping roadmap.

Headless canvas order-book liquidity heatmap. Resting limit orders render as
colour intensity over time, driven by snapshots from a ring buffer on a
`requestAnimationFrame` loop. Hit-testing fires `wick-heatmap-click` events
with the underlying snapshot and price.

## Attribution

This package ports code and visual design from:

- **[Elenchev/order-book-heatmap](https://github.com/Elenchev/order-book-heatmap)**
  — BSD 2-Clause, Copyright (c) 2021 Elenchev

See [`SOURCES.md`](./SOURCES.md) for a full description of what was ported
and what was rewritten. See [`NOTICE`](./NOTICE) for the required BSD-2
attribution text.

This package is licensed as **`MIT AND BSD-2-Clause`** to reflect the dual
origin. Downstream consumers must preserve the `NOTICE` file.

## Status

- [x] Core rendering loop + ring buffer
- [x] Hit-test events
- [x] Unit tests
- [ ] Published to npm
- [ ] Dedicated docs page
- [ ] Live demo at `/live`
