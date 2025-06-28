import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import React, { useState, useEffect } from "react";
import { useDarkMode } from "@/contexts/DarkModeContext";

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

export default function DateRangePopover() {
  const { isDarkMode } = useDarkMode();
  const [customTimeValue, setCustomTimeValue] = useState("3");
  const [customTimeUnit, setCustomTimeUnit] = useState("days");
  const [isAllTime, setIsAllTime] = useState(false);

  const debouncedTimeValue = useDebounce(customTimeValue, 500);

  const getTimeUnitLimits = (unit: string) => {
    const limits: { [key: string]: { min: number; max: number } } = {
      hours: { min: 1, max: 24 },
      days: { min: 1, max: 7 },
      weeks: { min: 1, max: 3 },
      months: { min: 1, max: 11 },
      years: { min: 1, max: 10 },
    };
    return limits[unit] || { min: 1, max: 100 };
  };

  const handleNumberChange = (value: string) => {
    const numValue = parseInt(value) || 0;
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
      hours: "24",
      days: "3",
      weeks: "2",
      months: "1",
      years: "1",
    };

    const currentValue = parseInt(customTimeValue) || 0;
    const newLimits = getTimeUnitLimits(unit);

    if (currentValue >= newLimits.min && currentValue <= newLimits.max) {
    } else {
      setCustomTimeValue(defaults[unit] || "1");
    }
  };

  useEffect(() => {
    if (debouncedTimeValue && customTimeUnit) {
      console.log(`Time filter: ${debouncedTimeValue} ${customTimeUnit}`);
    }
  }, [debouncedTimeValue, customTimeUnit]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-fit rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          {isAllTime ? "All time" : `${customTimeValue} ${customTimeUnit}`}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={`dark:bg-gray-800 dark:border-gray-600 ${
          isDarkMode ? "dark" : ""
        }`}
      >
        <div className="flex items-center space-x-2">
          <Input
            type="number"
            placeholder="Enter number"
            value={customTimeValue}
            onChange={(e) => handleNumberChange(e.target.value)}
            min={getTimeUnitLimits(customTimeUnit).min}
            max={getTimeUnitLimits(customTimeUnit).max}
            disabled={isAllTime}
            className="w-12 ring-0 text-sm text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 [&::-webkit-outer-spin-button]:hidden [&::-webkit-inner-spin-button]:hidden [-moz-appearance:textfield]"
          />
          <Select
            value={isAllTime ? "all-time" : customTimeUnit}
            onValueChange={handleTimeUnitChangeWithValidation}
          >
            <SelectTrigger className="w-24 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className={isDarkMode ? "dark" : ""}>
              <SelectItem value="all-time">All time</SelectItem>
              <SelectItem value="hours">Hours</SelectItem>
              <SelectItem value="days">Days</SelectItem>
              <SelectItem value="weeks">Weeks</SelectItem>
              <SelectItem value="months">Months</SelectItem>
              <SelectItem value="years">Years</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </PopoverContent>
    </Popover>
  );
}
