import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export interface CorrelationData {
  symbols: string[];
  prices: number[][];
}

/**
 * `<wick-correlation-matrix>` — Pearson correlation grid for an asset basket.
 *
 * @fires wick-corr-cell-click - { a, b, value }
 *
 * @csspart container
 * @csspart header-row
 * @csspart header-cell
 * @csspart row
 * @csspart cell
 * @csspart cell--positive
 * @csspart cell--negative
 * @csspart cell--diagonal
 */
@customElement('wick-correlation-matrix')
export class WickCorrelationMatrix extends LitElement {
  @property({ type: Object }) data: CorrelationData = { symbols: [], prices: [] };
  @property({ type: String, attribute: 'return-mode' }) returnMode: 'simple' | 'log' = 'simple';

  protected override createRenderRoot() {
    return this;
  }

  /** Compute returns from a price series. */
  static returns(series: number[], mode: 'simple' | 'log' = 'simple'): number[] {
    const out: number[] = [];
    for (let i = 1; i < series.length; i++) {
      if (mode === 'log') {
        out.push(Math.log(series[i] / series[i - 1]));
      } else {
        out.push((series[i] - series[i - 1]) / series[i - 1]);
      }
    }
    return out;
  }

  /** Pearson correlation between two return arrays. */
  static pearson(a: number[], b: number[]): number {
    const n = Math.min(a.length, b.length);
    if (n === 0) return 0;
    let sumA = 0;
    let sumB = 0;
    for (let i = 0; i < n; i++) {
      sumA += a[i];
      sumB += b[i];
    }
    const meanA = sumA / n;
    const meanB = sumB / n;
    let cov = 0;
    let varA = 0;
    let varB = 0;
    for (let i = 0; i < n; i++) {
      const da = a[i] - meanA;
      const db = b[i] - meanB;
      cov += da * db;
      varA += da * da;
      varB += db * db;
    }
    if (varA === 0 || varB === 0) return 0;
    return cov / Math.sqrt(varA * varB);
  }

  /** Build the full correlation matrix. */
  computeMatrix(): number[][] {
    const { symbols, prices } = this.data;
    const returns = prices.map((s) => WickCorrelationMatrix.returns(s, this.returnMode));
    const n = symbols.length;
    const matrix: number[][] = [];
    for (let i = 0; i < n; i++) {
      const row: number[] = [];
      for (let j = 0; j < n; j++) {
        if (i === j) row.push(1);
        else row.push(WickCorrelationMatrix.pearson(returns[i], returns[j]));
      }
      matrix.push(row);
    }
    return matrix;
  }

  private _onCell(a: string, b: string, value: number) {
    this.dispatchEvent(
      new CustomEvent('wick-corr-cell-click', {
        detail: { a, b, value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  protected override render() {
    const { symbols } = this.data;
    if (symbols.length === 0) return html`<div part="container"></div>`;
    const matrix = this.computeMatrix();
    return html`
      <div part="container">
        <div part="header-row">
          <div part="header-cell"></div>
          ${symbols.map((s) => html`<div part="header-cell">${s}</div>`)}
        </div>
        ${symbols.map(
          (rowSym, i) => html`
            <div part="row">
              <div part="header-cell">${rowSym}</div>
              ${symbols.map((colSym, j) => {
                const v = matrix[i][j];
                const isDiag = i === j;
                const cls = isDiag
                  ? 'cell cell--diagonal'
                  : `cell cell--${v >= 0 ? 'positive' : 'negative'}`;
                const opacity = Math.abs(v).toFixed(2);
                return html`
                  <div
                    part=${cls}
                    style=${`--wick-cm-cell-strength: ${opacity}`}
                    @click=${() => this._onCell(rowSym, colSym, v)}
                  >
                    ${v.toFixed(2)}
                  </div>
                `;
              })}
            </div>
          `,
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wick-correlation-matrix': WickCorrelationMatrix;
  }
}
