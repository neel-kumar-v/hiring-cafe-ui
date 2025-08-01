import { Combobox } from "@/components/ui/combobox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/contexts/AppContext";
import currenciesData from "@/data/currencies.json";
import { SalaryUnit } from "@/types/search";
import { useEffect, useRef, useState } from "react";
import FilterContainer from "../util/FilterContainer";
import LabelCheckbox from "../util/LabelCheckbox";
import RangeSlider from "../util/RangeSlider";

function useDebouncedEffect(effect: () => void, deps: ReadonlyArray<unknown>, delay: number) {
  const callback = useRef(effect);
  useEffect(() => {
    callback.current = effect;
  }, [effect]);
  useEffect(() => {
    const handler = setTimeout(() => callback.current(), delay);
    return () => clearTimeout(handler);
  }, [...deps, delay]);
}

export default function Salary() {
  const { searchOptions, updateSearchOptions } = useApp();
  const salary = searchOptions.salary;
  const [advanced, setAdvanced] = useState(false);

  // Local state for sliders
  const [salaryMinLow, setSalaryMinLow] = useState(salary.min_range.min === 0 ? 0 : salary.min_range.min);
  const [salaryMinHigh, setSalaryMinHigh] = useState(salary.min_range.max === 0 ? 0 : salary.min_range.max);
  const [salaryMaxLow, setSalaryMaxLow] = useState(salary.max_range.min === 0 ? 250000 : salary.max_range.min);
  const [salaryMaxHigh, setSalaryMaxHigh] = useState(salary.max_range.max === 0 ? 250000 : salary.max_range.max);

  const currencyItems = currenciesData.suggestions.map(currency => ({
    value: currency,
    label: currency
  }));

  const frequencyOptions = [
    { value: "Any", label: "Any" },
    { value: "Hourly", label: "Hourly" },
    { value: "Daily", label: "Daily" },
    { value: "Weekly", label: "Weekly" },
    { value: "Bi-Weekly", label: "Bi-Weekly" },
    { value: "Monthly", label: "Monthly" },
    { value: "Yearly", label: "Yearly" }
  ];

  useDebouncedEffect(() => {
    updateSearchOptions({
      salary: {
        ...salary,
        min_range: { min: salaryMinLow, max: salaryMinHigh },
        max_range: { min: salaryMaxLow, max: salaryMaxHigh },
      },
    });
  }, [salaryMinLow, salaryMinHigh, salaryMaxLow, salaryMaxHigh], 500);

  // Handlers for checkboxes
  const handleUndisclosedChange = (checked: boolean | "indeterminate") => {
    updateSearchOptions({
      salary: { ...salary, undisclosed: Boolean(checked) },
    });
  };

  const handleAdvancedChange = (checked: boolean | "indeterminate") => {
    setSalaryMinHigh(Math.min(salary.min_range.max + 50000, salary.max_range.max));
    setSalaryMaxLow(Math.max(salary.max_range.min - 50000, salary.min_range.min));
    setAdvanced(Boolean(checked));
  };

  // Currency handler
  const handleCurrencyChange = (value: string) => {
    updateSearchOptions({
      salary: { ...salary, currency: value },
    });
  };

  // Frequency handler
  const handleFrequencyChange = (value: string) => {
    updateSearchOptions({
      salary: { ...salary, unit: value as SalaryUnit },
    });
  };

  // Simple slider handler
  const handleSimpleSlider = ([min, max]: [number, number]) => {
    setSalaryMinLow(min);
    setSalaryMinHigh(min);
    setSalaryMaxLow(max);
    setSalaryMaxHigh(max);
  };

  // Advanced min slider handler
  const handleAdvMinSlider = ([min, max]: [number, number]) => {
    setSalaryMinLow(min);
    setSalaryMinHigh(max);
  };

  // Advanced max slider handler
  const handleAdvMaxSlider = ([min, max]: [number, number]) => {
    setSalaryMaxLow(min);
    setSalaryMaxHigh(max);
  };

  return (
    <FilterContainer title="Salary Range">
      <p className="mb-2 -mt-2 text-xs text-muted-foreground">
        Max slider value can be updated
      </p>
      
      <div className="grid grid-cols-1 gap-4">
        <LabelCheckbox
          label="Hide Jobs with undisclosed salaries?"
          checked={salary.undisclosed}
          onChange={handleUndisclosedChange}
        />
        <LabelCheckbox
          label="Advanced Salary Control"
          checked={advanced}
          onChange={handleAdvancedChange}
        />
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mt-4">
        <div className="flex-1">
          <label className="text-xs font-medium mb-2 block text-foreground">Currency</label>
          <Combobox
            items={currencyItems}
            value={salary.currency}
            onChange={handleCurrencyChange}
            placeholder="Select currency"
            buttonClassName="w-full h-9 px-3 py-2 text-sm border-border bg-accent text-foreground hover:bg-accent"
          />
        </div>
        <div className="flex-1">
          <label className="text-xs font-medium mb-2 block text-foreground">Frequency</label>
          <Select value={salary.unit} onValueChange={handleFrequencyChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              {frequencyOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-4">
        {!advanced ? (
          <RangeSlider
            min={0}
            max={250000}
            step={1000}
            currency={salary.currency}
            value={[salaryMinLow, salaryMaxHigh]}
            onValueChange={handleSimpleSlider}
          />
        ) : (
          <>
            <div>
              <div className="mb-1 text-xs font-medium">Min Salary</div>
              <RangeSlider
                min={0}
                max={250000}
                step={1000}
                currency={salary.currency}
                value={[salaryMinLow, salaryMinHigh]}
                onValueChange={handleAdvMinSlider}
              />
            </div>
            <div>
              <div className="mb-1 text-xs font-medium">Max Salary</div>
              <RangeSlider
                min={0}
                max={250000}
                step={1000}
                currency={salary.currency}
                value={[salaryMaxLow, salaryMaxHigh]}
                onValueChange={handleAdvMaxSlider}
              />
            </div>
          </>
        )}
      </div>
    </FilterContainer>
  );
} 