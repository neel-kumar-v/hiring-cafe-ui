"use client";

import { memo, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { SearchIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useApp } from "@/contexts/AppContext";
import { getCategoryEditCount, initialSearchState } from "@/lib/edited-filters";
import { EMPTY_FILTER_SEARCH_QUERY, FilterSearchQueryProvider, FocusedFilterProvider, useFocusedFilterId } from "@/lib/focused-filter";
import type { FilterChip } from "@/lib/search/filter-chips";
import { getFilterChips } from "@/lib/search/filter-chips";
import type { CategoryType } from "@/types/search";
import { filters } from "@/data/search-filters";
import { clearChipFromState, FilterChipButton } from "../filters/util/FilterChips";
import { GENERAL_CONTENT_EXCLUDED, GENERAL_NAV_EXCLUDED, FilteredCategoriesContent, getGroupedCategories, type FilteredGroup, useCategoryState } from ".";

export type SearchContentVariant = "sidebar" | "tabs";

interface SearchContentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  from?: string;
  variant: SearchContentVariant;
}

const ScrollVignette = memo(function ScrollVignette({
  axis,
  children,
  className,
  viewportClassName,
  viewportRef,
}: {
  axis: "x" | "y";
  children: React.ReactNode;
  className?: string;
  viewportClassName?: string;
  viewportRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const internalViewportRef = useRef<HTMLDivElement>(null);
  const activeViewportRef = viewportRef ?? internalViewportRef;
  const [edges, setEdges] = useState({ start: false, end: false });

  useEffect(() => {
    const viewport = activeViewportRef.current;
    if (!viewport) return;

    let frameId: number | null = null;
    const scheduleUpdate = () => {
      if (frameId !== null) return;
      frameId = requestAnimationFrame(() => {
        frameId = null;
        const start = axis === "y" ? viewport.scrollTop > 1 : viewport.scrollLeft > 1;
        const end = axis === "y" ? viewport.scrollTop + viewport.clientHeight < viewport.scrollHeight - 1 : viewport.scrollLeft + viewport.clientWidth < viewport.scrollWidth - 1;
        setEdges((previous) => (previous.start === start && previous.end === end ? previous : { start, end }));
      });
    };

    const resizeObserver = new ResizeObserver(scheduleUpdate);
    resizeObserver.observe(viewport);
    const content = viewport.firstElementChild;
    if (content instanceof Element) {
      resizeObserver.observe(content);
    }
    viewport.addEventListener("scroll", scheduleUpdate, { passive: true });
    scheduleUpdate();
    return () => {
      resizeObserver.disconnect();
      viewport.removeEventListener("scroll", scheduleUpdate);
      if (frameId !== null) cancelAnimationFrame(frameId);
    };
  }, [activeViewportRef, axis]);

  return (
    <div className={cn("relative min-h-0 min-w-0 overflow-hidden", className)}>
      <div ref={activeViewportRef} className={cn(axis === "y" ? "h-full min-w-0 overflow-y-auto" : "min-w-0 overflow-x-auto overscroll-x-contain", viewportClassName)}>
        {children}
      </div>
      {edges.start ? (
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute z-10",
            axis === "y" ? "inset-x-0 top-0 h-6 bg-gradient-to-b from-background to-transparent" : "bottom-0 left-0 top-0 w-6 bg-gradient-to-r from-background to-transparent"
          )}
        />
      ) : null}
      {edges.end ? (
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute z-10",
            axis === "y" ? "inset-x-0 bottom-0 h-6 bg-gradient-to-t from-background to-transparent" : "bottom-0 right-0 top-0 w-6 bg-gradient-to-l from-background to-transparent"
          )}
        />
      ) : null}
    </div>
  );
});

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
      <ScrollVignette axis="x" className="min-w-0 flex-1" viewportClassName="scrollbar-none">
        <div className="flex w-max items-center gap-1.5 pr-2">
          {chips.length ? (
            chips.map((chip) => <FilterChipButton key={chip.id} chip={chip} onClear={onClearFilter} onSelect={() => onSelectCategory(chip.categoryId)} />)
          ) : (
            <span className="px-1 text-xs text-muted-foreground">No filters selected</span>
          )}
        </div>
      </ScrollVignette>
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
  selectedCategory,
  focusedFilterId,
  inViewFilterIds,
  editCounts,
  onHeaderClick,
  onFilterClick,
}: {
  filteredCategories: FilteredGroup[];
  selectedCategory: CategoryType;
  focusedFilterId: string | null;
  inViewFilterIds: Set<string>;
  editCounts: Readonly<Record<string, number>>;
  onHeaderClick: (categoryType: CategoryType) => void;
  onFilterClick: (categoryId: string) => void;
}) {
  return (
    <div className="space-y-2 p-2 pt-0">
      {filteredCategories.map((category) => {
        const isSelected = selectedCategory === category.type;
        // Stream-only General filters stay out of the rail; section filters (e.g. Activity &
        // Outcomes) remain so the General category header always has a real nav group.
        const subcategories = category.type === "general" ? category.categories.filter((item) => !GENERAL_NAV_EXCLUDED.has(item.id)) : category.categories;

        const isHidden = category.type === "qualifications";

        return (
          <div key={category.name} className={cn("mt-1 gap-y-1 first-of-type:mt-0", isHidden && "hidden")}>
            {/* Always render the category header — never drop General when stream filters are nav-excluded. */}
            <Button
              className={cn(
                "h-auto w-full justify-start rounded-none border-l-2 border-transparent p-2 text-left text-foreground transition-colors duration-150 ease-out hover:border-primary hover:bg-muted hover:transition-none",
                isSelected && "border-primary bg-muted text-foreground"
              )}
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
                    isFocused && "border-primary bg-muted text-foreground",
                    !isFocused && inViewFilterIds.has(item.id) && "border-primary/40 bg-muted/40 text-foreground"
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
  const { selectedCategory, scrollToSection, setScrollToSection, handleFilterSelectWithScroll, handleHeaderClick } = useCategoryState(from, open, defaultCategory);
  const { focusedFilterId, setFocusedFilterId } = useFocusedFilterId();
  const clearScrollToSection = useCallback(() => setScrollToSection(undefined), [setScrollToSection]);
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [inViewFilterIds, setInViewFilterIds] = useState<Set<string>>(() => new Set());
  const contentScrollRef = useRef<HTMLDivElement>(null);
  const selectedFilters = useMemo(() => getFilterChips(deferredSearchOptions, initialSearchState), [deferredSearchOptions]);
  const filterSearchQueryValue = useMemo(
    () => ({
      filterSearchQuery: sidebarSearch,
      setFilterSearchQuery: setSidebarSearch,
    }),
    [sidebarSearch]
  );
  const filteredCategories = useMemo(() => {
    const base = getGroupedCategories();
    const query = sidebarSearch.trim().toLowerCase();
    if (!query) return base;

    return base
      .map((category) => {
        if (category.name.toLowerCase().includes(query)) return category;
        const matchingSubfilters = category.categories.filter((item) => item.name.toLowerCase().includes(query));
        if (!matchingSubfilters.length) return null;
        return { ...category, categories: matchingSubfilters };
      })
      .filter((category): category is (typeof base)[number] => category !== null);
  }, [sidebarSearch]);

  const handleSidebarSearchChange = useCallback((value: string) => {
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

  useEffect(() => {
    const root = contentScrollRef.current;
    if (!root || variant !== "sidebar") return;

    const filterElements = Array.from(root.querySelectorAll<HTMLElement>("[data-filter-container-id]"));

    // IntersectionObserver drives visible-filter tracking off the scroll path entirely: no
    // getBoundingClientRect reads while scrolling and state only flips when a container actually
    // enters/leaves the viewport (rAF-coalesced). The previous rect-probing debounce forced layout
    // and re-rendered the sidebar nav mid-scroll, fighting the programmatic section scroll animation.
    const visible = new Set<string>();
    let frameId: number | null = null;

    const flush = () => {
      frameId = null;
      setInViewFilterIds((previous) => {
        if (previous.size === visible.size && Array.from(previous).every((id) => visible.has(id))) {
          return previous;
        }
        return new Set(visible);
      });
    };

    const scheduleFlush = () => {
      if (frameId === null) frameId = requestAnimationFrame(flush);
    };

    if (typeof IntersectionObserver === "undefined") {
      // Legacy fallback (browsers without IntersectionObserver): original rect-probing debounce.
      let timeoutId: number | null = null;

      const updateVisibleFilters = () => {
        const rootRect = root.getBoundingClientRect();
        const next = new Set<string>();
        filterElements.forEach((element) => {
          const rect = element.getBoundingClientRect();
          const visibleHeight = Math.min(rect.bottom, rootRect.bottom) - Math.max(rect.top, rootRect.top);
          if (visibleHeight > 0) {
            const id = element.dataset.filterContainerId;
            if (id) next.add(id);
          }
        });
        setInViewFilterIds((previous) => {
          if (previous.size === next.size && Array.from(previous).every((id) => next.has(id))) {
            return previous;
          }
          return next;
        });
      };

      const handleScroll = () => {
        if (timeoutId !== null) window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => {
          timeoutId = null;
          updateVisibleFilters();
        }, 120);
      };

      root.addEventListener("scroll", handleScroll, { passive: true });
      updateVisibleFilters();
      return () => {
        root.removeEventListener("scroll", handleScroll);
        if (timeoutId !== null) window.clearTimeout(timeoutId);
        if (frameId !== null) cancelAnimationFrame(frameId);
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        let changed = false;
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).dataset.filterContainerId;
          if (!id) continue;
          if (entry.isIntersecting) {
            if (!visible.has(id)) {
              visible.add(id);
              changed = true;
            }
          } else if (visible.delete(id)) {
            changed = true;
          }
        }
        if (changed) scheduleFlush();
      },
      { root }
    );
    filterElements.forEach((element) => observer.observe(element));
    return () => {
      observer.disconnect();
      if (frameId !== null) cancelAnimationFrame(frameId);
    };
  }, [filteredCategories, variant]);

  const handleFilterClickWithScroll = useCallback(
    (categoryId: string) => {
      handleFilterSelectWithScroll(categoryId);
      setFocusedFilterId(categoryId);
    },
    [handleFilterSelectWithScroll, setFocusedFilterId]
  );

  const handleHeaderClickWithScroll = useCallback(
    (categoryType: CategoryType) => {
      // Skip the filters that are not rendered in the rail (e.g. "Current Filters" / "Saved Searches").
      const firstFilterId = filters.find((category) => category.type === categoryType && !GENERAL_CONTENT_EXCLUDED.has(category.id))?.id ?? null;
      setFocusedFilterId(firstFilterId);
      handleHeaderClick(categoryType);
    },
    [handleHeaderClick, setFocusedFilterId]
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

        <ScrollVignette axis="y" className="min-h-0 flex-1" viewportClassName="px-4 pb-8 pt-4">
          {filterCategoriesBody}
        </ScrollVignette>
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

          <ScrollVignette axis="y" className="min-h-0 flex-1" viewportClassName="pt-1 overflow-x-hidden overscroll-y-contain [scrollbar-width:thin]">
            <SearchSidebarNav
              filteredCategories={filteredCategories}
              selectedCategory={selectedCategory}
              focusedFilterId={focusedFilterId}
              inViewFilterIds={inViewFilterIds}
              editCounts={sidebarEditCounts}
              onHeaderClick={handleHeaderClickWithScroll}
              onFilterClick={handleFilterClickWithScroll}
            />
          </ScrollVignette>
        </div>

        <div aria-hidden="true" className="w-px shrink-0 bg-border" />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-r-md bg-background">
          {/* Extra bottom padding keeps the last filter (e.g. the boolean-search help link) clear of the scroll cutoff. */}
          <ScrollVignette axis="y" className="min-h-0 flex-1" viewportClassName="px-6 pb-10 pt-4 pr-10 overscroll-y-contain [scrollbar-width:thin]" viewportRef={contentScrollRef}>
            {filterCategoriesBody}
          </ScrollVignette>
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
