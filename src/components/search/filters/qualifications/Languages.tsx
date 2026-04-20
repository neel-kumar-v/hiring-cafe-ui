import { useApp } from "@/contexts/AppContext";
import { createKeywordsHandler } from "@/lib/search";
import FilterContainer from "../util/FilterContainer";
import { KeywordsMultiSelect } from "../util/KeywordsMultiSelect";
import { useSearchData } from "@/hooks/useSearchData";

export default function Languages() {
  const { searchOptions, updateSearchOptions } = useApp();

  const handleLanguagesChange = createKeywordsHandler(
    updateSearchOptions,
    "language"
  );

  const { options: languages, loading } = useSearchData("languages", true);

  return (
    <FilterContainer categoryId="languages" title="Languages">
      {loading ? (
        <div className="text-sm text-muted-foreground">Loading languages...</div>
      ) : (
        <KeywordsMultiSelect
          value={searchOptions.language}
          onChange={(languages) => handleLanguagesChange(languages)}
          includeOptions={languages}
          excludeOptions={languages}
          includePlaceholder="Include Languages"
          excludePlaceholder="Exclude Languages"
        />
      )}
    </FilterContainer>
  );
} 
