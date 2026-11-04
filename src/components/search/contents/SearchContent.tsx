"use client";

import { memo, useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { SearchIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useApp } from "@/contexts/AppContext";
import { getCategoryEditCount, initialSearchState } from "@/lib/edited-filters";
import { EMPTY_FILTER_SEARCH_QUERY, FilterSearchQueryProvider, FocusedFilterProvider, useFocusedFilterId } from "@/lib/focused-filter";
import type { FilterChip } from "@/lib/search/filter-chips";
import { getFilterChips } from "@/lib/search/filter-chips";
import { filterCategoriesBySearchQuery, firstMatchingFilterId } from "@/lib/search/filter-search-text";
import type { CategoryType } from "@/types/search";
import { filters, groupAnchorFilterIds } from "@/data/search-filters";
import { clearChipFromState, FilterChipButton } from "../filters/util/FilterChips";
import { GENERAL_NAV_EXCLUDED, FilteredCategoriesContent, getGroupedCategories, type FilteredGroup, useCategoryState } from ".";

export type SearchContentVariant = "sidebar" | "tabs";

interface SearchContentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  from?: string;
  variant: SearchContentVariant;
}

const CurrentFiltersFooter = memo(function CurrentFiltersFooter({
  chips,
  onClearAll,
  onClearFilter,
  onSelectCategory,
  onSearch,
}: {
  chips: FilterChip[];
  onClearAll: () => void;
  onClearFilter: (chip: FilterChip) => void;
  onSelectCategory: (categoryId: string) => void;
  onSearch: () => void;
}) {
  return (
    <footer className="flex min-w-0 w-full shrink-0 items-center gap-2 overflow-hidden border-t border-border/80 bg-background px-2 py-2.5">
      <div className="min-w-0 flex-1 overflow-x-auto scrollbar-none">
        <div className="flex w-max items-center gap-1.5 pr-2">
          {chips.length ? (
            chips.map((chip) => <FilterChipButton key={chip.id} chip={chip} onClear={onClearFilter} onSelect={() => onSelectCategory(chip.categoryId)} />)
          ) : (
            <span className="px-1 text-xs text-muted-foreground">No filters selected</span>
          )}
        </div>
      </div>
      <Button type="button" variant="ghost" size="sm" className="shrink-0 px-2 text-xs" onClick={onClearAll} disabled={!chips.length}>
        Clear all
      </Button>
      <Button type="button" size="sm" className="shrink-0 px-3 text-xs" onClick={onSearch}>
        Search
      </Button>
    </footer>
  );
});

const SearchSidebarNav = memo(function SearchSidebarNav({
  filteredCategories,
  focusedFilterId,
  editCounts,
  onHeaderClick,
  onFilterClick,
  revealNested,
}: {
  filteredCategories: FilteredGroup[];
  focusedFilterId: string | null;
  editCounts: Readonly<Record<string, number>>;
  onHeaderClick: (categoryType: CategoryType) => void;
  onFilterClick: (categoryId: string) => void;
  /** When the sidebar search is active, surface nested filters (benefits, stage, …). */
  revealNested?: boolean;
}) {
  return (
    <div className="space-y-2 p-2 pt-0">
      {filteredCategories.map((category) => {
        // Stream / nested filters stay out of the rail unless the user is searching for them.
        // A row whose name matches the group (Location, Company) is the section itself — the header scrolls there.
        const subcategories = category.categories.filter(
          (item) => (revealNested || !GENERAL_NAV_EXCLUDED.has(item.id)) && item.name.localeCompare(category.name, undefined, { sensitivity: "accent" }) !== 0
        );

        return (
          <div key={category.name} className="mt-1 gap-y-1 first-of-type:mt-0">
            {/* Category labels scroll to the section — no hover/selected chrome. */}
            <Button
              className="h-auto w-full justify-start rounded-none border-0 bg-transparent px-0 py-2 text-left text-foreground shadow-none hover:bg-transparent hover:text-foreground hover:no-underline focus-visible:bg-transparent active:bg-transparent dark:hover:bg-transparent"
              onClick={() => onHeaderClick(category.type)}
              variant="ghost"
            >
              <h3 className="truncate text-[15px] font-bold text-foreground">{category.name}</h3>
            </Button>

            {subcategories.map((item) => {
              const editCount = editCounts[item.id] ?? 0;
              const isFocused = focusedFilterId === item.id;
              return (
                <Button
                  key={item.id}
                  className={cn(
                    "group h-auto w-full justify-start rounded-none border-l-2 border-border px-2 py-1 text-left text-muted-foreground transition-colors duration-150 ease-out hover:border-primary hover:bg-muted hover:text-foreground hover:transition-none",
                    isFocused && "border-primary bg-muted text-foreground"
                  )}
                  onClick={() => onFilterClick(item.id)}
                  variant="ghost"
                >
                  <span className="flex w-full items-center gap-2">
                    {item.name}
                    {editCount > 0 ? (
                      <span className="ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-primary/15 px-1 text-[10px] font-semibold leading-5 text-primary">
                        {editCount}
                      </span>
                    ) : null}
                  </span>
                </Button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
});

const FilterCategoriesPane = memo(function FilterCategoriesPane({
  filteredCategories,
  scrollToSection,
  onFilterClick,
  clearScrollToSection,
  filterSearchQueryValue,
  variant,
}: {
  filteredCategories: FilteredGroup[];
  scrollToSection: string | undefined;
  onFilterClick: (categoryId: string) => void;
  clearScrollToSection: () => void;
  filterSearchQueryValue: { filterSearchQuery: string; setFilterSearchQuery: (query: string) => void };
  variant: SearchContentVariant;
}) {
  return (
    <FilterSearchQueryProvider value={variant === "tabs" ? filterSearchQueryValue : EMPTY_FILTER_SEARCH_QUERY}>
      <FilteredCategoriesContent
        filteredGroups={filteredCategories}
        scrollToSection={scrollToSection}
        handleCategoryClick={onFilterClick}
        clearScrollToSection={clearScrollToSection}
      />
    </FilterSearchQueryProvider>
  );
});

function SearchContentInner({ open, onOpenChange, from, variant }: SearchContentProps) {
  const { searchOptions, setSearchOptions, setHasUnsavedChanges } = useApp();
  const deferredSearchOptions = useDeferredValue(searchOptions);
  const defaultCategory = (variant === "sidebar" ? filters[0].type : "general") as CategoryType;
  const { scrollToSection, setScrollToSection, handleFilterSelectWithScroll, handleHeaderClick } = useCategoryState(from, open, defaultCategory);
  const { focusedFilterId, setFocusedFilterId } = useFocusedFilterId();
  const clearScrollToSection = useCallback(() => setScrollToSection(undefined), [setScrollToSection]);
  const [sidebarSearch, setSidebarSearch] = useState("");
  // Filtering the category tree yields to the input; the field itself stays instant.
  const deferredSidebarSearch = useDeferredValue(sidebarSearch);
  const selectedFilters = useMemo(() => getFilterChips(deferredSearchOptions, initialSearchState), [deferredSearchOptions]);
  const filterSearchQueryValue = useMemo(
    () => ({
      filterSearchQuery: sidebarSearch,
      setFilterSearchQuery: setSidebarSearch,
    }),
    [sidebarSearch]
  );
  // Rebuilds off `deferredSidebarSearch` so keystrokes stay urgent and the tree yields.
  const filteredCategories = useMemo(() => filterCategoriesBySearchQuery(getGroupedCategories(), deferredSidebarSearch), [deferredSidebarSearch]);

  const handleSidebarSearchChange = useCallback((value: string) => {
    // Input stays urgent; `deferredSidebarSearch` is what rebuilds the category tree.
    setSidebarSearch(value);
  }, []);

  useEffect(() => {
    if (!open) {
      setSidebarSearch("");
    }
  }, [open]);

  useEffect(() => {
    if (scrollToSection) setFocusedFilterId(scrollToSection);
  }, [scrollToSection, setFocusedFilterId]);

  // Ctrl+F-style: once the deferred query settles, land on the first sentence/name hit.
  useEffect(() => {
    const query = deferredSidebarSearch.trim();
    if (!query || !open) return;

    const matchId = firstMatchingFilterId(filteredCategories, query);
    if (!matchId) return;

    setFocusedFilterId(matchId);
    setScrollToSection(matchId);
  }, [deferredSidebarSearch, filteredCategories, open, setFocusedFilterId, setScrollToSection]);

  const handleFilterClickWithScroll = useCallback(
    (categoryId: string) => {
      handleFilterSelectWithScroll(categoryId);
      setFocusedFilterId(categoryId);
    },
    [handleFilterSelectWithScroll, setFocusedFilterId]
  );

  const handleHeaderClickWithScroll = useCallback(
    (categoryType: CategoryType) => {
      // Land on the section-named filter (Location, Company) when the header is that section; otherwise the first rail row.
      const groupName = filteredCategories.find((category) => category.type === categoryType)?.name;
      const named = groupName
        ? filters.find((category) => category.type === categoryType && category.name.localeCompare(groupName, undefined, { sensitivity: "accent" }) === 0)
        : undefined;
      const firstFilterId =
        named?.id ?? groupAnchorFilterIds[categoryType] ?? filters.find((category) => category.type === categoryType && !GENERAL_NAV_EXCLUDED.has(category.id))?.id ?? null;
      setFocusedFilterId(firstFilterId);
      handleHeaderClick(categoryType);
    },
    [filteredCategories, handleHeaderClick, setFocusedFilterId]
  );

  const sidebarEditCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const category of filteredCategories) {
      for (const item of category.categories) {
        counts[item.id] = getCategoryEditCount(deferredSearchOptions, initialSearchState, item.id);
      }
    }
    return counts;
  }, [deferredSearchOptions, filteredCategories]);

  const clearAllFilters = useCallback(() => {
    setSearchOptions(initialSearchState);
    setHasUnsavedChanges(true);
  }, [setHasUnsavedChanges, setSearchOptions]);

  const clearSelectedFilter = useCallback(
    (chip: FilterChip) => {
      setSearchOptions((previous) => ({ ...previous, ...clearChipFromState(previous, chip) }));
      setHasUnsavedChanges(true);
    },
    [setHasUnsavedChanges, setSearchOptions]
  );

  const handleSearchClose = useCallback(() => onOpenChange(false), [onOpenChange]);

  const filterCategoriesBody = (
    <FilterCategoriesPane
      filteredCategories={filteredCategories}
      scrollToSection={scrollToSection}
      onFilterClick={handleFilterClickWithScroll}
      clearScrollToSection={clearScrollToSection}
      filterSearchQueryValue={filterSearchQueryValue}
      variant={variant}
    />
  );

  const footer = (
    <CurrentFiltersFooter
      chips={selectedFilters}
      onClearAll={clearAllFilters}
      onClearFilter={clearSelectedFilter}
      onSelectCategory={handleFilterClickWithScroll}
      onSearch={handleSearchClose}
    />
  );

  if (variant === "tabs") {
    return (
      <div className="flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden">
        <div className="flex flex-shrink-0 items-center gap-3 border-b border-border p-3">
          <button className="rounded-lg p-2 transition-colors hover:bg-secondary dark:hover:bg-accent" onClick={() => onOpenChange(false)}>
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
          <div className="relative min-w-0 flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={sidebarSearch}
              onChange={(event) => handleSidebarSearchChange(event.target.value)}
              placeholder="Search filters..."
              aria-label="Search filters"
              className="h-10 rounded-full bg-muted/60 pl-9"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-8">{filterCategoriesBody}</div>
        {footer}
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden">
      <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
        <div className="flex min-h-0 w-[25%] min-w-[200px] max-w-[380px] shrink-0 flex-col rounded-l-md bg-background">
          <div className="p-2">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={sidebarSearch}
                onChange={(event) => handleSidebarSearchChange(event.target.value)}
                placeholder="Search filters..."
                aria-label="Search filters"
                className="h-8 pl-8 text-xs"
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain pt-1 [scrollbar-width:thin]">
            <SearchSidebarNav
              filteredCategories={filteredCategories}
              focusedFilterId={focusedFilterId}
              editCounts={sidebarEditCounts}
              onHeaderClick={handleHeaderClickWithScroll}
              onFilterClick={handleFilterClickWithScroll}
              revealNested={deferredSidebarSearch.trim().length > 0}
            />
          </div>
        </div>

        <div aria-hidden="true" className="w-px shrink-0 bg-border" />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-r-md bg-background">
          {/* Extra bottom padding keeps the last filter (e.g. the boolean-search help link) clear of the scroll cutoff. */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-6 pb-10 pr-10 [scrollbar-width:thin]">{filterCategoriesBody}</div>
        </div>
      </div>
      {footer}
    </div>
  );
}

export default function SearchContent(props: SearchContentProps) {
  return (
    <FocusedFilterProvider>
      <SearchContentInner {...props} />
    </FocusedFilterProvider>
  );
}
