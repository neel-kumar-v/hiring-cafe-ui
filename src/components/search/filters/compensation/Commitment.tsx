import { useSearch } from "@/contexts/SearchContext";
import { CommitmentLevel, Select } from "@/types/search";
import FilterContainer from "../util/FilterContainer";
import LabelCheckbox from "../util/LabelCheckbox";

export default function Commitment() {
  const { searchOptions, updateSearchOptions } = useSearch();

  const handleCheckboxChange = (type: CommitmentLevel) => {
    const currentCommitment = searchOptions.commitment;
    let newCommitment: Select<CommitmentLevel>
    const allCommitmentLevels: CommitmentLevel[] = [
      "Full Time",
      "Part Time",
      "Contract",
      "Internship",
      "Temporary",
      "Volunteer",
      "Seasonal"
    ]
    if (!Array.isArray(currentCommitment)) {
      newCommitment = [type]
    } else if (currentCommitment.includes(type)) {
      const filtered = currentCommitment.filter((item: CommitmentLevel) => item !== type)
      newCommitment = filtered.length === 0 ? "All" : filtered
    } else {
      const added = [...currentCommitment, type]
      newCommitment = added.length === allCommitmentLevels.length ? "All" : added
      // if (added.length === allCommitmentLevels.length) toast.info(checkboxInfo("Commitment Level"))
    }
    updateSearchOptions({
      commitment: newCommitment
    });
  };
  return (
    <FilterContainer title="Commitment Level">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
      </div>
    </FilterContainer>
  );
} 