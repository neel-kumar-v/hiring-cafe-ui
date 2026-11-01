"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

function readStoredWidth(key: string, fallback: number, min: number, max: number): number {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.min(max, Math.max(min, parsed));
  } catch {
    return fallback;
  }
}

export interface UseResizableWidthOptions {
  storageKey: string;
  defaultWidth: number;
  min: number;
  max: number;
  /** Stable callback that maps a width to DOM writes; receives "start" | "drag" | "end". */
  applyLiveWidth?: (width: number, phase: "start" | "drag" | "end") => void;
  /** Whether the target panel is currently collapsed (e.g. icon ribbon mode). */
  collapsed?: boolean;
  /** Fixed width in px when collapsed (e.g. 56 for ribbon). If omitted, collapsible dragging is disabled. */
  collapsedWidth?: number;
  /** Distance in px dragged right from collapsed handle to trigger expansion (default: 20). */
  expandThreshold?: number;
  /** Width in px below which dragging left collapses the panel (default: (min + collapsedWidth) / 2). */
  collapseThreshold?: number;
  /** Callback fired when drag crosses expand threshold into full mode. */
  onExpand?: () => void;
  /** Callback fired when drag crosses collapse threshold into ribbon mode. */
  onCollapse?: () => void;
}

export interface StartResizeOptions {
  edge?: "left" | "right";
  collapsed?: boolean;
  collapsedWidth?: number;
  expandThreshold?: number;
  collapseThreshold?: number;
  onExpand?: () => void;
  onCollapse?: () => void;
}

/**
 * Pixel width with drag-to-resize + localStorage persistence. Used for fixed
 * side rails where PanelGroup would break window-scroll layout.
 *
 * Drag hot path: `pointermove` never re-renders when `applyLiveWidth` is supplied.
 * Each move records the live width; a single `requestAnimationFrame` per frame
 * applies it via the `applyLiveWidth` callback (direct DOM writes of the rail width
 * and `--shell-*` CSS variables). React state and localStorage are written once,
 * on `pointerup`/`pointercancel`, so a drag costs minimal style writes per frame
 * instead of a full AppShell re-render plus board reflow.
 *
 * Supports optional drag-to-expand / drag-to-collapse when `collapsedWidth` is supplied.
 */
export function useResizableWidth({
  storageKey,
  defaultWidth,
  min,
  max,
  applyLiveWidth,
  collapsed,
  collapsedWidth,
  expandThreshold = 20,
  collapseThreshold,
  onExpand,
  onCollapse,
}: UseResizableWidthOptions) {
  const [width, setWidth] = useState(() => readStoredWidth(storageKey, defaultWidth, min, max));
  const [isDragging, setIsDragging] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);
  const frameRef = useRef<number | null>(null);
  const liveWidthRef = useRef<number>(width);

  const widthRef = useRef(width);
  widthRef.current = width;

  const lastExpandedWidthRef = useRef(width);
  if (width >= min) {
    lastExpandedWidthRef.current = width;
  }

  const optionsRef = useRef({
    storageKey,
    defaultWidth,
    min,
    max,
    applyLiveWidth,
    collapsed,
    collapsedWidth,
    expandThreshold,
    collapseThreshold: collapseThreshold ?? (min + (collapsedWidth ?? 0)) / 2,
    onExpand,
    onCollapse,
  });
  optionsRef.current = {
    storageKey,
    defaultWidth,
    min,
    max,
    applyLiveWidth,
    collapsed,
    collapsedWidth,
    expandThreshold,
    collapseThreshold: collapseThreshold ?? (min + (collapsedWidth ?? 0)) / 2,
    onExpand,
    onCollapse,
  };

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, String(width));
    } catch {
      // ignore
    }
  }, [storageKey, width]);

  useEffect(
    () => () => {
      const cleanup = cleanupRef.current;
      if (cleanup) cleanup();
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    },
    []
  );

  const startResize = useCallback((event: ReactPointerEvent, resizeOptions: StartResizeOptions = {}) => {
    event.preventDefault();
    cleanupRef.current?.();
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    const edge = resizeOptions.edge ?? "right";
    const opts = optionsRef.current;

    const isCollapsible = resizeOptions.collapsedWidth !== undefined || opts.collapsedWidth !== undefined;
    const cWidth = resizeOptions.collapsedWidth ?? opts.collapsedWidth ?? 0;
    const initialCollapsed = Boolean(resizeOptions.collapsed !== undefined ? resizeOptions.collapsed : opts.collapsed);
    const expThresh = resizeOptions.expandThreshold ?? opts.expandThreshold;
    const colThresh = resizeOptions.collapseThreshold ?? opts.collapseThreshold;

    const handleExpand = resizeOptions.onExpand ?? opts.onExpand;
    const handleCollapse = resizeOptions.onCollapse ?? opts.onCollapse;

    const startX = event.clientX;
    const startWidth = initialCollapsed ? cWidth : widthRef.current;
    const initialExpandedWidth = Math.max(opts.min, lastExpandedWidthRef.current || opts.defaultWidth);

    let isCurrentlyCollapsed = initialCollapsed;
    let currentDragWidth = initialCollapsed ? opts.min : initialExpandedWidth;
    let lastProjectedWidth = startWidth;

    liveWidthRef.current = startWidth;
    opts.applyLiveWidth?.(startWidth, "start");
    setIsDragging(true);

    const scheduleFrame = () => {
      if (frameRef.current !== null) return;
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = null;
        if (opts.applyLiveWidth) {
          opts.applyLiveWidth(liveWidthRef.current, "drag");
        } else {
          setWidth(liveWidthRef.current);
        }
      });
    };

    const onMove = (moveEvent: PointerEvent) => {
      const delta = edge === "right" ? moveEvent.clientX - startX : startX - moveEvent.clientX;
      const projectedWidth = startWidth + delta;
      lastProjectedWidth = projectedWidth;

      if (!isCollapsible) {
        liveWidthRef.current = Math.min(opts.max, Math.max(opts.min, projectedWidth));
        scheduleFrame();
        return;
      }

      if (initialCollapsed) {
        const expandThresholdWidth = startWidth + expThresh;
        if (!isCurrentlyCollapsed) {
          if (projectedWidth < expandThresholdWidth) {
            isCurrentlyCollapsed = true;
            handleCollapse?.();
            liveWidthRef.current = cWidth;
            scheduleFrame();
          } else if (projectedWidth >= opts.min) {
            currentDragWidth = Math.min(opts.max, projectedWidth);
            liveWidthRef.current = currentDragWidth;
            scheduleFrame();
          } else {
            currentDragWidth = opts.min;
            liveWidthRef.current = opts.min;
            scheduleFrame();
          }
        } else {
          if (projectedWidth >= expandThresholdWidth) {
            isCurrentlyCollapsed = false;
            handleExpand?.();
            if (projectedWidth >= opts.min) {
              currentDragWidth = Math.min(opts.max, projectedWidth);
              liveWidthRef.current = currentDragWidth;
            } else {
              currentDragWidth = opts.min;
              liveWidthRef.current = opts.min;
            }
            scheduleFrame();
          }
        }
      } else {
        if (!isCurrentlyCollapsed) {
          if (projectedWidth < colThresh) {
            isCurrentlyCollapsed = true;
            handleCollapse?.();
            liveWidthRef.current = cWidth;
            scheduleFrame();
          } else if (projectedWidth < opts.min) {
            currentDragWidth = opts.min;
            liveWidthRef.current = opts.min;
            scheduleFrame();
          } else {
            currentDragWidth = Math.min(opts.max, projectedWidth);
            liveWidthRef.current = currentDragWidth;
            scheduleFrame();
          }
        } else {
          if (projectedWidth >= colThresh) {
            isCurrentlyCollapsed = false;
            handleExpand?.();
            if (projectedWidth >= opts.min) {
              currentDragWidth = Math.min(opts.max, projectedWidth);
              liveWidthRef.current = currentDragWidth;
            } else {
              currentDragWidth = opts.min;
              liveWidthRef.current = opts.min;
            }
            scheduleFrame();
          }
        }
      }
    };

    const cleanup = () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", cleanup);
      document.removeEventListener("pointercancel", cleanup);
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      setIsDragging(false);

      if (isCollapsible) {
        if (isCurrentlyCollapsed) {
          handleCollapse?.();
          opts.applyLiveWidth?.(cWidth, "end");
          setWidth(initialExpandedWidth);
          try {
            localStorage.setItem(opts.storageKey, String(initialExpandedWidth));
          } catch {
            // ignore
          }
        } else {
          handleExpand?.();
          let finalWidth: number;
          if (initialCollapsed) {
            if (lastProjectedWidth < opts.min) {
              finalWidth = initialExpandedWidth;
            } else {
              finalWidth = Math.min(opts.max, Math.max(opts.min, currentDragWidth));
            }
          } else {
            finalWidth = Math.min(opts.max, Math.max(opts.min, currentDragWidth));
          }
          opts.applyLiveWidth?.(finalWidth, "end");
          setWidth(finalWidth);
          lastExpandedWidthRef.current = finalWidth;
          try {
            localStorage.setItem(opts.storageKey, String(finalWidth));
          } catch {
            // ignore
          }
        }
      } else {
        opts.applyLiveWidth?.(liveWidthRef.current, "end");
        setWidth(liveWidthRef.current);
      }

      document.body.style.removeProperty("cursor");
      document.body.style.removeProperty("user-select");
      if (cleanupRef.current === cleanup) cleanupRef.current = null;
    };

    cleanupRef.current = cleanup;

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", cleanup);
    document.addEventListener("pointercancel", cleanup);
  }, []);

  return { width, setWidth, startResize, isDragging, min, max };
}
