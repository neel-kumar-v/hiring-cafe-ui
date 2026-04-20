import { useApp } from "@/contexts/AppContext";
import { createLicenseCertificationHandler, createLicenseCertificationHideRequiredHandler } from "@/lib/search";
import FilterContainer from "../util/FilterContainer";
import { KeywordsMultiSelect } from "../util/KeywordsMultiSelect";
import LabelCheckbox from "../util/LabelCheckbox";
import LabelInputContainer from "../util/LabelInputContainer";
import { useSearchData } from "@/hooks/useSearchData";

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

  const { options: licenses, loading } = useSearchData("licenses", false);

  return (
    <FilterContainer categoryId="licenses" title="Licenses & Certifications">
      <LabelInputContainer midColCount={1} lgColCount={1}>
        <LabelCheckbox
          label="Hide Required Licenses"
          checked={searchOptions.license_certification.hide_required}
          onChange={handleHideRequiredLicensesChange}
        />
      </LabelInputContainer>
      {loading ? (
        <div className="text-sm text-muted-foreground">Loading licenses...</div>
      ) : (
        <KeywordsMultiSelect
          value={searchOptions.license_certification.keywords}
          onChange={handleLicensesChange}
          includeOptions={licenses}
          excludeOptions={licenses}
          includePlaceholder="Include Licenses"
          excludePlaceholder="Exclude Licenses"
        />
      )}
    </FilterContainer>
  );
} 
