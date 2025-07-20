import { CategoryId } from "@/types/search";
import { AllFilter } from "./util/AllFilter";
import { useSearch } from "@/contexts/SearchContext";



export default function CurrentFilters({handleCategoryClick}: {handleCategoryClick: (categoryType: CategoryId) => void}) {  
  const { searchOptions } = useSearch();
  return (
    <div>
      <p className="font-semibold text-lg text-text mb-2">
        Current Filters
      </p>
      <AllFilter handleCategoryClick={handleCategoryClick} searchOptions={searchOptions} />
    </div>
  );
} 
