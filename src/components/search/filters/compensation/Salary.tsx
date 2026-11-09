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
  CNY: "¥",
  NZD: "NZ$",
  SGD: "S$",
  HKD: "HK$",
  SEK: "kr",
  NOK: "kr",
  DKK: "kr",
  PLN: "zł",
  MXN: "Mex$",
  BRL: "R$",
  ZAR: "R",
  KRW: "₩",
  TRY: "₺",
  ILS: "₪",
  TWD: "NT$",
  THB: "฿",
  PHP: "₱",
  IDR: "Rp",
  MYR: "RM",
  VND: "₫",
  AED: "AED",
  SAR: "SAR",
  CZK: "Kč",
  HUF: "Ft",
  RON: "lei",
  BGN: "лв",
  COP: "Col$",
  CLP: "CLP$",
  ARS: "Arg$",
  PEN: "S/",
  EGP: "E£",
  PKR: "₨",
  NGN: "₦",
  UAH: "₴",
  QAR: "QR",
  KWD: "KD",
  BHD: "BD",
  OMR: "OMR",
};

export const getCurrencySymbol = (currency: string): string => {
  const upper = (currency ?? "").trim().toUpperCase();
  return CURRENCY_SYMBOLS[upper] || upper;
};

export const toCurrencyOption = (value: string, label = value) => {
  const code = (value ?? "").trim().toUpperCase();
  const symbol = getCurrencySymbol(code);
  const displayLabel = (label ?? code).trim().toUpperCase();
  return {
    value: code,
    label: displayLabel,
    phrase: symbol && symbol !== code ? `${symbol} ${code}` : code,
  };
};

export const DEFAULT_CURRENCY_CODES = [
  "USD",
  "EUR",
  "CAD",
  "GBP",
  "INR",
  "AUD",
  "MXN",
  "CHF",
  "BRL",
  "SGD",
  "PHP",
  "PLN",
  "MYR",
  "JPY",
  "CNY",
  "AED",
  "ZAR",
  "NZD",
  "IDR",
  "HKD",
  "TWD",
  "THB",
  "SAR",
  "SEK",
  "DKK",
  "EGP",
  "NGN",
  "CZK",
  "COP",
  "VND",
  "KRW",
  "PKR",
  "CLP",
  "HUF",
  "RON",
  "NOK",
  "TRY",
  "ILS",
  "PEN",
  "ARS",
] as const;

export const CURRENCY_BLANK_OPTIONS = DEFAULT_CURRENCY_CODES.map((code) => toCurrencyOption(code));

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
    currency: (salary?.currency ?? "").trim().toUpperCase() || "USD",
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

  const dynamicCurrencyOptions = (() => {
    const rawItems = currencyItems?.length ? currencyItems : CURRENCY_BLANK_OPTIONS;
    const seen = new Set<string>();
    const base: Array<{ value: string; label: string; phrase: string }> = [];

    for (const item of rawItems) {
      const raw = item?.value ?? item?.label;
      if (!raw || typeof raw !== "string") continue;
      const code = raw.trim().toUpperCase();
      if (!code || seen.has(code)) continue;
      if (!/^[A-Z]{3}$/.test(code)) continue;
      seen.add(code);
      base.push(toCurrencyOption(code));
    }

    const current = (salary.currency || "USD").trim().toUpperCase();
    if (current && !seen.has(current)) {
      base.unshift(toCurrencyOption(current));
    }

    return base.length > 0 ? base : CURRENCY_BLANK_OPTIONS;
  })();

  const formatAmountBlank = (raw: string) => {
    const parsed = Number.parseInt(raw, 10);
    if (!raw || !Number.isFinite(parsed)) return UNSPECIFIED_BLANK;
    return formatCompactNumber(parsed);
  };

  const title = (
    <SentenceText>
      Must pay between
      <SentenceRangeBlank
        variant="popover"
        ariaLabel="Salary range"
        minAriaLabel="Minimum salary"
        maxAriaLabel="Maximum salary"
        minValue={minAmount}
        maxValue={maxAmount}
        onChangeMin={setMinAmount}
        onChangeMax={setMaxAmount}
        onCommit={commitRange}
        formatDisplay={formatAmountBlank}
        separator="-"
        sliderMin={0}
        sliderMax={500_000}
        sliderStep={5_000}
        emptyLabel={UNSPECIFIED_BLANK}
        debounceMs={180}
      />
      <SentenceBlankSelect
        ariaLabel="Salary currency"
        value={(salary.currency || "USD").trim().toUpperCase()}
        onChange={(curr) => updateSearchOptions({ salary: { ...salary, currency: curr.trim().toUpperCase() } })}
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
