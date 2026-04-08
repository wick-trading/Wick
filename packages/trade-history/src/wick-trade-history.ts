import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export interface TradeRecord {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  entry: number;
  exit: number;
  size: number;
  openedAt: number;
  closedAt: number;
  fees?: number;
  pnl: number;
  rMultiple?: number;
  tags?: string[];
}

export interface TradeSummaryStats {
  totalTrades: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  expectancy: number;
  totalPnl: number;
}

export type TradeSortKey = 'closedAt' | 'pnl' | 'rMultiple' | 'symbol';

/**
 * `<wick-trade-history>` — Closed trades log with summary stats.
 *
 * @fires wick-trade-row-click  - { id }
 * @fires wick-trade-sort-change - { key, dir }
 *
 * @csspart summary
 * @csspart summary-stat
 * @csspart summary-stat--positive
 * @csspart summary-stat--negative
 * @csspart table
 * @csspart header-row
 * @csspart header-cell
 * @csspart row
 * @csspart cell--pnl
 * @csspart cell--pnl--positive
 * @csspart cell--pnl--negative
 * @csspart cell--side
 * @csspart cell--side--long
 * @csspart cell--side--short
 */
@customElement('wick-trade-history')
export class WickTradeHistory extends LitElement {
  @property({ type: Array }) trades: TradeRecord[] = [];
  @property({ type: Boolean, attribute: 'show-summary' }) showSummary = false;
  @property({ type: String, attribute: 'sort-key' }) sortKey: TradeSortKey = 'closedAt';
  @property({ type: String, attribute: 'sort-dir' }) sortDir: 'asc' | 'desc' = 'desc';

  protected override createRenderRoot() {
    return this;
  }

  computeSummary(): TradeSummaryStats {
    const trades = this.trades;
    if (trades.length === 0) {
      return {
        totalTrades: 0,
        winRate: 0,
        avgWin: 0,
        avgLoss: 0,
        profitFactor: 0,
        expectancy: 0,
        totalPnl: 0,
      };
    }
    const wins = trades.filter((t) => t.pnl > 0);
    const losses = trades.filter((t) => t.pnl < 0);
    const totalPnl = trades.reduce((s, t) => s + t.pnl, 0);
    const avgWin = wins.length ? wins.reduce((s, t) => s + t.pnl, 0) / wins.length : 0;
    const avgLoss = losses.length ? losses.reduce((s, t) => s + t.pnl, 0) / losses.length : 0;
    const winRate = wins.length / trades.length;
    const grossWin = wins.reduce((s, t) => s + t.pnl, 0);
    const grossLoss = Math.abs(losses.reduce((s, t) => s + t.pnl, 0));
    const profitFactor = grossLoss > 0 ? grossWin / grossLoss : 0;
    const expectancy = winRate * avgWin + (1 - winRate) * avgLoss;
    return {
      totalTrades: trades.length,
      winRate,
      avgWin,
      avgLoss,
      profitFactor,
      expectancy,
      totalPnl,
    };
  }

  get sortedTrades(): TradeRecord[] {
    const dir = this.sortDir === 'asc' ? 1 : -1;
    const key = this.sortKey;
    return [...this.trades].sort((a, b) => {
      const av = (a as any)[key];
      const bv = (b as any)[key];
      if (av === undefined || bv === undefined) return 0;
      if (typeof av === 'string') return dir * av.localeCompare(bv);
      return dir * (av - bv);
    });
  }

  setSort(key: TradeSortKey): void {
    if (this.sortKey === key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDir = 'desc';
    }
    this.dispatchEvent(
      new CustomEvent('wick-trade-sort-change', {
        detail: { key: this.sortKey, dir: this.sortDir },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _onRow(id: string) {
    this.dispatchEvent(
      new CustomEvent('wick-trade-row-click', {
        detail: { id },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _fmt(n: number, d = 2): string {
    return n.toFixed(d);
  }

  private _formatDate(ts: number): string {
    return new Date(ts).toISOString().slice(0, 10);
  }

  protected override render() {
    const summary = this.showSummary ? this.computeSummary() : null;
    return html`
      ${summary
        ? html`
            <div part="summary">
              <div part=${`summary-stat summary-stat--${summary.totalPnl >= 0 ? 'positive' : 'negative'}`}>
                <span>Total P&L</span><span>${this._fmt(summary.totalPnl)}</span>
              </div>
              <div part="summary-stat">
                <span>Trades</span><span>${summary.totalTrades}</span>
              </div>
              <div part="summary-stat">
                <span>Win Rate</span><span>${this._fmt(summary.winRate * 100, 1)}%</span>
              </div>
              <div part="summary-stat">
                <span>Profit Factor</span><span>${this._fmt(summary.profitFactor)}</span>
              </div>
              <div part="summary-stat">
                <span>Expectancy</span><span>${this._fmt(summary.expectancy)}</span>
              </div>
            </div>
          `
        : nothing}
      <table part="table">
        <thead>
          <tr part="header-row">
            <th part="header-cell" @click=${() => this.setSort('symbol')}>Symbol</th>
            <th part="header-cell">Side</th>
            <th part="header-cell">Entry</th>
            <th part="header-cell">Exit</th>
            <th part="header-cell">Size</th>
            <th part="header-cell" @click=${() => this.setSort('pnl')}>P&L</th>
            <th part="header-cell" @click=${() => this.setSort('rMultiple')}>R</th>
            <th part="header-cell" @click=${() => this.setSort('closedAt')}>Closed</th>
          </tr>
        </thead>
        <tbody>
          ${this.sortedTrades.map(
            (t) => html`
              <tr part="row" @click=${() => this._onRow(t.id)}>
                <td>${t.symbol}</td>
                <td part=${`cell--side cell--side--${t.side}`}>${t.side}</td>
                <td>${this._fmt(t.entry)}</td>
                <td>${this._fmt(t.exit)}</td>
                <td>${t.size}</td>
                <td part=${`cell--pnl cell--pnl--${t.pnl >= 0 ? 'positive' : 'negative'}`}>
                  ${this._fmt(t.pnl)}
                </td>
                <td>${t.rMultiple !== undefined ? this._fmt(t.rMultiple) + 'R' : '—'}</td>
                <td>${this._formatDate(t.closedAt)}</td>
              </tr>
            `,
          )}
        </tbody>
      </table>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wick-trade-history': WickTradeHistory;
  }
}
