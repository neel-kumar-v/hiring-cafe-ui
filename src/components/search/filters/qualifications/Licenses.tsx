import { useApp } from "@/contexts/AppContext";
import { getLicensesFromData } from "@/lib/search";
import { Keywords } from "@/types/search";
import { useMemo } from "react";
import FilterContainer from "../util/FilterContainer";
import { KeywordsMultiSelect } from "../util/KeywordsMultiSelect";
import LabelCheckbox from "../util/LabelCheckbox";
import LabelInputContainer from "../util/LabelInputContainer";

export default function Licenses() {
  const { searchOptions, updateSearchOptions } = useApp();

  const handleLicensesChange = (licenses: Keywords) => {
    updateSearchOptions({
      license_certification: {
        keywords: licenses,
        hide_required: searchOptions.license_certification.hide_required
      }
    });
  };

  const handleHideRequiredLicensesChange = () => {
    updateSearchOptions({
      license_certification: {
        keywords: searchOptions.license_certification.keywords,
        hide_required: !searchOptions.license_certification.hide_required
      }
    });
  };

  const licenses = useMemo(() => {
    return getLicensesFromData().map(license => ({
      label: license,
      value: license
    }));
  }, []);

  return (
    <FilterContainer title="Licenses & Certifications">
      <LabelInputContainer midColCount={1} lgColCount={1}>
        <LabelCheckbox
          label="Hide Required Licenses"
          checked={searchOptions.license_certification.hide_required}
          onChange={() => handleHideRequiredLicensesChange()}
        />
      </LabelInputContainer>
      <KeywordsMultiSelect
        value={searchOptions.license_certification.keywords}
        onChange={(licenses) => handleLicensesChange(licenses)}
        includeOptions={licenses}
        excludeOptions={licenses}
        includePlaceholder="Include Licenses"
        excludePlaceholder="Exclude Licenses"
      />
    </FilterContainer>
  );
} 