# Wick — Gotchas

Non-obvious invariants of the Wick codebase. Every item here represents a
real trap that was hit at least once during development. **Read before
adding a new component or debugging a weird failure.**

Every time you discover a new one, add it here the same day. If it lives
only in your head (or in an agent's auto-memory), the system cannot survive
you leaving.

---

## Lit / Component invariants

### 1. Never override Lit's `update()`

Lit's `LitElement.update(changedProperties)` is part of its reactive update
cycle. Shadowing it with a custom method of the same name silently breaks
rendering in subtle ways (often: props change, nothing re-renders, tests
pass locally because the snapshot happened to be right).

**Rule:** no class that extends `LitElement` may define a method named
`update`. If you need a method to patch partial state, use one of these
names instead:

- `patch(partial)` — for merging partial data into an existing snapshot
  (see `@wick/pnl`'s `WickPnlSummary.patch`)
- `applyUpdate(update)` — for applying an incoming update event
  (see `@wick/alerts`'s `WickAlerts.applyUpdate`)
- `applyDelta(delta)` — for streaming delta updates
  (see `@wick/order-book`'s `WickOrderBook.applyDelta`)

This invariant is enforced in CI by `scripts/check-invariants.mjs`. It will
fail the build if any `packages/*/src/**/*.ts` file that extends
`LitElement` defines an `update(` method.

### 2. Vitest + Lit decorators: side-effect imports required

Lit's `@customElement('wick-foo')` decorator only runs when the module is
actually executed. If your test imports only the **type** (`import type
{ WickFoo } from './wick-foo.js'`), TypeScript compiles the import away and
the custom element is never registered — the DOM creates an `HTMLElement`,
not your component, and every test fails mysteriously.

**Rule:** tests must include a side-effect import of the component module:

```ts
import './wick-foo.js';
import type { WickFoo } from './wick-foo.js';
```

The first line registers the element. The second gives you the type for
casts. Omitting the first is the #1 cause of "element is undefined in
tests" failures.

### 3. `happy-dom` `[part~="cell"]` is substring-ish

`happy-dom`'s CSS attribute-selector implementation is more permissive than
the browser. `[part~="cell"]` matches `<td part="header-cell">` in
happy-dom (real browsers correctly reject it — `~=` requires a
whitespace-separated exact-token match).

**Rule:** in tests, use the most specific `part` variant you can, e.g.
`[part~="cell--diagonal"]` instead of `[part~="cell"]`. Otherwise your
selector silently matches header cells you did not intend.

### 4. Row clicks in happy-dom need `dispatchEvent`, not `.click()`

`HTMLElement.click()` does not reliably propagate through shadow roots in
happy-dom when the listener is bound higher up. For table-row click tests,
use:

```ts
row.dispatchEvent(new Event('click', { bubbles: true }));
```

instead of `row.click()`.

### 5. Self-ticking components: clean up in `disconnectedCallback`

Components that own a `setInterval` (e.g. `@wick/funding-rate`'s countdown,
`@wick/market-clock`) must start the interval in `connectedCallback` and
clear it in `disconnectedCallback`. Otherwise tests leak timers and the
component double-ticks on reconnection.

To test them, use Vitest's fake timers:

```ts
vi.useFakeTimers();
const el = document.createElement('wick-foo');
document.body.append(el);
vi.advanceTimersByTime(1000);
expect(/* tick event fired */).toBeTruthy();
vi.useRealTimers();
```

---

## Build system invariants

### 6. `tsc --build` emits only `.d.ts`

The root `tsconfig.json` has `"emitDeclarationOnly": true`. The full build
pipeline is:

1. Per-package `vite build` — emits the `.js`
2. Root `tsc --build` — emits the `.d.ts` on top

Neither tool alone is sufficient. CI asserts declaration file presence
(see `.github/workflows/ci.yml` → "Verify .d.ts generation").

### 7. Missing `.d.ts` files? Delete `tsconfig.tsbuildinfo` first

If `tsc --build` reports that everything is up to date but `dist/*.d.ts`
files are missing (e.g. after a clean install, a rebase, or a cache error):

```bash
find . -name 'tsconfig.tsbuildinfo' -not -path '*/node_modules/*' -delete
npx tsc --build
```

`tsbuildinfo` files cache declaration state independently of whether the
output actually exists on disk.

### 8. The root `build` script is topological and hand-maintained

`package.json` → `"build"` is a single chained command that builds every
package in dependency order. When adding a new package, insert its build
step at the correct position: **after** all its workspace dependencies.
Breaking the order causes cryptic "cannot find module" errors during build.

This is a known ticking clock. Phase 4 of the recovery plan replaces it
with a topological resolver.

### 9. Cross-package composition pattern

When component A renders component B internally (canonical example:
`@wick/funding-rate` → `@wick/mini-chart`):

1. Package A imports `'@wick/B'` for **side-effect** registration at the
   top of its source file
2. Package A adds B as a dependency in `package.json`
3. Package A adds B to `external` in `vite.config.ts` so the build does not
   bundle B's source
4. Package A adds a project reference to B in its `tsconfig.json`

---

## Framework wrapper invariants

### 10. React wrapper: `onSelect` name collision

React's `HTMLAttributes<T>` defines `onSelect` as a built-in DOM event
handler. When wrapping a Wick component that fires a `wick-*-select`
event, the prop name `onSelect` collides and TypeScript rejects the JSX.

**Rule:** in `@wick/react`, rename the prop to something component-specific.
For `wick-drawing-overlay`, the prop is `onDrawingSelect`. Apply the same
pattern to any future component that dispatches a "select" event.

---

## Theming invariants

### 11. Two-layer theming — do not add globals in component CSS

See `packages/THEMING.md` for the full model. Quick summary:

- **Layer 1** (global): tokens on `:root` live in
  `@wick/theme/{dark,glass,minimal}.css` (`--wick-green`, `--wick-bg`, …).
  **Never** define a new global token inside a component.
- **Layer 2** (per-component): variables prefixed `--wick-<2-4-letter>-*`
  defined in the component's own shadow-root CSS, defaulting to the Layer 1
  tokens.

Every component reserves a prefix (see `packages/CATEGORIES.md` and
`THEMING.md`). Do not reuse an existing prefix.

---

## Monorepo / publishing

### 12. Workspace dep versions

The CI install step currently normalizes `@wick/*` workspace deps to `"*"`
(see commit `2654844`). This is a workaround. Before publishing any package
to npm for real, all workspace deps need to be pinned to real semver
versions or the publish will break for consumers.

This is paid off in Phase 2 of the recovery plan (ship order-book
end-to-end).
