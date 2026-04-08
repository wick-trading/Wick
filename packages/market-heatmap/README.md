# @wick/market-heatmap

> `🚧 Built` — exists in the monorepo with tests, not yet published to npm.
> See [`MILESTONES.md`](../../MILESTONES.md) for the shipping roadmap.

Headless canvas squarified treemap for market-wide performance views.
Supports hot-patching single tiles via `updateTile()` without a full
relayout, making it cheap to re-render on streaming price updates.

## Attribution

Layout ideas and squarified-treemap approach studied from:

- **[react-stock-heatmap](https://github.com/rongmz/react-stock-heatmap)** — MIT

MIT-licensed; no additional `NOTICE` file is required. The squarified
treemap algorithm itself (Bruls et al., 2000) is public. See
[`SOURCES.md`](./SOURCES.md) for a detailed account of what was taken and
what was rewritten for canvas + custom-element delivery.

## Status

- [x] Squarified treemap layout
- [x] `updateTile()` hot-patch
- [x] Unit tests
- [ ] Published to npm
- [ ] Dedicated docs page
