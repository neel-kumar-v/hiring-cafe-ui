"use client";

import { BooleanTextbox } from "@/components/search/filters/util/BooleanTextbox";
import { useApp } from "@/contexts/AppContext";
// import { getJobTitlesFromData } from "@/lib/search";
import FilterContainer from "../util/FilterContainer";

const FIELDS = [
  { key: "title", label: "Title Keywords" },
  { key: "technical", label: "Technical Keywords" },
  { key: "description", label: "Description Keywords" },
  { key: "requirements", label: "Requirements Keywords" },
] as const;

export default function JobTitles() {
  const { searchOptions, updateSearchOptions } = useApp();
  // const jobTitles = getJobTitlesFromData();

  return (
    <FilterContainer title="Job Titles & Keywords" help="Setup a boolean search for job keywords. e.g. 'software engineer AND NOT (react OR angular)' searches for software engineers that don't have react or angular in their job title.">
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
                // options={jobTitles}
              />
            </div>
          </div>
        ))}
      </div>
    </FilterContainer>
  );
} 