import { useSearch } from "@/contexts/SearchContext";
import { ExperienceLevel, Select } from "@/types/search";
import FilterContainer from "../util/FilterContainer";
import LabelCheckbox from "../util/LabelCheckbox";

export default function Experience() {
  const { searchOptions, updateSearchOptions } = useSearch();

  const handleSeniorityCheckboxChange = (type: ExperienceLevel) => {
    const currentExperience = searchOptions.experience;
    let newExperience: Select<ExperienceLevel>
    const allExperienceLevels: ExperienceLevel[] = [
      "None",
      "Entry Level",
      "Mid Level",
      "Senior Level"
    ]
    if (!Array.isArray(currentExperience.level)) {
      newExperience = [type]
    } else if (currentExperience.level.includes(type)) {
      const filtered = currentExperience.level.filter((item: ExperienceLevel) => item !== type)
      newExperience = filtered.length === 0 ? "All" : filtered
    } else {
      const added = [...currentExperience.level, type]
      newExperience = added.length === allExperienceLevels.length ? "All" : added
      // if (added.length === allExperienceLevels.length) toast.info(checkboxInfo("Experience"))
    }

    updateSearchOptions({
      experience: {
        ...currentExperience,
        level: newExperience
      }
    });
  };
  return (
    <FilterContainer title="Experience">
      {/* <p className="mb-2 -mt-2 text-base text-text font-medium">
        Seniority
      </p> */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <LabelCheckbox 
          label="No Prior Experience Required" 
          checked={searchOptions.experience.level.includes("None") || searchOptions.experience.level === "All"} 
          onChange={() => handleSeniorityCheckboxChange("None")}
        />
        <LabelCheckbox 
          label="Entry Level" 
          checked={searchOptions.experience.level.includes("Entry Level") || searchOptions.experience.level === "All"} 
          onChange={() => handleSeniorityCheckboxChange("Entry Level")}
        />
        <LabelCheckbox 
          label="Mid Level" 
          checked={searchOptions.experience.level.includes("Mid Level") || searchOptions.experience.level === "All"} 
          onChange={() => handleSeniorityCheckboxChange("Mid Level")}
        />
        <LabelCheckbox 
          label="Senior Level" 
          checked={searchOptions.experience.level.includes("Senior Level") || searchOptions.experience.level === "All"} 
          onChange={() => handleSeniorityCheckboxChange("Senior Level")}
        />
      </div>
    </FilterContainer>
  );
} 