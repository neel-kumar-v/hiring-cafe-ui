import { useApp } from "@/contexts/AppContext";
import FilterContainer from "../util/FilterContainer";
import RangeSlider from "../util/RangeSlider";

export default function Founding() {
  const { searchOptions, updateSearchOptions } = useApp();
  const foundingYear = searchOptions.founding_year;

  const handleValueChange = ([min, max]: [number, number]) => {
    updateSearchOptions({
      founding_year: { min, max }
    });
  };

  return (
    <FilterContainer title="Founding Year">
      <RangeSlider
        min={1800}
        max={2025}
        value={[foundingYear.min === 0 ? 1800 : foundingYear.min, foundingYear.max === 0 ? 2025 : foundingYear.max]}
        step={1}
        money={false}
        onValueChange={handleValueChange}
      />
    </FilterContainer>
  );
} 