"use client";

import { useApp } from "@/contexts/AppContext";
import { useSearchData } from "@/hooks/useSearchData";
import { createEducationKeywordsHandler } from "@/lib/search";
import { formatCountedList } from "@/lib/search/sentence-query";
import type { DegreePreferences, DegreePreferencesOptions, Keywords, Select } from "@/types/search";
import FilterContainer from "../util/FilterContainer";
import { SentenceBlankMultiSelect, SentenceBlankSelect, SentenceText } from "../util/sentence-query";

type DegreeKey = keyof DegreePreferencesOptions;

const DEGREE_ROWS: Array<{ key: DegreeKey; label: string }> = [
  { key: "associate", label: "Associate's" },
  { key: "bachelor", label: "Bachelor's" },
  { key: "master", label: "Master's" },
  { key: "doctorate", label: "Doctorate" },
];

const PREFERENCE_OPTIONS: Array<{ value: DegreePreferences; label: string; phrase: string }> = [
  { value: "Required", label: "be required", phrase: "be required" },
  { value: "Preferred", label: "be preferred", phrase: "be preferred" },
  { value: "Not Mentioned", label: "not be mentioned", phrase: "not be mentioned" },
];

const ANY_FIELD_TEXT = "any";

function selectedPreference(value: Select<DegreePreferences, null> | undefined): DegreePreferences | undefined {
  return Array.isArray(value) && value.length > 0 ? value[0] : undefined;
}

function preferencePhrase(value: Select<DegreePreferences, null> | undefined): string {
  const selected = selectedPreference(value) ?? "Not Mentioned";
  return PREFERENCE_OPTIONS.find((option) => option.value === selected)?.phrase ?? "not be mentioned";
}

function includeList(keywords: Keywords | undefined): string[] {
  if (!keywords || !Array.isArray(keywords.include)) return [];
  return keywords.include.filter(Boolean);
}

function fieldPhrase(keywords: Keywords | undefined): string {
  const include = includeList(keywords);
  return formatCountedList(include, { conjunction: "or", n1: 3, noneText: ANY_FIELD_TEXT });
}

export function getEducationTitle(education?: DegreePreferencesOptions): string {
  return DEGREE_ROWS.map(({ key, label }) => {
    const row = education?.[key];
    return `${label} degree in ${fieldPhrase(row?.keywords)} should ${preferencePhrase(row?.preferences)}`;
  }).join(". ");
}

function mergeBlankOptions(options: { label: string; value: string }[], selected: string[]) {
  const seen = new Set(options.map((option) => option.value));
  const extras = selected.filter((value) => !seen.has(value)).map((value) => ({ label: value, value }));
  return [...extras, ...options];
}

export default function Education() {
  const { searchOptions, updateSearchOptions } = useApp();
  const { options: degreeTitles } = useSearchData("bachelors_degree_titles", true);

  const handleKeywordsChange = createEducationKeywordsHandler(searchOptions.education, updateSearchOptions);

  return (
    <FilterContainer categoryId="education" chrome="stream">
      {DEGREE_ROWS.map(({ key, label }) => {
        const row = searchOptions.education[key];
        const fields = includeList(row.keywords);
        const fieldOptions = mergeBlankOptions(degreeTitles, fields);
        const preference = selectedPreference(row.preferences) ?? "Not Mentioned";

        return (
          <SentenceText key={key}>
            {label} degree in
            <SentenceBlankMultiSelect
              ariaLabel={`${label} fields of study`}
              options={fieldOptions}
              values={fields}
              onChange={(next) =>
                handleKeywordsChange(key, {
                  include: next,
                  exclude: row.keywords.exclude,
                })
              }
              placeholder={ANY_FIELD_TEXT}
              formatOptions={{ conjunction: "or", n1: 3, noneText: ANY_FIELD_TEXT }}
              contentClassName="max-h-64 overflow-y-auto"
              searchPlaceholder="Search fields of study..."
            />
            should
            <SentenceBlankSelect
              ariaLabel={`${label} degree preference`}
              options={PREFERENCE_OPTIONS}
              value={preference}
              onChange={(next) => {
                const current = Array.isArray(row.preferences) ? row.preferences : [];
                if (current.length === 1 && current[0] === next) return;
                // Keep null (unedited) when the blank still reads as the default phrase.
                const preferences = next === "Not Mentioned" && current.length === 0 ? null : [next];
                updateSearchOptions({
                  education: {
                    ...searchOptions.education,
                    [key]: { ...row, preferences },
                  },
                });
              }}
            />
          </SentenceText>
        );
      })}
    </FilterContainer>
  );
}
