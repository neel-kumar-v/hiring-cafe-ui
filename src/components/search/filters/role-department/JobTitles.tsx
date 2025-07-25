import { BooleanTextbox } from "@/components/search/filters/util/BooleanTextbox";
import { useSearch } from "@/contexts/SearchContext";
import FilterContainer from "../util/FilterContainer";

const FIELDS = [
  { key: "title", label: "Title" },
  { key: "technical", label: "Technical" },
  { key: "description", label: "Description" },
  { key: "requirements", label: "Requirements" },
] as const;

export default function JobTitles() {
  const { searchOptions, updateSearchOptions } = useSearch();

  return (
    <FilterContainer title="Job Titles & Keywords">
      <div className="flex flex-col gap-6">
        {FIELDS.map(({ key, label }) => (
          <div key={key} className="w-full">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">{label}</span>
            </div>
            <div className="w-full mt-1">
              <BooleanTextbox
                value={searchOptions.job_titles[key]}
                onChange={expr => updateSearchOptions({ job_titles: { ...searchOptions.job_titles, [key]: expr } })}
                placeholder={`Enter boolean search for ${label.toLowerCase()}`}
              />
            </div>
          </div>
        ))}
      </div>
    </FilterContainer>
  );
} 