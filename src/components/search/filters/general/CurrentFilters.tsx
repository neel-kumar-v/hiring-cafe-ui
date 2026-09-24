"use client";

import { useApp } from "@/contexts/AppContext";
import { initialSearchState } from "@/lib/edited-filters";
import { getFilterChips } from "@/lib/search/filter-chips";
import { CategoryId } from "@/types/search";
import { clearChipFromState, clearChipGroupFromState, GroupedFilterChips } from "../util/FilterChips";
import FilterContainer from "../util/FilterContainer";

export default function CurrentFilters({ handleCategoryClick }: { handleCategoryClick: (categoryType: CategoryId) => void }) {
  const { searchOptions, updateSearchOptions } = useApp();
  const chips = getFilterChips(searchOptions, initialSearchState);

  return (
    <FilterContainer categoryId="filters" title="Current Filters">
      <GroupedFilterChips
        chips={chips}
        onSelectCategory={(categoryId) => handleCategoryClick(categoryId as CategoryId)}
        onClearChip={(chip) => updateSearchOptions(clearChipFromState(searchOptions, chip))}
        onClearGroup={(group) => updateSearchOptions(clearChipGroupFromState(group))}
      />
    </FilterContainer>
  );
}
