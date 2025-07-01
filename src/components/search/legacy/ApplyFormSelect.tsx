import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import UniversalTooltip from "../../util/UniversalTooltip";
import React, { useState } from "react";
import { useDarkMode } from "@/contexts/DarkModeContext";

export default function ApplyFormSelect() {
  const { isDarkMode } = useDarkMode();
  const [applyFormValue, setApplyFormValue] = useState("all");

  return (
    <Select value={applyFormValue} onValueChange={setApplyFormValue}>
      <SelectTrigger className="w-fit transition-all duration-300 rounded px-3 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
        <SelectValue placeholder="All apply forms" />
      </SelectTrigger>
      <SelectContent className={isDarkMode ? "dark" : ""}>
        <UniversalTooltip content="All application forms - simple or time-consuming.">
          <SelectItem value="all">All apply forms</SelectItem>
        </UniversalTooltip>
        <UniversalTooltip content="Application forms that don't require account creation.">
          <SelectItem value="simple">Simple apply forms</SelectItem>
        </UniversalTooltip>
        <UniversalTooltip content="Application forms that require account creation and/or resume formatting.">
          <SelectItem value="time-consuming">
            Time consuming apply forms
          </SelectItem>
        </UniversalTooltip>
      </SelectContent>
    </Select>
  );
}
