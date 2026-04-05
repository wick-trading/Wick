import { useRef, useEffect, useCallback, type RefObject } from 'react';

/**
 * Hook that syncs object/array properties to a Web Component ref.
 * React can't pass complex props to custom elements via JSX —
 * this hook bridges the gap.
 */
export function usePropertySync<T extends HTMLElement>(
  ref: RefObject<T | null>,
  props: Record<string, unknown>,
): void {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    for (const [key, value] of Object.entries(props)) {
      if (value !== undefined) {
        (el as unknown as Record<string, unknown>)[key] = value;
      }
    }
  }, [ref, ...Object.values(props)]);
}

/**
 * Hook that listens for a CustomEvent on a Web Component ref.
 */
export function useCustomEvent<T extends HTMLElement, D = unknown>(
  ref: RefObject<T | null>,
  eventName: string,
  handler?: (detail: D) => void,
): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const el = ref.current;
    if (!el || !handlerRef.current) return;

    const listener = (e: Event) => {
      handlerRef.current?.((e as CustomEvent<D>).detail);
    };

    el.addEventListener(eventName, listener);
    return () => el.removeEventListener(eventName, listener);
  }, [ref, eventName]);
}
