"use client";

import UniversalTooltip from "@/components/util/UniversalTooltip";
import { useCardPrefs } from "@/contexts/CardPrefsContext";
import { getExperienceInfo } from "@/lib/job-info";
import { cn } from "@/lib/utils";
import { FileChartColumnIncreasing, FileUser } from "lucide-react";
import { useRef, type CSSProperties } from "react";
import { LAST_LINE_FADE_CLASSES, LAST_LINE_FADE_OFF_FOR_FINE_POINTERS, useLastLineClamp } from "./lastLineClamp";

/** Lines of requirements visible before the card is hovered. */
const COLLAPSED_LINES = 2;
/** Ceiling for the hover state (the fixed `max-h-96` it replaces). */
const EXPANDED_CEILING_REM = 24;
/** Height of the soft band kept free below the text once the block is expanded. */
const FADE_BAND_REM = 1.25;

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
  // The clamp is measured from the rendered text instead of being hard-coded
  // in rem: an experience badge is a taller inline box, so a fixed clamp
  // would shave the bottom off the second line. Every pointer type rests at
  // the same two lines — a phone has no hover to expand with, so the whole
  // description must not leak out there.
  const { contentHeight, collapsedHeight, lineHeight, rootFontSize, measured, overflows } = useLastLineClamp(contentRef, COLLAPSED_LINES);
  const collapsedMaxHeight = measured ? `${collapsedHeight}px` : `${COLLAPSED_LINES}lh`;

  // Expand to the text's own height (plus the band that keeps the fade below
  // it) instead of a fixed ceiling. Animating to a ceiling that is far taller
  // than the text spends most of the transition on empty space and dumps the
  // whole shrink-back into the last few frames, which reads as a stepped
  // collapse. Targeting the measured height keeps the whole transition on
  // visible text, so the shrink-back is one continuous motion.
  const fadeBandPx = Math.max(FADE_BAND_REM * rootFontSize, lineHeight);
  const expandedPx = Math.min(contentHeight + fadeBandPx, EXPANDED_CEILING_REM * rootFontSize);
  const expandedMaxHeight = measured ? `${Math.max(expandedPx, collapsedHeight)}px` : `${EXPANDED_CEILING_REM}rem`;

  return (
    <div
      className={cn(
        // The clamp is measured from the text (`2lh` is the pre-measurement
        // fallback); the wrapper carries the text's own metrics so `lh` means
        // the same thing here as it does inside the text. Only a fine pointer
        // can grow the block on hover, so touch (coarse or none) stays put at
        // the two collapsed lines. When the "Disable hover expansion —
        // Description" pref is on, nothing can grow the block for a mouse
        // either, so the fade is dropped for that pointer alone — the phone
        // still needs it to show the description continues.
        "max-h-[var(--requirements-collapsed-max-h,2lh)] overflow-hidden text-xs leading-normal transition-[max-height] duration-[350ms] ease-out motion-reduce:transition-none",
        !hoverExpandDisabled && "pointer-fine:group-hover/card:max-h-[var(--requirements-expanded-max-h)]",
        overflows && LAST_LINE_FADE_CLASSES,
        overflows && hoverExpandDisabled && LAST_LINE_FADE_OFF_FOR_FINE_POINTERS
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
