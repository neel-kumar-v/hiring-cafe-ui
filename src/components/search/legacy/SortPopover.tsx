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
          className="flex w-fit items-center space-x-2 rounded bg-white text-neutral-900 text-sm transition-all duration-300 dark:bg-neutral-800 dark:text-white"
          variant="outline"
        >
          <span>{getSortDisplayText()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={`dark:border-neutral-600 dark:bg-neutral-800 ${
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
              <SelectTrigger className="w-full border-neutral-200 bg-white text-neutral-900 text-sm dark:border-neutral-600 dark:bg-neutral-700 dark:text-white">
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
            className="flex w-full items-center justify-center rounded bg-neutral-100 text-neutral-900 transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-700 dark:text-white dark:hover:bg-neutral-600"
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
