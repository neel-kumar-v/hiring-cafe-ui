"use client";

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
import { Toggle } from "@/components/ui/toggle";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { ChevronsDown, ChevronsUp } from "lucide-react";
import { useState } from "react";

export default function SortPopover() {
  const { isDarkMode } = useDarkMode();
  const [sortCategory, setSortCategory] = useState("relevance");
  const [isAscending, setIsAscending] = useState(true);

  const getSortDisplayText = () => {
    let orderText;
    if (sortCategory === "salary") {
      orderText = isAscending ? "Lowest" : "Highest";
    } else {
      orderText = isAscending ? "Most" : "Least";
    }
    const categoryText =
      sortCategory === "relevance"
        ? "Relevant"
        : sortCategory === "recent"
          ? "Recent"
          : sortCategory === "salary"
            ? "Salary"
            : sortCategory === "experience"
              ? "Experience"
              : "Relevant";
    return `${orderText} ${categoryText}`;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className="flex w-fit items-center space-x-2 rounded bg-background text-foreground text-sm transition-all duration-300 dark:bg-card dark:text-foreground"
          variant="outline"
        >
          <span>{getSortDisplayText()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={`dark:border-border dark:bg-card ${
          isDarkMode ? "dark" : ""
        }`}
      >
        <div className="flex space-x-3">
          <div>
            <Select
              onValueChange={(value) => {
                setSortCategory(value);
                if (value === "relevance") {
                  setIsAscending(true);
                }
              }}
              value={sortCategory}
            >
              <SelectTrigger className="w-full border-border bg-background text-foreground text-sm dark:border-border dark:bg-secondary dark:text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={isDarkMode ? "dark" : ""}>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="recent">Recent</SelectItem>
                <SelectItem value="salary">Salary</SelectItem>
                <SelectItem value="experience">Experience</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Toggle
            className="flex w-full items-center justify-center rounded bg-secondary text-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50 dark:bg-secondary dark:text-foreground dark:hover:bg-accent"
            disabled={sortCategory === "relevance"}
            onClick={() => setIsAscending(!isAscending)}
            type="button"
          >
            {isAscending ? (
              <ChevronsUp className="size-4" />
            ) : (
              <ChevronsDown className="size-4" />
            )}
          </Toggle>
        </div>
      </PopoverContent>
    </Popover>
  );
}
