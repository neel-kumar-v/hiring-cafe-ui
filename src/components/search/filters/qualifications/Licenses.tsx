import { useApp } from "@/contexts/AppContext";
import { createLicenseCertificationHandler, createLicenseCertificationHideRequiredHandler, getLicensesFromData } from "@/lib/search";
import { useMemo } from "react";
import FilterContainer from "../util/FilterContainer";
import { KeywordsMultiSelect } from "../util/KeywordsMultiSelect";
import LabelCheckbox from "../util/LabelCheckbox";
import LabelInputContainer from "../util/LabelInputContainer";

export default function Licenses() {
  const { searchOptions, updateSearchOptions } = useApp();

  const handleLicensesChange = createLicenseCertificationHandler(
    searchOptions.license_certification,
    updateSearchOptions
  );

  const handleHideRequiredLicensesChange = createLicenseCertificationHideRequiredHandler(
    searchOptions.license_certification,
    updateSearchOptions
  );

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
          onChange={handleHideRequiredLicensesChange}
        />
      </LabelInputContainer>
      <KeywordsMultiSelect
        value={searchOptions.license_certification.keywords}
        onChange={handleLicensesChange}
        includeOptions={licenses}
        excludeOptions={licenses}
        includePlaceholder="Include Licenses"
        excludePlaceholder="Exclude Licenses"
      />
    </FilterContainer>
  );
} 