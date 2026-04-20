"use client";

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type TransitionEvent,
} from "react";

const DURATION_MS = 300;

/**
 * Drives a height transition between 0 and content height (then "auto" when open).
 * Uses measured px heights so the transition reliably runs (unlike grid-template-rows).
 */
export function useCollapsibleHeight(open: boolean) {
  const contentRef = useRef<HTMLDivElement>(null);
  const prevOpen = useRef<boolean | undefined>(undefined);
  const [height, setHeight] = useState<number | "auto">(() => (open ? "auto" : 0));

  useLayoutEffect(() => {
    const node = contentRef.current;
    if (!node) return;

    if (prevOpen.current === undefined) {
      prevOpen.current = open;
      setHeight(open ? "auto" : 0);
      return;
    }

    if (prevOpen.current === open) {
      return;
    }

    prevOpen.current = open;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      setHeight(open ? "auto" : 0);
      return;
    }

    if (open) {
      const target = node.scrollHeight;
      setHeight(0);
      const id = requestAnimationFrame(() => setHeight(target));
      return () => cancelAnimationFrame(id);
    }

    const target = node.scrollHeight;
    setHeight(target);
    const id = requestAnimationFrame(() => setHeight(0));
    return () => cancelAnimationFrame(id);
  }, [open]);

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
      className: "overflow-hidden transition-[height] ease-in-out",
      style: containerStyle,
      onTransitionEnd,
    },
  } as const;
}
