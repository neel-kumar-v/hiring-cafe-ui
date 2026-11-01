"use client";

import { useApp } from "@/contexts/AppContext";
import { formatCountedList } from "@/lib/search/sentence-query";
import { CommitmentLevel, CommitmentLevelOptions } from "@/types/search";
import FilterContainer from "../util/FilterContainer";
import { SentenceBlankMultiSelect, SentenceText } from "../util/sentence-query";

export const allCommitmentLevels: CommitmentLevel[] = ["Full Time", "Part Time", "Contract", "Internship", "Temporary", "Volunteer", "Seasonal"];

const COMMITMENT_BLANK_OPTIONS = allCommitmentLevels.map((lvl) => ({
  value: lvl,
  label: lvl,
}));

export function formatCommitmentList(items: string[]): string {
  return formatCountedList(items, { conjunction: "and", n1: 4 });
}

export function getCommitmentTitle(commitment?: CommitmentLevelOptions): string {
  if (!commitment || commitment === "All") {
    return "Show jobs with any commitment level";
  }

  const selected = Array.isArray(commitment) ? allCommitmentLevels.filter((level) => commitment.includes(level)) : [];

  if (selected.length === 0 || selected.length === allCommitmentLevels.length) {
    return "Show jobs with any commitment level";
  }

  return `Only show ${formatCommitmentList(selected)} jobs`;
}

function toCommitmentValue(next: CommitmentLevel[]): CommitmentLevelOptions {
  return next.length === 0 || next.length === allCommitmentLevels.length ? "All" : next;
}

export default function Commitment() {
  const { searchOptions, updateSearchOptions } = useApp();

  const selectedValues = Array.isArray(searchOptions.commitment) ? searchOptions.commitment : allCommitmentLevels;

  const isAll = searchOptions.commitment === "All" || selectedValues.length === allCommitmentLevels.length || selectedValues.length === 0;

  const blank = (
    <SentenceBlankMultiSelect
      ariaLabel="Commitment levels"
      options={COMMITMENT_BLANK_OPTIONS}
      values={isAll ? [] : selectedValues}
      onChange={(next) => {
        updateSearchOptions({ commitment: toCommitmentValue(next) });
      }}
      placeholder="any commitment level"
      formatOptions={{
        conjunction: "and",
        n1: 4,
        noneText: "any commitment level",
        allText: "any commitment level",
        total: allCommitmentLevels.length,
      }}
    />
  );

  const title = isAll ? (
    <SentenceText>
      Show jobs with
      {blank}
    </SentenceText>
  ) : (
    <SentenceText>
      Only show
      {blank}
      jobs
    </SentenceText>
  );

  return <FilterContainer categoryId="commitment" title={title} chrome="stream" />;
}
