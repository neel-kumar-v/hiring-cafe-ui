"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

// Shared ResizeObserver plumbing: reports the element's border-box width.
function useObservedWidth(ref: RefObject<HTMLElement | null>, onWidth: (width: number) => void): void {
  // The ref target can change without this hook unmounting (e.g. a component
  // swaps the wrapper it renders when a query resolves), so the ref object
  // alone is not enough to know when the observer needs to reconnect.
  const [observedElement, setObservedElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    setObservedElement((previous) => (previous === element ? previous : element));
  });

  // Keep the latest callback without re-subscribing the observer when a caller
  // passes a non-memoized function.
  const onWidthRef = useRef(onWidth);
  onWidthRef.current = onWidth;

  useEffect(() => {
    if (!observedElement) return;
    const notify = (width: number) => onWidthRef.current(width);

    if (typeof ResizeObserver === "undefined") {
      notify(observedElement.getBoundingClientRect().width);
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const borderBox = entry.borderBoxSize?.[0];
      notify(borderBox ? borderBox.inlineSize : entry.contentRect.width);
    });

    notify(observedElement.getBoundingClientRect().width);
    observer.observe(observedElement);
    return () => observer.disconnect();
  }, [observedElement]);
}

/**
 * Measures an element's border-box width with a ResizeObserver. Returns 0 until
 * mounted (and whenever the element is absent), so SSR stays safe and callers
 * can treat 0 as "unknown".
 */
export function useContainerWidth(ref: RefObject<HTMLElement | null>): number {
  const [width, setWidth] = useState(0);
  const onWidth = useCallback((borderBoxWidth: number) => {
    setWidth((previous) => (previous === borderBoxWidth ? previous : borderBoxWidth));
  }, []);
  useObservedWidth(ref, onWidth);
  return width;
}

/**
 * Width snapped to the given ascending breakpoints. Below the first breakpoint
 * the raw width is reported (fine-grained); at or above it, the width is the
 * highest breakpoint that fits. Resize observers fire on every pixel of a
 * drag-resize, so consumers that only care about step changes (grid column
 * counts, collapse toggles) use this to avoid re-rendering per frame — the
 * state update is skipped until the width actually crosses a breakpoint.
 */
export function useQuantizedContainerWidth(ref: RefObject<HTMLElement | null>, steps: readonly number[]): number {
  const [width, setWidth] = useState(0);
  const quantize = useCallback(
    (raw: number) => {
      let snapped = raw;
      for (const step of steps) {
        if (step > raw) break;
        snapped = step;
      }
      return snapped;
    },
    [steps]
  );
  const onQuantizedWidth = useCallback(
    (borderBoxWidth: number) => {
      const next = quantize(borderBoxWidth);
      setWidth((previous) => (previous === next ? previous : next));
    },
    [quantize]
  );
  useObservedWidth(ref, onQuantizedWidth);
  return width;
}

/** Container-width thresholds for the job cards grid; keep in sync with the
 * `@min-[width]:` variants used on the grid/loading classes. */
export const JOB_GRID_COLUMN_THRESHOLDS = {
  2: 640,
  3: 1024,
  4: 1400,
  5: 1800,
} as const;

/** Step list for `useQuantizedContainerWidth` on the job board container. */
export const JOB_GRID_WIDTH_STEPS: readonly number[] = [640, 1024, 1400, 1800];

/** Step list for `useQuantizedContainerWidth` on the search bar. */
export const SEARCH_BAR_COLLAPSE_STEPS: readonly number[] = [480, 680, 780];

export function getJobGridColumnsForWidth(width: number): number {
  if (width >= JOB_GRID_COLUMN_THRESHOLDS[5]) return 5;
  if (width >= JOB_GRID_COLUMN_THRESHOLDS[4]) return 4;
  if (width >= JOB_GRID_COLUMN_THRESHOLDS[3]) return 3;
  if (width >= JOB_GRID_COLUMN_THRESHOLDS[2]) return 2;
  return 1;
}
