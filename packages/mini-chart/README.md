# @wick/mini-chart

> `🚧 Built` — exists in the monorepo with tests, not yet published to npm.
> See [`MILESTONES.md`](../../MILESTONES.md) for the shipping roadmap.

Tiny SVG sparkline with auto up/down colouring. Optional area fill, dots,
smoothing, extremes markers, and a baseline. Designed to be embedded
inside other Wick components (watchlists, funding-rate history, equity
curves).

## Origin

**Greenfield.** Ideas studied from several sparkline libraries:

- react-sparklines
- peity
- Various canvas-based sparkline variants

No code was ported. The implementation is a from-scratch SVG generator
written to fit Wick's theming model and headless event contract. See
[`SOURCES.md`](./SOURCES.md) for the detailed lineage.

## Status

- [x] Line / area / dots / smooth / extremes / baseline modes
- [x] Auto up/down colour
- [x] Unit tests
- [ ] Published to npm
- [ ] Dedicated docs page
