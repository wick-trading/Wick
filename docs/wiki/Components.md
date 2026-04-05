# Components

Vela ships three core components for v1. Each is a standalone Web Component that can be used independently.

## Overview

| Component | Tag | Package | Size |
|-----------|-----|---------|------|
| [[Order Book]] | `<vela-order-book>` | `@vela-trading/order-book` | ~1.8 KB gzip |
| [[Price Ticker]] | `<vela-price-ticker>` | `@vela-trading/price-ticker` | ~1.2 KB gzip |
| [[Trade Feed]] | `<vela-trade-feed>` | `@vela-trading/trade-feed` | ~1.4 KB gzip |

All components share `@vela-trading/core` (~0.5 KB gzip) for types and utilities.

## Design Principles

### Headless
No built-in styles. Components render semantic HTML and expose CSS parts and custom properties for theming. You have full control over the visual appearance.

### Data-Agnostic
Components accept standardized data types (see [[Data Contracts]]). You bring your own data source — REST API, WebSocket, mock data, whatever. Vela doesn't care where the data comes from.

### Real-Time First
Every component is optimized for high-frequency updates:
- **Keyed rendering** via Lit's `repeat()` directive — DOM nodes are recycled, not recreated
- **Delta updates** — order book supports incremental updates, not just full snapshots
- **Streaming APIs** — `addTrade()`, `applyDelta()` for pushing data as it arrives

### Framework-Agnostic
Standard Web Components work in any framework or vanilla JS. No React wrappers, no Vue plugins, no framework-specific code.
