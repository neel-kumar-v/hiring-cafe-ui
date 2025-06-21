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
import React from "react";

type DateRangePopoverProps = {
  customTimeValue: string;
  customTimeUnit: string;
  isAllTime: boolean;
  getTimeUnitLimits: (unit: string) => { min: number; max: number };
  handleNumberChange: (value: string) => void;
  handleTimeUnitChangeWithValidation: (unit: string) => void;
  isDarkMode: boolean;
};

export default function DateRangePopover({
  customTimeValue,
  customTimeUnit,
  isAllTime,
  getTimeUnitLimits,
  handleNumberChange,
  handleTimeUnitChangeWithValidation,
  isDarkMode,
}: DateRangePopoverProps) {
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
