"use client";

import { useIsomorphicLayoutEffect } from "@/hooks/use-isomorphic-layout-effect";
import { useState, type RefObject } from "react";

/**
 * The fade is a horizontal vignette that trails the last visible line: it is
 * solid at the left edge of the block and turns transparent as it travels
 * right, so the text stays fully readable while the line dissolves towards
 * the right edge the way a normal right-edge scroll fade does. It is built
 * from two mask layers — a horizontal ramp and a one-line band — which the
 * default `add` compositing unions: the ramp only survives inside the band,
 * so the fade never touches the lines above it.
 *
 * The band is anchored to the bottom edge of the *box* rather than of the
 * text, so it travels with the box while the block grows and shrinks: the
 * collapsed view fades its last line, an expanded view fades the empty band
 * that sits below the text, and a collapse fades the text out exactly as the
 * edge passes over it. Because the fade follows the geometry it needs no
 * hover toggle, so the collapse can never snap a mask on or off mid-animation.
 *
 * Pointer-agnostic on purpose: a touch device never expands, so the fade is
 * the only cue that the block continues past its clamp.
 */
export const LAST_LINE_FADE_CLASSES =
  "[mask-image:linear-gradient(to_right,black_calc(100%_-_2rem),transparent_100%),linear-gradient(to_bottom,black_calc(100%_-_1lh),transparent_calc(100%_-_1lh))] [-webkit-mask-image:linear-gradient(to_right,black_calc(100%_-_2rem),transparent_100%),linear-gradient(to_bottom,black_calc(100%_-_1lh),transparent_calc(100%_-_1lh))]";

/**
 * Drops {@link LAST_LINE_FADE_CLASSES} again for mouse users who turned hover
 * expansion off: their block can never grow, so a fade would promise text it
 * will not hand over. Touch keeps the fade — it has no hover to give up. The
 * `!` matters: it wins over the unprefixed layer of the pair above whatever
 * order the two arbitrary properties land in the stylesheet.
 */
export const LAST_LINE_FADE_OFF_FOR_FINE_POINTERS = "pointer-fine:[mask-image:none]! pointer-fine:[-webkit-mask-image:none]!";

export type LineBoxMetrics = {
  /** Height of the text without the trailing fade band, in px. */
  contentHeight: number;
  /** Height of the first `lines` line boxes, in px. */
  collapsedHeight: number;
  /** Distance between two consecutive line boxes, in px. */
  lineHeight: number;
  /** Root font size in px, so callers can do rem math against the block. */
  rootFontSize: number;
};

/**
 * Measures the line boxes of a block of text.
 *
 * The text is rendered unclamped and read through a Range, so the clamp can
 * land exactly on a line boundary even when a taller inline box (an
 * experience badge, a bold name span) makes one line taller than the rest.
 */
const measureLineBoxes = (content: HTMLElement, lines: number): LineBoxMetrics => {
  const style = getComputedStyle(content);
  // A trailing band is layout, not text: measure the text itself so the
  // clamp test stays honest once the band is attached.
  const paddingBottom = parseFloat(style.paddingBottom) || 0;
  const contentHeight = content.offsetHeight - paddingBottom;
  const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;

  const range = document.createRange();
  range.selectNodeContents(content);
  const rects = Array.from(range.getClientRects()).filter((rect) => rect.height > 0 && rect.width > 0);
  if (rects.length === 0) {
    return { contentHeight, collapsedHeight: contentHeight, lineHeight: 0, rootFontSize };
  }

  // Grouping needs a line height before the boxes exist; the computed one is
  // exact whenever the leading is explicit (which every caller sets).
  const computed = parseFloat(style.lineHeight);
  const bootstrapLineHeight = Number.isFinite(computed) && computed > 0 ? computed : Math.max(...rects.map((rect) => rect.height));

  // Group the rects into line boxes: a rect belongs to the current box when
  // it starts within half a line height of the box's first rect.
  const boxes: { top: number; bottom: number }[] = [];
  for (const rect of [...rects].sort((a, b) => a.top - b.top)) {
    const box = boxes[boxes.length - 1];
    if (box && rect.top - box.top <= bootstrapLineHeight / 2) {
      box.bottom = Math.max(box.bottom, rect.bottom);
    } else {
      boxes.push({ top: rect.top, bottom: rect.bottom });
    }
  }

  // The clean line advance is the smallest gap between two box tops: a taller
  // inline box on one line pushes that line's top up, so its own gap is the
  // outlier, never the smallest one.
  let lineHeight = 0;
  for (let index = 1; index < boxes.length; index += 1) {
    const gap = boxes[index].top - boxes[index - 1].top;
    if (gap > 0 && (!lineHeight || gap < lineHeight)) lineHeight = gap;
  }
  if (!lineHeight) lineHeight = bootstrapLineHeight;

  if (boxes.length <= lines) {
    return { contentHeight, collapsedHeight: contentHeight, lineHeight, rootFontSize };
  }

  // The shortest box is a plain line of glyphs; the line box is taller than
  // its glyphs by half a leading on each side.
  const glyphHeight = Math.min(...boxes.map((box) => box.bottom - box.top));
  const halfLeading = Math.max(0, (lineHeight - glyphHeight) / 2);
  const contentTop = content.getBoundingClientRect().top;
  const collapsedHeight = boxes[lines - 1].bottom + halfLeading - contentTop;
  return { contentHeight, collapsedHeight, lineHeight, rootFontSize };
};

export type LastLineClamp = LineBoxMetrics & {
  /** True once the block has been measured. */
  measured: boolean;
  /** True when the text runs past `lines` line boxes, i.e. the clamp clips. */
  overflows: boolean;
};

/**
 * Clamps a block of text to `lines` line boxes and reports whether that clamp
 * actually clips anything, so the caller only paints the fade over text that
 * continues. Pass a ref to the *content* element — the one that holds the text
 * and keeps its natural height — not to the clamped wrapper, so hover
 * expansions never re-enter the measurement loop; its height only changes on
 * rewrap, font load, or data swap, all of which the ResizeObserver reports.
 */
export const useLastLineClamp = (contentRef: RefObject<HTMLElement | null>, lines = 2): LastLineClamp => {
  const [metrics, setMetrics] = useState<LineBoxMetrics | null>(null);

  useIsomorphicLayoutEffect(() => {
    const element = contentRef.current;
    if (!element || typeof ResizeObserver === "undefined") return;

    const check = () => {
      const next = measureLineBoxes(element, lines);
      setMetrics((previous) =>
        previous &&
        previous.contentHeight === next.contentHeight &&
        previous.collapsedHeight === next.collapsedHeight &&
        previous.lineHeight === next.lineHeight &&
        previous.rootFontSize === next.rootFontSize
          ? previous
          : next
      );
    };

    check();
    const observer = new ResizeObserver(check);
    observer.observe(element);
    return () => observer.disconnect();
  }, [contentRef, lines]);

  const measured = metrics !== null;
  return {
    contentHeight: metrics?.contentHeight ?? 0,
    collapsedHeight: metrics?.collapsedHeight ?? 0,
    lineHeight: metrics?.lineHeight ?? 0,
    rootFontSize: metrics?.rootFontSize ?? 16,
    measured,
    overflows: measured && metrics.contentHeight > metrics.collapsedHeight,
  };
};
