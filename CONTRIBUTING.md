# Contributing to Wick

Wick is in early, pre-1.0 development. Contributions are welcome, but the
bar is high: **the goal is to ship a small number of production-grade
components, not to expand the package count.** Please read this page end
to end before opening a PR.

## Before you start

1. Read [`packages/CATEGORIES.md`](packages/CATEGORIES.md) — it is the
   operational map of every component and its current status.
2. Read [`packages/THEMING.md`](packages/THEMING.md) — the two-layer
   theming model is non-optional.
3. Read [`docs/GOTCHAS.md`](docs/GOTCHAS.md) — **required.** Every item in
   that file represents a real trap. You will hit at least one of them if
   you skip this step.
4. Read [`docs/NEW-COMPONENT.md`](docs/NEW-COMPONENT.md) if you are adding
   a new package.

## Development setup

```bash
git clone https://github.com/wick-trading/Wick.git
cd Wick
npm install
npm run build     # Build all packages
npm test          # Run the full test suite
npm run dev       # Start the demo app
```

Node ≥ 18 is required. Node 22 is used in CI for the typecheck job.

## The Shipped bar

A package is only `✅ Shipped` when it meets **all four** criteria:

1. Published to npm under `@wick/*` at a real semver (≥ `0.1.0`)
2. Documented with a dedicated page on the site
3. Demoed live at `/live` driven by the market engine
4. Tested with meaningful unit tests

Anything less is `🚧 Built`. Do not relabel your PR's output `✅` unless
all four are true.

## PR checklist

- [ ] Code builds cleanly (`npm run build`)
- [ ] Tests pass (`npm test`)
- [ ] `scripts/check-invariants.mjs` passes (runs automatically in CI)
- [ ] If you added a new component: every box in
      [`docs/NEW-COMPONENT.md`](docs/NEW-COMPONENT.md) is ticked
- [ ] If you hit and solved a non-obvious problem: add it to
      [`docs/GOTCHAS.md`](docs/GOTCHAS.md) in the same PR
- [ ] No new phantom structure — if you add teams to `CODEOWNERS`, they
      must reference real people

## Commit messages

Conventional-ish. Lowercase, imperative mood, scoped:

```
feat(order-book): add heatmap cell hit-testing
fix(pnl): guard against NaN in equity curve normalization
chore: honesty pass — redefine shipped bar
```

## The golden rule

**No component #32 until at least one component has met the Shipped bar
end-to-end and been used by a real external user.** Horizontal expansion
without feedback is the dominant failure mode of UI libraries. Wick is
deliberately choosing not to fall into it.

If you have an idea for component #32, open a discussion instead of a PR
and help us get component #1 over the line first.
