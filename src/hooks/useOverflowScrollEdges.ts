"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

export type OverflowEdges = { start: boolean; end: boolean };

const EDGE_PX = 14;

/**
 * Track which horizontal edges of a scroll container actually hide overflowing
 * content (`start` = left, `end` = right). Both false when everything fits.
 * Same behavior as `AgentPromptQuote` in SavedSearches.tsx.
 */
export function useOverflowScrollEdges<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [edges, setEdges] = useState<OverflowEdges>({ start: false, end: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frameId: number | null = null;

    const updateEdges = () => {
      const maxScrollLeft = el.scrollWidth - el.clientWidth;
      if (maxScrollLeft <= 1) {
        setEdges((prev) => (prev.start || prev.end ? { start: false, end: false } : prev));
        return;
      }
      const start = el.scrollLeft > 1;
      const end = el.scrollLeft < maxScrollLeft - 1;
      setEdges((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
    };

    updateEdges();

    const onScroll = () => {
      if (frameId !== null) return;
      frameId = requestAnimationFrame(() => {
        frameId = null;
        updateEdges();
      });
    };

    const resizeObserver = new ResizeObserver(updateEdges);
    resizeObserver.observe(el);
    el.addEventListener("scroll", onScroll, { passive: true });
    // Content changes (chips/cards added or removed) can change scrollWidth
    // without resizing the container itself.
    const mutationObserver = new MutationObserver(updateEdges);
    mutationObserver.observe(el, { childList: true, subtree: true, characterData: true });

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      el.removeEventListener("scroll", onScroll);
      if (frameId !== null) cancelAnimationFrame(frameId);
    };
  }, []);

  return { ref, edges };
}

/**
 * Edge-fade mask matching `ChatRowTitle` in ChatPanel.tsx (14px fade).
 * Only the edge that currently hides content fades; `undefined` (no mask)
 * when nothing overflows or both edges are visible.
 */
export function overflowEdgeMaskStyle(edges: OverflowEdges): CSSProperties | undefined {
  if (!edges.start && !edges.end) return undefined;
  let gradient: string;
  if (edges.start && edges.end) {
    gradient = `linear-gradient(to right, transparent 0, black ${EDGE_PX}px, black calc(100% - ${EDGE_PX}px), transparent 100%)`;
  } else if (edges.start) {
    gradient = `linear-gradient(to right, transparent 0, black ${EDGE_PX}px, black 100%)`;
  } else {
    gradient = `linear-gradient(to right, black calc(100% - ${EDGE_PX}px), transparent 100%)`;
  }
  return { maskImage: gradient, WebkitMaskImage: gradient };
}
