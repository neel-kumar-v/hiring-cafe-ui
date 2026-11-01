"use client";

import FilterPillBar from "@/components/search/FilterPillBar";
import ResultsHeaderBand from "@/components/search/ResultsMetaRow";
import { useSearchUI } from "@/contexts/SearchContext";
import { useCollapsibleHeight } from "@/hooks/useCollapsibleHeight";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface SearchSubHeaderProps {
  className?: string;
  headerSlot?: ReactNode;
  children?: ReactNode;
}

/**
 * The browse chrome under the top navbar (home + saved-search views):
 * filter pill ribbon and the counts/actions band.
 * Main search input is hosted in Navbar and not duplicated here.
 * When in 'talent-agent' mode, the filter pill ribbon is completely hidden.
 * Filter area sticks below the top navbar (top-16) without a bottom border (Feedback #5, #13).
 * ResultsHeaderBand is not sticky and scrolls with content without a bottom border.
 * Reduced horizontal chrome padding (Feedback #3).
 * Rendered on md+ only - mobile keeps its own compact band.
 */
export default function SearchSubHeader({ className, headerSlot, children }: SearchSubHeaderProps) {
  const liveJobCount = useQuery(api.jobs.count, {});
  const liveCompanyCount = useQuery(api.companies.count, {});
  const { searchMode } = useSearchUI();

  const isFiltersOpen = searchMode !== "talent-agent";
  const { contentRef, containerProps } = useCollapsibleHeight(isFiltersOpen);
  const hasCustomHeader = Boolean(headerSlot ?? children);

  return (
    <div className={cn("@container bg-background-header dark:bg-background", className)}>
      <div className="sticky top-16 z-30 bg-background-header dark:bg-background">
        {hasCustomHeader && <div>{headerSlot ?? children}</div>}
        <div {...containerProps}>
          <div
            ref={contentRef}
            className={cn(
              "transition-transform duration-300 ease-in-out motion-reduce:transition-none motion-reduce:transform-none",
              isFiltersOpen ? "translate-y-0" : "-translate-y-full"
            )}
            inert={!isFiltersOpen}
          >
            <div className="px-2 py-2.5">
              <FilterPillBar />
            </div>
          </div>
        </div>
      </div>
      <ResultsHeaderBand jobCount={liveJobCount ?? null} companyCount={liveCompanyCount ?? null} />
    </div>
  );
}
