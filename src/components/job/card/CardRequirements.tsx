"use client";

import UniversalTooltip from "@/components/util/UniversalTooltip";
import { useCardPrefs } from "@/contexts/CardPrefsContext";
import { useIsomorphicLayoutEffect } from "@/hooks/use-isomorphic-layout-effect";
import { getExperienceInfo } from "@/lib/job-info";
import { cn } from "@/lib/utils";
import { FileChartColumnIncreasing, FileUser } from "lucide-react";
import { useRef, useState, type CSSProperties } from "react";

/** Lines of requirements visible before the card is hovered. */
const COLLAPSED_LINES = 2;
/** Ceiling for the hover state (the fixed `max-h-96` it replaces). */
const EXPANDED_CEILING_REM = 24;
/** Height of the soft band kept free below the text once the block is expanded. */
const FADE_BAND_REM = 1.25;

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
 * collapsed view fades its last line, the expanded view fades the empty band
 * that sits below the text, and a collapse fades the text out exactly as the
 * edge passes over it. Because the fade follows the geometry it needs no
 * hover toggle, so the collapse can never snap a mask on or off mid-animation.
 *
 * Attached only when the clamp genuinely clips content — a description that
 * fits entirely would otherwise get its last line darkened with nothing more
 * to reveal. The motion-reduce opt-out travels with the fade so it only
 * exists when a fade does.
 */
const VIGNETTE_CLASSES =
  "pointer-fine:[mask-image:linear-gradient(to_right,black_calc(100%_-_2rem),transparent_100%),linear-gradient(to_bottom,black_calc(100%_-_1lh),transparent_calc(100%_-_1lh))] pointer-fine:[-webkit-mask-image:linear-gradient(to_right,black_calc(100%_-_2rem),transparent_100%),linear-gradient(to_bottom,black_calc(100%_-_1lh),transparent_calc(100%_-_1lh))] pointer-fine:motion-reduce:[mask-image:none] pointer-fine:motion-reduce:[-webkit-mask-image:none]";

type LineBoxMetrics = {
  /** Height of the text without the trailing fade band, in px. */
  contentHeight: number;
  /** Height of the first `COLLAPSED_LINES` line boxes, in px. */
  collapsedHeight: number;
  /** Distance between two consecutive line boxes, in px. */
  lineHeight: number;
};

/**
 * Measures the line boxes of the requirements text.
 *
 * The text is rendered unclamped and read through a Range, so the clamp can
 * land exactly on a line boundary even when an experience badge — a taller
 * inline box — makes the first line taller than the line height.
 */
const measureLineBoxes = (content: HTMLElement): LineBoxMetrics => {
  const style = getComputedStyle(content);
  // The trailing band is layout, not text: measure the text itself so the
  // clamp test stays honest once the band is attached.
  const paddingBottom = parseFloat(style.paddingBottom) || 0;
  const contentHeight = content.offsetHeight - paddingBottom;

  const range = document.createRange();
  range.selectNodeContents(content);
  const rects = Array.from(range.getClientRects()).filter((rect) => rect.height > 0 && rect.width > 0);

  // Glyph boxes of the text lines share a height and sit one line height
  // apart; the badge is the taller inline box that shares the first line.
  const textNode = Array.from(content.childNodes)
    .reverse()
    .find((node) => node.nodeType === Node.TEXT_NODE);
  let glyphHeight = 0;
  let lineHeight = 0;
  if (textNode) {
    const textRange = document.createRange();
    textRange.selectNodeContents(textNode);
    const textRects = Array.from(textRange.getClientRects()).filter((rect) => rect.height > 0 && rect.width > 0);
    if (textRects.length > 0) {
      glyphHeight = textRects[0].height;
      lineHeight = textRects.length > 1 ? textRects[1].top - textRects[0].top : 0;
    }
  }
  if (!lineHeight) {
    const computed = parseFloat(style.lineHeight);
    lineHeight = Number.isFinite(computed) && computed > 0 ? computed : 0;
  }
  if (!lineHeight || !glyphHeight) {
    return { contentHeight, collapsedHeight: contentHeight, lineHeight: 0 };
  }

  // Group the rects into line boxes: a rect belongs to the current box when
  // it starts within half a line height of the box's first rect.
  const boxes: { top: number; bottom: number }[] = [];
  for (const rect of [...rects].sort((a, b) => a.top - b.top)) {
    const box = boxes[boxes.length - 1];
    if (box && rect.top - box.top <= lineHeight / 2) {
      box.bottom = Math.max(box.bottom, rect.bottom);
    } else {
      boxes.push({ top: rect.top, bottom: rect.bottom });
    }
  }

  // The line box is taller than its glyphs by half a leading on each side.
  const halfLeading = Math.max(0, (lineHeight - glyphHeight) / 2);
  const contentTop = content.getBoundingClientRect().top;
  const collapsedHeight = boxes.length > COLLAPSED_LINES ? boxes[COLLAPSED_LINES - 1].bottom + halfLeading - contentTop : contentHeight;
  return { contentHeight, collapsedHeight, lineHeight };
};

const CardRequirements = ({
  requirementsSummary,
  minIndustryAndRoleYoe,
  minManagementAndLeadershipYoe,
}: {
  requirementsSummary: string;
  minIndustryAndRoleYoe?: number | null;
  minManagementAndLeadershipYoe?: number | null;
}) => {
  const experienceInfo = getExperienceInfo(minIndustryAndRoleYoe, minManagementAndLeadershipYoe);
  const { prefs } = useCardPrefs();
  const hoverExpandDisabled = prefs.disableDescriptionHoverExpansion;
  const contentRef = useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = useState(false);
  const [collapsedMaxHeight, setCollapsedMaxHeight] = useState("2lh");
  const [expandedMaxHeight, setExpandedMaxHeight] = useState(`${EXPANDED_CEILING_REM}rem`);

  // The clamp is measured from the rendered text instead of being hard-coded
  // in rem: an experience badge is a taller inline box, so a fixed clamp
  // would shave the bottom off the second line. Observing the content element
  // (not the clamped wrapper) keeps hover expansions out of the loop; its
  // natural height only changes on rewrap, font load, or data swap, all of
  // which the ResizeObserver reports.
  useIsomorphicLayoutEffect(() => {
    const element = contentRef.current;
    if (!element || typeof ResizeObserver === "undefined") return;

    const check = () => {
      const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const { contentHeight, collapsedHeight, lineHeight } = measureLineBoxes(element);

      setOverflows(contentHeight > collapsedHeight);
      setCollapsedMaxHeight(`${collapsedHeight}px`);

      // Expand to the text's own height (plus the band that keeps the fade
      // below it) instead of a fixed ceiling. Animating to a ceiling that is
      // far taller than the text spends most of the transition on empty space
      // and dumps the whole shrink-back into the last few frames, which reads
      // as a stepped collapse. Targeting the measured height keeps the whole
      // transition on visible text, so the shrink-back is one continuous
      // motion.
      const fadeBandPx = Math.max(FADE_BAND_REM * rootFontSize, lineHeight);
      const expandedPx = Math.min(contentHeight + fadeBandPx, EXPANDED_CEILING_REM * rootFontSize);
      const next = `${Math.max(expandedPx, collapsedHeight)}px`;
      setExpandedMaxHeight((previous) => (previous === next ? previous : next));
    };

    check();
    const observer = new ResizeObserver(check);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={cn(
        // The clamp is measured from the text (`2lh` is the pre-measurement
        // fallback); the wrapper carries the text's own metrics so `lh` means
        // the same thing here as it does inside the text. When the
        // "Disable hover expansion — Description" pref is on, the block stays
        // clamped at its rest height (no hover class, no fade vignette), so
        // the visible lines stay fully readable.
        "pointer-fine:max-h-[var(--requirements-collapsed-max-h,2lh)] pointer-fine:motion-reduce:max-h-none overflow-hidden transition-[max-height] duration-[750ms] ease-in-out pointer-coarse:max-h-none pointer-none:max-h-none text-xs leading-normal",
        !hoverExpandDisabled && "pointer-fine:group-hover/card:max-h-[var(--requirements-expanded-max-h)]",
        overflows && !hoverExpandDisabled && VIGNETTE_CLASSES
      )}
      style={
        {
          "--requirements-collapsed-max-h": collapsedMaxHeight,
          "--requirements-expanded-max-h": expandedMaxHeight,
        } as CSSProperties
      }
    >
      <div
        ref={contentRef}
        className={cn(
          "cursor-text text-foreground/80 text-xs leading-normal dark:text-foreground/80",
          // Trailing band: keeps the fade below the text once the block is
          // expanded (so the last line stays readable) while adding no space
          // to blocks that are not clipped in the first place.
          overflows && !hoverExpandDisabled && "pointer-fine:motion-safe:pb-[max(1.25rem,1lh)]"
        )}
      >
        {experienceInfo.hasAny && (
          <>
            {experienceInfo.industryBadge && experienceInfo.leadershipBadge ? (
              <>
                <UniversalTooltip content={experienceInfo.industryTooltip!}>
                  <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-muted-foreground text-xs dark:bg-secondary dark:text-foreground/80 mr-2">
                    <FileChartColumnIncreasing className="w-3 h-3" />
                    {experienceInfo.industryBadge}
                  </span>
                </UniversalTooltip>
                <UniversalTooltip content={experienceInfo.leadershipTooltip!}>
                  <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-muted-foreground text-xs dark:bg-secondary dark:text-foreground/80 mr-2">
                    <FileUser className="w-3 h-3" />
                    {experienceInfo.leadershipBadge}
                  </span>
                </UniversalTooltip>
              </>
            ) : (
              <>
                {experienceInfo.industryBadge && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-muted-foreground text-xs dark:bg-secondary dark:text-foreground/80 mr-2">
                    <FileChartColumnIncreasing className="w-3 h-3" />
                    {experienceInfo.industryBadge}
                  </span>
                )}
                {experienceInfo.leadershipBadge && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-muted-foreground text-xs dark:bg-secondary dark:text-foreground/80 mr-2">
                    <FileUser className="w-3 h-3" />
                    {experienceInfo.leadershipBadge}
                  </span>
                )}
              </>
            )}
          </>
        )}
        {requirementsSummary}
      </div>
    </div>
  );
};

export default CardRequirements;
