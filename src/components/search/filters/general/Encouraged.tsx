import { useApp } from "@/contexts/AppContext";
import { createEncouragedHandler } from "@/lib/search";
import FilterContainer from "../util/FilterContainer";
import LabelCheckbox from "../util/LabelCheckbox";
import LabelInputContainer from "../util/LabelInputContainer";

export default function Encouraged() {
  const { searchOptions, updateSearchOptions } = useApp();

  const handleCheckboxChange = createEncouragedHandler(
    searchOptions.encouraged,
    updateSearchOptions
  );

  return (
    <FilterContainer title="Encouraged to Apply">
      <LabelInputContainer>
        <LabelCheckbox 
          label="Veteran" 
          checked={searchOptions.encouraged?.includes("Veteran") || false} 
          onChange={() => handleCheckboxChange("Veteran")}
        />
        <LabelCheckbox 
          label="Fair Chance" 
          checked={searchOptions.encouraged?.includes("Fair Chance") || false} 
          onChange={() => handleCheckboxChange("Fair Chance")}
        />
      </LabelInputContainer>
    </FilterContainer>
  );
} 