import { useSearch } from "@/contexts/SearchContext";
import { CategoryId } from "@/types/search";
import { AllFilter } from "../util/AllFilter";
import FilterContainer from "../util/FilterContainer";



export default function CurrentFilters({handleCategoryClick}: {handleCategoryClick: (categoryType: CategoryId) => void}) {  
  const { searchOptions } = useSearch();
  return (
    <FilterContainer title="Current Filters">
      <AllFilter handleCategoryClick={handleCategoryClick} searchOptions={searchOptions} />
    </FilterContainer>
  );
} 
