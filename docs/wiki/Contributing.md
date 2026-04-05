# Contributing

## Development Setup

```bash
git clone https://github.com/astralchemist/vela.git
cd vela
npm install
npm run build
npm test
```

## Running the Demo

```bash
npm run dev
```

Opens a browser with mock BTC/USD real-time data exercising all components.

## Making Changes

1. Create a branch from `main`
2. Make your changes in `packages/*/src/`
3. Run `npm run build` to verify the build
4. Run `npm test` to verify tests pass
5. Open a pull request

## Adding a New Component

1. Create `packages/your-component/` with:
   - `package.json` (use existing packages as template)
   - `tsconfig.json` (reference `../core`)
   - `vite.config.ts`
   - `src/wick-your-component.ts`
   - `src/index.ts`
2. Add the package to root `tsconfig.json` references
3. Add the workspace build step to root `package.json` build script
4. Add to the demo app
5. Add wiki documentation

## Component Guidelines

- **Headless first** — no built-in styles, use CSS parts and custom properties
- **No Shadow DOM** — use `createRenderRoot() { return this; }`
- **Streaming API** — provide imperative methods for pushing real-time data
- **Standard events** — use `CustomEvent` with `bubbles: true, composed: true`
- **Keyed rendering** — use `repeat()` for any list that updates frequently
- **Immutable state** — never mutate component state directly, always create new objects
- **Type-safe** — export TypeScript types for all public APIs

## Code Style

- TypeScript strict mode
- No unused variables or parameters
- Lit decorators for component APIs
- JSDoc comments on public APIs with `@fires`, `@csspart`, `@cssprop` tags

## Testing

- Add tests in `src/*.test.ts` next to the source
- Use vitest for unit tests
- Test pure logic functions, not DOM rendering (for now)

## Commit Messages

Follow conventional commits:

```
feat: add new component
fix: correct order book sorting
docs: update wiki
chore: update dependencies
```
