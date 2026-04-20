"use client";

import { useCallback, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FocusedFilterProvider, useFocusedFilter } from "@/lib/focused-filter";
import type { CategoryType } from "@/types/search";
import { filters } from "@/data/search-filters";
import {
  getGroupedCategories,
  renderAllCategoriesContent,
  renderCategoryContent,
  useCategoryState,
} from ".";

interface SearchOverlayContentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  from?: string;
  singlePage?: boolean;
}

function SearchOverlayHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-shrink-0 items-center gap-3 border-b border-border p-4 dark:border-border">
      <button
        className="rounded-lg p-2 transition-colors hover:bg-secondary dark:hover:bg-accent"
        onClick={onClose}
      >
        <X className="h-5 w-5 text-muted-foreground dark:text-muted-foreground" />
      </button>
      <div className="flex-1">
        <h2 className="text-lg font-semibold text-foreground dark:text-foreground">
          Create your Job Search
        </h2>
      </div>
    </div>
  );
}

function SearchOverlayContentInner({
  open,
  onOpenChange,
  from,
  singlePage = false,
}: SearchOverlayContentProps) {
  const {
    selectedCategory,
    scrollToSection,
    setScrollToSection,
    selectedCategoryData,
    handleFilterSelectWithScroll,
    handleFilterSelectNoScroll,
    handleHeaderClick,
  } = useCategoryState(from, open, "general");
  const { focusedFilterId, setFocusedFilterId } = useFocusedFilter();
  const clearScrollToSection = useCallback(
    () => setScrollToSection(undefined),
    [setScrollToSection]
  );

  useEffect(() => {
    if (scrollToSection) {
      setFocusedFilterId(scrollToSection);
    }
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

  const handleFilterFocusNoScroll = (categoryId: string) => {
    handleFilterSelectNoScroll(categoryId);
    setFocusedFilterId(categoryId);
  };

  const categories = getGroupedCategories();
  const selectedGroup = categories.find((category) => category.type === selectedCategory);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <SearchOverlayHeader onClose={() => onOpenChange(false)} />

      <div className="sticky top-0 z-10 border-b border-border bg-background p-4 pb-0 dark:border-border dark:bg-background/50">
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
        <div className="p-4">
          {singlePage
            ? renderAllCategoriesContent(
                scrollToSection,
                handleFilterFocusNoScroll,
                clearScrollToSection
              )
            : renderCategoryContent(
                selectedCategory,
                handleFilterFocusNoScroll,
                selectedCategoryData,
                {
                  scrollToSection,
                  clearScrollToSection,
                }
              )}
        </div>
      </div>
    </div>
  );
}

export default function SearchOverlayContent(props: SearchOverlayContentProps) {
  return (
    <FocusedFilterProvider>
      <SearchOverlayContentInner {...props} />
    </FocusedFilterProvider>
  );
}
