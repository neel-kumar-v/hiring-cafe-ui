import { useApp } from "@/contexts/AppContext";
import { createCompanyHandler, getCompanyOptions } from "@/lib/search";
import FilterContainer from "../util/FilterContainer";
import { KeywordsMultiSelect } from "../util/KeywordsMultiSelect";

export default function Company() {
  const companies = getCompanyOptions();
  const { searchOptions, updateSearchOptions } = useApp();

  const handleCompanyChange = createCompanyHandler(updateSearchOptions);


  return (
    <FilterContainer title="Company Keywords">
      <KeywordsMultiSelect 
        value={searchOptions.company} 
        onChange={handleCompanyChange} 
        includeOptions={companies} 
        excludeOptions={companies} 
        includePlaceholder="Include Company Names"
        excludePlaceholder="Exclude Company Names"
      />
    </FilterContainer>
  );
} 