"use client";

import { useApp } from "@/contexts/AppContext";
import { useSearchData } from "@/hooks/useSearchData";
import { formatCountedList } from "@/lib/search/sentence-query";
import type { Keywords, LicenseCertificationOptions } from "@/types/search";
import FilterContainer from "../util/FilterContainer";
import { SentenceBlankMultiSelect, SentenceText } from "../util/sentence-query";

const NO_LICENSE = "__none__";
const ANY_LICENSES_TEXT = "any";
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

function includeBlankValues(keywords: Keywords | undefined, hideRequired: boolean): string[] {
  const include = includeList(keywords);
  return hideRequired && include.length === 0 ? [NO_LICENSE] : include;
}

function includePhrase(keywords: Keywords | undefined, hideRequired: boolean): string {
  if (hideRequired && includeList(keywords).length === 0) return NONE_TEXT;
  return formatCountedList(includeList(keywords), { conjunction: "or", n1: 3, noneText: ANY_LICENSES_TEXT });
}

function excludePhrase(keywords: Keywords | undefined): string {
  return formatCountedList(excludeList(keywords), { conjunction: "or", n1: 3, noneText: NONE_TEXT });
}

export function getLicensesTitle(license?: LicenseCertificationOptions): string {
  const keywords = license?.keywords;
  return `Jobs mentioning ${includePhrase(keywords, Boolean(license?.hide_required))} licenses, excluding ${excludePhrase(keywords)}`;
}

function mergeBlankOptions(options: { label: string; value: string }[], selected: string[]) {
  const seen = new Set(options.map((option) => option.value));
  const extras = selected.filter((value) => value !== NO_LICENSE && !seen.has(value)).map((value) => ({ label: value, value }));
  return [...extras, ...options];
}

export default function Licenses() {
  const { searchOptions, updateSearchOptions } = useApp();
  const { options: licenses } = useSearchData("licenses", false);
  const current = searchOptions.license_certification;

  const include = includeList(current.keywords);
  const exclude = excludeList(current.keywords);
  const blankOptions = mergeBlankOptions(licenses, [...include, ...exclude]);
  const includeOptions = [{ value: NO_LICENSE, label: "none", phrase: NONE_TEXT }, ...blankOptions.filter((option) => !exclude.includes(option.value))];

  return (
    <FilterContainer categoryId="licenses" chrome="stream">
      <SentenceText>
        Jobs mentioning
        <SentenceBlankMultiSelect
          ariaLabel="Included licenses"
          options={includeOptions}
          values={includeBlankValues(current.keywords, current.hide_required)}
          onChange={(next) => {
            const licensesOnly = next.filter((value) => value !== NO_LICENSE);
            const hadNone = current.hide_required && include.length === 0;
            const pickedNone = next.includes(NO_LICENSE) && !hadNone;
            updateSearchOptions({
              license_certification: {
                keywords: {
                  include: pickedNone ? [] : licensesOnly,
                  exclude: current.keywords.exclude,
                },
                hide_required: pickedNone,
              },
            });
          }}
          placeholder={ANY_LICENSES_TEXT}
          formatOptions={{ conjunction: "or", n1: 3, noneText: ANY_LICENSES_TEXT }}
          contentClassName="max-h-64 overflow-y-auto"
          searchPlaceholder="Search licenses..."
        />
        licenses, excluding
        <SentenceBlankMultiSelect
          ariaLabel="Excluded licenses"
          options={blankOptions.filter((option) => !include.includes(option.value))}
          values={exclude}
          onChange={(next) =>
            updateSearchOptions({
              license_certification: {
                keywords: { include: current.keywords.include, exclude: toExcludeValue(next) },
                hide_required: current.hide_required,
              },
            })
          }
          placeholder={NONE_TEXT}
          formatOptions={{ conjunction: "or", n1: 3, noneText: NONE_TEXT }}
          contentClassName="max-h-64 overflow-y-auto"
          searchPlaceholder="Search licenses..."
        />
      </SentenceText>
    </FilterContainer>
  );
}
