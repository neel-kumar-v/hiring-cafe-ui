import { useApp } from "@/contexts/AppContext";
import { createSelectHandler } from "@/lib/search";
import { CommitmentLevel } from "@/types/search";
import FilterContainer from "../util/FilterContainer";
import LabelCheckbox from "../util/LabelCheckbox";
import LabelInputContainer from "../util/LabelInputContainer";

export default function Commitment() {
  const { searchOptions, updateSearchOptions } = useApp();

  const allCommitmentLevels: CommitmentLevel[] = [
    "Full Time",
    "Part Time",
    "Contract",
    "Internship",
    "Temporary",
    "Volunteer",
    "Seasonal"
  ];

  const handleCheckboxChange = createSelectHandler(
    searchOptions.commitment,
    allCommitmentLevels,
    updateSearchOptions,
    "commitment"
  );

  return (
    <FilterContainer categoryId="commitment" title="Commitment Level">
      <LabelInputContainer>
        <LabelCheckbox 
          label="Full Time" 
          checked={searchOptions.commitment.includes("Full Time") || searchOptions.commitment === "All"} 
          onChange={() => handleCheckboxChange("Full Time")}
        />
        <LabelCheckbox 
          label="Part Time" 
          checked={searchOptions.commitment.includes("Part Time") || searchOptions.commitment === "All"} 
          onChange={() => handleCheckboxChange("Part Time")}
        />

        <LabelCheckbox 
          label="Contract" 
          checked={searchOptions.commitment.includes("Contract") || searchOptions.commitment === "All"} 
          onChange={() => handleCheckboxChange("Contract")}
        />
        <LabelCheckbox 
          label="Internship" 
          checked={searchOptions.commitment.includes("Internship") || searchOptions.commitment === "All"} 
          onChange={() => handleCheckboxChange("Internship")}
        />
        <LabelCheckbox 
          label="Temporary" 
          checked={searchOptions.commitment.includes("Temporary") || searchOptions.commitment === "All"} 
          onChange={() => handleCheckboxChange("Temporary")}
        />
        <LabelCheckbox 
          label="Volunteer" 
          checked={searchOptions.commitment.includes("Volunteer") || searchOptions.commitment === "All"} 
          onChange={() => handleCheckboxChange("Volunteer")}
        />
        <LabelCheckbox 
          label="Seasonal" 
          checked={searchOptions.commitment.includes("Seasonal") || searchOptions.commitment === "All"} 
          onChange={() => handleCheckboxChange("Seasonal")}
        />
      </LabelInputContainer>
    </FilterContainer>
  );
} 
