"use client";

import { useApp } from "@/contexts/AppContext";
import type { TimeUnits } from "@/types/search";
import FilterContainer from "../util/FilterContainer";
import LabelInputContainer from "../util/LabelInputContainer";
import LabelRadio from "../util/LabelRadio";

type DatePreset = {
  label: string;
  magnitude: number;
  unit: TimeUnits;
};

const DATE_PRESETS: DatePreset[] = [
  { label: "All time", magnitude: 10, unit: "Years" },
  { label: "Past 24 hours", magnitude: 24, unit: "Hours" },
  { label: "3 days", magnitude: 3, unit: "Days" },
  { label: "1 week", magnitude: 1, unit: "Weeks" },
  { label: "2 weeks", magnitude: 2, unit: "Weeks" },
  { label: "3 weeks", magnitude: 3, unit: "Weeks" },
  { label: "1 month", magnitude: 1, unit: "Months" },
  { label: "2 months", magnitude: 2, unit: "Months" },
  { label: "3 months", magnitude: 3, unit: "Months" },
  { label: "4 months", magnitude: 4, unit: "Months" },
  { label: "5 months", magnitude: 5, unit: "Months" },
  { label: "6 months", magnitude: 6, unit: "Months" },
  { label: "1 year", magnitude: 1, unit: "Years" },
  { label: "2 years", magnitude: 2, unit: "Years" },
  { label: "3 years", magnitude: 3, unit: "Years" },
];

export default function DateRange() {
  const { searchOptions, updateSearchOptions } = useApp();

  const currentPreset = DATE_PRESETS.find(
    (preset) =>
      preset.magnitude === searchOptions.date_range.magnitude &&
      preset.unit === searchOptions.date_range.unit
  );

  return (
    <FilterContainer categoryId="date-range" title="Show jobs from the past">
      <LabelInputContainer midColCount={3} lgColCount={3}>
        {DATE_PRESETS.map((preset) => (
          <LabelRadio
            key={preset.label}
            label={preset.label}
            checked={currentPreset?.label === preset.label}
            onChange={() =>
              updateSearchOptions({
                date_range: {
                  magnitude: preset.magnitude,
                  unit: preset.unit,
                },
              })
            }
          />
        ))}
      </LabelInputContainer>
    </FilterContainer>
  );
}
