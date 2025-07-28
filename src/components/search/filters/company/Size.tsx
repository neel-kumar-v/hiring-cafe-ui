import { useApp } from "@/contexts/AppContext";
import { InfiniteRange, Select } from "@/types/search";
import FilterContainer from "../util/FilterContainer";
import LabelCheckbox from "../util/LabelCheckbox";
import LabelInputContainer from "../util/LabelInputContainer";

export default function Size() {
  const { searchOptions, updateSearchOptions } = useApp();

  const sizeRanges: Array<{ label: string; range: InfiniteRange }> = [
    { label: "1-10", range: { min: 1, max: 10 } },
    { label: "11-50", range: { min: 11, max: 50 } },
    { label: "51-200", range: { min: 51, max: 200 } },
    { label: "201-500", range: { min: 201, max: 500 } },
    { label: "501-1000", range: { min: 501, max: 1000 } },
    { label: "1001-2000", range: { min: 1001, max: 2000 } },
    { label: "2001-5000", range: { min: 2001, max: 5000 } },
    { label: "5001-10000", range: { min: 5001, max: 10000 } },
    { label: "10000+", range: { min: 10001, max: null } },
  ];

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

  const handleRangeToggle = (range: InfiniteRange) => {
    const currentSize = searchOptions.size;
    let newSize: Select<InfiniteRange, "All">;
    
    const allRanges: InfiniteRange[] = sizeRanges.map(item => item.range);
    
    if (currentSize === "All") {
      const allExceptSelected = allRanges.filter(item => 
        !(item.min === range.min && item.max === range.max)
      );
      newSize = allExceptSelected;
    } else if (Array.isArray(currentSize)) {
      if (currentSize.some(selectedRange => 
        selectedRange.min === range.min && selectedRange.max === range.max
      )) {
        const filtered = currentSize.filter(selectedRange => 
          !(selectedRange.min === range.min && selectedRange.max === range.max)
        );
        newSize = filtered.length === 0 ? "All" : filtered;
      } else {
        const added = [...currentSize, range];
        newSize = added.length === allRanges.length ? "All" : added;
      }
    } else {
      newSize = [range];
    }
    
    updateSearchOptions({ size: newSize });
  };

  return (
    <FilterContainer title="Company Size">
      <LabelInputContainer title="Employees" midColCount={3} lgColCount={3}> 
        {sizeRanges.map(({ label, range }) => (
          <LabelCheckbox
            key={label}
            label={label}
            checked={isRangeSelected(range)}
            onChange={() => handleRangeToggle(range)}
          />
        ))}
      </LabelInputContainer>
    </FilterContainer>
  );
} 