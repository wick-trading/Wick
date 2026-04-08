# Adding a New Wick Component

> **Prerequisite:** read [`GOTCHAS.md`](GOTCHAS.md) first. Seriously.

This is the full checklist for adding a new package `@wick/<name>` to the
monorepo. Every box must be ticked before the PR is mergeable. Missing any
one of these has historically caused a CI failure, a broken publish, or a
silent rendering bug.

## Inside `packages/<name>/`

- [ ] `package.json` with:
  - `"name": "@wick/<name>"`
  - `"lit"` listed in `dependencies`
  - `"build": "vite build"`, `"test": "vitest"` scripts
  - correct `exports` map pointing at `dist/`
- [ ] `tsconfig.json` extending the root config, referencing
      `@wick/core` (and any composed component) via `references`
- [ ] `vite.config.ts` with `@wick/core` (and any composed component) in
      `build.rollupOptions.external`
- [ ] `src/index.ts` re-exporting the element class and any public types
- [ ] `src/wick-<name>.ts` — the Lit component
  - Uses `@customElement('wick-<name>')`
  - **Does NOT override Lit's `update()`** — use `patch`, `applyUpdate`, or
    `applyDelta` instead (see GOTCHAS #1)
  - Uses CSS parts and `--wick-<prefix>-*` custom properties — no hard-coded
    colors
  - Reserves a unique 2–4 letter CSS variable prefix (check
    `packages/CATEGORIES.md` for taken prefixes)
- [ ] `src/wick-<name>.test.ts`
  - **Side-effect imports the component** (see GOTCHAS #2)
  - Covers render, prop updates, event dispatch, and any public methods
- [ ] `SOURCES.md` — even for greenfield components. Document the
      inspiration lineage. Mostly-followed conventions are worse than none.

## Root-level changes

- [ ] `tsconfig.json` — add `{ "path": "./packages/<name>" }` to
      `references`
- [ ] `package.json` — insert ` && npm run build -w @wick/<name>` into the
      root `build` script **at the correct topological position** (after
      all its workspace deps)
- [ ] `packages/CATEGORIES.md` — add the row to the right category,
      honestly labeled `🚧 Built` (not `✅ Shipped`)
- [ ] `packages/theme/src/*.css` — add a section for the component's
      `--wick-<prefix>-*` vars in `dark.css`, `glass.css`, and `minimal.css`
- [ ] `packages/react/` — add a wrapper if the component is user-facing

## Before opening the PR

- [ ] `npm run build` passes locally
- [ ] `npm test` passes locally
- [ ] `node scripts/check-invariants.mjs` passes
- [ ] If you hit any non-obvious problem during development, add it to
      `docs/GOTCHAS.md`

## After merge

This does **not** make your component `✅ Shipped`. It makes it `🚧 Built`.
To reach `✅ Shipped` you also need: npm publish, a dedicated docs page, a
`/live` demo wiring it to the market engine, and meaningful tests. See
`CONTRIBUTING.md` → "The Shipped bar".
