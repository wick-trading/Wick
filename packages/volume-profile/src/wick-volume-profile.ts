import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export interface VolumeBar {
  price: number;
  volume: number;
}

export interface VolumeProfileData {
  bars: VolumeBar[];
}

export interface VpLevels {
  poc: number;
  vah: number;
  val: number;
}

/**
 * `<wick-volume-profile>` — Volume-by-price histogram (VPVR).
 * Computes VAH / VAL / POC and renders horizontal bars.
 *
 * @fires wick-vp-poc-change - { poc, vah, val }
 *
 * @csspart container
 * @csspart canvas
 * @csspart poc-line
 * @csspart vah-line
 * @csspart val-line
 */
@customElement('wick-volume-profile')
export class WickVolumeProfile extends LitElement {
  @property({ type: Object }) data: VolumeProfileData = { bars: [] };
  @property({ type: Number, attribute: 'value-area' }) valueArea = 0.7;
  @property({ type: Number, attribute: 'bucket-size' }) bucketSize = 10;

  protected override createRenderRoot() {
    return this;
  }

  /** Compute POC, VAH and VAL from the current data. */
  computeLevels(): VpLevels | null {
    const { bars } = this.data;
    if (bars.length === 0) return null;

    const totalVol = bars.reduce((s, b) => s + b.volume, 0);
    if (totalVol === 0) return null;

    // POC = bar with highest volume
    const poc = bars.reduce((best, b) => (b.volume > best.volume ? b : best), bars[0]);

    // Expand outward from POC until valueArea is covered
    const target = totalVol * this.valueArea;
    let accumulated = poc.volume;
    let lo = poc.price;
    let hi = poc.price;

    const sorted = [...bars].sort((a, b) => a.price - b.price);
    const pocIdx = sorted.findIndex((b) => b.price === poc.price);
    let left = pocIdx - 1;
    let right = pocIdx + 1;

    while (accumulated < target && (left >= 0 || right < sorted.length)) {
      const leftVol = left >= 0 ? sorted[left].volume : -Infinity;
      const rightVol = right < sorted.length ? sorted[right].volume : -Infinity;
      if (leftVol >= rightVol && left >= 0) {
        accumulated += leftVol;
        lo = sorted[left].price;
        left--;
      } else if (right < sorted.length) {
        accumulated += rightVol;
        hi = sorted[right].price;
        right++;
      } else {
        break;
      }
    }

    return { poc: poc.price, vah: hi, val: lo };
  }

  private _lastPoc: number | null = null;

  protected override willUpdate() {
    const levels = this.computeLevels();
    if (levels && levels.poc !== this._lastPoc) {
      this._lastPoc = levels.poc;
      this.dispatchEvent(
        new CustomEvent('wick-vp-poc-change', {
          detail: levels,
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  protected override render() {
    const { bars } = this.data;
    if (bars.length === 0) {
      return html`<div part="container"></div>`;
    }
    const maxVol = Math.max(...bars.map((b) => b.volume));
    const levels = this.computeLevels();
    const sorted = [...bars].sort((a, b) => b.price - a.price);
    return html`
      <div part="container">
        ${sorted.map((bar) => {
          const pct = maxVol > 0 ? (bar.volume / maxVol) * 100 : 0;
          const isPoc = levels?.poc === bar.price;
          const isVah = levels?.vah === bar.price;
          const isVal = levels?.val === bar.price;
          return html`
            <div
              part=${`bar${isPoc ? ' bar--poc' : ''}${isVah ? ' bar--vah' : ''}${isVal ? ' bar--val' : ''}`}
              style=${`--wick-vp-bar-pct: ${pct.toFixed(1)}%`}
              data-price=${bar.price}
              data-volume=${bar.volume}
            >
              <span part="price-label">${bar.price}</span>
            </div>
          `;
        })}
        ${levels
          ? html`
              <div part="poc-line" data-price=${levels.poc}></div>
              <div part="vah-line" data-price=${levels.vah}></div>
              <div part="val-line" data-price=${levels.val}></div>
            `
          : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wick-volume-profile': WickVolumeProfile;
  }
}
