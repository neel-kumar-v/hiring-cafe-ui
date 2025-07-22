
import { useSearch } from "@/contexts/SearchContext";
import { Exclusion as ExclusionType } from "@/types/search";
import LabelCheckbox from "../util/LabelCheckbox";
import FilterContainer from "../util/FilterContainer";

export default function Exclusion() {
  const { searchOptions, updateSearchOptions } = useSearch();

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
      </div>
    </FilterContainer>
  );
}   