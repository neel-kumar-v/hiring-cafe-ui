import FilterContainer from "../util/FilterContainer";
import { KeywordsMultiSelect } from "../util/KeywordsMultiSelect";
import { useApp } from "@/contexts/AppContext";
import { useMemo } from "react";
import { getCompaniesFromData } from "@/lib/search";
import { Keywords } from "@/types/search";

export default function Company() {
  const companies = useMemo(() => getCompaniesFromData().map(company => ({
    label: company,
    value: company,
  })), []);
  const { searchOptions, updateSearchOptions } = useApp();

  const handleCompanyChange = (companies: Keywords) => {
    updateSearchOptions({
      company: companies,
    });
  };


  return (
    <FilterContainer title="Company Keywords">
      <KeywordsMultiSelect 
        value={searchOptions.company} 
        onChange={handleCompanyChange} 
        includeOptions={companies} 
        excludeOptions={companies} 
      />
    </FilterContainer>
  );
} 