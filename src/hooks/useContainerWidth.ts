"use client";

import type { JobBoardLayout } from "@/contexts/SearchContext";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { useIsMobile } from "./use-mobile";

// Shared ResizeObserver plumbing: reports the element's border-box width.
function useObservedWidth(ref: RefObject<HTMLElement | null>, onWidth: (width: number) => void): void {
  // The ref target can change without this hook unmounting (e.g. a component
  // swaps the wrapper it renders when a query resolves), so the ref object
  // alone is not enough to know when the observer needs to reconnect.
  //
  // Track the observed node in a ref — not React state. A useEffect with no
  // deps that called setState every commit was the Maximum update depth loop
  // at JobBoard: even a same-value bailout still scheduled updates in a tight
  // setState↔render cycle once width/layout consumers re-rendered.
  const observedElementRef = useRef<HTMLElement | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);

  // Keep the latest callback without re-subscribing the observer when a caller
  // passes a non-memoized function.
  const onWidthRef = useRef(onWidth);
  onWidthRef.current = onWidth;

  // After every commit, reconnect only when ref.current's identity changed.
  // No cleanup on this effect: React would otherwise disconnect the observer
  // before each re-run even when the element is unchanged.
  useLayoutEffect(() => {
    const element = ref.current;
    if (element === observedElementRef.current) return;

    observerRef.current?.disconnect();
    observerRef.current = null;
    observedElementRef.current = element;

    if (!element) return;

    const notify = (width: number) => onWidthRef.current(width);

    if (typeof ResizeObserver === "undefined") {
      notify(element.getBoundingClientRect().width);
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const borderBox = entry.borderBoxSize?.[0];
      notify(borderBox ? borderBox.inlineSize : entry.contentRect.width);
    });

    notify(element.getBoundingClientRect().width);
    observer.observe(element);
    observerRef.current = observer;
  });

  // Disconnect only on unmount.
  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
      observedElementRef.current = null;
    };
  }, []);
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
 * `@min-[width]:` variants used on the grid/loading classes. Capped at 4
 * columns — the board never goes wider than four across. */
export const JOB_GRID_COLUMN_THRESHOLDS = {
  2: 640,
  3: 1024,
  4: 1400,
} as const;

/** Maximum column count for the grid and waterfall (masonry) layouts. */
export const MAX_JOB_GRID_COLUMNS = 4;

/** Step list for `useQuantizedContainerWidth` on the job board container. */
export const JOB_GRID_WIDTH_STEPS: readonly number[] = [640, 1024, 1400];

/** Step list for `useQuantizedContainerWidth` on the search bar. */
export const SEARCH_BAR_COLLAPSE_STEPS: readonly number[] = [480, 680, 780];

export function getJobGridColumnsForWidth(width: number): number {
  if (width >= JOB_GRID_COLUMN_THRESHOLDS[4]) return MAX_JOB_GRID_COLUMNS;
  if (width >= JOB_GRID_COLUMN_THRESHOLDS[3]) return 3;
  if (width >= JOB_GRID_COLUMN_THRESHOLDS[2]) return 2;
  return 1;
}

/**
 * True when the results can only be shown as one column. The mobile shell
 * (below `md`, where `useIsMobile` says the sidebar is gone) counts even though
 * losing the sidebar frees enough width for two cards — the screen is still a
 * phone, so the board stays a list there.
 */
export function isOneColumnBoardWidth(containerWidth: number, isMobileShell: boolean): boolean {
  if (isMobileShell) return true;
  if (containerWidth > 0) return getJobGridColumnsForWidth(containerWidth) <= 1;
  // Width 0 means "not measured yet" (SSR / first paint): fall back to the viewport.
  return typeof window !== "undefined" && window.innerWidth < JOB_GRID_COLUMN_THRESHOLDS[2];
}

/** Board layout actually rendered: a one-column board always degrades to the list. */
export function resolveJobBoardLayout(isOneColumn: boolean, boardLayout: JobBoardLayout): JobBoardLayout {
  return isOneColumn ? "list" : boardLayout;
}

/**
 * Grid metrics for a job board container: how many card columns its measured
 * width fits, and whether the board is in the one-column/mobile state (which
 * forces the list layout and hides the Waterfall/Grid/List switch).
 */
export function useJobBoardColumns(ref: RefObject<HTMLElement | null>): { columns: number; isOneColumn: boolean } {
  const containerWidth = useQuantizedContainerWidth(ref, JOB_GRID_WIDTH_STEPS);
  const isMobileShell = useIsMobile();
  return { columns: getJobGridColumnsForWidth(containerWidth), isOneColumn: isOneColumnBoardWidth(containerWidth, isMobileShell) };
}
