"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/contexts/AppContext";
import { useDarkMode } from "@/contexts/DarkModeContext";
import type { ApplyForm } from "@/types/search";
import { useEffect, useState } from "react";
import FilterContainer from "../util/FilterContainer";

export default function ApplyForm() {
  const { isDarkMode } = useDarkMode();
  const { searchOptions, updateSearchOptions } = useApp();
  
  const [applyFormValue, setApplyFormValue] = useState<string>(() => {
    const valueMap: Record<ApplyForm, string> = {
      "All": "all",
      "Fast": "simple", 
      "Slow": "time-consuming"
    };
    return valueMap[searchOptions.apply_form] || "all";
  });

  useEffect(() => {
    const applyFormMap: Record<string, ApplyForm> = {
      "all": "All",
      "simple": "Fast",
      "time-consuming": "Slow"
    };
    
    updateSearchOptions({
      apply_form: applyFormMap[applyFormValue] || "All"
    });
  }, [applyFormValue]);

  const getDescription = (value: string) => {
    switch (value) {
      case "all":
        return "All application forms - simple or time-consuming.";
      case "simple":
        return "Application forms that don't require account creation.";
      case "time-consuming":
        return "Application forms that require account creation and/or resume formatting.";
      default:
        return "";
    }
  };

  return (
    <FilterContainer title="Apply Form Type">
      
      <Select onValueChange={setApplyFormValue} value={applyFormValue}>
        <SelectTrigger className="w-full text-text placeholder:text-muted-foreground text-sm">
          <SelectValue placeholder="All apply forms" />
        </SelectTrigger>
        <SelectContent className={isDarkMode ? "dark" : ""}>
          <SelectItem value="all">All apply forms</SelectItem>
          <SelectItem value="simple">Simple apply forms</SelectItem>
          <SelectItem value="time-consuming">
            Time consuming apply forms
          </SelectItem>
        </SelectContent>
      </Select>
      
      <p className="text-sm text-muted-foreground">{getDescription(applyFormValue)}</p>
    </FilterContainer>
  );
} 