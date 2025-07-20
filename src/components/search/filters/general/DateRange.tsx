import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useDarkMode } from "@/contexts/DarkModeContext";

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
  const [customTimeValue, setCustomTimeValue] = useState("3");
  const [customTimeUnit, setCustomTimeUnit] = useState("days");
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

    setCustomTimeValue(defaults[unit] || "1");
  };

  useEffect(() => {
    if (debouncedTimeValue && customTimeUnit) {
      console.log(`Time filter: ${debouncedTimeValue} ${customTimeUnit}`);
    }
  }, [debouncedTimeValue, customTimeUnit]);

  return (
    <>
      <p className="font-semibold text-lg text-text">Show jobs from the past</p>
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
            <SelectItem value="weeks">Minutes</SelectItem>
            <SelectItem value="hours">Hours</SelectItem>
            <SelectItem value="days">Days</SelectItem>
            <SelectItem value="months">Months</SelectItem>
            <SelectItem value="years">Years</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
} 