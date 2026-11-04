"use client";

import { renderCategoryContent } from "@/components/search/contents";
import { EMPTY_FILTER_SEARCH_QUERY, FilterSearchQueryProvider, FocusedFilterProvider } from "@/lib/focused-filter";
import type { CategoryType } from "@/types/search";
import { cn } from "@/lib/utils";
import { memo } from "react";

interface InlineFilterPanelProps {
  /** Category rendered in place (compensation, location, role-department, …). */
  category: CategoryType;
  /** Group name used when the category has no subtitle of its own. */
  label: string;
  className?: string;
}

/** Nothing in the inline panel navigates between categories; it only edits filters in place. */
const NOOP_CATEGORY_CLICK = () => {};

/**
 * Renders one filter category in page flow — the same filter bodies the search
 * dialog shows, minus any dialog chrome. Used by the filter pill ribbon so
 * category chips expand their filters inline instead of opening a modal.
 */
function InlineFilterPanel({ category, label, className }: InlineFilterPanelProps) {
  return (
    <FocusedFilterProvider>
      <FilterSearchQueryProvider value={EMPTY_FILTER_SEARCH_QUERY}>
        <div className={cn("min-w-0", className)}>{renderCategoryContent(category, NOOP_CATEGORY_CLICK, { name: label })}</div>
      </FilterSearchQueryProvider>
    </FocusedFilterProvider>
  );
}

export default memo(InlineFilterPanel);
