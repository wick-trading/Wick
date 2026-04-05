# Vela — Headless Trading Components

Welcome to the Vela wiki. Vela is an open-source library of headless Web Components for building trading interfaces.

## What is Vela?

Vela provides unstyled, framework-agnostic Web Components designed for real-time trading UIs. Think of it as **Radix/shadcn for trading** — you bring your own styles, we handle the data logic, performance, and accessibility.

## Why Vela?

Most existing trading UI libraries are:
- **Framework-locked** — tied to React, Vue, or Angular
- **Over-styled** — ship with opinionated CSS you have to fight against
- **Slow** — choke on real-time tick data (10-50+ updates/sec)
- **Abandoned** — last commit 2+ years ago

Vela is different:
- **Framework-agnostic** — Web Components work everywhere (React, Vue, Svelte, vanilla JS)
- **Headless** — zero built-in styles, full CSS control via parts and custom properties
- **Real-time first** — keyed rendering, efficient DOM recycling, designed for streaming WebSocket data
- **Tiny** — core + all 3 components < 5KB gzip total

## Pages

- [Getting Started](Getting-Started.md)
- [Components](Components.md)
  - [Order Book](Order-Book.md)
  - [Price Ticker](Price-Ticker.md)
  - [Trade Feed](Trade-Feed.md)
- [Styling Guide](Styling-Guide.md)
- [Data Contracts](Data-Contracts.md)
- [Architecture](Architecture.md)
- [Contributing](Contributing.md)
