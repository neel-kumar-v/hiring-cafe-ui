import { useApp } from "@/contexts/AppContext";
import { getCurrentYear } from "@/lib/search/company";
import { Input } from "@/components/ui/input";
import { useCallback, useEffect, useState } from "react";
import FilterContainer from "../util/FilterContainer";

export default function Founding() {
  const { searchOptions, updateSearchOptions } = useApp();
  const foundingYear = searchOptions.founding_year;
  const currentYear = getCurrentYear();
  const [minYear, setMinYear] = useState("");
  const [maxYear, setMaxYear] = useState("");

  useEffect(() => {
    setMinYear(foundingYear.min > 0 ? String(foundingYear.min) : "");
    setMaxYear(foundingYear.max > 0 ? String(foundingYear.max) : "");
  }, [foundingYear.max, foundingYear.min]);

  const toNumberOrZero = (value: string) => {
    if (!value) return 0;
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

  const commit = useCallback(() => {
    const rawMin = toNumberOrZero(minYear);
    const rawMax = toNumberOrZero(maxYear);

    const normalizedMin = rawMin === 0 ? 0 : clamp(rawMin, 1800, currentYear);
    const normalizedMax = rawMax === 0 ? 0 : clamp(rawMax, 1800, currentYear);

    const min = normalizedMin;
    const max = normalizedMax;

    updateSearchOptions({
      founding_year: min > 0 && max > 0 && min > max ? { min: max, max: min } : { min, max },
    });
  }, [currentYear, maxYear, minYear, updateSearchOptions]);

  return (
    <FilterContainer categoryId="founding" title="Founding Year">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-foreground">Min</label>
          <Input
            className="w-full text-sm [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden"
            inputMode="numeric"
            placeholder="No min"
            type="text"
            value={minYear}
            onChange={(e) => setMinYear(e.target.value.replace(/[^0-9]/g, ""))}
            onBlur={commit}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-foreground">Max</label>
          <Input
            className="w-full text-sm [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden"
            inputMode="numeric"
            placeholder="No max"
            type="text"
            value={maxYear}
            onChange={(e) => setMaxYear(e.target.value.replace(/[^0-9]/g, ""))}
            onBlur={commit}
          />
        </div>
      </div>
    </FilterContainer>
  );
} 
