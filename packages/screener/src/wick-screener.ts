import { LitElement, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

export type FilterType = 'range' | 'select' | 'boolean' | 'search';

export interface FilterDef {
  id: string;
  label: string;
  type: FilterType;
  min?: number;
  max?: number;
  options?: string[];
}

export interface FilterValue {
  min?: number;
  max?: number;
  selected?: string[];
  value?: boolean | string;
}

export interface ScreenableInstrument {
  id: string;
  symbol: string;
  [key: string]: unknown;
}

/**
 * `<wick-screener>` — Headless market screener. Filters a universe of instruments
 * by any metric. Composable with `<wick-watchlist>`.
 *
 * @fires wick-screener-results       - { results, count }
 * @fires wick-screener-filter-change - { id, value }
 *
 * @csspart filter-bar
 * @csspart filter-group
 * @csspart filter-label
 * @csspart filter-control
 * @csspart range-input-min
 * @csspart range-input-max
 * @csspart select-control
 * @csspart results-count
 * @csspart reset-btn
 */
@customElement('wick-screener')
export class WickScreener extends LitElement {
  @property({ type: Array }) filters: FilterDef[] = [];
  @property({ type: Array }) universe: ScreenableInstrument[] = [];

  @state() private _values: Map<string, FilterValue> = new Map();

  protected override createRenderRoot() {
    return this;
  }

  /** Apply a single filter value and re-emit results. */
  setFilter(id: string, value: FilterValue): void {
    this._values = new Map(this._values).set(id, value);
    this._emit();
  }

  /** Clear all filters. */
  resetFilters(): void {
    this._values = new Map();
    this._emit();
  }

  /** Test whether an instrument passes a single filter. */
  static testFilter(
    instrument: ScreenableInstrument,
    def: FilterDef,
    value: FilterValue,
  ): boolean {
    const raw = instrument[def.id];
    const v = typeof raw === 'number' ? raw : typeof raw === 'string' ? raw : null;
    if (def.type === 'range') {
      if (typeof v !== 'number') return true; // field missing → pass
      if (value.min !== undefined && v < value.min) return false;
      if (value.max !== undefined && v > value.max) return false;
      return true;
    }
    if (def.type === 'select') {
      if (!value.selected || value.selected.length === 0) return true;
      return value.selected.includes(String(v ?? ''));
    }
    if (def.type === 'boolean') {
      if (value.value === undefined) return true;
      return Boolean(v) === Boolean(value.value);
    }
    if (def.type === 'search') {
      if (!value.value) return true;
      return String(v ?? '').toLowerCase().includes(String(value.value).toLowerCase());
    }
    return true;
  }

  get results(): ScreenableInstrument[] {
    return this.universe.filter((inst) =>
      this.filters.every((def) => {
        const val = this._values.get(def.id);
        if (!val) return true;
        return WickScreener.testFilter(inst, def, val);
      }),
    );
  }

  private _emit(): void {
    const results = this.results;
    this.dispatchEvent(
      new CustomEvent('wick-screener-results', {
        detail: { results, count: results.length },
        bubbles: true,
        composed: true,
      }),
    );
  }

  protected override render() {
    return html`
      <div part="filter-bar">
        ${this.filters.map((def) => {
          const val = this._values.get(def.id);
          return html`
            <div part="filter-group">
              <label part="filter-label">${def.label}</label>
              <div part="filter-control">
                ${def.type === 'range'
                  ? html`
                      <input
                        part="range-input-min"
                        type="number"
                        placeholder="min"
                        .value=${String(val?.min ?? '')}
                        @change=${(e: Event) => {
                          const mn = parseFloat((e.target as HTMLInputElement).value);
                          this.setFilter(def.id, {
                            ...(val ?? {}),
                            min: isNaN(mn) ? undefined : mn,
                          });
                        }}
                      />
                      <input
                        part="range-input-max"
                        type="number"
                        placeholder="max"
                        .value=${String(val?.max ?? '')}
                        @change=${(e: Event) => {
                          const mx = parseFloat((e.target as HTMLInputElement).value);
                          this.setFilter(def.id, {
                            ...(val ?? {}),
                            max: isNaN(mx) ? undefined : mx,
                          });
                        }}
                      />
                    `
                  : def.type === 'select'
                    ? html`
                        <select
                          part="select-control"
                          multiple
                          @change=${(e: Event) => {
                            const sel = Array.from(
                              (e.target as HTMLSelectElement).selectedOptions,
                            ).map((o) => o.value);
                            this.setFilter(def.id, { selected: sel });
                          }}
                        >
                          ${(def.options ?? []).map(
                            (opt) =>
                              html`<option
                                part="select-option"
                                value=${opt}
                                ?selected=${val?.selected?.includes(opt) ?? false}
                              >
                                ${opt}
                              </option>`,
                          )}
                        </select>
                      `
                    : nothing}
              </div>
            </div>
          `;
        })}
        <span part="results-count">${this.results.length} results</span>
        <button part="reset-btn" @click=${() => this.resetFilters()}>Reset</button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wick-screener': WickScreener;
  }
}
