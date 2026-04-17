import { useApp } from "@/contexts/AppContext";
import { createBenefitsHandler } from "@/lib/search";
import FilterContainer from "../util/FilterContainer";
import LabelCheckbox from "../util/LabelCheckbox";
import LabelInputContainer from "../util/LabelInputContainer";

export default function Benefits() {
  const { searchOptions, updateSearchOptions } = useApp();

  const handleBenefitsCheckboxChange = createBenefitsHandler(
    searchOptions.benefits,
    updateSearchOptions
  );

  return (
    <FilterContainer categoryId="benefits" title="Benefits & Perks">
      <LabelInputContainer>
        <LabelCheckbox 
          label="PTO" 
          checked={searchOptions.benefits?.includes("PTO") || false} 
          onChange={() => handleBenefitsCheckboxChange("PTO")}
        />
        <LabelCheckbox 
          label="4 Days" 
          checked={searchOptions.benefits?.includes("4 Days") || false} 
          onChange={() => handleBenefitsCheckboxChange("4 Days")}
        />
        <LabelCheckbox 
          label="401k" 
          checked={searchOptions.benefits?.includes("401k") || false} 
          onChange={() => handleBenefitsCheckboxChange("401k")}
        />
        <LabelCheckbox 
          label="Parental Leave" 
          checked={searchOptions.benefits?.includes("Parental Leave") || false} 
          onChange={() => handleBenefitsCheckboxChange("Parental Leave")}
        />
        <LabelCheckbox 
          label="Retirement" 
          checked={searchOptions.benefits?.includes("Retirement") || false} 
          onChange={() => handleBenefitsCheckboxChange("Retirement")}
        />
        <LabelCheckbox 
          label="Tuition" 
          checked={searchOptions.benefits?.includes("Tuition") || false} 
          onChange={() => handleBenefitsCheckboxChange("Tuition")}
        />
        <LabelCheckbox 
          label="Visa" 
          checked={searchOptions.benefits?.includes("Visa") || false} 
          onChange={() => handleBenefitsCheckboxChange("Visa")}
        />
        <LabelCheckbox 
          label="Relocation" 
          checked={searchOptions.benefits?.includes("Relocation") || false} 
          onChange={() => handleBenefitsCheckboxChange("Relocation")}
        />
      </LabelInputContainer>
    </FilterContainer>
  );
} 
