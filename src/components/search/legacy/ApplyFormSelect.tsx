import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { useState } from "react";
import UniversalTooltip from "../../util/UniversalTooltip";

export default function ApplyFormSelect() {
  const { isDarkMode } = useDarkMode();
  const [applyFormValue, setApplyFormValue] = useState("all");

  return (
    <Select onValueChange={setApplyFormValue} value={applyFormValue}>
      <SelectTrigger className="w-fit rounded bg-white px-3 py-1 text-neutral-900 text-sm transition-all duration-300 dark:bg-neutral-800 dark:text-white">
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
