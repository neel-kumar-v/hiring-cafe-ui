"use client";

import { cn } from "@/lib/utils";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type TransitionEvent } from "react";

const DURATION_MS = 300;

/**
 * Drives a height transition between 0 and content height (then "auto" when open).
 * Uses measured px heights so the transition reliably runs (unlike grid-template-rows).
 */
export function useCollapsibleHeight(open: boolean) {
  const contentRef = useRef<HTMLDivElement>(null);
  const prevOpen = useRef<boolean>(open);
  const [hasMounted, setHasMounted] = useState(false);
  const [height, setHeight] = useState<number | "auto">(open ? "auto" : 0);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!hasMounted) return;

    const node = contentRef.current;
    if (!node) return;

    if (prevOpen.current === open) {
      return;
    }

    prevOpen.current = open;

    const prefersReduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      setHeight(open ? "auto" : 0);
      return;
    }

    if (open) {
      const parent = node.parentElement;
      const currentHeight = parent ? parent.getBoundingClientRect().height : 0;
      const target = node.scrollHeight;
      setHeight(currentHeight);
      const id = requestAnimationFrame(() => setHeight(target));
      return () => cancelAnimationFrame(id);
    }

    const parent = node.parentElement;
    const currentHeight = parent ? parent.getBoundingClientRect().height : node.scrollHeight;
    setHeight(currentHeight);
    const id = requestAnimationFrame(() => setHeight(0));
    return () => cancelAnimationFrame(id);
  }, [hasMounted, open]);

  const onTransitionEnd = useCallback(
    (event: TransitionEvent<HTMLDivElement>) => {
      if (event.propertyName !== "height") return;
      if (open) setHeight("auto");
    },
    [open]
  );

  const containerStyle: CSSProperties = {
    transitionDuration: `${DURATION_MS}ms`,
    ...(height === "auto" ? {} : { height }),
  };

  return {
    contentRef,
    containerProps: {
      className: cn("transition-[height] ease-in-out", height !== "auto" ? "overflow-hidden" : "overflow-visible"),
      style: containerStyle,
      onTransitionEnd,
    },
  } as const;
}
