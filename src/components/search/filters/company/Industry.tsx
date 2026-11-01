"use client";

import { useApp } from "@/contexts/AppContext";
import { useSearchData } from "@/hooks/useSearchData";
import { formatCountedList } from "@/lib/search/sentence-query";
import type { IndustryOptions, Keywords, Profit, USAJobs } from "@/types/search";
import FilterContainer from "../util/FilterContainer";
import { SentenceBlankMultiSelect, SentenceBlankSelect, SentenceText } from "../util/sentence-query";

const PROFIT_OPTIONS: Profit[] = ["For-Profit", "Non-Profit"];

const PROFIT_BLANK_OPTIONS = PROFIT_OPTIONS.map((profit) => ({
  value: profit,
  label: profit,
  phrase: profit.toLowerCase(),
}));

const USA_JOBS_BLANK_OPTIONS: { value: USAJobs; label: string; phrase: string }[] = [
  { value: "All", label: "OK to include", phrase: "OK to include" },
  { value: "Only", label: "Include only", phrase: "Include only" },
  { value: "No", label: "Do not include", phrase: "Do not include" },
];

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

function selectedProfitValues(profit: IndustryOptions["profit"]): Profit[] {
  if (profit === "All" || !Array.isArray(profit)) return [];
  if (profit.length === 0 || profit.length === PROFIT_OPTIONS.length) return [];
  return PROFIT_OPTIONS.filter((option) => profit.includes(option));
}

function toProfitValue(next: Profit[]): IndustryOptions["profit"] {
  return next.length === 0 || next.length === PROFIT_OPTIONS.length ? "All" : next;
}

function formatProfitPhrase(profit: IndustryOptions["profit"]): string {
  const selected = selectedProfitValues(profit);
  if (selected.length === 0) return "any";
  return formatCountedList(
    selected.map((item) => item.toLowerCase()),
    { conjunction: "or", n1: 3 }
  );
}

function formatKeywordPair(keywords: Keywords, noneInclude: string): string {
  const include = formatCountedList(includeList(keywords), {
    conjunction: "or",
    n1: 3,
    noneText: noneInclude,
  });
  const exclude = formatCountedList(excludeList(keywords), {
    conjunction: "or",
    n1: 3,
    noneText: "none",
  });
  return `${include} excluding ${exclude}`;
}

function patchIndustry(current: IndustryOptions, updateSearchOptions: (updates: { industry: IndustryOptions }) => void, patch: Partial<IndustryOptions>) {
  updateSearchOptions({ industry: { ...current, ...patch } });
}

export function getIndustryTitle(industry?: IndustryOptions): string {
  const value = industry ?? {
    profit: "All" as const,
    activities: { include: [], exclude: "None" as const },
    industry: { include: [], exclude: "None" as const },
    usa_jobs: "All" as const,
  };

  const usaPhrase = USA_JOBS_BLANK_OPTIONS.find((option) => option.value === value.usa_jobs)?.phrase ?? "OK to include";

  return `Company profit type is ${formatProfitPhrase(value.profit)} with activities ${formatKeywordPair(value.activities, "any activity")} in ${formatKeywordPair(value.industry, "any industry")}. ${usaPhrase} jobs from USAJobs.gov`;
}

export default function Industry() {
  const { searchOptions, updateSearchOptions } = useApp();
  const industry = searchOptions.industry;

  const { options: activities } = useSearchData("company_activities", true);
  const { options: industries } = useSearchData("industries", true);

  const profitSelected = selectedProfitValues(industry.profit);
  const activityInclude = includeList(industry.activities);
  const activityExclude = excludeList(industry.activities);
  const industryInclude = includeList(industry.industry);
  const industryExclude = excludeList(industry.industry);

  const activityOptions = mergeBlankOptions(activities, [...activityInclude, ...activityExclude]);
  const industryOptions = mergeBlankOptions(industries, [...industryInclude, ...industryExclude]);

  const listFormat = {
    conjunction: "or" as const,
    n1: 3,
  };

  const title = (
    <SentenceText>
      Company profit type is
      <SentenceBlankMultiSelect
        ariaLabel="Company profit type"
        options={PROFIT_BLANK_OPTIONS}
        values={profitSelected}
        onChange={(next) => patchIndustry(industry, updateSearchOptions, { profit: toProfitValue(next) })}
        placeholder="any"
        formatOptions={{
          ...listFormat,
          noneText: "any",
          allText: "any",
          total: PROFIT_OPTIONS.length,
        }}
      />
    </SentenceText>
  );

  return (
    <FilterContainer categoryId="industry" title={title} chrome="stream">
      <SentenceText>
        Active in
        <SentenceBlankMultiSelect
          ariaLabel="Included company activities"
          options={activityOptions.filter((option) => !activityExclude.includes(option.value))}
          values={activityInclude}
          onChange={(next) =>
            patchIndustry(industry, updateSearchOptions, {
              activities: { include: next, exclude: industry.activities.exclude },
            })
          }
          placeholder="any activity"
          formatOptions={{ ...listFormat, noneText: "any activity" }}
          contentClassName="max-h-64 overflow-y-auto"
        />
        excluding
        <SentenceBlankMultiSelect
          ariaLabel="Excluded company activities"
          options={activityOptions.filter((option) => !activityInclude.includes(option.value))}
          values={activityExclude}
          onChange={(next) =>
            patchIndustry(industry, updateSearchOptions, {
              activities: { include: industry.activities.include, exclude: toExcludeValue(next) },
            })
          }
          placeholder="none"
          formatOptions={{ ...listFormat, noneText: "none" }}
          contentClassName="max-h-64 overflow-y-auto"
        />
      </SentenceText>

      <SentenceText>
        In
        <SentenceBlankMultiSelect
          ariaLabel="Included industries"
          options={industryOptions.filter((option) => !industryExclude.includes(option.value))}
          values={industryInclude}
          onChange={(next) =>
            patchIndustry(industry, updateSearchOptions, {
              industry: { include: next, exclude: industry.industry.exclude },
            })
          }
          placeholder="any industry"
          formatOptions={{ ...listFormat, noneText: "any industry" }}
          contentClassName="max-h-64 overflow-y-auto"
        />
        excluding
        <SentenceBlankMultiSelect
          ariaLabel="Excluded industries"
          options={industryOptions.filter((option) => !industryInclude.includes(option.value))}
          values={industryExclude}
          onChange={(next) =>
            patchIndustry(industry, updateSearchOptions, {
              industry: { include: industry.industry.include, exclude: toExcludeValue(next) },
            })
          }
          placeholder="none"
          formatOptions={{ ...listFormat, noneText: "none" }}
          contentClassName="max-h-64 overflow-y-auto"
        />
      </SentenceText>

      <SentenceText>
        <SentenceBlankSelect
          ariaLabel="USAJobs.gov inclusion"
          options={USA_JOBS_BLANK_OPTIONS}
          value={industry.usa_jobs}
          onChange={(next) => patchIndustry(industry, updateSearchOptions, { usa_jobs: next })}
        />
        jobs from USAJobs.gov
      </SentenceText>
    </FilterContainer>
  );
}
