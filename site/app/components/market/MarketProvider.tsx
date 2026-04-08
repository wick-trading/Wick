'use client';

/**
 * MarketProvider — owns the singleton MarketEngine and exposes hooks.
 *
 * All live components on a page share ONE engine instance. That's what
 * makes the docs feel alive: every component is watching the same tape.
 *
 * SSR-safe: engine is created lazily in useEffect on mount.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import {
  MarketEngine,
  type Book,
  type ControlsState,
  type Frame,
  type ScenarioId,
  type Trade,
} from '../../lib/market-engine';

interface MarketContextValue {
  engine: MarketEngine;
}

const MarketContext = createContext<MarketContextValue | null>(null);

interface MarketProviderProps {
  children: ReactNode;
  /** Auto-play on mount (default true) */
  autoPlay?: boolean;
  /** Initial scenario (default 'calm') */
  initialScenario?: ScenarioId;
}

export function MarketProvider({
  children,
  autoPlay = true,
  initialScenario = 'calm',
}: MarketProviderProps) {
  const engineRef = useRef<MarketEngine | null>(null);

  // Lazy init — only on client
  if (engineRef.current === null && typeof window !== 'undefined') {
    engineRef.current = new MarketEngine();
    engineRef.current.setScenario(initialScenario);
  }

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    if (autoPlay) engine.play();
    return () => engine.pause();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({ engine: engineRef.current as MarketEngine }),
    [],
  );

  // During SSR or first render without window, render children without provider
  if (!engineRef.current) {
    return <>{children}</>;
  }

  return (
    <MarketContext.Provider value={value}>{children}</MarketContext.Provider>
  );
}

function useEngine(): MarketEngine | null {
  const ctx = useContext(MarketContext);
  return ctx?.engine ?? null;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

/**
 * Subscribe to the full frame stream. Returns the latest Frame, or null before mount.
 * Use this if you need everything at once. Otherwise prefer the narrower hooks.
 */
export function useMarketFrame(): Frame | null {
  const engine = useEngine();
  const [frame, setFrame] = useState<Frame | null>(
    () => engine?.getCurrentFrame() ?? null,
  );

  useEffect(() => {
    if (!engine) return;
    return engine.subscribe((f) => setFrame(f));
  }, [engine]);

  return frame;
}

/**
 * Just the price tick. Lighter than useMarketFrame for components that
 * only need mid + direction (price ticker, pulse bar).
 */
export function useMarketTick(): {
  mid: number;
  direction: 'up' | 'down' | 'flat';
  seq: number;
} | null {
  const engine = useEngine();
  const [tick, setTick] = useState<{
    mid: number;
    direction: 'up' | 'down' | 'flat';
    seq: number;
  } | null>(() => {
    const f = engine?.getCurrentFrame();
    return f ? { mid: f.mid, direction: f.direction, seq: f.seq } : null;
  });

  useEffect(() => {
    if (!engine) return;
    return engine.subscribe((f) => {
      setTick({ mid: f.mid, direction: f.direction, seq: f.seq });
    });
  }, [engine]);

  return tick;
}

/**
 * Just the order book snapshot.
 */
export function useMarketBook(): Book | null {
  const engine = useEngine();
  const [book, setBook] = useState<Book | null>(
    () => engine?.getCurrentFrame()?.book ?? null,
  );

  useEffect(() => {
    if (!engine) return;
    return engine.subscribe((f) => setBook(f.book));
  }, [engine]);

  return book;
}

/**
 * Rolling buffer of the most recent trades. Accumulates across ticks up to `max`.
 * Resets when scrubbing.
 */
export function useMarketTrades(max = 30): Trade[] {
  const engine = useEngine();
  const [trades, setTrades] = useState<Trade[]>([]);
  const lastSeqRef = useRef<number>(-1);

  useEffect(() => {
    if (!engine) return;
    lastSeqRef.current = -1;
    return engine.subscribe((f) => {
      // If we jumped backward (scrubbing), reset the buffer
      if (f.seq < lastSeqRef.current) {
        setTrades(f.trades.slice(-max));
      } else if (f.trades.length > 0) {
        setTrades((prev) => {
          const merged = [...f.trades, ...prev];
          return merged.slice(0, max);
        });
      }
      lastSeqRef.current = f.seq;
    });
  }, [engine, max]);

  return trades;
}

/**
 * Controls state + actions.
 */
export function useMarketControls(): {
  state: ControlsState | null;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  setSpeed: (speed: number) => void;
  setScenario: (id: ScenarioId) => void;
  scrubTo: (index: number | null) => void;
  stepForward: () => void;
  stepBackward: () => void;
} {
  const engine = useEngine();

  const subscribe = useCallback(
    (cb: () => void) => {
      if (!engine) return () => {};
      return engine.subscribeControls(() => cb());
    },
    [engine],
  );

  const getSnapshot = useCallback(
    () => engine?.getControls() ?? null,
    [engine],
  );

  const getServerSnapshot = useCallback(() => null, []);

  const state = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  return {
    state,
    play: useCallback(() => engine?.play(), [engine]),
    pause: useCallback(() => engine?.pause(), [engine]),
    toggle: useCallback(() => {
      if (!engine) return;
      if (engine.getControls().playing) engine.pause();
      else engine.play();
    }, [engine]),
    setSpeed: useCallback((s: number) => engine?.setSpeed(s), [engine]),
    setScenario: useCallback(
      (id: ScenarioId) => engine?.setScenario(id),
      [engine],
    ),
    scrubTo: useCallback(
      (i: number | null) => engine?.scrubTo(i),
      [engine],
    ),
    stepForward: useCallback(() => engine?.stepForward(), [engine]),
    stepBackward: useCallback(() => engine?.stepBackward(), [engine]),
  };
}
