# Development Log — Issues Found & Solutions

This document tracks issues encountered during initial scaffolding and how they were resolved. Useful for contributors and for understanding architectural decisions.

---

## Issue 1: TypeScript Declaration Files (.d.ts) Not Emitting

**Problem:** Packages declared `"types": "./dist/index.d.ts"` in package.json, but no `.d.ts` files were being generated. Vite's library mode only outputs bundled JS — it does not emit TypeScript declarations.

**Root cause:** We initially tried adding `tsc --emitDeclarationOnly --declaration --outDir dist` to each package's build script. This failed for two reasons:
1. The `--outDir` flag conflicted with the `outDir` already set in each package's `tsconfig.json`, causing tsc to emit nothing silently.
2. Running tsc per-package didn't resolve cross-package references (`@vela-trading/core` types weren't available when building `@vela-trading/order-book`).

**Solution:** Use `tsc --build` at the root level, which respects project references and builds packages in dependency order. The root build script runs vite for each package first (for optimized JS bundles), then `tsc --build` last (for declarations). This works because vite doesn't clean the `dist/` directory when files already exist, and tsc adds `.d.ts` + `.d.ts.map` files alongside the vite-generated `.js` files.

**Files changed:**
- `package.json` — root build script: `"build": "npm run build -w @vela-trading/core && ... && tsc --build"`
- `tsconfig.json` — added `"files": []` so root tsconfig only coordinates references, doesn't compile anything itself
- All package `tsconfig.json` files — added `"declaration": true, "declarationMap": true`

---

## Issue 2: Stale tsbuildinfo Cache Causing Silent Build Failures

**Problem:** After changing tsconfig settings, `tsc --build` would produce no output and no errors. The `.tsbuildinfo` incremental cache files were stale and tsc believed everything was up-to-date.

**Root cause:** TypeScript's `composite: true` creates `.tsbuildinfo` files for incremental builds. When tsconfig settings change, these cache files can become stale, and tsc skips emission because it thinks nothing changed.

**Solution:** Clean build with `rm -rf packages/*/dist packages/*/*.tsbuildinfo` before rebuilding. Added `*.tsbuildinfo` to `.gitignore` so these never get committed. For CI, every build starts clean.

**Files changed:**
- `.gitignore` — already had `*.tsbuildinfo`

---

## Issue 3: Workspace Resolution — `npm run build -w packages/core` Not Found

**Problem:** The original build script used directory paths (`-w packages/core`), but npm couldn't find the workspace.

**Root cause:** npm workspaces are resolved by package name, not directory path. The `-w` flag expects the `name` field from `package.json`, not the filesystem path.

**Solution:** Changed all workspace references from directory paths to package names:
```diff
- npm run build -w packages/core
+ npm run build -w @vela-trading/core
```

**Files changed:**
- `package.json` — updated all `-w` references in the build script

---

## Issue 4: tsc Picking Up vite.config.ts and Test Files

**Problem:** `tsc --build` compiled `vite.config.ts` files (which use Node.js APIs like `path` and `__dirname`) and test files, producing errors about missing `path` module and unused imports.

**Root cause:** Even though each package's tsconfig has `"include": ["src"]`, the vite config files and test files were being included because they're within the project root. TypeScript's `include` only affects which files are part of the program — `tsc --build` still processes files that are referenced or in scope.

**Solution:**
- Added `"exclude": ["vite.config.ts"]` to each package's `tsconfig.json`
- Added `"exclude": ["vite.config.ts", "src/**/*.test.ts"]` to core's tsconfig (the only package with tests so far)
- Added `"files": []` to root `tsconfig.json` so it doesn't try to compile anything directly

**Files changed:**
- All package `tsconfig.json` files — added exclude patterns
- `tsconfig.json` — added `"files": []`

---

## Issue 5: Unused `_flash` State in Order Book Component

**Problem:** `tsc --emitDeclarationOnly` (strict mode) flagged `TS6133: '_flash' is declared but its value is never read` in the order book component.

**Root cause:** During initial scaffolding, a `@state() private _flash` map was added as a placeholder for future flash-on-update functionality, but it was never wired up to the render method.

**Solution:** Removed the unused `_flash` state field and its `@state()` import. Flash-on-change can be re-added when the feature is actually implemented, rather than leaving dead code.

**Files changed:**
- `packages/order-book/src/vela-order-book.ts` — removed `_flash` state, removed `state` import from decorators

---

## Issue 6: Build Artifact Pollution in Git

**Problem:** `tsc --build` emits `.js`, `.js.map`, `.d.ts`, and `.d.ts.map` files for vite config files and demo source files outside of `dist/` directories. These showed up as untracked files in git.

**Root cause:** `tsc --build` processes all referenced projects and emits output based on each project's `outDir`. For files like `vite.config.ts` that sit at the package root, tsc emits siblings like `vite.config.js`, `vite.config.d.ts`, etc.

**Solution:** Updated `.gitignore` to exclude these build artifacts:
```
vite.config.js
vite.config.d.ts
vite.config.d.ts.map
vite.config.js.map
demo/src/main.js
demo/src/main.js.map
demo/src/main.d.ts
demo/src/main.d.ts.map
```

**Files changed:**
- `.gitignore` — added patterns for tsc artifacts outside dist/

---

## Architectural Decisions

### Why Lit over Stencil?
Lit is thinner (~5KB), closer to the Web Components platform, and doesn't generate framework-like output. Stencil adds a compiler and runtime that we don't need for headless components.

### Why No Shadow DOM?
Each component uses `createRenderRoot() { return this; }` to opt out of Shadow DOM. This is intentional for headless components — consumers need full CSS access without piercing shadow boundaries. CSS parts would work with Shadow DOM, but direct styling is simpler for this use case.

### Why `repeat()` Directive?
At trading tick rates (10-50+ updates/sec), Lit's default `map()` rendering recreates DOM nodes on every render. The `repeat()` directive with stable keys (price for order book, trade id for feed) enables DOM recycling — only changed nodes are updated, dramatically reducing GC pressure and layout thrashing.

### Why Vite + tsc (Not Just tsc)?
Vite produces tree-shakeable ESM bundles with dead code elimination. Raw tsc output includes every module as a separate file and doesn't tree-shake. We use both: vite for the optimized runtime JS, tsc for type declarations only.
