# Architecture

## Project Structure

```
Wick/
├── packages/
│   ├── core/                    # @wick/core
│   │   └── src/
│   ��       ├── types.ts         # All shared TypeScript types
│   │       ├── utils.ts         # Formatting, delta application, cumulative totals
│   │       ├── utils.test.ts    # Unit tests
│   │       └── index.ts         # Public API barrel export
│   ├── order-book/              # @wick/order-book
│   │   └── src/
│   │       ├── wick-order-book.ts
│   │       └── index.ts
│   ├── price-ticker/            # @wick/price-ticker
│   │   └── src/
│   │       ├── wick-price-ticker.ts
│   │       └── index.ts
│   └── trade-feed/              # @wick/trade-feed
│       └── src/
│           ├── wick-trade-feed.ts
│           └── index.ts
├── demo/                        # Dev playground with mock data
├── docs/
│   ├── DEVELOPMENT.md           # Issues log & architectural decisions
│   └── wiki/                    # GitHub wiki source pages
├── .github/workflows/
│   ├── ci.yml                   # Build + test on Node 18/20/22
│   └── release.yml              # Tag-triggered npm publish
├── package.json                 # Root workspace config
├── tsconfig.json                # Root project references
└── vitest.config.ts             # Test configuration
```

## Build Pipeline

```
npm run build
  │
  ├─ 1. vite build (per package) → dist/index.js (optimized ESM bundle)
  │     ├── @wick/core
  │     ├���─ @wick/order-book
  │     ├── @wick/price-ticker
  │     └── @wick/trade-feed
  │
  └─ 2. tsc --build → dist/*.d.ts (type declarations)
         Uses project references to build in dependency order
```

**Why two tools?**
- **Vite** produces tree-shakeable, minified ESM bundles with dead code elimination
- **tsc** emits type declarations that Vite can't generate
- Order matters: vite runs first (creates dist/), tsc runs second (adds .d.ts alongside .js)

## Key Design Decisions

### No Shadow DOM

Components use `createRenderRoot() { return this; }` to render into the light DOM. This is intentional:

- **Full CSS access** — consumers can style with regular selectors, Tailwind, etc.
- **No style encapsulation** — headless means zero built-in styles to encapsulate
- **Simpler debugging** — inspect elements directly in DevTools
- **Part selectors still work** — `[part="price"]` works without Shadow DOM

### Lit as a Thin Layer

Lit adds ~5KB and provides:
- Reactive properties (`@property`) — automatic re-render when data changes
- Efficient template rendering with `html` tagged template literals
- `repeat()` directive for keyed rendering (critical for performance)
- Decorators for clean component API (`@customElement`, `@property`)

We don't use: Lit's scoped styles, Shadow DOM, or CSS-in-JS features.

### Immutable State Updates

`applyOrderBookDelta()` returns a new `OrderBookData` object rather than mutating in place. This:
- Triggers Lit's reactive update cycle (reference equality check)
- Makes state changes predictable and debuggable
- Enables easy undo/snapshot functionality if needed

### Keyed Rendering

Both order book and trade feed use `repeat()` with stable keys:
- **Order book**: keyed by `price` — price levels move but prices are stable identifiers
- **Trade feed**: keyed by `id` — each trade has a unique identifier

This means at 50 updates/sec, Lit only patches changed cells instead of recreating the entire table.

## Dependency Graph

```
@wick/core          (0 deps, just lit)
    ↑
    ├── @wick/order-book
    ├── @wick/price-ticker
    └── @wick/trade-feed
```

Each component depends only on `core` and `lit`. No cross-dependencies between components.

## Testing Strategy

- **Unit tests** (vitest): Core utility functions — pure functions, easy to test
- **Component tests** (planned): @open-wc/testing for Web Component lifecycle and rendering
- **Visual tests** (planned): Storybook or similar for visual regression testing
