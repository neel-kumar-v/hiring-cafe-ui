"use client";

import { Button } from "@/components/ui/button";
import { getInitialPatchForCategory, initialSearchState } from "@/lib/edited-filters";
import type { FilterChip, FilterChipGroup } from "@/lib/search/filter-chips";
import { groupFilterChips } from "@/lib/search/filter-chips";
import type { SearchState } from "@/types/search";
import { X } from "lucide-react";

export function FilterChipButton({
  chip,
  onClear,
  onSelect,
}: {
  chip: FilterChip;
  onClear: (chip: FilterChip) => void;
  onSelect: () => void;
}) {
  return (
    <span className="inline-flex max-w-72 shrink-0 items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
      <button type="button" className="max-w-72 truncate text-left hover:text-primary/80" onClick={onSelect}>
        {chip.label}
      </button>
      <button
        type="button"
        aria-label={`Clear ${chip.label}`}
        className="rounded-full text-primary/70 transition-colors hover:bg-primary/15 hover:text-primary"
        onClick={() => onClear(chip)}
      >
        <X className="size-3" />
      </button>
    </span>
  );
}

export function GroupedFilterChips({
  chips,
  onClearChip,
  onClearGroup,
  onSelectCategory,
}: {
  chips: FilterChip[];
  onClearChip: (chip: FilterChip) => void;
  onClearGroup: (group: FilterChipGroup) => void;
  onSelectCategory: (categoryId: string) => void;
}) {
  const groups = groupFilterChips(chips);

  if (!groups.length) {
    return <span className="text-sm text-muted-foreground">No filters selected</span>;
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.id} className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{group.label}</h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => onClearGroup(group)}
            >
              Clear
            </Button>
          </div>
          <div className="flex min-w-0 flex-wrap gap-1.5">
            {group.chips.map((chip) => (
              <FilterChipButton key={chip.id} chip={chip} onClear={onClearChip} onSelect={() => onSelectCategory(chip.categoryId)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function clearChipFromState(searchOptions: SearchState, chip: FilterChip): Partial<SearchState> {
  return chip.clear(searchOptions, initialSearchState);
}

export function clearChipGroupFromState(group: FilterChipGroup): Partial<SearchState> {
  return getInitialPatchForCategory(group.categoryId, initialSearchState);
}
