import { describe, it, expect, beforeEach } from 'vitest';
import './wick-drawing-overlay.js';
import { WickDrawingOverlay } from './wick-drawing-overlay.js';
import type { DrawingTool } from './wick-drawing-overlay.js';

describe('<wick-drawing-overlay>', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  function mount(): WickDrawingOverlay {
    const el = document.createElement('wick-drawing-overlay') as WickDrawingOverlay;
    document.body.appendChild(el);
    return el;
  }

  const trendline: DrawingTool = {
    id: 'tool-1',
    type: 'trendline',
    points: [
      { t: 1000, p: 67000 },
      { t: 2000, p: 68000 },
    ],
  };

  it('registers the custom element', () => {
    expect(customElements.get('wick-drawing-overlay')).toBeDefined();
  });

  it('requiredPoints returns 1 for hline and 2 for trendline', () => {
    expect(WickDrawingOverlay.requiredPoints('hline')).toBe(1);
    expect(WickDrawingOverlay.requiredPoints('trendline')).toBe(2);
  });

  it('addTool adds tool and emits wick-drawing-create', () => {
    const el = mount();
    let detail: any = null;
    el.addEventListener('wick-drawing-create', (e: any) => (detail = e.detail));
    el.addTool(trendline);
    expect(el.tools.length).toBe(1);
    expect(detail?.tool.id).toBe('tool-1');
  });

  it('deleteTool removes tool and emits wick-drawing-delete', () => {
    const el = mount();
    el.tools = [trendline];
    let detail: any = null;
    el.addEventListener('wick-drawing-delete', (e: any) => (detail = e.detail));
    el.deleteTool('tool-1');
    expect(el.tools.length).toBe(0);
    expect(detail?.id).toBe('tool-1');
  });

  it('addDraftPoint returns true when enough points collected (hline = 1)', () => {
    const el = mount();
    el.activeTool = 'hline';
    const done = el.addDraftPoint({ t: 1000, p: 67000 });
    expect(done).toBe(true);
    expect(el.tools.length).toBe(1);
  });

  it('selectTool emits wick-drawing-select', () => {
    const el = mount();
    el.tools = [trendline];
    let detail: any = null;
    el.addEventListener('wick-drawing-select', (e: any) => (detail = e.detail));
    el.selectTool('tool-1');
    expect(detail?.id).toBe('tool-1');
  });
});
