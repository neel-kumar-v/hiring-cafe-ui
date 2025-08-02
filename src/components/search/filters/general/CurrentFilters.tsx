"use client";

import { useApp } from "@/contexts/AppContext";
import { CategoryId } from "@/types/search";
import { AllFilter } from "../util/AllFilter";
import FilterContainer from "../util/FilterContainer";

export default function CurrentFilters({handleCategoryClick}: {handleCategoryClick: (categoryType: CategoryId) => void}) {  
  const { searchOptions, currentSavedSearchId, user } = useApp();

  const currentSavedSearch = currentSavedSearchId 
    ? user.savedSearches.find(search => search.id === currentSavedSearchId)
    : null;

  const title = currentSavedSearch 
    ? `Current Filters - ${currentSavedSearch.name}` 
    : "Current Filters";

  return (
    <FilterContainer title={title}>
      <AllFilter 
        handleCategoryClick={handleCategoryClick} 
        searchOptions={searchOptions} 
      />
    </FilterContainer>
  );
} 
