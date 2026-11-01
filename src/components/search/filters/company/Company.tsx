"use client";

import { useApp } from "@/contexts/AppContext";
import { useSearchData } from "@/hooks/useSearchData";
import { createCompanyHandler } from "@/lib/search";
import { formatCountedList } from "@/lib/search/sentence-query";
import type { Keywords } from "@/types/search";
import FilterContainer from "../util/FilterContainer";
import { SentenceBlankMultiSelect, SentenceText } from "../util/sentence-query";

function includeList(keywords: Keywords): string[] {
  return Array.isArray(keywords.include) ? keywords.include.filter(Boolean) : [];
}

function excludeList(keywords: Keywords): string[] {
  if (!keywords.exclude || keywords.exclude === "None") return [];
  return Array.isArray(keywords.exclude) ? keywords.exclude.filter(Boolean) : [];
}

function toExcludeValue(next: string[]): Keywords["exclude"] {
  return next.length === 0 ? "None" : next;
}

function mergeBlankOptions(options: { label: string; value: string }[], selected: string[]) {
  const seen = new Set(options.map((option) => option.value));
  const extras = selected.filter((value) => !seen.has(value)).map((value) => ({ label: value, value }));
  return [...extras, ...options];
}

export function getCompanyTitle(company?: Keywords): string {
  const include = includeList(company ?? { include: [], exclude: "None" });
  const exclude = excludeList(company ?? { include: [], exclude: "None" });

  const includePhrase = formatCountedList(include, {
    conjunction: "or",
    n1: 3,
    noneText: "any company",
  });
  const excludePhrase = formatCountedList(exclude, {
    conjunction: "or",
    n1: 3,
    noneText: "none",
  });

  return `Jobs at ${includePhrase} excluding ${excludePhrase}`;
}

export default function Company() {
  const { options: companies } = useSearchData("companies", true);
  const { searchOptions, updateSearchOptions } = useApp();

  const handleCompanyChange = createCompanyHandler(updateSearchOptions);
  const include = includeList(searchOptions.company);
  const exclude = excludeList(searchOptions.company);
  const blankOptions = mergeBlankOptions(companies, [...include, ...exclude]);

  const listFormat = {
    conjunction: "or" as const,
    n1: 3,
  };

  const title = (
    <SentenceText>
      Jobs at
      <SentenceBlankMultiSelect
        ariaLabel="Included companies"
        options={blankOptions.filter((option) => !exclude.includes(option.value))}
        values={include}
        onChange={(next) =>
          handleCompanyChange({
            include: next,
            exclude: searchOptions.company.exclude,
          })
        }
        placeholder="any company"
        formatOptions={{ ...listFormat, noneText: "any company" }}
        contentClassName="max-h-64 overflow-y-auto"
      />
      excluding
      <SentenceBlankMultiSelect
        ariaLabel="Excluded companies"
        options={blankOptions.filter((option) => !include.includes(option.value))}
        values={exclude}
        onChange={(next) =>
          handleCompanyChange({
            include: searchOptions.company.include,
            exclude: toExcludeValue(next),
          })
        }
        placeholder="none"
        formatOptions={{ ...listFormat, noneText: "none" }}
        contentClassName="max-h-64 overflow-y-auto"
      />
    </SentenceText>
  );

  return <FilterContainer categoryId="company" title={title} chrome="stream" />;
}
