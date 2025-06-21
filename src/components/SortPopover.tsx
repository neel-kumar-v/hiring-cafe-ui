import { ChevronsUp, ChevronsDown } from "lucide-react";
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
import React from "react";

type SortPopoverProps = {
  sortCategory: string;
  setSortCategory: (value: string) => void;
  isAscending: boolean;
  setIsAscending: (value: boolean) => void;
  isDarkMode: boolean;
  getSortDisplayText: () => string;
};

export default function SortPopover({
  sortCategory,
  setSortCategory,
  isAscending,
  setIsAscending,
  isDarkMode,
  getSortDisplayText,
}: SortPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-fit transition-all duration-300 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white flex items-center space-x-2"
        >
          <span>{getSortDisplayText()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={`dark:bg-gray-800 dark:border-gray-600 ${
          isDarkMode ? "dark" : ""
        }`}
      >
        <div className="space-x-3 flex">
          <div>
            <Select
              value={sortCategory}
              onValueChange={(value) => {
                setSortCategory(value);
                if (value === "relevance") {
                  setIsAscending(true);
                }
              }}
            >
              <SelectTrigger className="w-full text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600">
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
            type="button"
            className="flex items-center justify-center w-full rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setIsAscending(!isAscending)}
            disabled={sortCategory === "relevance"}
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
