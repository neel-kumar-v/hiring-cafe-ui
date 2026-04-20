"use client";

import { useEffect, useState } from "react";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApp } from "@/contexts/AppContext";
import { useSearchData } from "@/hooks/useSearchData";
import type { SalaryUnit } from "@/types/search";
import FilterContainer from "../util/FilterContainer";
import LabelCheckbox from "../util/LabelCheckbox";

const frequencyOptions: SalaryUnit[] = [
  "Any",
  "Hourly",
  "Daily",
  "Weekly",
  "Bi-Weekly",
  "Monthly",
  "Yearly",
];

type MoneyInputProps = {
  label: string;
  currencySymbol: string;
  value: string;
  placeholder: string;
  onChangeValue: (nextValue: string) => void;
  onBlurCommit: () => void;
};

function getCurrencySymbol(currencyCode: string) {
  try {
    const parts = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
    }).formatToParts(0);
    return parts.find((part) => part.type === "currency")?.value ?? "$";
  } catch {
    return "$";
  }
}

function MoneyInput({
  label,
  currencySymbol,
  value,
  placeholder,
  onChangeValue,
  onBlurCommit,
}: MoneyInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-foreground">{label}</label>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
          {currencySymbol}
        </span>
        <Input
          className="w-full pl-8 text-sm [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden"
          inputMode="numeric"
          placeholder={placeholder}
          type="text"
          value={value}
          onChange={(e) => onChangeValue(e.target.value)}
          onBlur={onBlurCommit}
        />
      </div>
    </div>
  );
}

export default function Salary() {
  const { searchOptions, updateSearchOptions } = useApp();
  const { options: currencyItems, loading: currenciesLoading } = useSearchData("currencies");
  const salary = searchOptions.salary;
  const [advanced, setAdvanced] = useState(false);

  const [simpleAmount, setSimpleAmount] = useState("");
  const [advMinLow, setAdvMinLow] = useState("");
  const [advMinHigh, setAdvMinHigh] = useState("");
  const [advMaxLow, setAdvMaxLow] = useState("");
  const [advMaxHigh, setAdvMaxHigh] = useState("");

  useEffect(() => {
    const hasAdvancedValues =
      salary.min_range.max > 0 ||
      salary.max_range.min !== salary.max_range.max ||
      salary.min_range.min !== salary.min_range.max;

    setAdvanced(hasAdvancedValues);
  }, [salary.max_range.max, salary.max_range.min, salary.min_range.max, salary.min_range.min]);

  useEffect(() => {
    setSimpleAmount(salary.max_range.max > 0 ? String(salary.max_range.max) : "");
    setAdvMinLow(salary.min_range.min > 0 ? String(salary.min_range.min) : "");
    setAdvMinHigh(salary.min_range.max > 0 ? String(salary.min_range.max) : "");
    setAdvMaxLow(salary.max_range.min > 0 ? String(salary.max_range.min) : "");
    setAdvMaxHigh(salary.max_range.max > 0 ? String(salary.max_range.max) : "");
  }, [salary.max_range.max, salary.max_range.min, salary.min_range.max, salary.min_range.min]);

  const cleanDigits = (value: string) => value.replace(/[^0-9]/g, "");
  const toNumberOrZero = (value: string) => {
    const cleaned = cleanDigits(value);
    if (!cleaned) return 0;
    const parsed = Number.parseInt(cleaned, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const currencySymbol = getCurrencySymbol(salary.currency || "USD");

  return (
    <FilterContainer categoryId="salary" title="Salary Range">
      <p className="-mt-2 mb-2 text-xs text-muted-foreground">
        Enter salary amounts directly. Leave fields blank to remove that bound.
      </p>

      <div className="grid grid-cols-1 gap-4">
        <LabelCheckbox
          label="Hide Jobs with undisclosed salaries?"
          checked={salary.undisclosed}
          onChange={(checked) =>
            updateSearchOptions({
              salary: {
                ...salary,
                undisclosed: Boolean(checked),
              },
            })
          }
        />
        <LabelCheckbox
          label="Advanced Salary Control"
          checked={advanced}
          onChange={(checked) => {
            const nextAdvanced = Boolean(checked);
            setAdvanced(nextAdvanced);

            if (!nextAdvanced) {
              const nextAmount = toNumberOrZero(advMaxHigh || advMaxLow || advMinLow || simpleAmount);
              updateSearchOptions({
                salary: {
                  ...salary,
                  min_range: { min: 0, max: 0 },
                  max_range: { min: nextAmount, max: nextAmount },
                },
              });
            }
          }}
        />
      </div>

      <div className="mt-4 flex flex-col gap-4 md:flex-row">
        <div className="flex-1">
          <label className="mb-2 block text-xs font-medium text-foreground">Currency</label>
          {currenciesLoading ? (
            <div className="h-9 w-full rounded-md border border-border bg-accent px-3 py-2 text-sm text-muted-foreground">
              Loading...
            </div>
          ) : (
            <Combobox
              items={currencyItems}
              value={salary.currency}
              onChange={(value) =>
                updateSearchOptions({
                  salary: {
                    ...salary,
                    currency: value || "USD",
                  },
                })
              }
              placeholder="Select currency"
              buttonClassName="w-full h-9 px-3 py-2 text-sm border-border bg-accent text-foreground hover:bg-accent"
            />
          )}
        </div>

        <div className="flex-1">
          <label className="mb-2 block text-xs font-medium text-foreground">Frequency</label>
          <Select
            value={salary.unit}
            onValueChange={(value: SalaryUnit) =>
              updateSearchOptions({
                salary: {
                  ...salary,
                  unit: value,
                },
              })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              {frequencyOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-4">
        {!advanced ? (
          <MoneyInput
            label="Amount"
            currencySymbol={currencySymbol}
            placeholder="Enter amount"
            value={simpleAmount}
            onChangeValue={(nextValue) => setSimpleAmount(cleanDigits(nextValue))}
            onBlurCommit={() => {
              const amount = toNumberOrZero(simpleAmount);
              updateSearchOptions({
                salary: {
                  ...salary,
                  min_range: { min: 0, max: 0 },
                  max_range: { min: amount, max: amount },
                },
              });
            }}
          />
        ) : (
          <>
            <div>
              <div className="mb-1 text-xs font-medium">Minimum Salary Range</div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <MoneyInput
                  label="Low"
                  currencySymbol={currencySymbol}
                  placeholder="No min"
                  value={advMinLow}
                  onChangeValue={(nextValue) => setAdvMinLow(cleanDigits(nextValue))}
                  onBlurCommit={() =>
                    updateSearchOptions({
                      salary: {
                        ...salary,
                        min_range: {
                          ...salary.min_range,
                          min: toNumberOrZero(advMinLow),
                        },
                      },
                    })
                  }
                />
                <MoneyInput
                  label="High"
                  currencySymbol={currencySymbol}
                  placeholder="No max"
                  value={advMinHigh}
                  onChangeValue={(nextValue) => setAdvMinHigh(cleanDigits(nextValue))}
                  onBlurCommit={() =>
                    updateSearchOptions({
                      salary: {
                        ...salary,
                        min_range: {
                          ...salary.min_range,
                          max: toNumberOrZero(advMinHigh),
                        },
                      },
                    })
                  }
                />
              </div>
            </div>

            <div>
              <div className="mb-1 text-xs font-medium">Maximum Salary Range</div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <MoneyInput
                  label="Low"
                  currencySymbol={currencySymbol}
                  placeholder="No min"
                  value={advMaxLow}
                  onChangeValue={(nextValue) => setAdvMaxLow(cleanDigits(nextValue))}
                  onBlurCommit={() =>
                    updateSearchOptions({
                      salary: {
                        ...salary,
                        max_range: {
                          ...salary.max_range,
                          min: toNumberOrZero(advMaxLow),
                        },
                      },
                    })
                  }
                />
                <MoneyInput
                  label="High"
                  currencySymbol={currencySymbol}
                  placeholder="No max"
                  value={advMaxHigh}
                  onChangeValue={(nextValue) => setAdvMaxHigh(cleanDigits(nextValue))}
                  onBlurCommit={() =>
                    updateSearchOptions({
                      salary: {
                        ...salary,
                        max_range: {
                          ...salary.max_range,
                          max: toNumberOrZero(advMaxHigh),
                        },
                      },
                    })
                  }
                />
              </div>
            </div>
          </>
        )}
      </div>
    </FilterContainer>
  );
}
