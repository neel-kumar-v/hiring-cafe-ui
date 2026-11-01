"use client";

import { formatTool } from "@/lib/job-info";
import { cn } from "@/lib/utils";
import { useApp } from "@/contexts/AppContext";
import { countWrapRows, getNaturalTextWidth } from "@/lib/pretext-text";
import { isAnyJobCardHovered, isJobCardHoverSettled, markElementHoveredIfHovered, onJobCardHoverSettled } from "@/lib/jobs/cardHoverTracker";
import { useMemo, useRef, useState, useEffect, type CSSProperties, type MouseEvent as ReactMouseEvent } from "react";
import { Check } from "lucide-react";

/** Text measurement per frame via @chenglou/pretext instead of DOM reflow:
 * `prepare(text, font)` snapshots glyph widths once per (text, font) pair and
 * is cached in `@/lib/pretext-text`; the chip-wrap estimate below is pure JS,
 * so sidebar/chat drag frames stop forcing per-card `scrollHeight` text
 * measurement — the DOM is asked for truth only when the wrap estimate says
 * the row layout changed (or is unknown). */

interface CardTechnicalToolsProps {
  technicalTools: string[];
  variant?: "card" | "dialog";
}

const TWO_LINES_MAX_PX = 68; // 4.25rem = 68px
const LINE_HEIGHT_PX = 32; // ~26px chip + 6px gap
const CHIP_GAP_PX = 6; // gap-1.5 between chips
const CHIP_FIXED_PX = 22; // px-2.5 = 10+10 horizontal padding + 1px borders
const MATCHED_ICON_PX = 16; // matched chips add a size-3 icon (12) + gap-1 (4)

const CardTechnicalTools = ({ technicalTools, variant = "card" }: CardTechnicalToolsProps) => {
  const { user, addSkill, removeSkill } = useApp();
  const tools = technicalTools ?? [];
  const chipsRef = useRef<HTMLDivElement>(null);
  const [restMaxHeight, setRestMaxHeight] = useState<string | null>(null);
  const [restVisibleHeight, setRestVisibleHeight] = useState<number | null>(null);
  const [expandedHeight, setExpandedHeight] = useState<string | null>(null);

  const skillMatchInfo = useMemo(() => {
    const normalizeSkill = (skill: string) =>
      skill
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();

    const normalizedUserSkills = user.skills.map(normalizeSkill);

    return tools.map((tool) => {
      const normalizedTool = normalizeSkill(tool);
      return {
        original: tool,
        normalized: normalizedTool,
        isMatched: normalizedUserSkills.includes(normalizedTool),
      };
    });
  }, [user.skills, tools]);

  // Live access inside the measurement effect without re-subscribing it.
  const skillMatchInfoRef = useRef(skillMatchInfo);
  skillMatchInfoRef.current = skillMatchInfo;

  const handleSkillClick = (e: ReactMouseEvent, skillInfo: { original: string; isMatched: boolean }) => {
    e.stopPropagation();
    e.preventDefault();

    if (skillInfo.isMatched) {
      removeSkill(skillInfo.original);
    } else {
      addSkill(skillInfo.original);
    }
  };

  useEffect(() => {
    if (variant === "dialog") return;
    const chipsEl = chipsRef.current;
    if (!chipsEl) return;

    const card = chipsEl.closest('[data-job-card="true"]') as HTMLElement | null;
    if (!card) return;

    // The pointer may already be inside this card before any pointer event
    // reached the shared tracker; seed it so sibling measurements treat the
    // shared row as hover-transient too.
    markElementHoveredIfHovered(card);

    let rafId: number | null = null;
    let disposed = false;

    // Computed font string for the chip labels, captured once per mount (not
    // per measure tick) so the pretext cache stays valid across cards.
    let chipFont = "";
    const firstChip = chipsEl.querySelector<HTMLButtonElement>(":scope > button");
    if (firstChip) {
      const cs = getComputedStyle(firstChip);
      chipFont = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    }

    let chipsWidth = 0; // chips container width, from its ResizeObserver entry
    let fullScrollHeight = -1; // last DOM-verified full stack height (-1 = unverified)
    let simRowsAtTruth = -1; // wrap-row estimate at the time DOM truth was captured
    let simRows = 0; // rows the current pretext estimate predicts

    // Pretext-estimated chip widths + greedy wrap, mirroring the flex layout:
    // shrink-0 nowrap chips packed with `gap-1.5`. Pure JS — no DOM reads.
    const estimateRows = () => {
      if (!chipFont || !(chipsWidth > 0)) return 0;
      const itemWidths = skillMatchInfoRef.current.map((info) => {
        const text = formatTool(info.original);
        return getNaturalTextWidth(text, chipFont) + CHIP_FIXED_PX + (info.isMatched ? MATCHED_ICON_PX : 0);
      });
      return countWrapRows(itemWidths, chipsWidth, CHIP_GAP_PX);
    };

    const apply = (next: string, visibleHeight: number) => {
      setRestMaxHeight((previous) => (previous === next ? previous : next));
      setRestVisibleHeight((previous) => (previous === visibleHeight ? previous : visibleHeight));
      const expanded = `${fullScrollHeight}px`;
      setExpandedHeight((previous) => (previous === expanded ? previous : expanded));
    };

    // `definitive` ticks are scheduled deliberately (board just settled after a
    // hover burst, fonts just re-verified) and may ignore a late settle window;
    // observer ticks must come from fully settled, resting layout only.
    const measure = (definitive = false) => {
      if (disposed) return;
      // Avoid re-measuring while user is actively hovering over the card
      if (card.matches(":hover")) return;

      // Cascade guard (ratchet fix): grid rows are shared, so a sibling's
      // hover-driven expansion stretches this card too — measuring that
      // transient stretch would raise the resting clamp and permanently unlock
      // more chips across the row ("one card expands → siblings show more →
      // nothing goes back because the siblings now prop the row up"). The row
      // also keeps collapsing for ~750ms after the pointer leaves the cards,
      // so observer ticks during that settle window are transient as well.
      // Definitive ticks bypass the settle window so resting clamps get
      // re-committed from resting geometry (and any hover-driven excess
      // un-unlocks).
      if (isAnyJobCardHovered()) return;
      if (!definitive && !isJobCardHoverSettled()) return;

      // DOM truth only when the wrap estimate is unknown or changed; every
      // other tick reuses the verified stack height (cache). The stack height
      // only depends on the row count, so an estimate-stable tick can never
      // have changed it.
      simRows = estimateRows();
      const canTrustEstimate = simRows > 0 && fullScrollHeight >= 0 && simRows === simRowsAtTruth;
      if (!canTrustEstimate) {
        fullScrollHeight = chipsEl.scrollHeight;
        simRowsAtTruth = simRows;
      }

      // If chips don't exceed standard 2 lines, no clamp needed
      if (fullScrollHeight <= TWO_LINES_MAX_PX) {
        apply(`${TWO_LINES_MAX_PX}px`, fullScrollHeight);
        return;
      }

      const footer = card.querySelector('[data-card-footer="true"]') as HTMLElement | null;
      if (!footer) {
        apply("4.25rem", TWO_LINES_MAX_PX);
        return;
      }

      const footerRect = footer.getBoundingClientRect();
      const chipsRect = chipsEl.getBoundingClientRect();

      // Vertical room available between top of chips and footer (leaving a 12px margin for card padding/spacing)
      const availableSpace = Math.floor(footerRect.top - chipsRect.top - 12);

      // Nuance #23: If the card already has leftover vertical space, show more skill chips.
      // Only apply the 2-line clamp when content would otherwise overflow the card.
      if (availableSpace > TWO_LINES_MAX_PX) {
        if (fullScrollHeight <= availableSpace) {
          // All chips fit comfortably within the leftover room
          apply(`${fullScrollHeight}px`, fullScrollHeight);
        } else {
          // Snap allowed height to full lines of chips to avoid cutting chips in half
          const lines = Math.max(2, Math.floor((availableSpace - 2) / LINE_HEIGHT_PX));
          const allowedPx = lines * LINE_HEIGHT_PX + 4;
          apply(`${allowedPx}px`, allowedPx);
        }
      } else {
        // No leftover space in card; enforce 2-line clamp at rest
        apply("4.25rem", TWO_LINES_MAX_PX);
      }
    };

    measure();

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === chipsEl) {
          const borderBox = entry.borderBoxSize?.[0];
          chipsWidth = borderBox ? borderBox.inlineSize : entry.contentRect.width;
        }
      }
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => measure());
    });

    observer.observe(card);
    observer.observe(chipsEl);

    // Webfonts load asynchronously and invalidate the cached glyph widths;
    // re-verify the DOM truth once fonts are ready.
    document.fonts?.ready.then(() => {
      if (disposed) return;
      fullScrollHeight = -1;
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => measure(true));
    });

    // Re-commit the resting clamp once the board has been free of hover long
    // enough for the hover expansions/row growth to fully collapse. This is
    // what lets extra chips "go back": any decision that was (or would have
    // been) derived from a sibling's transient stretch gets re-derived here
    // from rest geometry.
    const unsubscribeSettle = onJobCardHoverSettled(() => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => measure(true));
    });

    return () => {
      disposed = true;
      if (rafId !== null) cancelAnimationFrame(rafId);
      observer.disconnect();
      unsubscribeSettle();
    };
  }, [variant, tools]);

  if (!tools.length) return null;

  const isDialog = variant === "dialog";

  // The hover expansion may only run once a measurement has committed AND it
  // would actually reveal more chips than the resting clamp shows. Without
  // this gate a card that mounts under the pointer (measure() bails while the
  // card matches ":hover") keeps the old "20rem" fallback and expands the
  // strip on hover to reveal nothing but empty space below the chips.
  const expandable =
    expandedHeight !== null &&
    restVisibleHeight !== null &&
    parseFloat(expandedHeight) > restVisibleHeight + 1;

  const chipBaseClass = isDialog
    ? "inline-flex items-center gap-1.5 shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium leading-normal select-none whitespace-nowrap transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    : "inline-flex items-center gap-1 shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium leading-normal min-h-[1.625rem] select-none whitespace-nowrap transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1";

  const unmatchedClass = "border-border/60 bg-transparent text-muted-foreground hover:border-border hover:bg-muted/60 hover:text-foreground";

  const matchedClass = "border-primary/25 bg-primary/10 text-primary hover:bg-primary/15 hover:border-primary/40";

  const chips = skillMatchInfo.map((skillInfo, skillIndex) => {
    const isMatched = skillInfo.isMatched;
    const actionLabel = isMatched ? `Remove ${skillInfo.original} from your skills` : `Add ${skillInfo.original} to your skills`;

    return (
      <button
        key={`${skillInfo.original}-${skillIndex}`}
        type="button"
        aria-pressed={isMatched}
        aria-label={actionLabel}
        title={actionLabel}
        className={cn(chipBaseClass, isMatched ? matchedClass : unmatchedClass)}
        onClick={(e) => handleSkillClick(e, skillInfo)}
      >
        {isMatched ? <Check className={cn(isDialog ? "size-3.5" : "size-3", "shrink-0")} aria-hidden="true" /> : null}
        <span className="leading-normal">{formatTool(skillInfo.original)}</span>
      </button>
    );
  });

  if (isDialog) {
    return <div className="flex flex-wrap gap-2">{chips}</div>;
  }

  return (
    <div className="mb-0.5 min-w-0 overflow-visible">
      {/*
        The chips are absolutely positioned, so the wrapper owns the space the
        strip occupies in the card layout. It has to grow with the expanded
        chip stack on hover: otherwise the revealed chips spill out of the
        strip and land on top of the card footer. Growing the wrapper pushes
        the footer down and lets the card grow with it (the card height is
        driven by its content), so the expanded strip stays inside the card.
      */}
      <div
        className={cn(
          "relative min-w-0 transition-[height] duration-[350ms] ease-out motion-reduce:transition-none pointer-coarse:h-auto pointer-none:h-auto",
          expandable
            ? "h-[var(--skills-rest-height)] pointer-fine:group-hover/card:h-[var(--skills-expanded-height)]"
            : "h-auto"
        )}
        style={
          expandable
            ? ({
                "--skills-rest-height": `${restVisibleHeight ?? TWO_LINES_MAX_PX}px`,
                "--skills-expanded-height": expandedHeight,
              } as CSSProperties)
            : undefined
        }
      >
        <div
          ref={chipsRef}
          style={
            {
              "--skills-rest-max-h": restMaxHeight || "4.25rem",
            } as CSSProperties
          }
          className={cn(
            // The strip must sit directly on the card: a filled panel (or the
            // shadow that fakes one) reads as a grey box around the chips.
            "scrollbar-none flex min-w-0 max-w-full flex-wrap gap-1.5 rounded-md bg-transparent py-1 overflow-hidden transition-[max-height] duration-[350ms] ease-out motion-reduce:transition-none pointer-coarse:static pointer-coarse:max-h-none pointer-none:static pointer-none:max-h-none",
            "pointer-fine:max-h-[var(--skills-rest-max-h)]",
            expandable
              ? "absolute top-0 right-0 left-0 z-10 pointer-fine:group-hover/card:max-h-[var(--skills-expanded-height)]"
              : "relative"
          )}
        >
          {chips}
        </div>
      </div>
    </div>
  );
};

export default CardTechnicalTools;
