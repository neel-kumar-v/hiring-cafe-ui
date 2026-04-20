import { useApp } from "@/contexts/AppContext";
import { createCompanyHandler } from "@/lib/search";
import FilterContainer from "../util/FilterContainer";
import { KeywordsMultiSelect } from "../util/KeywordsMultiSelect";
import { useSearchData } from "@/hooks/useSearchData";

export default function Company() {
  const { options: companies, loading } = useSearchData("companies", true);
  const { searchOptions, updateSearchOptions } = useApp();

  const handleCompanyChange = createCompanyHandler(updateSearchOptions);

  return (
    <FilterContainer categoryId="company" title="Company Keywords">
      {loading ? (
        <div className="text-sm text-muted-foreground">Loading companies...</div>
      ) : (
        <KeywordsMultiSelect 
          value={searchOptions.company} 
          onChange={handleCompanyChange} 
          includeOptions={companies} 
          excludeOptions={companies} 
          includePlaceholder="Include Company Names"
          excludePlaceholder="Exclude Company Names"
        />
      )}
    </FilterContainer>
  );
}
