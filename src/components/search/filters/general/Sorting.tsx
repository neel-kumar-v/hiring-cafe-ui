"use client";

import { useApp } from "@/contexts/AppContext";
import type { SortOptions } from "@/types/search";
import FilterContainer from "../util/FilterContainer";
import LabelInputContainer from "../util/LabelInputContainer";
import LabelRadio from "../util/LabelRadio";

type SortPreset = {
  label: string;
  value: SortOptions;
};

const SORT_PRESETS: SortPreset[] = [
  { label: "Relevance", value: { by: "Relevance", order: "Most" } },
  { label: "Most recent", value: { by: "Recency", order: "Most" } },
  { label: "Oldest", value: { by: "Recency", order: "Least" } },
  { label: "Highest salary", value: { by: "Salary", order: "Most" } },
  { label: "Lowest salary", value: { by: "Salary", order: "Least" } },
  { label: "Most experience", value: { by: "Experience", order: "Most" } },
  { label: "Least experience", value: { by: "Experience", order: "Least" } },
];

export default function Sorting() {
  const { searchOptions, updateSearchOptions } = useApp();

  return (
    <FilterContainer categoryId="sorting" title="Sort By">
      <LabelInputContainer midColCount={3} lgColCount={3}>
        {SORT_PRESETS.map((preset) => (
          <LabelRadio
            key={preset.label}
            label={preset.label}
            checked={
              searchOptions.sort.by === preset.value.by &&
              searchOptions.sort.order === preset.value.order
            }
            onChange={() =>
              updateSearchOptions({
                sort: preset.value,
              })
            }
          />
        ))}
      </LabelInputContainer>
    </FilterContainer>
  );
}
