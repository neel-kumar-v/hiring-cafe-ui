import { useApp } from "@/contexts/AppContext";
import { ExperienceLevel, Role, Select } from "@/types/search";
import { Input } from "@/components/ui/input";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import FilterContainer from "../util/FilterContainer";
import LabelCheckbox from "../util/LabelCheckbox";
import LabelInputContainer from "../util/LabelInputContainer";

export default function Experience() {
  const { searchOptions, updateSearchOptions } = useApp();
  const [icMin, setIcMin] = useState("");
  const [icMax, setIcMax] = useState("");
  const [pmMin, setPmMin] = useState("");
  const [pmMax, setPmMax] = useState("");

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

  useEffect(() => {
    const ic = searchOptions.experience.individualContributor;
    const pm = searchOptions.experience.peopleManager;
    setIcMin(ic?.min ? String(ic.min) : "");
    setIcMax(ic?.max ? String(ic.max) : "");
    setPmMin(pm?.min ? String(pm.min) : "");
    setPmMax(pm?.max ? String(pm.max) : "");
  }, [
    searchOptions.experience.individualContributor?.max,
    searchOptions.experience.individualContributor?.min,
    searchOptions.experience.peopleManager?.max,
    searchOptions.experience.peopleManager?.min,
  ]);

  const toNumberOrZero = (value: string) => {
    if (!value) return 0;
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

  const commitIndividualContributor = useCallback(() => {
    const rawMin = toNumberOrZero(icMin);
    const rawMax = toNumberOrZero(icMax);
    const min = clamp(rawMin, 0, 20);
    const max = clamp(rawMax, 0, 20);

    const next =
      icMin === "" && icMax === ""
        ? null
        : min > 0 && max > 0 && min > max
          ? { min: max, max: min }
          : { min, max: icMax === "" ? 20 : max };

    updateSearchOptions({
      experience: {
        ...searchOptions.experience,
        individualContributor: next,
      },
    });
  }, [icMax, icMin, searchOptions.experience, updateSearchOptions]);

  const commitPeopleManager = useCallback(() => {
    const rawMin = toNumberOrZero(pmMin);
    const rawMax = toNumberOrZero(pmMax);
    const min = clamp(rawMin, 0, 20);
    const max = clamp(rawMax, 0, 20);

    const next =
      pmMin === "" && pmMax === ""
        ? null
        : min > 0 && max > 0 && min > max
          ? { min: max, max: min }
          : { min, max: pmMax === "" ? 20 : max };

    updateSearchOptions({
      experience: {
        ...searchOptions.experience,
        peopleManager: next,
      },
    });
  }, [pmMax, pmMin, searchOptions.experience, updateSearchOptions]);

  const isIndividualContributorSelected = Array.isArray(searchOptions.experience.role) 
    ? searchOptions.experience.role.includes("Individual Contributor")
    : searchOptions.experience.role === "All";

  const isPeopleManagerSelected = Array.isArray(searchOptions.experience.role)
    ? searchOptions.experience.role.includes("People Manager")
    : searchOptions.experience.role === "All";

  const shouldShowIndividualContributorRange = isIndividualContributorSelected;
  const shouldShowPeopleManagerRange = isPeopleManagerSelected;

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
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-foreground">Min</label>
              <Input
                className="w-full text-sm [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden"
                inputMode="numeric"
                placeholder="No min"
                type="text"
                value={icMin}
                onChange={(e) => setIcMin(e.target.value.replace(/[^0-9]/g, ""))}
                onBlur={commitIndividualContributor}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-foreground">Max</label>
              <Input
                className="w-full text-sm [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden"
                inputMode="numeric"
                placeholder="No max"
                type="text"
                value={icMax}
                onChange={(e) => setIcMax(e.target.value.replace(/[^0-9]/g, ""))}
                onBlur={commitIndividualContributor}
              />
            </div>
          </div>
        </LabelInputContainer>
      )}
      
      {shouldShowPeopleManagerRange && (
        <LabelInputContainer title="People Manager Experience (Years)" midColCount={1} lgColCount={1}>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-foreground">Min</label>
              <Input
                className="w-full text-sm [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden"
                inputMode="numeric"
                placeholder="No min"
                type="text"
                value={pmMin}
                onChange={(e) => setPmMin(e.target.value.replace(/[^0-9]/g, ""))}
                onBlur={commitPeopleManager}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-foreground">Max</label>
              <Input
                className="w-full text-sm [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden"
                inputMode="numeric"
                placeholder="No max"
                type="text"
                value={pmMax}
                onChange={(e) => setPmMax(e.target.value.replace(/[^0-9]/g, ""))}
                onBlur={commitPeopleManager}
              />
            </div>
          </div>
        </LabelInputContainer>
      )}
    </FilterContainer>
  );
} 
