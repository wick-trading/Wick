# @wick/funding-rate — Sources & Lineage

**Status:** Greenfield (no direct OSS port)

## Why no port?

Funding-rate widgets exist on every perp exchange (Binance, Bybit, OKX, dYdX,
Hyperliquid, Drift, …) but every implementation is bolted to its host UI:
React components inside the exchange's design system, locked to one data
source, no theming hooks, no countdown reuse. There is no MIT-licensed
"funding rate primitive" worth porting.

## Inspiration (the patterns we observed across exchanges)

| Exchange       | Pattern we noted                                                       |
|----------------|------------------------------------------------------------------------|
| Binance        | Rate + countdown side-by-side. Tooltip shows historical rates.         |
| Bybit          | Compact rate badge, colour shifts with sign, clickable for history.    |
| OKX            | Rate strip with sparkline below, persistent across pages.              |
| dYdX v4        | Rate + 8h countdown, predicted vs current toggle.                      |
| Hyperliquid    | Per-asset funding row in market overview, with last-N sparkline.       |

## What Wick takes

- **Sign-aware colour state** → exposed as compound CSS parts (`rate--positive`)
- **Owned countdown loop** → component owns its `setInterval`, consumers don't
- **Sparkline of historical rates** → composes with `@wick/mini-chart`
- **Single push API** → one `data` object, no setter ceremony

## What Wick discards

- **Predicted-rate toggle** — exchange-specific, scope creep, not in v1
- **Tooltips with funding history table** — that's a different component
- **Built-in WS subscription** — adapters handle exchange wire formats, not us
- **Click-to-trade integration** — separation of concerns; let consumers wire it

## What Wick adds

- **Self-tick** — emits `wick-funding-tick` every second so consumers can hook in
- **`wick-funding-settled`** — fires exactly once when the countdown crosses zero
- **Composition with `@wick/mini-chart`** — first Wick component that renders
  another Wick component. Validates the library composes with itself.
- **Theme parity** — uses the shared `--wick-fr-*` token family across all 3 themes
- **Framework-agnostic** — same element runs in vanilla, React, Vue, Svelte, Angular

## License

MIT. No third-party code copied.
