import { useApp } from "@/contexts/AppContext";
import { SecurityClearance, Select } from "@/types/search";
import FilterContainer from "../util/FilterContainer";
import LabelCheckbox, { LabelCheckboxContainer } from "../util/LabelCheckbox";

export default function Security() {
  const { searchOptions, updateSearchOptions } = useApp();

  const handleCheckboxChange = (security: SecurityClearance) => {
    const currentSecurity = searchOptions.security_clearance;
    let newSecurity: Select<SecurityClearance>;

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
    
    if (!Array.isArray(currentSecurity)) {
      const allExceptSelected = allSecurityClearances.filter(item => item !== security);
      newSecurity = allExceptSelected;
    } else if (currentSecurity.includes(security)) {
      const filtered = currentSecurity.filter(item => item !== security);
      newSecurity = filtered.length === 0 ? "All" : filtered;
    } else {
      newSecurity = [...currentSecurity, security];
      if (newSecurity.length === allSecurityClearances.length) newSecurity = "All";
    }
    
    updateSearchOptions({
      security_clearance: newSecurity
    });
  }

  return (
    <FilterContainer title="Security Clearance">
      <LabelCheckboxContainer>
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
      </LabelCheckboxContainer>
    </FilterContainer>
  );
} 