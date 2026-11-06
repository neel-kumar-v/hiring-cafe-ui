"use client";

import { useApp } from "@/contexts/AppContext";
import { useSearchUI } from "@/contexts/SearchContext";
import { filters } from "@/data/search-filters";
import { initialSearchState } from "@/lib/edited-filters";
import { getFilterChips } from "@/lib/search/filter-chips";
import { overflowEdgeMaskStyle, useOverflowScrollEdges } from "@/hooks/useOverflowScrollEdges";
import { cn } from "@/lib/utils";
import type { SearchState } from "@/types/search";
import { useMemo } from "react";

export interface CategoryChipDef {
  label: string;
  categoryType: string;
  fromId: string;
}

/** Matches `filterGroupOrder` in search-filters (General has no pill). */
export const CATEGORY_CHIPS: CategoryChipDef[] = [
  { label: "Compensation", categoryType: "compensation", fromId: "compensation" },
  { label: "Requirements", categoryType: "qualifications", fromId: "qualifications" },
  { label: "Location", categoryType: "location", fromId: "location" },
  { label: "Role", categoryType: "role-department", fromId: "role-department" },
  { label: "Availability", categoryType: "availability", fromId: "availability" },
  { label: "Company", categoryType: "company", fromId: "company" },
];

export function getCategoryCounts(searchOptions: SearchState, initialState: SearchState = initialSearchState): Record<string, number> {
  const filterIdToType = new Map<string, string>();
  for (const filter of filters) {
    filterIdToType.set(filter.id, filter.type);
  }

  const selectedChips = getFilterChips(searchOptions, initialState);
  const counts: Record<string, number> = {};
  for (const chip of selectedChips) {
    const type = filterIdToType.get(chip.categoryId);
    if (type) {
      counts[type] = (counts[type] || 0) + 1;
    }
  }
  return counts;
}

export function getCategoryActiveCount(categoryType: string, searchOptions: SearchState, initialState: SearchState = initialSearchState): number {
  return getCategoryCounts(searchOptions, initialState)[categoryType] ?? 0;
}

export function CountChip({ count, className }: { count: number; className?: string }) {
  const isActive = count > 0;
  return (
    <span
      className={cn(
        "inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold leading-none",
        isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
        className
      )}
    >
      {count}
    </span>
  );
}

export default function FilterPillBar({ className }: { className?: string }) {
  const { searchOptions } = useApp();
  const { handleSearchIconClick, searchBarShowsLocation, searchBarShowsSalary } = useSearchUI();
  // Compensation and Location already live as search-bar segments when those
  // flags are set (mobile always; desktop only while the bar is wide enough).
  // Keep the pills while the segments are off screen.
  const visibleChips = useMemo(
    () =>
      CATEGORY_CHIPS.filter((chip) => {
        if (chip.fromId === "location" && searchBarShowsLocation) return false;
        if (chip.fromId === "compensation" && searchBarShowsSalary) return false;
        return true;
      }),
    [searchBarShowsLocation, searchBarShowsSalary]
  );

  const categoryCounts = useMemo(() => {
    return getCategoryCounts(searchOptions, initialSearchState);
  }, [searchOptions]);

  /**
   * Category chips deep-link into the existing search filters dialog/drawer
   * for that category (`fromId`: compensation, location, …).
   */
  const handleChipClick = (event: React.MouseEvent<HTMLButtonElement>, fromId: string) => {
    // Ancestors (job cards/list rows) must not treat this as a card click and open job details.
    event.stopPropagation();
    handleSearchIconClick(fromId);
  };

  // Mobile scroller vignette: only the edge that actually hides overflowing
  // pills fades. On desktop the row wraps (no overflow), so the mask stays off
  // and vertical/wrapped content is never faded.
  const { ref: scrollRef, edges } = useOverflowScrollEdges<HTMLDivElement>();

  return (
    <div
      ref={scrollRef}
      style={overflowEdgeMaskStyle(edges)}
      className={cn(
        "@container/pills flex flex-wrap items-center gap-1.5 @min-[720px]/pills:gap-2",
        // Mobile: one horizontally scrolling row — never wrap (desktop keeps wrapping).
        "max-md:flex-nowrap max-md:overflow-x-auto max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden",
        className
      )}
    >
      {visibleChips.map((chip) => {
        const count = categoryCounts[chip.categoryType] ?? 0;
        const isActive = count > 0;

        return (
          <button
            key={chip.fromId}
            type="button"
            onClick={(event) => handleChipClick(event, chip.fromId)}
            className={cn(
              "flex h-7 shrink-0 items-center gap-1 rounded-full px-2.5 text-[11px] transition-colors @min-[720px]/pills:h-8 @min-[720px]/pills:gap-1.5 @min-[720px]/pills:px-3 @min-[720px]/pills:text-xs @min-[900px]/pills:h-9 @min-[900px]/pills:px-3.5 @min-[900px]/pills:text-sm",
              isActive
                ? "border border-primary/40 bg-primary/5 font-semibold text-primary hover:bg-primary/10"
                : "border border-border bg-background font-medium text-foreground hover:bg-accent"
            )}
          >
            <span className="whitespace-nowrap">{chip.label}</span>
            <CountChip count={count} className="@max-[719px]/pills:h-3.5 @max-[719px]/pills:min-w-3.5 @max-[719px]/pills:px-1 @max-[719px]/pills:text-[9px]" />
          </button>
        );
      })}

    </div>
  );
}
