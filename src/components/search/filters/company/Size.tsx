"use client";

import { useApp } from "@/contexts/AppContext";
import { commitSizeEmployeeRange, getSizeEnvelope, getSizeRanges, getSizeRangesOverlapping } from "@/lib/search/company";
import { formatCompanySizeSentence } from "@/lib/search/sentence-query";
import { useCallback, useEffect, useRef, useState } from "react";
import type { SearchState } from "@/types/search";
import FilterContainer from "../util/FilterContainer";
import { SentenceRangeBlank, SentenceText } from "../util/sentence-query";

/**
 * Sentence title for the company-size range.
 * Untouched → "Company has any number of employees"; otherwise
 * "Company has between {min} and {max} employees", "Company has at least {min} employees",
 * "Company has up to {max} employees", or "Company has {n} employees".
 */
export function getSizeTitle(min = 0, max = 0): string {
  return formatCompanySizeSentence(min, max) ?? "Company has any number of employees";
}

function toNumberOrZero(value: string): number {
  if (!value) return 0;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Stable signature of a size selection ("All" or the list of selected buckets). */
function sizeStateKey(size: SearchState["size"]): string {
  if (!Array.isArray(size)) return "All";
  return size.map((range) => `${range.min}-${range.max ?? "plus"}`).join(",");
}

/**
 * Bucket selection a free employee range maps onto. Mirrors
 * `commitSizeEmployeeRange` so the inputs can tell whether the applied filter
 * still matches what was typed.
 */
function rangeToSizeKey(min: number, max: number): string {
  if (min <= 0 && max <= 0) return "All";

  let normalizedMin = min;
  let normalizedMax = max;
  if (normalizedMin > 0 && normalizedMax > 0 && normalizedMin > normalizedMax) {
    [normalizedMin, normalizedMax] = [normalizedMax, normalizedMin];
  }

  const overlapping = getSizeRangesOverlapping(normalizedMin, normalizedMax);
  if (overlapping.length === 0 || overlapping.length === getSizeRanges().length) return "All";
  return sizeStateKey(overlapping);
}

export default function Size() {
  const { searchOptions, updateSearchOptions } = useApp();
  const sizeKey = sizeStateKey(searchOptions.size);

  const [minEmployees, setMinEmployees] = useState("");
  const [maxEmployees, setMaxEmployees] = useState("");

  // Latest typed bounds, so a commit never relies on stale React state.
  const boundsRef = useRef({ min: "", max: "" });
  boundsRef.current = { min: minEmployees, max: maxEmployees };

  // Adopt the applied size filter only when it changed outside of these inputs,
  // so the bucket mapping never rewrites the range the user typed.
  useEffect(() => {
    const bounds = boundsRef.current;
    if (rangeToSizeKey(toNumberOrZero(bounds.min), toNumberOrZero(bounds.max)) === sizeKey) return;

    const envelope = getSizeEnvelope(searchOptions.size);
    setMinEmployees(envelope.min > 0 ? String(envelope.min) : "");
    setMaxEmployees(envelope.max > 0 ? String(envelope.max) : "");
  }, [sizeKey, searchOptions.size]);

  // Free employee bounds are mapped onto the preset size buckets, so the search
  // state keeps its "All" / bucket shape.
  const commit = useCallback(
    (patch?: { min?: string; max?: string }) => {
      const bounds = boundsRef.current;
      const nextMin = patch?.min ?? bounds.min;
      const nextMax = patch?.max ?? bounds.max;

      if (patch?.min !== undefined) setMinEmployees(patch.min);
      if (patch?.max !== undefined) setMaxEmployees(patch.max);
      boundsRef.current = { min: nextMin, max: nextMax };

      commitSizeEmployeeRange(toNumberOrZero(nextMin), toNumberOrZero(nextMax), updateSearchOptions);
    },
    [updateSearchOptions]
  );

  const title = (
    <SentenceText>
      Company has between
      <SentenceRangeBlank
        ariaLabel="Employee count range"
        minAriaLabel="Minimum employees"
        maxAriaLabel="Maximum employees"
        minValue={minEmployees}
        maxValue={maxEmployees}
        onChangeMin={setMinEmployees}
        onChangeMax={setMaxEmployees}
        onCommit={commit}
        separator="-"
        sliderMin={0}
        sliderMax={10_000}
        sliderStep={50}
        emptyLabel="unspecified"
        debounceMs={150}
      />
      employees
    </SentenceText>
  );

  return <FilterContainer categoryId="size" title={title} chrome="stream" />;
}
