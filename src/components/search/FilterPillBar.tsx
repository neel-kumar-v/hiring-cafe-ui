"use client";

import { useApp } from "@/contexts/AppContext";
import { useSearchUI } from "@/contexts/SearchContext";
import { filters } from "@/data/search-filters";
import { getEditedTags, initialSearchState } from "@/lib/edited-filters";
import { getFilterChips } from "@/lib/search/filter-chips";
import { cn } from "@/lib/utils";
import type { SearchState } from "@/types/search";
import { RotateCcw } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";

export interface CategoryChipDef {
  label: string;
  categoryType: string;
  fromId: string;
}

export const CATEGORY_CHIPS: CategoryChipDef[] = [
  { label: "Role & Department", categoryType: "role-department", fromId: "role-department" },
  { label: "Qualifications", categoryType: "qualifications", fromId: "qualifications" },
  { label: "Availability", categoryType: "availability", fromId: "availability" },
  { label: "Company", categoryType: "company", fromId: "company" },
  { label: "Compensation & Levels", categoryType: "compensation", fromId: "compensation" },
  { label: "Location", categoryType: "location", fromId: "location" },
];

export function getCategoryCounts(
  searchOptions: SearchState,
  initialState: SearchState = initialSearchState
): Record<string, number> {
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

export function getCategoryActiveCount(
  categoryType: string,
  searchOptions: SearchState,
  initialState: SearchState = initialSearchState
): number {
  return getCategoryCounts(searchOptions, initialState)[categoryType] ?? 0;
}

export function CountChip({ count, className }: { count: number; className?: string }) {
  const isActive = count > 0;
  return (
    <span
      className={cn(
        "inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold leading-none",
        isActive
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground",
        className
      )}
    >
      {count}
    </span>
  );
}

export default function FilterPillBar({ className }: { className?: string }) {
  const { searchOptions, setSearchOptions, setHasUnsavedChanges } = useApp();
  const { handleSearchIconClick } = useSearchUI();

  const selectedChips = useMemo(() => getFilterChips(searchOptions, initialSearchState), [searchOptions]);

  const categoryCounts = useMemo(() => {
    return getCategoryCounts(searchOptions, initialSearchState);
  }, [searchOptions]);

  const hasActiveFilters = useMemo(() => {
    return selectedChips.length > 0 || getEditedTags(searchOptions).size > 0;
  }, [selectedChips, searchOptions]);

  const handleClearFilters = () => {
    setSearchOptions(initialSearchState);
    setHasUnsavedChanges(false);
    toast.success("Filters cleared.");
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {CATEGORY_CHIPS.map((chip) => {
        const count = categoryCounts[chip.categoryType] ?? 0;
        const isActive = count > 0;

        return (
          <button
            key={chip.fromId}
            type="button"
            onClick={() => handleSearchIconClick(chip.fromId)}
            className={cn(
              "flex h-9 items-center gap-1.5 rounded-full px-3.5 text-sm transition-colors",
              isActive
                ? "border border-primary/40 bg-primary/5 font-semibold text-primary hover:bg-primary/10"
                : "border border-border bg-background font-medium text-foreground hover:bg-accent"
            )}
          >
            {chip.label}
            <CountChip count={count} />
          </button>
        );
      })}

      {hasActiveFilters ? (
        <button
          type="button"
          onClick={handleClearFilters}
          className="flex h-9 items-center gap-1.5 rounded-full border border-border/80 bg-background px-3 text-xs font-medium text-muted-foreground transition-colors hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
        >
          <RotateCcw className="size-3.5" />
          Clear filters
        </button>
      ) : null}
    </div>
  );
}
