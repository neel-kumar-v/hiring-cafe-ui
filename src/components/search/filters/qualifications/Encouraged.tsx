"use client";

import { useApp } from "@/contexts/AppContext";
import { formatCountedList } from "@/lib/search/sentence-query";
import type { Encouraged as EncouragedType, EncouragedOptions } from "@/types/search";
import FilterContainer from "../util/FilterContainer";
import { SentenceBlankMultiSelect, SentenceText } from "../util/sentence-query";

const ENCOURAGED_CHOICES: EncouragedType[] = ["Veteran", "Fair Chance"];

const ENCOURAGED_BLANK_OPTIONS = [
  { value: "Veteran" as const, label: "military veterans", phrase: "military veterans" },
  { value: "Fair Chance" as const, label: "fair chance", phrase: "fair chance" },
];

const UNSPECIFIED_TEXT = "unspecified";

function selectedEncouraged(value: EncouragedOptions | undefined): EncouragedType[] {
  if (!Array.isArray(value)) return [];
  return ENCOURAGED_CHOICES.filter((choice) => value.includes(choice));
}

function toEncouragedValue(next: EncouragedType[]): EncouragedOptions {
  return next.length === 0 ? null : next;
}

export function getEncouragedTitle(encouraged?: EncouragedOptions): string {
  const selected = selectedEncouraged(encouraged);
  const blank = formatCountedList(
    selected.map((choice) => ENCOURAGED_BLANK_OPTIONS.find((option) => option.value === choice)?.phrase ?? choice),
    {
      conjunction: "and",
      noneText: UNSPECIFIED_TEXT,
    }
  );
  return `Jobs that welcome applicants from ${blank}`;
}

export default function Encouraged() {
  const { searchOptions, updateSearchOptions } = useApp();
  const selectedValues = selectedEncouraged(searchOptions.encouraged);

  return (
    <FilterContainer categoryId="encouraged" chrome="stream">
      <SentenceText>
        Jobs that welcome applicants from
        <SentenceBlankMultiSelect
          ariaLabel="Encouraged to Apply"
          options={ENCOURAGED_BLANK_OPTIONS}
          values={selectedValues}
          onChange={(next) => {
            updateSearchOptions({ encouraged: toEncouragedValue(next) });
          }}
          placeholder={UNSPECIFIED_TEXT}
          formatOptions={{
            conjunction: "and",
            noneText: UNSPECIFIED_TEXT,
          }}
        />
      </SentenceText>
    </FilterContainer>
  );
}
