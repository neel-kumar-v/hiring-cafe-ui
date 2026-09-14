"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PencilIcon, SearchIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useApp } from "@/contexts/AppContext";
import { getEditedTags, initialSearchState } from "@/lib/edited-filters";
import { FocusedFilterProvider, useFocusedFilter } from "@/lib/focused-filter";
import type { CategoryType } from "@/types/search";
import { filters } from "@/data/search-filters";
import {
  getGroupedCategories,
  renderAllCategoriesContent,
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

function SearchContentInner({ open, onOpenChange, from, variant }: SearchContentProps) {
  const { searchOptions } = useApp();
  const editedTags = useMemo(() => getEditedTags(searchOptions, initialSearchState), [searchOptions]);
  const defaultCategory = (variant === "sidebar" ? filters[0].type : "general") as CategoryType;
  const { selectedCategory, scrollToSection, setScrollToSection, handleFilterSelectWithScroll, handleHeaderClick } = useCategoryState(from, open, defaultCategory);
  const { focusedFilterId, setFocusedFilterId } = useFocusedFilter();
  const clearScrollToSection = useCallback(() => setScrollToSection(undefined), [setScrollToSection]);
  const [sidebarSearch, setSidebarSearch] = useState("");

  const filteredCategories = useMemo(() => {
    const base = getGroupedCategories();
    if (variant !== "sidebar") return base;
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
  }, [sidebarSearch, variant]);

  useEffect(() => {
    if (scrollToSection) setFocusedFilterId(scrollToSection);
  }, [scrollToSection, setFocusedFilterId]);

  const handleFilterClickWithScroll = (categoryId: string) => {
    handleFilterSelectWithScroll(categoryId);
    setFocusedFilterId(categoryId);
  };

  const handleHeaderClickWithScroll = (categoryType: CategoryType) => {
    const firstFilterId = filters.find((category) => category.type === categoryType)?.id ?? null;
    setFocusedFilterId(firstFilterId);
    handleHeaderClick(categoryType);
  };

  if (variant === "tabs") {
    const categories = getGroupedCategories();
    const selectedGroup = categories.find((category) => category.type === selectedCategory);

    return (
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex flex-shrink-0 items-center gap-3 border-b border-border p-4">
          <button className="rounded-lg p-2 transition-colors hover:bg-secondary dark:hover:bg-accent" onClick={() => onOpenChange(false)}>
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-foreground">Create your Job Search</h2>
          </div>
        </div>

        <div className="sticky top-0 z-10 border-b border-border bg-background p-4 pb-0 dark:bg-background/50">
          <div className="scrollbar-none flex gap-1 overflow-x-auto">
            {categories.map((category) => (
              <Button
                data-active={selectedCategory === category.type}
                key={category.type}
                className="h-auto w-fit px-2 py-1 text-left text-sm"
                onClick={() => handleHeaderClickWithScroll(category.type)}
                variant="tab"
              >
                <span className="text-sm">{category.name}</span>
              </Button>
            ))}
          </div>

          {selectedGroup?.categories.length ? (
            <div className="scrollbar-none mb-2 mt-2 flex gap-1 overflow-x-auto">
              {selectedGroup.categories.map((category) => (
                <Button
                  data-active={focusedFilterId === category.id}
                  key={category.id}
                  className="h-auto w-fit px-2 py-1 text-left text-sm"
                  onClick={() => handleFilterClickWithScroll(category.id)}
                  variant="tab"
                >
                  <span className="text-sm">{category.name}</span>
                </Button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="p-4">{renderAllCategoriesContent(scrollToSection, handleFilterClickWithScroll, clearScrollToSection)}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0">
      <div className="flex w-[220px] flex-col rounded-l-md border-r border-border bg-background">
        <div className="p-2">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={sidebarSearch}
              onChange={(event) => setSidebarSearch(event.target.value)}
              placeholder="Search filters..."
              aria-label="Search filters"
              className="h-8 pl-8 text-xs"
            />
          </div>
        </div>

        <div className="overflow-y-auto overflow-x-hidden pt-1">
          <div className="space-y-3 p-2 pt-0">
            {filteredCategories.map((category) => {
              const isSelected = selectedCategory === category.type;
              return (
                <div key={category.name} className="mt-2 gap-y-1 first-of-type:mt-0">
                  <Button
                    className={cn(
                      "h-auto w-full justify-start rounded-none p-2 text-left text-foreground transition-colors duration-300 ease-in-out hover:bg-muted hover:transition-none",
                      isSelected && "bg-primary hover:bg-primary/90"
                    )}
                    onClick={() => handleHeaderClickWithScroll(category.type)}
                    variant={isSelected ? "default" : "ghost"}
                  >
                    <h3 className="text-xs font-semibold uppercase tracking-wide">{category.name}</h3>
                  </Button>

                  {category.categories.map((item) => {
                    const isEdited = editedTags.has(item.name);
                    const isFocused = focusedFilterId === item.id;
                    return (
                      <Button
                        key={item.id}
                        className={cn(
                          "group h-auto w-full justify-start rounded-none border-l-2 border-border px-2 py-1 text-left text-muted-foreground transition-all duration-300 ease-in-out hover:border-primary hover:bg-muted hover:text-foreground hover:transition-none",
                          isFocused && "border-primary bg-muted text-foreground"
                        )}
                        onClick={() => handleFilterClickWithScroll(item.id)}
                        variant="ghost"
                      >
                        <span className="flex w-full items-center gap-2">
                          {item.name}
                          {isEdited ? (
                            <PencilIcon
                              className="size-3 shrink-0 translate-y-px text-muted-foreground transition-all duration-300 ease-in-out group-hover:text-foreground group-hover:transition-none"
                              aria-hidden
                            />
                          ) : null}
                        </span>
                      </Button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-r-md bg-background">
        <div className="flex-1 overflow-y-auto p-6 py-4 pr-10">
          {renderFilteredCategoriesContent(filteredCategories, scrollToSection, handleFilterClickWithScroll, clearScrollToSection)}
        </div>
      </div>
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
