import { useApp } from "@/contexts/AppContext";
import { createSizeHandler, getSizeRanges } from "@/lib/search";
import { InfiniteRange } from "@/types/search";
import FilterContainer from "../util/FilterContainer";
import LabelCheckbox from "../util/LabelCheckbox";
import LabelInputContainer from "../util/LabelInputContainer";

export default function Size() {
  const { searchOptions, updateSearchOptions } = useApp();
  const sizeRanges = getSizeRanges();

  const isRangeSelected = (range: InfiniteRange): boolean => {
    if (searchOptions.size === "All") return true;
    if (Array.isArray(searchOptions.size)) {
      return searchOptions.size.some(
        selectedRange => 
          selectedRange.min === range.min && 
          selectedRange.max === range.max
      );
    }
    return false;
  };

  const handleRangeChange = createSizeHandler(
    searchOptions.size,
    updateSearchOptions
  );

  return (
    <FilterContainer title="Company Size">
      <LabelInputContainer title="Employees" midColCount={3} lgColCount={3}> 
        {sizeRanges.map(({ label, range }) => (
          <LabelCheckbox
            key={label}
            label={label}
            checked={isRangeSelected(range)}
            onChange={() => handleRangeChange(range)}
          />
        ))}
      </LabelInputContainer>
    </FilterContainer>
  );
} 