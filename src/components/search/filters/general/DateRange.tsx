"use client";

import { useApp } from "@/contexts/AppContext";
import type { TimeUnits } from "@/types/search";
import FilterContainer from "../util/FilterContainer";
import { SentenceBlankSelect, SentenceText } from "../util/sentence-query";

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

/** Stable string key for a date preset while it passes through the sentence blank. */
function presetKey(preset: DatePreset): string {
  return `${preset.magnitude}:${preset.unit}`;
}

/** Phrase rendered inside the "Show jobs from the past …" sentence. */
export function presetPhrase(preset: DatePreset): string {
  if (preset.label === "All time") return "all time";
  if (preset.label === "Past 24 hours") return "24 hours";
  return preset.label.toLowerCase();
}

function findMatchingPreset(magnitude: number, unit: TimeUnits): DatePreset | undefined {
  return DATE_PRESETS.find((preset) => preset.magnitude === magnitude && preset.unit === unit);
}

/** Phrase for the current date-range state (falls back to the default 6 months preset). */
export function getDateRangePhrase(magnitude: number, unit: TimeUnits): string {
  return presetPhrase(findMatchingPreset(magnitude, unit) ?? DATE_PRESETS[11]);
}

/** Complete sentence title for a given date-range state. */
export function getDateRangeTitle(magnitude: number, unit: TimeUnits): string {
  const currentPreset = findMatchingPreset(magnitude, unit) ?? DATE_PRESETS[11];
  if (currentPreset.label === "All time") return "Show jobs from all time";
  return `Show jobs from the past ${presetPhrase(currentPreset)}`;
}

const DATE_BLANK_OPTIONS = DATE_PRESETS.map((preset) => ({
  value: presetKey(preset),
  label: preset.label,
  phrase: presetPhrase(preset),
}));

export default function DateRange() {
  const { searchOptions, updateSearchOptions } = useApp();

  const currentPreset = findMatchingPreset(searchOptions.date_range.magnitude, searchOptions.date_range.unit) ?? DATE_PRESETS[11];

  const isAllTime = currentPreset.label === "All time";

  const title = (
    <SentenceText>
      Show jobs from {isAllTime ? null : <span>the past</span>}
      <SentenceBlankSelect
        ariaLabel="Date posted range"
        value={presetKey(currentPreset)}
        onChange={(key) => {
          const preset = DATE_PRESETS.find((option) => presetKey(option) === key);
          if (preset) {
            updateSearchOptions({
              date_range: {
                magnitude: preset.magnitude,
                unit: preset.unit,
              },
            });
          }
        }}
        options={DATE_BLANK_OPTIONS}
      />
    </SentenceText>
  );

  return <FilterContainer categoryId="date-range" title={title} chrome="stream" />;
}
