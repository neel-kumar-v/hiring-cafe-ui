import { useSearch } from "@/contexts/SearchContext";
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
  const { searchOptions, updateSearchOptions } = useSearch();
  const salary = searchOptions.salary;
  const [advanced, setAdvanced] = useState(false);

  // Local state for sliders
  const [salaryMinLow, setSalaryMinLow] = useState(salary.min_range.min === 0 ? 0 : salary.min_range.min);
  const [salaryMinHigh, setSalaryMinHigh] = useState(salary.min_range.max === 0 ? 0 : salary.min_range.max);
  const [salaryMaxLow, setSalaryMaxLow] = useState(salary.max_range.min === 0 ? 250000 : salary.max_range.min);
  const [salaryMaxHigh, setSalaryMaxHigh] = useState(salary.max_range.max === 0 ? 250000 : salary.max_range.max);

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