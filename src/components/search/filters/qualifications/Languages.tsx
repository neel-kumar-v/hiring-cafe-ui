"use client";

import { useApp } from "@/contexts/AppContext";
import { useSearchData } from "@/hooks/useSearchData";
import { createKeywordsHandler } from "@/lib/search";
import { formatCountedList } from "@/lib/search/sentence-query";
import type { Keywords } from "@/types/search";
import FilterContainer from "../util/FilterContainer";
import { SentenceBlankMultiSelect, SentenceText } from "../util/sentence-query";

const NO_LANGUAGE = "__none__";
const ANY_LANGUAGES_TEXT = "any";
const NONE_TEXT = "none";

function includeList(keywords: Keywords | undefined): string[] {
  if (!keywords || !Array.isArray(keywords.include)) return [];
  return keywords.include.filter(Boolean);
}

function excludeList(keywords: Keywords | undefined): string[] {
  if (!keywords || !keywords.exclude || keywords.exclude === "None" || !Array.isArray(keywords.exclude)) return [];
  return keywords.exclude.filter(Boolean);
}

function toExcludeValue(next: string[]): Keywords["exclude"] {
  return next.length === 0 ? "None" : next;
}

function includePhrase(keywords: Keywords | undefined): string {
  return formatCountedList(includeList(keywords), { conjunction: "or", n1: 3, noneText: ANY_LANGUAGES_TEXT });
}

function excludePhrase(keywords: Keywords | undefined): string {
  return formatCountedList(excludeList(keywords), { conjunction: "or", n1: 3, noneText: NONE_TEXT });
}

export function getLanguagesTitle(language?: Keywords): string {
  return `Jobs requiring fluency in ${includePhrase(language)} excluding ${excludePhrase(language)}`;
}

function mergeBlankOptions(options: { label: string; value: string }[], selected: string[]) {
  const seen = new Set(options.map((option) => option.value));
  const extras = selected.filter((value) => value !== NO_LANGUAGE && !seen.has(value)).map((value) => ({ label: value, value }));
  return [...extras, ...options];
}

export default function Languages() {
  const { searchOptions, updateSearchOptions } = useApp();
  const { options: languages } = useSearchData("languages", true);
  const handleLanguagesChange = createKeywordsHandler(updateSearchOptions, "language");
  const current = searchOptions.language;

  const include = includeList(current);
  const exclude = excludeList(current);
  const blankOptions = mergeBlankOptions(languages, [...include, ...exclude]);
  const includeOptions = [{ value: NO_LANGUAGE, label: "none", phrase: NONE_TEXT }, ...blankOptions.filter((option) => !exclude.includes(option.value))];

  return (
    <FilterContainer categoryId="languages" chrome="stream">
      <SentenceText>
        Jobs requiring fluency in
        <SentenceBlankMultiSelect
          ariaLabel="Required languages"
          options={includeOptions}
          values={include}
          onChange={(next) => {
            // "none" clears required-language filters (same role as licenses hide_required).
            if (next.includes(NO_LANGUAGE)) {
              handleLanguagesChange({ include: [], exclude: current.exclude });
              return;
            }
            handleLanguagesChange({
              include: next,
              exclude: current.exclude,
            });
          }}
          placeholder={ANY_LANGUAGES_TEXT}
          formatOptions={{ conjunction: "or", n1: 3, noneText: ANY_LANGUAGES_TEXT }}
          contentClassName="max-h-64 overflow-y-auto"
          searchPlaceholder="Search languages..."
        />
        excluding
        <SentenceBlankMultiSelect
          ariaLabel="Excluded languages"
          options={blankOptions.filter((option) => !include.includes(option.value))}
          values={exclude}
          onChange={(next) =>
            handleLanguagesChange({
              include: current.include,
              exclude: toExcludeValue(next),
            })
          }
          placeholder={NONE_TEXT}
          formatOptions={{ conjunction: "or", n1: 3, noneText: NONE_TEXT }}
          contentClassName="max-h-64 overflow-y-auto"
          searchPlaceholder="Search languages..."
        />
      </SentenceText>
    </FilterContainer>
  );
}
