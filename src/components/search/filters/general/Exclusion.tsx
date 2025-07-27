
import { useApp } from "@/contexts/AppContext";
import { Exclusion as ExclusionType } from "@/types/search";
import FilterContainer from "../util/FilterContainer";
import LabelCheckbox from "../util/LabelCheckbox";
import LabelInputContainer from "../util/LabelInputContainer";

export default function Exclusion() {
  const { searchOptions, updateSearchOptions } = useApp();

  const handleCheckboxChange = (type: ExclusionType) => {
    const currentExclusion = searchOptions.exclusion;
    const newExclusion = currentExclusion.includes(type)
      ? currentExclusion.filter((item: ExclusionType) => item !== type)
      : [...currentExclusion, type];
    
    updateSearchOptions({
      exclusion: newExclusion
    });
  };

  return (
    <FilterContainer title="Exclude Jobs you have">
      <LabelInputContainer>
        <LabelCheckbox 
          label="Applied" 
          checked={searchOptions.exclusion.includes("Applied")} 
          onChange={() => handleCheckboxChange("Applied")}
        />
        <LabelCheckbox 
          label="Viewed" 
          checked={searchOptions.exclusion.includes("Viewed")} 
          onChange={() => handleCheckboxChange("Viewed")}
        />
        <LabelCheckbox 
          label="Saved" 
          checked={searchOptions.exclusion.includes("Saved")} 
          onChange={() => handleCheckboxChange("Saved")}
        />
        <LabelCheckbox 
          label="Hidden" 
          checked={searchOptions.exclusion.includes("Hidden")} 
          onChange={() => handleCheckboxChange("Hidden")}
        />
      </LabelInputContainer>
    </FilterContainer>
  );
}   