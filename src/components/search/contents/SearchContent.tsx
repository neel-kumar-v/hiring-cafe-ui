"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SearchIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useApp } from "@/contexts/AppContext";
import { getCategoryEditCount, getInitialPatchForCategory, initialSearchState } from "@/lib/edited-filters";
import { FocusedFilterProvider, useFocusedFilter } from "@/lib/focused-filter";
import type { FilterChip } from "@/lib/search/filter-chips";
import { getFilterChips } from "@/lib/search/filter-chips";
import type { CategoryType } from "@/types/search";
import { filters } from "@/data/search-filters";
import { clearChipFromState, FilterChipButton, GroupedFilterChips } from "../filters/util/FilterChips";
import {
  getGroupedCategories,
  renderFilteredCategoriesContent,
  useCategoryState,
} from ".";

export type SearchContentVariant = "sidebar" | "tabs";

interface SearchContentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  from?: string;
  variant: SearchContentVariant;
}

function ScrollVignette({
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

    const updateEdges = () => {
      const start = axis === "y" ? viewport.scrollTop > 1 : viewport.scrollLeft > 1;
      const end = axis === "y"
        ? viewport.scrollTop + viewport.clientHeight < viewport.scrollHeight - 1
        : viewport.scrollLeft + viewport.clientWidth < viewport.scrollWidth - 1;
      setEdges((previous) => (previous.start === start && previous.end === end ? previous : { start, end }));
    };

    const resizeObserver = new ResizeObserver(updateEdges);
    const mutationObserver = new MutationObserver(updateEdges);
    resizeObserver.observe(viewport);
    mutationObserver.observe(viewport, { childList: true, subtree: true, attributes: true });
    viewport.addEventListener("scroll", updateEdges, { passive: true });
    updateEdges();
    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      viewport.removeEventListener("scroll", updateEdges);
    };
  }, [activeViewportRef, axis]);

  return (
    <div className={cn("relative min-h-0 min-w-0 overflow-hidden", className)}>
      <div
        ref={activeViewportRef}
        className={cn(axis === "y" ? "h-full min-w-0 overflow-y-auto" : "min-w-0 overflow-x-auto overscroll-x-contain", viewportClassName)}
      >
        {children}
      </div>
      {edges.start ? (
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute z-10",
            axis === "y" ? "inset-x-0 top-0 h-6 bg-gradient-to-b from-background to-transparent" : "bottom-0 left-0 top-0 w-6 bg-gradient-to-r from-background to-transparent",
          )}
        />
      ) : null}
      {edges.end ? (
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute z-10",
            axis === "y" ? "inset-x-0 bottom-0 h-6 bg-gradient-to-t from-background to-transparent" : "bottom-0 right-0 top-0 w-6 bg-gradient-to-l from-background to-transparent",
          )}
        />
      ) : null}
    </div>
  );
}

function CurrentFiltersFooter({
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
            chips.map((chip) => (
              <FilterChipButton
                key={chip.id}
                chip={chip}
                onClear={onClearFilter}
                onSelect={() => onSelectCategory(chip.categoryId)}
              />
            ))
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
}

function SelectedFiltersPanel({
  chips,
  onClearFilter,
  onClearGroup,
  onSelectCategory,
}: {
  chips: FilterChip[];
  onClearFilter: (chip: FilterChip) => void;
  onClearGroup: Parameters<typeof GroupedFilterChips>[0]["onClearGroup"];
  onSelectCategory: (categoryId: string) => void;
}) {
  return (
    <section id="filters" className="mb-3 scroll-mt-4 md:mb-4">
      <div className="border-b border-border/80 pb-1.5 md:pb-2">
        <h2 className="text-sm font-semibold text-foreground md:text-base">Selected filters</h2>
      </div>
      <div className="pt-3">
        <GroupedFilterChips
          chips={chips}
          onClearChip={onClearFilter}
          onClearGroup={onClearGroup}
          onSelectCategory={onSelectCategory}
        />
      </div>
    </section>
  );
}

function SearchContentInner({ open, onOpenChange, from, variant }: SearchContentProps) {
  const { searchOptions, updateSearchOptions, setSearchOptions, setHasUnsavedChanges } = useApp();
  const defaultCategory = (variant === "sidebar" ? filters[0].type : "general") as CategoryType;
  const { selectedCategory, scrollToSection, setScrollToSection, handleFilterSelectWithScroll, handleHeaderClick } = useCategoryState(from, open, defaultCategory);
  const { focusedFilterId, setFocusedFilterId, setFilterSearchQuery } = useFocusedFilter();
  const clearScrollToSection = useCallback(() => setScrollToSection(undefined), [setScrollToSection]);
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [inViewFilterIds, setInViewFilterIds] = useState<Set<string>>(() => new Set());
  const contentScrollRef = useRef<HTMLDivElement>(null);
  const selectedFilters = useMemo(() => getFilterChips(searchOptions, initialSearchState), [searchOptions]);
  const selectedFilterCount = selectedFilters.length;

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

  const handleSidebarSearchChange = (value: string) => {
    setSidebarSearch(value);
    setFilterSearchQuery(value);
  };

  useEffect(() => {
    if (!open) {
      setSidebarSearch("");
      setFilterSearchQuery("");
    }
  }, [open, setFilterSearchQuery]);

  useEffect(() => {
    if (scrollToSection) setFocusedFilterId(scrollToSection);
  }, [scrollToSection, setFocusedFilterId]);

  useEffect(() => {
    const root = contentScrollRef.current;
    if (!root || variant !== "sidebar") return;

    const filterElements = Array.from(root.querySelectorAll<HTMLElement>("[data-filter-container-id]"));
    let frameId: number | null = null;

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
      if (frameId !== null) return;
      frameId = requestAnimationFrame(() => {
        frameId = null;
        updateVisibleFilters();
      });
    };

    root.addEventListener("scroll", handleScroll, { passive: true });
    updateVisibleFilters();
    return () => {
      root.removeEventListener("scroll", handleScroll);
      if (frameId !== null) cancelAnimationFrame(frameId);
    };
  }, [filteredCategories, variant]);

  const handleFilterClickWithScroll = (categoryId: string) => {
    handleFilterSelectWithScroll(categoryId);
    setFocusedFilterId(categoryId);
    if (categoryId === "filters") {
      requestAnimationFrame(() => {
        contentScrollRef.current?.querySelector<HTMLElement>("#filters")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  };

  const handleHeaderClickWithScroll = (categoryType: CategoryType) => {
    const firstFilterId = filters.find((category) => category.type === categoryType)?.id ?? null;
    setFocusedFilterId(firstFilterId);
    handleHeaderClick(categoryType);
  };

  const clearAllFilters = useCallback(() => {
    setSearchOptions(initialSearchState);
    setHasUnsavedChanges(true);
  }, [setHasUnsavedChanges, setSearchOptions]);

  const clearSelectedFilter = useCallback(
    (chip: FilterChip) => {
      updateSearchOptions(clearChipFromState(searchOptions, chip));
    },
    [searchOptions, updateSearchOptions],
  );

  const selectedFiltersPanel = (
    <SelectedFiltersPanel
      chips={selectedFilters}
      onClearFilter={clearSelectedFilter}
      onClearGroup={(group) => updateSearchOptions(getInitialPatchForCategory(group.categoryId, initialSearchState))}
      onSelectCategory={handleFilterClickWithScroll}
    />
  );

  const footer = (
    <CurrentFiltersFooter
      chips={selectedFilters}
      onClearAll={clearAllFilters}
      onClearFilter={clearSelectedFilter}
      onSelectCategory={handleFilterClickWithScroll}
      onSearch={() => onOpenChange(false)}
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

        <ScrollVignette axis="y" className="min-h-0 flex-1" viewportClassName="p-4">
          {sidebarSearch.trim() ? null : selectedFiltersPanel}
          {renderFilteredCategoriesContent(filteredCategories, scrollToSection, handleFilterClickWithScroll, clearScrollToSection)}
        </ScrollVignette>
        {footer}
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden">
      <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
        <div className="flex w-[220px] shrink-0 flex-col rounded-l-md border-r border-border bg-background">
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

        <ScrollVignette axis="y" className="min-h-0 flex-1" viewportClassName="pt-1 overflow-x-hidden">
          <div className="space-y-2 p-2 pt-0">
            {filteredCategories.map((category) => {
              const isSelected = selectedCategory === category.type;
              return (
                <div key={category.name} className="mt-1 gap-y-1 first-of-type:mt-0">
                  <Button
                    className={cn(
                      "h-auto w-full justify-start rounded-none border-l-2 border-transparent p-2 text-left text-foreground transition-colors duration-150 ease-out hover:border-primary hover:bg-muted hover:transition-none",
                      isSelected && "border-primary bg-muted text-foreground"
                    )}
                    onClick={() => handleHeaderClickWithScroll(category.type)}
                    variant="ghost"
                  >
                    <h3 className="text-xs font-semibold uppercase tracking-wide">{category.name}</h3>
                  </Button>

                  {category.categories.map((item) => {
                    const editCount = item.id === "filters" ? selectedFilterCount : getCategoryEditCount(searchOptions, initialSearchState, item.id);
                    const isFocused = focusedFilterId === item.id;
                    return (
                      <Button
                        key={item.id}
                        className={cn(
                          "group h-auto w-full justify-start rounded-none border-l-2 border-border px-2 py-1 text-left text-muted-foreground transition-colors duration-150 ease-out hover:border-primary hover:bg-muted hover:text-foreground hover:transition-none",
                          isFocused && "border-primary bg-muted text-foreground",
                          !isFocused && inViewFilterIds.has(item.id) && "border-primary/40 bg-muted/40 text-foreground"
                        )}
                        onClick={() => handleFilterClickWithScroll(item.id)}
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
        </ScrollVignette>
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-r-md bg-background">
          <ScrollVignette axis="y" className="min-h-0 flex-1" viewportClassName="p-6 py-4 pr-10" viewportRef={contentScrollRef}>
            {sidebarSearch.trim() ? null : selectedFiltersPanel}
            {renderFilteredCategoriesContent(filteredCategories, scrollToSection, handleFilterClickWithScroll, clearScrollToSection)}
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
