import { LitElement, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

export type EventImpact = 'low' | 'medium' | 'high';

export interface EconomicEvent {
  id: string;
  title: string;
  country: string;
  currency?: string;
  impact: EventImpact;
  timestamp: number;
  previous?: string;
  forecast?: string;
  actual?: string;
}

const IMPACT_RANK: Record<EventImpact, number> = { low: 0, medium: 1, high: 2 };

/**
 * `<wick-economic-calendar>` — Macro events grouped by date with countdowns.
 *
 * @fires wick-event-click   - { id }
 * @fires wick-event-imminent - { id, untilMs }
 *
 * @csspart container
 * @csspart day-group
 * @csspart day-label
 * @csspart event
 * @csspart event--high
 * @csspart event--medium
 * @csspart event--low
 * @csspart event-time
 * @csspart event-country
 * @csspart event-title
 * @csspart event-values
 * @csspart event-countdown
 */
@customElement('wick-economic-calendar')
export class WickEconomicCalendar extends LitElement {
  @property({ type: Array }) events: EconomicEvent[] = [];
  @property({ type: String, attribute: 'min-impact' }) minImpact: EventImpact = 'low';
  @property({ type: String, attribute: 'filter-region' }) filterRegion = '';
  @property({ type: Number, attribute: 'imminent-minutes' }) imminentMinutes = 30;

  @state() private _now = Date.now();
  private _intervalId: ReturnType<typeof setInterval> | null = null;
  private _imminentFired = new Set<string>();

  override connectedCallback(): void {
    super.connectedCallback();
    this._intervalId = setInterval(() => this._tick(), 1000);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._intervalId !== null) clearInterval(this._intervalId);
    this._intervalId = null;
  }

  protected override createRenderRoot() {
    return this;
  }

  private _tick(): void {
    const now = Date.now();
    this._now = now;
    const cutoff = this.imminentMinutes * 60_000;
    for (const e of this.filteredEvents) {
      const until = e.timestamp - now;
      if (until > 0 && until <= cutoff && !this._imminentFired.has(e.id)) {
        this._imminentFired.add(e.id);
        this.dispatchEvent(
          new CustomEvent('wick-event-imminent', {
            detail: { id: e.id, untilMs: until },
            bubbles: true,
            composed: true,
          }),
        );
      }
    }
  }

  get filteredEvents(): EconomicEvent[] {
    const minRank = IMPACT_RANK[this.minImpact];
    const regions = this.filterRegion
      ? this.filterRegion.split(',').map((r) => r.trim().toUpperCase())
      : null;
    return this.events.filter((e) => {
      if (IMPACT_RANK[e.impact] < minRank) return false;
      if (regions && !regions.includes(e.country.toUpperCase())) return false;
      return true;
    });
  }

  private _groupByDay(events: EconomicEvent[]): Map<string, EconomicEvent[]> {
    const groups = new Map<string, EconomicEvent[]>();
    for (const e of events) {
      const day = new Date(e.timestamp).toISOString().slice(0, 10);
      const list = groups.get(day) ?? [];
      list.push(e);
      groups.set(day, list);
    }
    for (const list of groups.values()) list.sort((a, b) => a.timestamp - b.timestamp);
    return groups;
  }

  private _onClick(id: string) {
    this.dispatchEvent(
      new CustomEvent('wick-event-click', {
        detail: { id },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _formatTime(ts: number): string {
    const d = new Date(ts);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
  }

  private _formatCountdown(untilMs: number): string {
    if (untilMs <= 0) return '—';
    const total = Math.floor(untilMs / 1000);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }

  protected override render() {
    const groups = this._groupByDay(this.filteredEvents);
    return html`
      <div part="container">
        ${[...groups.entries()].map(
          ([day, events]) => html`
            <div part="day-group">
              <div part="day-label">${day}</div>
              ${events.map((e) => {
                const past = e.timestamp < this._now;
                return html`
                  <div
                    part=${`event event--${e.impact}`}
                    data-past=${past ? 'true' : 'false'}
                    @click=${() => this._onClick(e.id)}
                  >
                    <span part="event-time">${this._formatTime(e.timestamp)}</span>
                    <span part="event-country">${e.country}</span>
                    <span part="event-title">${e.title}</span>
                    <span part="event-values">
                      ${e.previous ? `prev ${e.previous}` : ''}
                      ${e.forecast ? `· fcst ${e.forecast}` : ''}
                      ${e.actual ? `· act ${e.actual}` : ''}
                    </span>
                    ${past
                      ? nothing
                      : html`<span part="event-countdown">
                          ${this._formatCountdown(e.timestamp - this._now)}
                        </span>`}
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
    'wick-economic-calendar': WickEconomicCalendar;
  }
}
