"use client";

import { useApp } from "@/contexts/AppContext";
import type { SortOptions } from "@/types/search";
import FilterContainer from "../util/FilterContainer";
import { SentenceBlankSelect, SentenceText } from "../util/sentence-query";

type SortPreset = {
  label: string;
  phrase: string;
  value: SortOptions;
};

const SORT_PRESETS: SortPreset[] = [
  { label: "Relevance", phrase: "relevance", value: { by: "Relevance", order: "Most" } },
  { label: "Most recent", phrase: "most recent", value: { by: "Recency", order: "Most" } },
  { label: "Oldest", phrase: "oldest", value: { by: "Recency", order: "Least" } },
  { label: "Highest salary", phrase: "highest salary", value: { by: "Salary", order: "Most" } },
  { label: "Lowest salary", phrase: "lowest salary", value: { by: "Salary", order: "Least" } },
  { label: "Most experience", phrase: "most experience", value: { by: "Experience", order: "Most" } },
  { label: "Least experience", phrase: "least experience", value: { by: "Experience", order: "Least" } },
];

/** Sentence phrase for the current sort state ("most recent", "lowest salary", …). */
export function getSortPhrase(sort: SortOptions): string {
  const currentPreset = SORT_PRESETS.find((preset) => preset.value.by === sort.by && preset.value.order === sort.order);

  if (currentPreset) {
    return currentPreset.phrase;
  }

  return `${sort.order === "Least" ? "least" : "most"} ${sort.by.toLowerCase()}`;
}

/** Complete sentence title for a given sort state. */
export function getSortTitle(sort: SortOptions): string {
  return `Sort jobs by ${getSortPhrase(sort)}`;
}

function presetKey(sort: SortOptions): string {
  return `${sort.by}:${sort.order}`;
}

const SORT_BLANK_OPTIONS = SORT_PRESETS.map((preset) => ({
  value: presetKey(preset.value),
  label: preset.label,
  phrase: preset.phrase,
}));

export default function Sorting() {
  const { searchOptions, updateSearchOptions } = useApp();

  const title = (
    <SentenceText>
      Sort jobs by
      <SentenceBlankSelect
        ariaLabel="Sort jobs by"
        value={presetKey(searchOptions.sort)}
        placeholder={getSortPhrase(searchOptions.sort)}
        onChange={(key) => {
          const preset = SORT_PRESETS.find((option) => presetKey(option.value) === key);
          if (preset) {
            updateSearchOptions({
              sort: preset.value,
            });
          }
        }}
        options={SORT_BLANK_OPTIONS}
      />
    </SentenceText>
  );

  return <FilterContainer categoryId="sorting" title={title} chrome="stream" />;
}
