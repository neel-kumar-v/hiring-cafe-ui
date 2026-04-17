import { useApp } from "@/contexts/AppContext";
import { createSelectHandler } from "@/lib/search";
import { SecurityClearance } from "@/types/search";
import FilterContainer from "../util/FilterContainer";
import LabelCheckbox from "../util/LabelCheckbox";
import LabelInputContainer from "../util/LabelInputContainer";

export default function Security() {
  const { searchOptions, updateSearchOptions } = useApp();

  const allSecurityClearances: SecurityClearance[] = [
    "None",
    "Confidential",
    "Secret",
    "Top Secret",
    "Top Secret/SCI",
    "Public Trust",
    "Interim Clearances",
    "Other"
  ];

  const handleCheckboxChange = createSelectHandler(
    searchOptions.security_clearance,
    allSecurityClearances,
    updateSearchOptions,
    "security_clearance"
  );

  return (
    <FilterContainer categoryId="security" title="Security Clearance">
      <LabelInputContainer>
        <LabelCheckbox 
          label="None" 
          checked={searchOptions.security_clearance.includes("None") || searchOptions.security_clearance === "All"} 
          onChange={() => handleCheckboxChange("None")}
        />
        <LabelCheckbox 
          label="Confidential" 
          checked={searchOptions.security_clearance.includes("Confidential") || searchOptions.security_clearance === "All"} 
          onChange={() => handleCheckboxChange("Confidential")}
        />
        <LabelCheckbox 
          label="Secret" 
          checked={searchOptions.security_clearance.includes("Secret") || searchOptions.security_clearance === "All"} 
          onChange={() => handleCheckboxChange("Secret")}
        />
        <LabelCheckbox 
          label="Top Secret" 
          checked={searchOptions.security_clearance.includes("Top Secret") || searchOptions.security_clearance === "All"} 
          onChange={() => handleCheckboxChange("Top Secret")}
        />
        <LabelCheckbox 
          label="Top Secret/SCI" 
          checked={searchOptions.security_clearance.includes("Top Secret/SCI") || searchOptions.security_clearance === "All"} 
          onChange={() => handleCheckboxChange("Top Secret/SCI")}
        />
        <LabelCheckbox 
          label="Public Trust" 
          checked={searchOptions.security_clearance.includes("Public Trust") || searchOptions.security_clearance === "All"} 
          onChange={() => handleCheckboxChange("Public Trust")}
        />
        <LabelCheckbox 
          label="Interim Clearances" 
          checked={searchOptions.security_clearance.includes("Interim Clearances") || searchOptions.security_clearance === "All"} 
          onChange={() => handleCheckboxChange("Interim Clearances")}
        />
        <LabelCheckbox 
          label="Other" 
          checked={searchOptions.security_clearance.includes("Other") || searchOptions.security_clearance === "All"} 
          onChange={() => handleCheckboxChange("Other")}
        />
      </LabelInputContainer>
    </FilterContainer>
  );
} 
