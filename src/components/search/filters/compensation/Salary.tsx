"use client";

import { useApp } from "@/contexts/AppContext";
import { formatCompactNumber, formatSalarySentence } from "@/lib/search/sentence-query";
import { useSearchData } from "@/hooks/useSearchData";
import type { SalaryOptions, SalaryUnit } from "@/types/search";
import { useEffect, useState } from "react";
import FilterContainer from "../util/FilterContainer";
import { SentenceBlankSelect, SentenceRangeBlank, SentenceText, UNSPECIFIED_BLANK } from "../util/sentence-query";

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  CAD: "C$",
  AUD: "A$",
  INR: "₹",
  JPY: "¥",
  CHF: "CHF",
};

export const getCurrencySymbol = (currency: string): string => {
  return CURRENCY_SYMBOLS[currency] || currency;
};

const CURRENCY_BLANK_OPTIONS = [
  { value: "USD", label: "USD", phrase: "$ USD" },
  { value: "EUR", label: "EUR", phrase: "€ EUR" },
  { value: "GBP", label: "GBP", phrase: "£ GBP" },
  { value: "CAD", label: "CAD", phrase: "C$ CAD" },
  { value: "AUD", label: "AUD", phrase: "A$ AUD" },
  { value: "INR", label: "INR", phrase: "₹ INR" },
];

const FREQUENCY_BLANK_OPTIONS = [
  { value: "Yearly", label: "Yearly", phrase: "yearly" },
  { value: "Monthly", label: "Monthly", phrase: "monthly" },
  { value: "Hourly", label: "Hourly", phrase: "hourly" },
  { value: "Weekly", label: "Weekly", phrase: "weekly" },
  { value: "Bi-Weekly", label: "Bi-Weekly", phrase: "bi-weekly" },
  { value: "Daily", label: "Daily", phrase: "daily" },
];

const UNDISCLOSED_BLANK_OPTIONS = [
  { value: "show", label: "Show", phrase: "Show" },
  { value: "hide", label: "Hide", phrase: "Hide" },
] as const;

export function extractSalaryRange(salary: SalaryOptions): { min: number; max: number } {
  const min = salary.min_range.min > 0 ? salary.min_range.min : 0;
  let max = 0;

  if (salary.max_range.max > 0) {
    max = salary.max_range.max;
  } else if (salary.min_range.max > 0 && salary.min_range.max !== min) {
    max = salary.min_range.max;
  } else if (salary.max_range.min > 0 && salary.max_range.min !== min) {
    max = salary.max_range.min;
  }

  return { min, max };
}

/**
 * Title sentence built on the shared `formatSalarySentence` API:
 * "Must pay between 70k - 120k USD yearly", "Must pay at least 70k USD yearly",
 * "Must pay up to 120k USD yearly", or the any-salary fallback.
 */
export function getSalaryTitle(salary: SalaryOptions): string {
  const { min, max } = extractSalaryRange(salary);

  return formatSalarySentence({
    min,
    max,
    currency: salary?.currency?.trim() || "USD",
    unit: salary?.unit,
    undisclosed: salary?.undisclosed,
  });
}

export function getUndisclosedSalaryTitle(undisclosed: boolean): string {
  return undisclosed ? "Hide jobs with undisclosed salaries" : "Show jobs with undisclosed salaries";
}

export default function Salary() {
  const { searchOptions, updateSearchOptions } = useApp();
  const { options: currencyItems } = useSearchData("currencies");
  const salary = searchOptions.salary;

  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  useEffect(() => {
    const { min, max } = extractSalaryRange(salary);
    setMinAmount(min > 0 ? String(min) : "");
    setMaxAmount(max > 0 ? String(max) : "");
  }, [salary.max_range.max, salary.max_range.min, salary.min_range.max, salary.min_range.min]);

  const toNumberOrZero = (value: string) => {
    const cleaned = value.replace(/[^0-9]/g, "");
    if (!cleaned) return 0;
    const parsed = Number.parseInt(cleaned, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const commitRange = (patch?: { min?: string; max?: string }) => {
    const rawMin = toNumberOrZero(patch?.min ?? minAmount);
    const rawMax = toNumberOrZero(patch?.max ?? maxAmount);
    const min = rawMin > 0 && rawMax > 0 && rawMin > rawMax ? rawMax : rawMin;
    const max = rawMin > 0 && rawMax > 0 && rawMin > rawMax ? rawMin : rawMax;

    if (patch?.min !== undefined) setMinAmount(patch.min);
    if (patch?.max !== undefined) setMaxAmount(patch.max);

    updateSearchOptions({
      salary: {
        ...salary,
        min_range: { min, max: min },
        max_range: { min: 0, max },
      },
    });
  };

  const toCurrencyOption = (value: string, label = value) => {
    const symbol = getCurrencySymbol(value);
    return {
      value,
      label,
      phrase: symbol && symbol !== value ? `${symbol} ${value}` : value,
    };
  };

  const dynamicCurrencyOptions = (() => {
    const base = currencyItems?.length ? currencyItems.slice(0, 10).map((c: { value: string; label: string }) => toCurrencyOption(c.value, c.label)) : CURRENCY_BLANK_OPTIONS;
    const current = salary.currency || "USD";
    if (base.some((option) => option.value === current)) return base;
    return [toCurrencyOption(current), ...base];
  })();

  const formatAmountBlank = (raw: string) => {
    const parsed = Number.parseInt(raw, 10);
    if (!raw || !Number.isFinite(parsed) || parsed <= 0) return UNSPECIFIED_BLANK;
    return formatCompactNumber(parsed);
  };

  const title = (
    <SentenceText>
      Must pay between
      <SentenceRangeBlank
        variant="popover"
        minAriaLabel="Minimum salary"
        maxAriaLabel="Maximum salary"
        minLabel="Minimum salary"
        maxLabel="Maximum salary"
        minValue={minAmount}
        maxValue={maxAmount}
        onChangeMin={setMinAmount}
        onChangeMax={setMaxAmount}
        onCommit={commitRange}
        formatDisplay={formatAmountBlank}
        separator="-"
        inputVariant="money"
        currencySymbol={getCurrencySymbol(salary.currency || "USD")}
      />
      <SentenceBlankSelect
        ariaLabel="Salary currency"
        value={salary.currency || "USD"}
        onChange={(curr) => updateSearchOptions({ salary: { ...salary, currency: curr } })}
        options={dynamicCurrencyOptions}
      />
      <SentenceBlankSelect
        ariaLabel="Salary frequency"
        value={salary.unit && salary.unit !== "Any" ? salary.unit : "Yearly"}
        onChange={(unit) =>
          updateSearchOptions({
            salary: { ...salary, unit: unit as SalaryUnit, listedUnit: unit as SalaryUnit },
          })
        }
        options={FREQUENCY_BLANK_OPTIONS}
      />
    </SentenceText>
  );

  return (
    <FilterContainer categoryId="salary" title={title} chrome="stream">
      <SentenceText>
        <SentenceBlankSelect
          ariaLabel="Undisclosed salary visibility"
          value={salary.undisclosed ? "hide" : "show"}
          onChange={(next) =>
            updateSearchOptions({
              salary: {
                ...salary,
                undisclosed: next === "hide",
              },
            })
          }
          options={[...UNDISCLOSED_BLANK_OPTIONS]}
        />
        jobs with undisclosed salaries
      </SentenceText>
    </FilterContainer>
  );
}
