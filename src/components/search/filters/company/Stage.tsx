"use client";

import { useCallback, useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { useSearchData } from "@/hooks/useSearchData";
import { getCurrentYear } from "@/lib/search/company";
import { describeRange, formatCompactNumber, formatCountedList, formatRangeParts, makeRangePhrases } from "@/lib/search/sentence-query";
import type { CurrentStage, FundingOptions, Keywords } from "@/types/search";
import FilterContainer from "../util/FilterContainer";
import { SentenceBlankMultiSelect, SentenceRangeBlank, SentenceText } from "../util/sentence-query";

const STAGE_OPTIONS: CurrentStage[] = ["Public", "Private"];

const STAGE_BLANK_OPTIONS = STAGE_OPTIONS.map((stage) => ({
  value: stage,
  label: stage,
  phrase: stage.toLowerCase(),
}));

const LATEST_ROUND_YEAR_PHRASES = makeRangePhrases({
  exactPhrase: (value) => `in ${value}`,
  betweenPhrase: (low, high) => `between ${low} – ${high}`,
  atLeastPhrase: (value) => `after ${value}`,
  upToPhrase: (value) => `before ${value}`,
});

const LATEST_ROUND_AMOUNT_PHRASES = makeRangePhrases({
  format: formatCompactNumber,
  exactPhrase: (value) => `of ${value}`,
  betweenPhrase: (low, high) => `between ${low} – ${high}`,
  atLeastPhrase: (value) => `of at least ${value}`,
  upToPhrase: (value) => `of up to ${value}`,
});

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

function selectedStageValues(current: FundingOptions["current"]): CurrentStage[] {
  if (current === "All" || !Array.isArray(current)) return [];
  if (current.length === 0 || current.length === STAGE_OPTIONS.length) return [];
  return STAGE_OPTIONS.filter((stage) => current.includes(stage));
}

function toStageValue(next: CurrentStage[]): FundingOptions["current"] {
  return next.length === 0 || next.length === STAGE_OPTIONS.length ? "All" : next;
}

function formatStagePhrase(current: FundingOptions["current"]): string {
  const selected = selectedStageValues(current);
  if (selected.length === 0) return "any";
  return formatCountedList(
    selected.map((stage) => stage.toLowerCase()),
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

function formatLatestRoundYear(min: number, max: number): string {
  return formatRangeParts(describeRange(min, max), LATEST_ROUND_YEAR_PHRASES) ?? "any year";
}

function formatLatestRoundAmount(min: number, max: number): string {
  return formatRangeParts(describeRange(min, max), LATEST_ROUND_AMOUNT_PHRASES) ?? "any amount";
}

function patchStageFunding(current: FundingOptions, updateSearchOptions: (updates: { stage_funding: FundingOptions }) => void, patch: Partial<FundingOptions>) {
  updateSearchOptions({ stage_funding: { ...current, ...patch } });
}

export function getStageTitle(stageFunding?: FundingOptions): string {
  const value = stageFunding ?? {
    current: "All" as const,
    investors: { include: [], exclude: "None" as const },
    latest_round: { min: 0, max: 0 },
    latest_round_type: { include: [], exclude: "None" as const },
    latest_round_amount: { min: 0, max: 0 },
  };

  return `Company stage is ${formatStagePhrase(value.current)}. Latest round ${formatLatestRoundYear(value.latest_round.min, value.latest_round.max)}. Latest round amount ${formatLatestRoundAmount(value.latest_round_amount.min, value.latest_round_amount.max)}. Latest round type ${formatKeywordPair(value.latest_round_type, "any round type")}. Backed by ${formatKeywordPair(value.investors, "any investor")}.`;
}

export default function Stage() {
  const { searchOptions, updateSearchOptions } = useApp();
  const stageFunding = searchOptions.stage_funding;
  const currentYear = getCurrentYear();

  const [latestRoundMin, setLatestRoundMin] = useState("");
  const [latestRoundMax, setLatestRoundMax] = useState("");
  const [latestRoundAmountMin, setLatestRoundAmountMin] = useState("");
  const [latestRoundAmountMax, setLatestRoundAmountMax] = useState("");

  const { options: roundTypes } = useSearchData("round_types", false);
  const { options: investors } = useSearchData("investors", false);

  useEffect(() => {
    const { latest_round, latest_round_amount } = stageFunding;
    setLatestRoundMin(latest_round.min > 0 ? String(latest_round.min) : "");
    setLatestRoundMax(latest_round.max > 0 ? String(latest_round.max) : "");
    setLatestRoundAmountMin(latest_round_amount.min > 0 ? String(latest_round_amount.min) : "");
    setLatestRoundAmountMax(latest_round_amount.max > 0 ? String(latest_round_amount.max) : "");
  }, [stageFunding.latest_round.max, stageFunding.latest_round.min, stageFunding.latest_round_amount.max, stageFunding.latest_round_amount.min]);

  const toNumberOrZero = (value: string) => {
    if (!value) return 0;
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

  const commitLatestRound = useCallback(
    (patch?: { min?: string; max?: string }) => {
      const nextMin = patch?.min ?? latestRoundMin;
      const nextMax = patch?.max ?? latestRoundMax;

      if (patch?.min !== undefined) setLatestRoundMin(patch.min);
      if (patch?.max !== undefined) setLatestRoundMax(patch.max);

      const rawMin = toNumberOrZero(nextMin);
      const rawMax = toNumberOrZero(nextMax);

      const normalizedMin = rawMin === 0 ? 0 : clamp(rawMin, 1800, currentYear);
      const normalizedMax = rawMax === 0 ? 0 : clamp(rawMax, 1800, currentYear);

      patchStageFunding(stageFunding, updateSearchOptions, {
        latest_round:
          normalizedMin > 0 && normalizedMax > 0 && normalizedMin > normalizedMax ? { min: normalizedMax, max: normalizedMin } : { min: normalizedMin, max: normalizedMax },
      });
    },
    [currentYear, latestRoundMax, latestRoundMin, stageFunding, updateSearchOptions]
  );

  const commitLatestRoundAmount = useCallback(
    (patch?: { min?: string; max?: string }) => {
      const nextMin = patch?.min ?? latestRoundAmountMin;
      const nextMax = patch?.max ?? latestRoundAmountMax;

      if (patch?.min !== undefined) setLatestRoundAmountMin(patch.min);
      if (patch?.max !== undefined) setLatestRoundAmountMax(patch.max);

      const rawMin = toNumberOrZero(nextMin);
      const rawMax = toNumberOrZero(nextMax);

      const normalizedMin = rawMin === 0 ? 0 : clamp(rawMin, 0, 500000000);
      const normalizedMax = rawMax === 0 ? 0 : clamp(rawMax, 0, 500000000);

      patchStageFunding(stageFunding, updateSearchOptions, {
        latest_round_amount:
          normalizedMin > 0 && normalizedMax > 0 && normalizedMin > normalizedMax ? { min: normalizedMax, max: normalizedMin } : { min: normalizedMin, max: normalizedMax },
      });
    },
    [latestRoundAmountMax, latestRoundAmountMin, stageFunding, updateSearchOptions]
  );

  const stageSelected = selectedStageValues(stageFunding.current);
  const roundTypeInclude = includeList(stageFunding.latest_round_type);
  const roundTypeExclude = excludeList(stageFunding.latest_round_type);
  const investorInclude = includeList(stageFunding.investors);
  const investorExclude = excludeList(stageFunding.investors);

  const roundTypeOptions = mergeBlankOptions(roundTypes, [...roundTypeInclude, ...roundTypeExclude]);
  const investorOptions = mergeBlankOptions(investors, [...investorInclude, ...investorExclude]);

  const listFormat = {
    conjunction: "or" as const,
    n1: 3,
  };

  const title = (
    <SentenceText>
      Company stage is
      <SentenceBlankMultiSelect
        ariaLabel="Company stage"
        options={STAGE_BLANK_OPTIONS}
        values={stageSelected}
        onChange={(next) => patchStageFunding(stageFunding, updateSearchOptions, { current: toStageValue(next) })}
        placeholder="any"
        formatOptions={{
          ...listFormat,
          noneText: "any",
          allText: "any",
          total: STAGE_OPTIONS.length,
        }}
      />
    </SentenceText>
  );

  return (
    <FilterContainer categoryId="stage" title={title} chrome="stream">
      <SentenceText>
        Latest round type
        <SentenceBlankMultiSelect
          ariaLabel="Included round types"
          options={roundTypeOptions.filter((option) => !roundTypeExclude.includes(option.value))}
          values={roundTypeInclude}
          onChange={(next) =>
            patchStageFunding(stageFunding, updateSearchOptions, {
              latest_round_type: { include: next, exclude: stageFunding.latest_round_type.exclude },
            })
          }
          placeholder="any round type"
          formatOptions={{ ...listFormat, noneText: "any round type" }}
          contentClassName="max-h-64 overflow-y-auto"
        />
        excluding
        <SentenceBlankMultiSelect
          ariaLabel="Excluded round types"
          options={roundTypeOptions.filter((option) => !roundTypeInclude.includes(option.value))}
          values={roundTypeExclude}
          onChange={(next) =>
            patchStageFunding(stageFunding, updateSearchOptions, {
              latest_round_type: { include: stageFunding.latest_round_type.include, exclude: toExcludeValue(next) },
            })
          }
          placeholder="none"
          formatOptions={{ ...listFormat, noneText: "none" }}
          contentClassName="max-h-64 overflow-y-auto"
        />
      </SentenceText>

      <SentenceText>
        Backed by
        <SentenceBlankMultiSelect
          ariaLabel="Included investors"
          options={investorOptions.filter((option) => !investorExclude.includes(option.value))}
          values={investorInclude}
          onChange={(next) =>
            patchStageFunding(stageFunding, updateSearchOptions, {
              investors: { include: next, exclude: stageFunding.investors.exclude },
            })
          }
          placeholder="any investor"
          formatOptions={{ ...listFormat, noneText: "any investor" }}
          contentClassName="max-h-64 overflow-y-auto"
        />
        excluding
        <SentenceBlankMultiSelect
          ariaLabel="Excluded investors"
          options={investorOptions.filter((option) => !investorInclude.includes(option.value))}
          values={investorExclude}
          onChange={(next) =>
            patchStageFunding(stageFunding, updateSearchOptions, {
              investors: { include: stageFunding.investors.include, exclude: toExcludeValue(next) },
            })
          }
          placeholder="none"
          formatOptions={{ ...listFormat, noneText: "none" }}
          contentClassName="max-h-64 overflow-y-auto"
        />
      </SentenceText>

      <SentenceText>
        Latest round between
        <SentenceRangeBlank
          ariaLabel="Latest round year range"
          minAriaLabel="Earliest latest-round year"
          maxAriaLabel="Latest latest-round year"
          minValue={latestRoundMin}
          maxValue={latestRoundMax}
          onChangeMin={setLatestRoundMin}
          onChangeMax={setLatestRoundMax}
          onCommit={commitLatestRound}
          separator="-"
          sliderMin={1800}
          sliderMax={currentYear}
          sliderStep={1}
          emptyLabel="unspecified"
        />
      </SentenceText>

      <SentenceText>
        Latest round amount between
        <SentenceRangeBlank
          ariaLabel="Latest round amount range"
          minAriaLabel="Minimum latest-round amount"
          maxAriaLabel="Maximum latest-round amount"
          minValue={latestRoundAmountMin}
          maxValue={latestRoundAmountMax}
          onChangeMin={setLatestRoundAmountMin}
          onChangeMax={setLatestRoundAmountMax}
          onCommit={commitLatestRoundAmount}
          separator="-"
          formatDisplay={(raw) => {
            const parsed = Number.parseInt(raw, 10);
            if (!raw || !Number.isFinite(parsed)) return "unspecified";
            return formatCompactNumber(parsed);
          }}
          sliderMin={0}
          sliderMax={500_000_000}
          sliderStep={1_000_000}
          emptyLabel="unspecified"
          debounceMs={180}
        />
      </SentenceText>
    </FilterContainer>
  );
}
