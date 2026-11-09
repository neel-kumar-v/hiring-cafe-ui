"use client";

import { useApp } from "@/contexts/AppContext";
import { getCurrentYear } from "@/lib/search/company";
import { useCallback, useEffect, useState } from "react";
import { formatFoundingYearsSentence } from "@/lib/search/sentence-query";
import FilterContainer from "../util/FilterContainer";
import { SentenceRangeBlank, SentenceText } from "../util/sentence-query";

/**
 * Sentence title for the founding-year range.
 * Untouched → "Founding Year"; otherwise "Founded between {min} – {max}",
 * "Founded after {min}", "Founded before {max}", or "Founded in {year}".
 */
export function getFoundingTitle(min = 0, max = 0): string {
  return formatFoundingYearsSentence(min, max) ?? "Founding Year";
}

export default function Founding() {
  const { searchOptions, updateSearchOptions } = useApp();
  const foundingYear = searchOptions.founding_year;
  const currentYear = getCurrentYear();
  const [minYear, setMinYear] = useState("");
  const [maxYear, setMaxYear] = useState("");

  useEffect(() => {
    setMinYear(foundingYear.min > 0 ? String(foundingYear.min) : "");
    setMaxYear(foundingYear.max > 0 ? String(foundingYear.max) : "");
  }, [foundingYear.max, foundingYear.min]);

  const toNumberOrZero = (value: string) => {
    if (!value) return 0;
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

  const commit = useCallback(
    (patch?: { min?: string; max?: string }) => {
      const nextMin = patch?.min ?? minYear;
      const nextMax = patch?.max ?? maxYear;

      if (patch?.min !== undefined) setMinYear(patch.min);
      if (patch?.max !== undefined) setMaxYear(patch.max);

      const rawMin = toNumberOrZero(nextMin);
      const rawMax = toNumberOrZero(nextMax);

      const normalizedMin = rawMin === 0 ? 0 : clamp(rawMin, 1800, currentYear);
      const normalizedMax = rawMax === 0 ? 0 : clamp(rawMax, 1800, currentYear);

      updateSearchOptions({
        founding_year:
          normalizedMin > 0 && normalizedMax > 0 && normalizedMin > normalizedMax ? { min: normalizedMax, max: normalizedMin } : { min: normalizedMin, max: normalizedMax },
      });
    },
    [currentYear, maxYear, minYear, updateSearchOptions]
  );

  const title = (
    <SentenceText>
      Founded between
      <SentenceRangeBlank
        ariaLabel="Founding year range"
        minAriaLabel="Earliest founding year"
        maxAriaLabel="Latest founding year"
        minValue={minYear}
        maxValue={maxYear}
        onChangeMin={setMinYear}
        onChangeMax={setMaxYear}
        onCommit={commit}
        separator="-"
        sliderMin={1800}
        sliderMax={currentYear}
        sliderStep={1}
        emptyLabel="unspecified"
      />
    </SentenceText>
  );

  return <FilterContainer categoryId="founding" title={title} chrome="stream" />;
}
