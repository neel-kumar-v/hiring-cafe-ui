import { useApp } from "@/contexts/AppContext";
import FilterContainer from "../util/FilterContainer";
import { KeywordsMultiSelect } from "../util/KeywordsMultiSelect";
import { useMemo } from "react";
import { Keywords } from "@/types/search";
import { getLicensesFromData } from "@/lib/search";
import LabelCheckbox, { LabelCheckboxContainer } from "../util/LabelCheckbox";

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
      <LabelCheckboxContainer midColCount={1} lgColCount={1}>
        <LabelCheckbox
          label="Hide Required Licenses"
          checked={searchOptions.license_certification.hide_required}
          onChange={() => handleHideRequiredLicensesChange()}
        />
      </LabelCheckboxContainer>
      <KeywordsMultiSelect
        value={searchOptions.license_certification.keywords}
        onChange={(licenses) => handleLicensesChange(licenses)}
        includeOptions={licenses}
        excludeOptions={licenses}
      />
    </FilterContainer>
  );
} 