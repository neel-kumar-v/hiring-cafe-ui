import { type RefObject, useEffect, useRef } from "react";

interface ScrollRefs {
  [key: string]: RefObject<HTMLDivElement | null>;
}

const MIN_DURATION_MS = 140;
const MAX_DURATION_MS = 400;
/** Animation speed in px/ms; duration = distance / speed, clamped between the min/max above. */
const SPEED_PX_PER_MS = 2.6;

const easeOutCubic = (progress: number) => 1 - (1 - progress) ** 3;

type ScrollAnimation = { cancel: () => void };

/** One active scroll animation per viewport element, so starting a new one cancels the previous. */
const activeAnimations = new WeakMap<HTMLElement, ScrollAnimation>();

/** Nearest ancestor whose overflow-y actually scrolls. */
function findScrollViewport(element: HTMLElement): HTMLElement | null {
  for (let node: HTMLElement | null = element.parentElement; node; node = node.parentElement) {
    const overflowY = getComputedStyle(node).overflowY;
    if (overflowY === "auto" || overflowY === "scroll") return node;
  }
  return null;
}

/**
 * Absolute scrollTop that aligns `target` (plus its scroll margin) to the viewport start. Re-measured
 * live every frame so layout growth during the move cannot derail the landing.
 */
function measureAlignedTop(viewport: HTMLElement, target: HTMLElement, marginTop: number): number {
  if (!target.isConnected) return viewport.scrollTop; // target unmounted mid-flight: hold position, animation ends
  const delta = target.getBoundingClientRect().top - marginTop - viewport.getBoundingClientRect().top;
  const maxTop = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
  return Math.max(0, Math.min(viewport.scrollTop + delta, maxTop));
}

/**
 * Light rAF "chase" animation: interpolates scrollTop with ease-out while re-measuring the
 * destination every frame. Per frame it does one rect read and one scroll write — no React state in
 * the loop. Interrupted instantly by any user input or by a newer programmatic scroll.
 */
function chaseScroll(viewport: HTMLElement, resolveTop: () => number): void {
  activeAnimations.get(viewport)?.cancel();

  const startTop = viewport.scrollTop;
  const distance = Math.abs(resolveTop() - startTop);
  if (distance < 1) return;
  const duration = Math.max(MIN_DURATION_MS, Math.min(MAX_DURATION_MS, distance / SPEED_PX_PER_MS));
  const startTime = performance.now();

  let frameId: number | null = null;
  let stopped = false;
  const inputListenerOptions = { capture: true, passive: true } as const;

  const animation: ScrollAnimation = {
    cancel: () => {
      if (stopped) return;
      stopped = true;
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
        frameId = null;
      }
      stopInputListeners();
      if (activeAnimations.get(viewport) === animation) activeAnimations.delete(viewport);
    },
  };

  const cancelOnInput = () => animation.cancel();
  const stopInputListeners = () => {
    window.removeEventListener("wheel", cancelOnInput, inputListenerOptions);
    window.removeEventListener("touchstart", cancelOnInput, inputListenerOptions);
    window.removeEventListener("keydown", cancelOnInput, inputListenerOptions);
    window.removeEventListener("pointerdown", cancelOnInput, inputListenerOptions);
  };

  const step = () => {
    frameId = null;
    if (stopped) return;
    const progress = Math.min(1, (performance.now() - startTime) / duration);
    const desired = resolveTop();
    viewport.scrollTo({ top: startTop + (desired - startTop) * easeOutCubic(progress), behavior: "instant" });
    if (progress >= 1) {
      animation.cancel();
      return;
    }
    frameId = requestAnimationFrame(step);
  };

  window.addEventListener("wheel", cancelOnInput, inputListenerOptions);
  window.addEventListener("touchstart", cancelOnInput, inputListenerOptions);
  window.addEventListener("keydown", cancelOnInput, inputListenerOptions);
  window.addEventListener("pointerdown", cancelOnInput, inputListenerOptions);
  activeAnimations.set(viewport, animation);
  frameId = requestAnimationFrame(step);
}

/**
 * Scrolls the nearest scrollable container so `target` lands at its start (honoring scroll-margin).
 * Unlike scrollIntoView it only moves the intended container, not every ancestor scroller.
 *
 * Jank strategy: native smooth scrolling across `[content-visibility: auto]` sections stutters badly —
 * each skipped section materializes mid-animation and layout shifts underneath the viewport. Long
 * jumps therefore hop instantly to just past the target in a single layout pass, then ease the short
 * remaining tail with the chase animation, which re-measures the target every frame and lands exactly
 * on it even while lazy content keeps expanding.
 */
export function scrollSectionIntoView(target: HTMLElement): void {
  if (!target.isConnected || typeof window === "undefined") return;

  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  const viewport = findScrollViewport(target);

  if (!viewport) {
    target.scrollIntoView({ block: "start", behavior: reducedMotion ? "instant" : "smooth" });
    return;
  }

  const marginTop = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
  const resolveTop = () => measureAlignedTop(viewport, target, marginTop);
  const desired = resolveTop();
  if (Math.abs(desired - viewport.scrollTop) < 1) return;

  if (reducedMotion) {
    activeAnimations.get(viewport)?.cancel();
    viewport.scrollTo({ top: desired, behavior: "instant" });
    return;
  }

  if (Math.abs(desired - viewport.scrollTop) > viewport.clientHeight) {
    // Phase 1 — instant hop so pending/lazy layout between here and the target materializes in one
    // synchronous pass instead of stuttering frame by frame during the animation.
    activeAnimations.get(viewport)?.cancel();
    const maxTop = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
    const hopTop = desired > viewport.scrollTop ? desired - viewport.clientHeight : desired + viewport.clientHeight;
    viewport.scrollTo({ top: Math.max(0, Math.min(hopTop, maxTop)), behavior: "instant" });
  }
  // Phase 2 — ease the remaining (less than one viewport) distance exactly onto the target.
  chaseScroll(viewport, resolveTop);
}

export function useScrollToSection(scrollToSection?: string, refs?: ScrollRefs, onComplete?: () => void) {
  // Mirror refs through a ref so the scroll effect below depends only on the section id (refs may be
  // recreated by callers on every render; the mirror always points at the latest ones at effect time).
  const refsRef = useRef(refs);
  useEffect(() => {
    refsRef.current = refs;
  });

  useEffect(() => {
    if (!scrollToSection) return;
    const target = refsRef.current?.[scrollToSection]?.current;
    if (!target) return;
    scrollSectionIntoView(target);
    onComplete?.();
  }, [onComplete, scrollToSection]);
}

export function createRefs<T extends string>(keys: T[]): Record<T, RefObject<HTMLDivElement | null>> {
  // Plain ref objects are valid React refs; hook-free so this stays callable outside components.
  const refs = {} as Record<T, RefObject<HTMLDivElement | null>>;
  keys.forEach((key) => {
    refs[key] = { current: null };
  });
  return refs;
}
