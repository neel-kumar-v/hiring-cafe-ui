"use client";

import { useApp } from "@/contexts/AppContext";
import { formatCountedList } from "@/lib/search/sentence-query";
import type { Encouraged as EncouragedType, EncouragedOptions } from "@/types/search";
import FilterContainer from "../util/FilterContainer";
import { SentenceBlankMultiSelect, SentenceText } from "../util/sentence-query";

const ENCOURAGED_CHOICES: EncouragedType[] = ["Veteran", "Fair Chance"];

const ENCOURAGED_BLANK_OPTIONS = [
  { value: "Veteran" as const, label: "Veteran applicants", phrase: "Veteran applicants" },
  { value: "Fair Chance" as const, label: "Fair Chance applicants", phrase: "Fair Chance applicants" },
];

const ANY_APPLICANTS_TEXT = "any applicants";
const ENCOURAGED_BLANK_COUNT = ENCOURAGED_CHOICES.length;

function selectedEncouraged(value: EncouragedOptions | undefined): EncouragedType[] {
  if (!Array.isArray(value)) return [];
  return ENCOURAGED_CHOICES.filter((choice) => value.includes(choice));
}

function toEncouragedValue(next: EncouragedType[]): EncouragedOptions {
  return next.length === 0 || next.length === ENCOURAGED_BLANK_COUNT ? null : next;
}

export function getEncouragedTitle(encouraged?: EncouragedOptions): string {
  const selected = selectedEncouraged(encouraged);
  const blank = formatCountedList(
    selected.map((choice) => ENCOURAGED_BLANK_OPTIONS.find((option) => option.value === choice)?.phrase ?? choice),
    {
      conjunction: "and",
      total: ENCOURAGED_BLANK_COUNT,
      noneText: ANY_APPLICANTS_TEXT,
      allText: ANY_APPLICANTS_TEXT,
    }
  );
  return `Show jobs that encourage ${blank}`;
}

export default function Encouraged() {
  const { searchOptions, updateSearchOptions } = useApp();
  const selectedValues = selectedEncouraged(searchOptions.encouraged);

  const title = (
    <SentenceText>
      Show jobs that encourage
      <SentenceBlankMultiSelect
        ariaLabel="Encouraged to Apply"
        options={ENCOURAGED_BLANK_OPTIONS}
        values={selectedValues}
        onChange={(next) => {
          updateSearchOptions({ encouraged: toEncouragedValue(next) });
        }}
        placeholder={ANY_APPLICANTS_TEXT}
        formatOptions={{
          conjunction: "and",
          total: ENCOURAGED_BLANK_COUNT,
          noneText: ANY_APPLICANTS_TEXT,
          allText: ANY_APPLICANTS_TEXT,
        }}
      />
    </SentenceText>
  );

  return <FilterContainer categoryId="encouraged" title={title} chrome="stream" />;
}
