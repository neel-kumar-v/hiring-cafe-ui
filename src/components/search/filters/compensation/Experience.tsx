import { useApp } from "@/contexts/AppContext";
import { ExperienceLevel, Role, Select } from "@/types/search";
import { toast } from "sonner";
import FilterContainer from "../util/FilterContainer";
import LabelCheckbox from "../util/LabelCheckbox";
import LabelInputContainer from "../util/LabelInputContainer";
import RangeSlider from "../util/RangeSlider";

export default function Experience() {
  const { searchOptions, updateSearchOptions } = useApp();

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
      const allExceptSelected = allExperienceLevels.filter(item => item !== type);
      newExperience = allExceptSelected;
    } else if (currentExperience.level.includes(type)) {
      const filtered = currentExperience.level.filter((item: ExperienceLevel) => item !== type)
      newExperience = filtered.length === 0 ? "All" : filtered
    } else {
      const added = [...currentExperience.level, type]
      newExperience = added.length === allExperienceLevels.length ? "All" : added
    }

    updateSearchOptions({
      experience: {
        ...currentExperience,
        level: newExperience
      }
    });
  };

  const handleRoleCheckboxChange = (role: Role) => {
    const currentExperience = searchOptions.experience;
    let newRole: Select<Role>;
    const allRoles: Role[] = ["Individual Contributor", "People Manager"];
    
    if (!Array.isArray(currentExperience.role)) {
      const allExceptSelected = allRoles.filter(item => item !== role);
      newRole = allExceptSelected;
    } else if (currentExperience.role.includes(role)) {
      const filtered = currentExperience.role.filter((item: Role) => item !== role);
      newRole = filtered.length === 0 ? "All" : filtered;
    } else {
      const added = [...currentExperience.role, role];
      newRole = added.length === allRoles.length ? "All" : added;
    }

    // If both roles are unchecked, set both to true and show toast
    if (Array.isArray(newRole) && newRole.length === 0) {
      newRole = "All";
      toast.info("Selecting neither role type is the same as selecting all role types");
    }

    updateSearchOptions({
      experience: {
        ...currentExperience,
        role: newRole
      }
    });
  };

  const handleIndividualContributorRangeChange = (values: [number, number]) => {
    const currentExperience = searchOptions.experience;
    const range = { min: values[0], max: values[1] };
    updateSearchOptions({
      experience: {
        ...currentExperience,
        individualContributor: range
      }
    });
  };

  const handlePeopleManagerRangeChange = (values: [number, number]) => {
    const currentExperience = searchOptions.experience;
    const range = { min: values[0], max: values[1] };
    updateSearchOptions({
      experience: {
        ...currentExperience,
        peopleManager: range
      }
    });
  };

  const isIndividualContributorSelected = Array.isArray(searchOptions.experience.role) 
    ? searchOptions.experience.role.includes("Individual Contributor")
    : searchOptions.experience.role === "All";

  const isPeopleManagerSelected = Array.isArray(searchOptions.experience.role)
    ? searchOptions.experience.role.includes("People Manager")
    : searchOptions.experience.role === "All";

  const shouldShowIndividualContributorRange = isIndividualContributorSelected;
  const shouldShowPeopleManagerRange = isPeopleManagerSelected;

  // Convert Range to [number, number] for RangeSlider
  const individualContributorValue: [number, number] | undefined = 
    searchOptions.experience.individualContributor 
      ? [searchOptions.experience.individualContributor.min, searchOptions.experience.individualContributor.max]
      : undefined;

  const peopleManagerValue: [number, number] | undefined = 
    searchOptions.experience.peopleManager 
      ? [searchOptions.experience.peopleManager.min, searchOptions.experience.peopleManager.max]
      : undefined;

  return (
    <FilterContainer categoryId="experience" title="Experience">
      <LabelInputContainer title="Seniority">
        <LabelCheckbox 
          label="No Experience Required" 
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
      </LabelInputContainer>
      
      <LabelInputContainer title="Role Type">
        <LabelCheckbox 
          label="Individual Contributor" 
          checked={isIndividualContributorSelected}
          onChange={() => handleRoleCheckboxChange("Individual Contributor")}
        />
        <LabelCheckbox 
          label="People Manager" 
          checked={isPeopleManagerSelected}
          onChange={() => handleRoleCheckboxChange("People Manager")}
        />
      </LabelInputContainer>
      
      {shouldShowIndividualContributorRange && (
        <LabelInputContainer title="Individual Contributor Experience (Years)" midColCount={1} lgColCount={1}>
          <RangeSlider
            min={0}
            max={20}
            step={1}
            value={individualContributorValue}
            onValueChange={handleIndividualContributorRangeChange}
            money={false}
          />
        </LabelInputContainer>
      )}
      
      {shouldShowPeopleManagerRange && (
        <LabelInputContainer title="People Manager Experience (Years)" midColCount={1} lgColCount={1}>
          <RangeSlider
            min={0}
            max={20}
            step={1}
            value={peopleManagerValue}
            onValueChange={handlePeopleManagerRangeChange}
            money={false}
          />
        </LabelInputContainer>
      )}
    </FilterContainer>
  );
} 
