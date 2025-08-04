import { useApp } from "@/contexts/AppContext";
import { createKeywordsHandler } from "@/lib/search";
import { getLanguagesFromData } from "@/lib/search";
import { useMemo } from "react";
import FilterContainer from "../util/FilterContainer";
import { KeywordsMultiSelect } from "../util/KeywordsMultiSelect";

export default function Languages() {
  const { searchOptions, updateSearchOptions } = useApp();

  const handleLanguagesChange = createKeywordsHandler(
    updateSearchOptions,
    "language"
  );

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