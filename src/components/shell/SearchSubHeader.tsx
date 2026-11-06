"use client";

import FilterPillBar from "@/components/search/FilterPillBar";
import ResultsHeaderBand from "@/components/search/ResultsMetaRow";
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
 * The filter pill ribbon stays visible in both Talent Agent and Classic Search.
 * The filter ribbon scrolls with the page (no sticky chrome; Feedback #5, #13).
 * ResultsHeaderBand is not sticky either and scrolls with content without a bottom border.
 * Reduced horizontal chrome padding (Feedback #3).
 * Rendered on md+ only - mobile keeps its own compact band.
 */
export default function SearchSubHeader({ className, headerSlot, children }: SearchSubHeaderProps) {
  const liveJobCount = useQuery(api.jobs.count, {});
  const liveCompanyCount = useQuery(api.companies.count, {});
  const hasCustomHeader = Boolean(headerSlot ?? children);

  return (
    <div className={cn("@container bg-background-header dark:bg-background", className)}>
      {hasCustomHeader && <div>{headerSlot ?? children}</div>}
      <div className="px-4 py-2.5 transition-[padding] duration-500 ease-in-out lg:px-8">
        <FilterPillBar />
      </div>
      <ResultsHeaderBand jobCount={liveJobCount ?? null} companyCount={liveCompanyCount ?? null} />
    </div>
  );
}
