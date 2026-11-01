"use client";

import { useApp } from "@/contexts/AppContext";
import { formatCountedList } from "@/lib/search/sentence-query";
import type { Benefits as Benefit, BenefitsOptions } from "@/types/search";
import FilterContainer from "../util/FilterContainer";
import { SentenceBlankMultiSelect, SentenceText } from "../util/sentence-query";

export const allBenefits: Benefit[] = ["PTO", "4 Days", "401k", "Parental Leave", "Retirement", "Tuition", "Visa", "Relocation"];

const BENEFIT_BLANK_OPTIONS = allBenefits.map((benefit) => ({
  value: benefit,
  label: benefit,
}));

export function formatBenefitsList(items: string[]): string {
  return formatCountedList(items, { conjunction: "and", n1: 4 });
}

export function getBenefitsTitle(benefits?: BenefitsOptions): string {
  const selected = Array.isArray(benefits) ? allBenefits.filter((benefit) => benefits.includes(benefit)) : [];

  if (selected.length === 0) {
    return "Show jobs with any benefits";
  }

  return `Only show jobs offering ${formatBenefitsList(selected)}`;
}

function toBenefitsValue(next: Benefit[]): BenefitsOptions {
  return next.length === 0 || next.length === allBenefits.length ? null : next;
}

export default function Benefits() {
  const { searchOptions, updateSearchOptions } = useApp();

  const selectedValues = Array.isArray(searchOptions.benefits) ? searchOptions.benefits : [];
  const isEmpty = selectedValues.length === 0;

  const blank = (
    <SentenceBlankMultiSelect
      ariaLabel="Benefits and perks"
      options={BENEFIT_BLANK_OPTIONS}
      values={selectedValues}
      onChange={(next) => {
        updateSearchOptions({ benefits: toBenefitsValue(next) });
      }}
      placeholder="any benefits"
      formatOptions={{
        conjunction: "and",
        n1: 4,
        noneText: "any benefits",
        allText: "any benefits",
        total: allBenefits.length,
      }}
    />
  );

  const title = isEmpty ? (
    <SentenceText>
      Show jobs with
      {blank}
    </SentenceText>
  ) : (
    <SentenceText>
      Only show jobs offering
      {blank}
    </SentenceText>
  );

  return <FilterContainer categoryId="benefits" title={title} chrome="stream" />;
}
