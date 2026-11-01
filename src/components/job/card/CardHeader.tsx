import { getCleanJobTitle, getCompensation, getLocations } from "@/lib/job-info";
import { CompensationRange } from "@/types/job";
import { DollarSign, MapPin } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";

const chipClass = "bg-secondary text-foreground/80 rounded-md px-2 py-0.5 text-xs";

/** Matches the `max-h-6` collapsed clamp below. */
const COLLAPSED_REM = 1.5;
/** Ceiling for the hover state (the fixed `max-h-36` it replaces). */
const EXPANDED_CEILING_REM = 9;

const CardHeader = ({
  jobTitle,
  companyName,
  workplaceCities,
  commitments,
  workType,
  compensation,
  tools,
}: {
  jobTitle: string;
  companyName: string;
  workplaceCities: string[];
  commitments: string[];
  workType: string;
  compensation: CompensationRange;
  tools: string[];
}) => {
  const locationForTitle = workplaceCities.length > 0 ? workplaceCities[0] : "";

  const locations = getLocations(workplaceCities);
  const salaryLabel = getCompensation(compensation);
  const workTypeTrimmed = workType.trim();

  const locationsRef = useRef<HTMLDivElement>(null);
  const [locationsMaxHeight, setLocationsMaxHeight] = useState(`${EXPANDED_CEILING_REM}rem`);

  // Stable identity for the effect below: `locations` is rebuilt on every
  // render, the joined value only changes when the chips actually change.
  const locationsKey = locations.join("\u0000");

  useEffect(() => {
    const element = locationsRef.current;
    if (!element || typeof ResizeObserver === "undefined") return;

    let disposed = false;
    let lastWidth = -1;

    const measure = () => {
      if (disposed) return;
      const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      // The row is height-clamped, so its own box size says nothing about the
      // content; `scrollHeight` still reports the full wrapped height.
      const contentHeight = element.scrollHeight;
      // Expand to the chips' own height instead of a fixed ceiling: animating
      // to a ceiling that is far taller than the chips spends most of the
      // transition on empty space and dumps the whole shrink-back into the
      // last few frames, which reads as a stepped collapse. Targeting the
      // measured height keeps the whole transition on visible chips, so the
      // shrink-back is one continuous motion.
      const expandedPx = Math.min(contentHeight + 1, EXPANDED_CEILING_REM * rootFontSize);
      const next = `${Math.max(expandedPx, COLLAPSED_REM * rootFontSize)}px`;
      setLocationsMaxHeight((previous) => (previous === next ? previous : next));
    };

    lastWidth = element.getBoundingClientRect().width;
    measure();

    const observer = new ResizeObserver(() => {
      // Only the width matters: the chips wrap by width, while the height of
      // the clamped row changes on every frame of the hover transition.
      const width = element.getBoundingClientRect().width;
      if (width === lastWidth) return;
      lastWidth = width;
      measure();
    });
    observer.observe(element);

    // Webfonts load asynchronously and change how the chips wrap; re-measure
    // once the glyphs are in.
    document.fonts?.ready.then(() => measure());

    return () => {
      disposed = true;
      observer.disconnect();
    };
  }, [locationsKey]);

  return (
    <div className="mb-3 space-y-2">
      <div className="flex flex-row items-start justify-between gap-2">
        {/* Type scale follows the card's own width (container query), so a card
            in a narrow column or the mobile shell still reads correctly. */}
        <div className="line-clamp-2 min-w-0 flex-1 text-base font-semibold text-foreground @min-[360px]/card:text-lg">
          {getCleanJobTitle(jobTitle, companyName, locationForTitle, tools)}
        </div>
        {/* <div className="-translate-y-0.5 flex shrink-0 items-center space-x-1">
          {skillMatchComponent}
        </div> */}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="text-muted-foreground flex flex-wrap items-center gap-1 text-xs">
          {locations.length > 0 && (
            <div
              ref={locationsRef}
              style={{ "--card-locations-expanded-max-h": locationsMaxHeight } as CSSProperties}
              className="pointer-fine:max-h-6 pointer-fine:group-hover/card:max-h-[var(--card-locations-expanded-max-h)] pointer-fine:motion-reduce:max-h-full pointer-coarse:max-h-none pointer-none:max-h-none flex max-h-full flex-row flex-wrap items-center gap-1 overflow-hidden transition-[max-height] duration-[750ms] ease-in-out"
            >
              {locations.map((loc, index) => (
                <span key={index} className={`flex items-center gap-1 ${chipClass}`}>
                  <MapPin className="h-3 w-3 shrink-0" />
                  {loc}
                </span>
              ))}
            </div>
          )}
          {salaryLabel ? (
            <div className="flex flex-wrap">
              <span className="bg-primary/20 text-foreground flex items-center gap-1 rounded-md px-2 py-0.5 text-xs">
                <DollarSign className="h-3 w-3 shrink-0" />
                {salaryLabel}
              </span>
            </div>
          ) : null}
          {commitments.map((commitment, index) => (
            <span key={`c-${index}`} className={chipClass}>
              {commitment}
            </span>
          ))}
          {workTypeTrimmed ? <span className={chipClass}>{workTypeTrimmed}</span> : null}
        </div>
      </div>
    </div>
  );
};

export default CardHeader;
