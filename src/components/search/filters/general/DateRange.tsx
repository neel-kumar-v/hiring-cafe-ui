import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { useSearch } from "@/contexts/SearchContext";
import { TimeUnits } from "@/types/search";
import { useEffect, useState } from "react";
import FilterContainer from "../util/FilterContainer";

interface DateRangeProps {
  isDarkMode?: boolean;
}

// Custom debounce hook
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function DateRange({}: DateRangeProps) {
  const { isDarkMode } = useDarkMode();
  const { searchOptions, updateSearchOptions } = useSearch();
  
  const [customTimeValue, setCustomTimeValue] = useState(searchOptions.date_range.magnitude.toString());
  const [customTimeUnit, setCustomTimeUnit] = useState(searchOptions.date_range.unit.toLowerCase());
  const [isAllTime, setIsAllTime] = useState(false);

  const debouncedTimeValue = useDebounce(customTimeValue, 500);

  const getTimeUnitLimits = (unit: string) => {
    const limits: { [key: string]: { min: number; max: number } } = {
      minutes: { min: 1, max: 60 },
      hours: { min: 1, max: 48 },
      days: { min: 1, max: 90 },
      months: { min: 1, max: 24 },
      years: { min: 1, max: 10 },
    };
    return limits[unit] || { min: 1, max: 100 };
  };

  const handleNumberChange = (value: string) => {
    const numValue = Number.parseInt(value) || 0;
    const limits = getTimeUnitLimits(customTimeUnit);

    if (numValue < limits.min) {
      setCustomTimeValue(limits.min.toString());
    } else if (numValue > limits.max) {
      setCustomTimeValue(limits.max.toString());
    } else {
      setCustomTimeValue(value);
    }
  };

  const handleTimeUnitChangeWithValidation = (unit: string) => {
    if (unit === "all-time") {
      setIsAllTime(true);
      setCustomTimeUnit("days");
      updateSearchOptions({
        date_range: {
          magnitude: 365,
          unit: "Days"
        }
      });
      return;
    }

    setIsAllTime(false);
    setCustomTimeUnit(unit);

    const defaults: { [key: string]: string } = {
      minutes: "1",
      hours: "24",
      days: "3",
      weeks: "2",
      years: "1",
    };

    const newValue = defaults[unit] || "1";
    setCustomTimeValue(newValue);
    
    const timeUnitMap: { [key: string]: TimeUnits } = {
      minutes: "Minutes",
      hours: "Hours", 
      days: "Days",
      weeks: "Weeks",
      months: "Months",
      years: "Years"
    };

    updateSearchOptions({
      date_range: {
        magnitude: parseInt(newValue),
        unit: timeUnitMap[unit] || "Days"
      }
    });
  };

  useEffect(() => {
    if (debouncedTimeValue && customTimeUnit && !isAllTime) {
      const timeUnitMap: { [key: string]: TimeUnits } = {
        minutes: "Minutes",
        hours: "Hours", 
        days: "Days",
        weeks: "Weeks",
        months: "Months",
        years: "Years"
      };

      updateSearchOptions({
        date_range: {
          magnitude: parseInt(debouncedTimeValue),
          unit: timeUnitMap[customTimeUnit] || "Days"
        }
      });
    }
  }, [debouncedTimeValue, customTimeUnit, isAllTime]);

  return (
    <FilterContainer title="Show jobs from the past">
      <div className="flex items-center space-x-2">
        <Input
          className="w-12  text-center text-text placeholder:text-muted-foreground text-sm ring-0 [-moz-appearance:textfield]  [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden"
          disabled={isAllTime}
          max={getTimeUnitLimits(customTimeUnit).max}
          min={getTimeUnitLimits(customTimeUnit).min}
          onChange={(e) => handleNumberChange(e.target.value)}
          placeholder="Enter number"
          type="number"
          value={customTimeValue}
        />
        <Select
          onValueChange={handleTimeUnitChangeWithValidation}
          value={isAllTime ? "all-time" : customTimeUnit}
        >
          <SelectTrigger className="w-full text-text placeholder:text-muted-foreground text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className={isDarkMode ? "dark" : ""}>
            <SelectItem value="all-time">All time</SelectItem>
            <SelectItem value="minutes">Minutes</SelectItem>
            <SelectItem value="hours">Hours</SelectItem>
            <SelectItem value="days">Days</SelectItem>
            <SelectItem value="weeks">Weeks</SelectItem>
            <SelectItem value="months">Months</SelectItem>
            <SelectItem value="years">Years</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </FilterContainer>
  );
} 