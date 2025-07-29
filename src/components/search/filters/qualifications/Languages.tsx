import { useApp } from "@/contexts/AppContext";
import FilterContainer from "../util/FilterContainer";
import { KeywordsMultiSelect } from "../util/KeywordsMultiSelect";
import { Keywords } from "@/types/search";
import { useMemo } from "react";
import { getLanguagesFromData } from "@/lib/search";

export default function Languages() {
  const { searchOptions, updateSearchOptions } = useApp();

  const handleLanguagesChange = (languages: Keywords) => {
    updateSearchOptions({
      language: languages
    });
  };

  const languages = useMemo(() => {
    return getLanguagesFromData().map(language => ({
      label: language,
      value: language
    }));
  }, []);

  return (
    <FilterContainer title="Languages">
      <KeywordsMultiSelect
        value={searchOptions.language}
        onChange={(languages) => handleLanguagesChange(languages)}
        includeOptions={languages}
        excludeOptions={languages}
        includePlaceholder="Include Languages"
        excludePlaceholder="Exclude Languages"
      />
    </FilterContainer>
  );
} 