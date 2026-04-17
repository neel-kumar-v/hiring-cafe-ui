import { useApp } from "@/contexts/AppContext";
import { createFoundingYearHandler } from "@/lib/search";
import { getCurrentYear } from "@/lib/search/company";
import FilterContainer from "../util/FilterContainer";
import RangeSlider from "../util/RangeSlider";

export default function Founding() {
  const { searchOptions, updateSearchOptions } = useApp();
  const foundingYear = searchOptions.founding_year;

  const handleValueChange = createFoundingYearHandler(updateSearchOptions);

  return (
    <FilterContainer categoryId="founding" title="Founding Year">
      <RangeSlider
        min={1800}
        max={getCurrentYear()}
        value={[foundingYear.min === 0 ? 1800 : foundingYear.min, foundingYear.max === 0 ? getCurrentYear() : foundingYear.max]}
        step={1}
        money={false}
        onValueChange={handleValueChange}
      />
    </FilterContainer>
  );
} 
