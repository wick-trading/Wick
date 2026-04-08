# @wick/funding-rate

> `🚧 Built` — exists in the monorepo with tests, not yet published to npm.
> See [`MILESTONES.md`](../../MILESTONES.md) for the shipping roadmap.

Perpetual-futures funding-rate display with a self-ticking countdown to
the next funding event. Composes `<wick-mini-chart>` internally to render
an optional history sparkline.

## Origin

**Greenfield.** No existing OSS component did this end-to-end as a
headless Web Component. Exchange UX patterns were studied from Binance,
Bybit, and OKX perp pages, but no code was ported. See
[`SOURCES.md`](./SOURCES.md) for a detailed account of what was studied
vs. what was written from scratch.

## Status

- [x] Self-ticking countdown
- [x] Optional history sparkline via `<wick-mini-chart>`
- [x] Unit tests (with `vi.useFakeTimers()`)
- [ ] Published to npm
- [ ] Dedicated docs page
