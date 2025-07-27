import { useApp } from "@/contexts/AppContext";
import { type Encouraged } from "@/types/search";
import FilterContainer from "../util/FilterContainer";
import LabelCheckbox from "../util/LabelCheckbox";
import { LabelInputContainer } from "../util/LabelInputContainer";

export default function Encouraged() {
  const { searchOptions, updateSearchOptions } = useApp();

  const handleCheckboxChange = (type: Encouraged) => {
    const currentEncouraged = searchOptions.encouraged;
    const newEncouraged = currentEncouraged?.includes(type)
      ? currentEncouraged.filter(item => item !== type)
      : [...(currentEncouraged || []), type];
    
    updateSearchOptions({
      encouraged: newEncouraged
    });
  };

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