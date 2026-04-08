import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

export type ToolType =
  | 'trendline'
  | 'hline'
  | 'vline'
  | 'ray'
  | 'channel'
  | 'fib'
  | 'rect';

export interface ToolPoint {
  t: number;
  p: number;
}

export interface DrawingTool {
  id: string;
  type: ToolType;
  points: ToolPoint[];
  style?: { color?: string; width?: number; dash?: number[] };
}

export type ProjectFn = (t: number, p: number) => { x: number; y: number };

/**
 * `<wick-drawing-overlay>` — Chart drawing tools overlay.
 * Takes a `project` callback (time+price → pixel) and renders
 * trendlines, H-lines, fibs, etc. as SVG paths on top of any chart.
 *
 * @fires wick-drawing-create - { tool }
 * @fires wick-drawing-update - { id, tool }
 * @fires wick-drawing-delete - { id }
 * @fires wick-drawing-select - { id }
 *
 * @csspart overlay
 * @csspart canvas
 * @csspart tool-handle
 * @csspart tool-handle--selected
 */
@customElement('wick-drawing-overlay')
export class WickDrawingOverlay extends LitElement {
  @property({ type: Array }) tools: DrawingTool[] = [];
  @property({ type: String, attribute: 'active-tool' }) activeTool: ToolType | null = null;

  /** Caller-provided (t, p) → (x, y) projection function. */
  project: ProjectFn = () => ({ x: 0, y: 0 });

  @state() private _selectedId: string | null = null;
  @state() private _draft: ToolPoint[] = [];

  protected override createRenderRoot() {
    return this;
  }

  /** Add a new tool programmatically. */
  addTool(tool: DrawingTool): void {
    this.tools = [...this.tools, tool];
    this.dispatchEvent(
      new CustomEvent('wick-drawing-create', {
        detail: { tool },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** Update an existing tool. */
  updateTool(id: string, patch: Partial<DrawingTool>): void {
    this.tools = this.tools.map((t) => (t.id === id ? { ...t, ...patch } : t));
    const tool = this.tools.find((t) => t.id === id);
    if (!tool) return;
    this.dispatchEvent(
      new CustomEvent('wick-drawing-update', {
        detail: { id, tool },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** Delete a tool by id. */
  deleteTool(id: string): void {
    this.tools = this.tools.filter((t) => t.id !== id);
    if (this._selectedId === id) this._selectedId = null;
    this.dispatchEvent(
      new CustomEvent('wick-drawing-delete', {
        detail: { id },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** Select a tool by id. */
  selectTool(id: string | null): void {
    this._selectedId = id;
    if (id !== null) {
      this.dispatchEvent(
        new CustomEvent('wick-drawing-select', {
          detail: { id },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  /** Number of points required for each tool type. */
  static requiredPoints(type: ToolType): number {
    switch (type) {
      case 'hline':
      case 'vline':
        return 1;
      case 'trendline':
      case 'ray':
      case 'channel':
      case 'fib':
      case 'rect':
        return 2;
      default:
        return 1;
    }
  }

  /** Register a point during an active draw. Returns true if the tool is complete. */
  addDraftPoint(point: ToolPoint): boolean {
    if (!this.activeTool) return false;
    this._draft = [...this._draft, point];
    const needed = WickDrawingOverlay.requiredPoints(this.activeTool);
    if (this._draft.length >= needed) {
      const newTool: DrawingTool = {
        id: `tool-${Date.now()}`,
        type: this.activeTool,
        points: this._draft,
      };
      this._draft = [];
      this.addTool(newTool);
      return true;
    }
    return false;
  }

  protected override render() {
    return html`
      <div part="overlay">
        ${this.tools.map((tool) => {
          const selected = tool.id === this._selectedId;
          return html`
            <div
              part=${`tool-handle${selected ? ' tool-handle--selected' : ''}`}
              data-tool-id=${tool.id}
              data-tool-type=${tool.type}
              @click=${() => this.selectTool(tool.id)}
            ></div>
          `;
        })}
        ${this._draft.length > 0
          ? html`<div part="draft-indicator" data-points=${this._draft.length}></div>`
          : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wick-drawing-overlay': WickDrawingOverlay;
  }
}
