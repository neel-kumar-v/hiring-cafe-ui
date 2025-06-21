import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React, { useState } from "react";

type ApplyFormSelectProps = {
  isDarkMode: boolean;
};

export default function ApplyFormSelect({ isDarkMode }: ApplyFormSelectProps) {
  const [applyFormValue, setApplyFormValue] = useState("all");

  return (
    <Select value={applyFormValue} onValueChange={setApplyFormValue}>
      <SelectTrigger className="w-fit transition-all duration-300 rounded px-3 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
        <SelectValue placeholder="All apply forms" />
      </SelectTrigger>
      <SelectContent className={isDarkMode ? "dark" : ""}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <SelectItem value="all">All apply forms</SelectItem>
            </TooltipTrigger>
            <TooltipContent side="right">
              All application forms - simple or time-consuming.
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <SelectItem value="simple">Simple apply forms</SelectItem>
            </TooltipTrigger>
            <TooltipContent side="right">
              Application forms that don&apos;t require account creation.
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <SelectItem value="time-consuming">
                Time consuming apply forms
              </SelectItem>
            </TooltipTrigger>
            <TooltipContent side="right">
              Application forms that require account creation and/or resume
              formatting.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </SelectContent>
    </Select>
  );
}
