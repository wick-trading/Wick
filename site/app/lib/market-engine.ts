/**
 * Market Engine — synthetic BTC/USD market simulation.
 *
 * A living market you can pause, rewind, replay, and stress-test. Drives
 * every live component in the docs from a single shared feed.
 *
 * Architecture:
 *  - Fixed 50ms tick rate (20Hz)
 *  - Scenario-driven drift / volatility / trade rate / book shape
 *  - Ring-buffer history (30s @ 20Hz = 600 frames) for time scrubbing
 *  - Pub/sub: subscribers see frames as they happen, or historical frames
 *    when scrubbing.
 *
 * Pure TS. No React. No DOM. SSR-safe (never auto-starts; caller drives it).
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Level {
  price: number;
  size: number;
}

export interface Book {
  bids: Level[];
  asks: Level[];
}

export interface Trade {
  id: string;
  ts: number;
  price: number;
  size: number;
  side: 'buy' | 'sell';
}

export type Direction = 'up' | 'down' | 'flat';

export interface Frame {
  /** Simulation time (ms since engine start) */
  ts: number;
  /** Mid price */
  mid: number;
  /** Current order book snapshot */
  book: Book;
  /** Trades that happened during this tick */
  trades: Trade[];
  /** Price direction vs. previous tick */
  direction: Direction;
  /** Sequence number (increments every tick) */
  seq: number;
}

export type ScenarioId =
  | 'calm'
  | 'rally'
  | 'flash-crash'
  | 'liq-cascade'
  | 'whale-wall'
  | 'low-liq';

interface ScenarioParams {
  /** Drift per tick as fraction of mid */
  drift: (t: number) => number;
  /** Stddev per tick as fraction of mid */
  vol: (t: number) => number;
  /** Expected trades per tick (Poisson lambda) */
  tradeRate: (t: number) => number;
  /** Trade side bias in [-1, 1]; -1 all sells, +1 all buys */
  tradeBias: (t: number) => number;
  /** Spread in basis points */
  spreadBps: (t: number) => number;
  /** Depth multiplier (1 = normal, <1 thin, >1 thick) */
  depthMul: (t: number) => number;
  /** Book asymmetry in [-1, 1]; -1 ask-heavy, +1 bid-heavy */
  asymmetry: (t: number) => number;
}

export interface Scenario extends ScenarioParams {
  id: ScenarioId;
  label: string;
  description: string;
  /** Length in ms; after this the scenario loops or decays to calm */
  durationMs: number;
}

export type ControlsState = {
  playing: boolean;
  speed: number;
  scenarioId: ScenarioId;
  /** null = live at head of history; number = index into history buffer */
  scrubIndex: number | null;
  /** Current seq at the head of the engine (max seq) */
  headSeq: number;
  /** Oldest seq still in history */
  tailSeq: number;
  /** Seq being displayed (live or scrubbed) */
  currentSeq: number;
};

// ─── Scenarios ────────────────────────────────────────────────────────────────

// Utility to ramp a value over time
const ramp = (t: number, start: number, end: number, duration: number) => {
  const p = Math.min(1, Math.max(0, t / duration));
  return start + (end - start) * p;
};

// Smooth sine wobble for more organic motion
const wobble = (t: number, period: number, amp: number) =>
  Math.sin((t / period) * Math.PI * 2) * amp;

export const SCENARIOS: Record<ScenarioId, Scenario> = {
  calm: {
    id: 'calm',
    label: 'Calm',
    description: 'Quiet range-bound market. Tight spread, balanced flow.',
    durationMs: 60_000,
    drift: (t) => wobble(t, 20_000, 0.00003),
    vol: () => 0.00012,
    tradeRate: () => 0.8,
    tradeBias: (t) => wobble(t, 8_000, 0.2),
    spreadBps: () => 1.2,
    depthMul: () => 1,
    asymmetry: (t) => wobble(t, 12_000, 0.15),
  },

  rally: {
    id: 'rally',
    label: 'Rally',
    description: 'Sustained grind upward. Asks thinning, bids stacking.',
    durationMs: 40_000,
    drift: (t) => 0.00025 + wobble(t, 6_000, 0.0001),
    vol: () => 0.00025,
    tradeRate: (t) => 1.4 + wobble(t, 4_000, 0.4),
    tradeBias: () => 0.5,
    spreadBps: () => 1.5,
    depthMul: (t) => 1 - 0.2 * Math.min(1, t / 15_000),
    asymmetry: () => 0.35,
  },

  'flash-crash': {
    id: 'flash-crash',
    label: 'Flash Crash',
    description: '−4% in 3 seconds. Bids disappear, spread blows out, trades cascade.',
    durationMs: 30_000,
    drift: (t) => {
      // Sharp drop over first 3s, then slow recovery
      if (t < 3_000) return -0.0035;
      if (t < 8_000) return 0.0002;
      return 0.00005;
    },
    vol: (t) => {
      if (t < 3_000) return 0.0012;
      if (t < 8_000) return 0.0008;
      return 0.0003;
    },
    tradeRate: (t) => {
      if (t < 3_000) return 4.5;
      if (t < 8_000) return 2.5;
      return 1.2;
    },
    tradeBias: (t) => (t < 3_000 ? -0.85 : -0.3),
    spreadBps: (t) => {
      if (t < 3_000) return 8;
      if (t < 8_000) return 4;
      return 2;
    },
    depthMul: (t) => (t < 3_000 ? 0.25 : t < 8_000 ? 0.5 : 1),
    asymmetry: (t) => (t < 3_000 ? -0.8 : -0.3),
  },

  'liq-cascade': {
    id: 'liq-cascade',
    label: 'Liquidation Cascade',
    description: 'Repeated down-spikes as long positions get force-closed.',
    durationMs: 45_000,
    drift: (t) => {
      // Create spiky drops every ~5s
      const phase = (t % 5_000) / 5_000;
      if (phase < 0.15) return -0.0018;
      if (phase < 0.3) return 0.0006;
      return -0.00005;
    },
    vol: (t) => {
      const phase = (t % 5_000) / 5_000;
      return phase < 0.15 ? 0.0009 : 0.0003;
    },
    tradeRate: (t) => {
      const phase = (t % 5_000) / 5_000;
      return phase < 0.15 ? 3.5 : 1.2;
    },
    tradeBias: (t) => {
      const phase = (t % 5_000) / 5_000;
      return phase < 0.15 ? -0.9 : -0.2;
    },
    spreadBps: (t) => {
      const phase = (t % 5_000) / 5_000;
      return phase < 0.15 ? 5 : 2;
    },
    depthMul: (t) => {
      const phase = (t % 5_000) / 5_000;
      return phase < 0.15 ? 0.4 : 0.9;
    },
    asymmetry: () => -0.4,
  },

  'whale-wall': {
    id: 'whale-wall',
    label: 'Whale Wall',
    description: 'Massive bid wall appears, sits, then vanishes. Watch the reaction.',
    durationMs: 40_000,
    drift: (t) => (t < 20_000 ? 0.00008 : -0.00015),
    vol: () => 0.00018,
    tradeRate: () => 1.1,
    tradeBias: (t) => (t < 20_000 ? 0.3 : -0.5),
    spreadBps: () => 1.5,
    // Wall appears at 5s, vanishes at 20s
    depthMul: (t) => {
      if (t < 5_000) return 1;
      if (t < 20_000) return 1.8; // big liquidity
      if (t < 22_000) return ramp(t - 20_000, 1.8, 0.6, 2_000); // crash as wall lifts
      return 0.9;
    },
    asymmetry: (t) => {
      if (t < 5_000) return 0;
      if (t < 20_000) return 0.7; // bid-heavy
      return -0.3; // flip ask-heavy after pull
    },
  },

  'low-liq': {
    id: 'low-liq',
    label: 'Low Liquidity',
    description: 'Thin book, wide spread, jumpy prints. Overnight / holiday feel.',
    durationMs: 60_000,
    drift: (t) => wobble(t, 15_000, 0.00008),
    vol: () => 0.00045,
    tradeRate: () => 0.35,
    tradeBias: (t) => wobble(t, 6_000, 0.4),
    spreadBps: (t) => 3.5 + wobble(t, 10_000, 1.2),
    depthMul: () => 0.35,
    asymmetry: (t) => wobble(t, 7_000, 0.4),
  },
};

// ─── Engine ───────────────────────────────────────────────────────────────────

const TICK_MS = 50;
const BOOK_LEVELS = 25;
const HISTORY_SIZE = 600; // 30s @ 50ms
const BASE_PRICE = 67432.5;
const BASE_DEPTH = 1.8; // base size per level

type Listener = (frame: Frame) => void;
type ControlsListener = (state: ControlsState) => void;

// Gaussian noise via Box-Muller
function gauss(): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// Poisson sample (small lambda, direct method)
function poisson(lambda: number): number {
  if (lambda <= 0) return 0;
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= Math.random();
  } while (p > L);
  return k - 1;
}

export class MarketEngine {
  private mid: number = BASE_PRICE;
  private lastMid: number = BASE_PRICE;
  private seq: number = 0;
  private scenarioT: number = 0;
  private scenario: Scenario = SCENARIOS.calm;
  private speed: number = 1;
  private playing: boolean = false;
  private history: Frame[] = [];
  private scrubIndex: number | null = null;
  private tradeSeq: number = 0;
  private listeners: Set<Listener> = new Set();
  private controlsListeners: Set<ControlsListener> = new Set();
  private rafId: number | null = null;
  private lastWallTime: number = 0;
  private tickAccumulator: number = 0;

  constructor() {
    // Pre-warm with 60 frames so the demo never shows an empty book
    for (let i = 0; i < 60; i++) this.stepTick();
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  play(): void {
    if (this.playing) return;
    // Exit scrub on play
    this.scrubIndex = null;
    this.playing = true;
    this.lastWallTime =
      typeof performance !== 'undefined' ? performance.now() : Date.now();
    this.loop();
    this.emitControls();
  }

  pause(): void {
    if (!this.playing) return;
    this.playing = false;
    if (this.rafId !== null && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.emitControls();
  }

  setSpeed(speed: number): void {
    this.speed = speed;
    this.emitControls();
  }

  setScenario(id: ScenarioId): void {
    this.scenario = SCENARIOS[id];
    this.scenarioT = 0;
    this.emitControls();
  }

  /**
   * Scrub to a specific history index. null = jump back to live.
   * Auto-pauses while scrubbing.
   */
  scrubTo(index: number | null): void {
    if (index === null) {
      this.scrubIndex = null;
      this.emitControls();
      // Emit live head to resync listeners
      const head = this.history[this.history.length - 1];
      if (head) this.emitFrame(head);
      return;
    }
    const clamped = Math.max(0, Math.min(this.history.length - 1, index));
    this.scrubIndex = clamped;
    if (this.playing) this.pause();
    const frame = this.history[clamped];
    if (frame) this.emitFrame(frame);
    this.emitControls();
  }

  /** Step forward one tick while paused (for frame-by-frame inspection) */
  stepForward(): void {
    if (this.scrubIndex !== null) {
      this.scrubTo(Math.min(this.history.length - 1, this.scrubIndex + 1));
    } else {
      this.stepTick();
      const head = this.history[this.history.length - 1];
      if (head) this.emitFrame(head);
    }
  }

  stepBackward(): void {
    const idx = this.scrubIndex ?? this.history.length - 1;
    this.scrubTo(Math.max(0, idx - 1));
  }

  /** Subscribe to frame updates. Returns unsubscribe. */
  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    // Immediately emit current frame so new subscribers see state
    const head =
      this.scrubIndex !== null
        ? this.history[this.scrubIndex]
        : this.history[this.history.length - 1];
    if (head) fn(head);
    return () => this.listeners.delete(fn);
  }

  subscribeControls(fn: ControlsListener): () => void {
    this.controlsListeners.add(fn);
    fn(this.getControls());
    return () => this.controlsListeners.delete(fn);
  }

  getControls(): ControlsState {
    const head = this.history[this.history.length - 1];
    const current =
      this.scrubIndex !== null ? this.history[this.scrubIndex] : head;
    return {
      playing: this.playing,
      speed: this.speed,
      scenarioId: this.scenario.id,
      scrubIndex: this.scrubIndex,
      headSeq: head?.seq ?? 0,
      tailSeq: this.history[0]?.seq ?? 0,
      currentSeq: current?.seq ?? 0,
    };
  }

  getCurrentFrame(): Frame | null {
    if (this.scrubIndex !== null) return this.history[this.scrubIndex] ?? null;
    return this.history[this.history.length - 1] ?? null;
  }

  getHistorySize(): number {
    return this.history.length;
  }

  // ── Internals ──────────────────────────────────────────────────────────────

  private loop = (): void => {
    if (!this.playing) return;
    const now =
      typeof performance !== 'undefined' ? performance.now() : Date.now();
    const delta = now - this.lastWallTime;
    this.lastWallTime = now;
    this.tickAccumulator += delta * this.speed;

    // Cap to avoid spiral after tab resume
    if (this.tickAccumulator > 500) this.tickAccumulator = 500;

    while (this.tickAccumulator >= TICK_MS) {
      this.stepTick();
      this.tickAccumulator -= TICK_MS;
      const head = this.history[this.history.length - 1];
      if (head) this.emitFrame(head);
    }

    if (typeof requestAnimationFrame !== 'undefined') {
      this.rafId = requestAnimationFrame(this.loop);
    }
  };

  private stepTick(): void {
    // Scenario time advances; loop back with calm reset
    this.scenarioT += TICK_MS;
    if (this.scenarioT > this.scenario.durationMs) {
      this.scenarioT = 0;
    }

    const t = this.scenarioT;
    const s = this.scenario;

    // Update mid via GBM-ish step
    this.lastMid = this.mid;
    const drift = s.drift(t);
    const vol = s.vol(t);
    const shock = gauss() * vol;
    this.mid = this.mid * (1 + drift + shock);

    // Generate book around mid
    const spread = (s.spreadBps(t) / 10_000) * this.mid;
    const depthMul = s.depthMul(t);
    const asym = s.asymmetry(t);
    const book = this.buildBook(this.mid, spread, depthMul, asym);

    // Generate trades
    const rate = s.tradeRate(t);
    const bias = s.tradeBias(t);
    const trades = this.generateTrades(rate, bias, book);

    const direction: Direction =
      this.mid > this.lastMid + 0.001
        ? 'up'
        : this.mid < this.lastMid - 0.001
          ? 'down'
          : 'flat';

    this.seq += 1;
    const frame: Frame = {
      ts: this.seq * TICK_MS,
      mid: this.mid,
      book,
      trades,
      direction,
      seq: this.seq,
    };

    this.history.push(frame);
    if (this.history.length > HISTORY_SIZE) this.history.shift();
  }

  private buildBook(
    mid: number,
    spread: number,
    depthMul: number,
    asym: number,
  ): Book {
    const halfSpread = spread / 2;
    const bestBid = mid - halfSpread;
    const bestAsk = mid + halfSpread;

    // Tick size: roughly 0.5 for BTC, but keep it proportional
    const tick = Math.max(0.5, Math.round(mid * 0.00001 * 100) / 100);

    const bids: Level[] = [];
    const asks: Level[] = [];

    // Bid ladder
    for (let i = 0; i < BOOK_LEVELS; i++) {
      const price = bestBid - i * tick;
      // Exponential-ish decay with jitter
      const base = BASE_DEPTH * Math.exp(-i * 0.08) * (1 + asym);
      const jitter = 1 + (Math.random() - 0.5) * 0.3;
      const size = Math.max(0.01, base * depthMul * jitter);
      bids.push({ price: round2(price), size: round4(size) });
    }

    // Ask ladder
    for (let i = 0; i < BOOK_LEVELS; i++) {
      const price = bestAsk + i * tick;
      const base = BASE_DEPTH * Math.exp(-i * 0.08) * (1 - asym);
      const jitter = 1 + (Math.random() - 0.5) * 0.3;
      const size = Math.max(0.01, base * depthMul * jitter);
      asks.push({ price: round2(price), size: round4(size) });
    }

    return { bids, asks };
  }

  private generateTrades(rate: number, bias: number, book: Book): Trade[] {
    const n = poisson(rate);
    if (n === 0) return [];
    const out: Trade[] = [];
    for (let i = 0; i < n; i++) {
      const r = Math.random() * 2 - 1; // [-1, 1]
      const side: 'buy' | 'sell' = r < bias ? 'buy' : 'sell';
      const ladder = side === 'buy' ? book.asks : book.bids;
      // Prefer top-of-book; small chance to walk a level
      const levelIdx = Math.random() < 0.82 ? 0 : 1;
      const level = ladder[levelIdx] ?? ladder[0];
      if (!level) continue;
      const size = Math.max(
        0.001,
        round4(level.size * (0.05 + Math.random() * 0.4)),
      );
      this.tradeSeq += 1;
      out.push({
        id: `t${this.tradeSeq}`,
        ts: this.seq * TICK_MS,
        price: level.price,
        size,
        side,
      });
    }
    return out;
  }

  private emitFrame(frame: Frame): void {
    this.listeners.forEach((l) => l(frame));
  }

  private emitControls(): void {
    const state = this.getControls();
    this.controlsListeners.forEach((l) => l(state));
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function round4(n: number): number {
  return Math.round(n * 10_000) / 10_000;
}
