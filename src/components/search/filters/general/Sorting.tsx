import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { useSearch } from "@/contexts/SearchContext";
import { ChevronsDown, ChevronsUp } from "lucide-react";
import { useEffect, useState } from "react";

interface SortingProps {
  isDarkMode?: boolean;
}

type SortCategory = "relevance" | "recent" | "salary" | "experience";

export default function Sorting({}: SortingProps) {
  const { isDarkMode } = useDarkMode();
  const { searchOptions, updateSearchOptions } = useSearch();
  
  const [sortCategory, setSortCategory] = useState<SortCategory>(() => {
    const categoryMap: Record<string, SortCategory> = {
      Relevance: "relevance",
      Recency: "recent", 
      Salary: "salary",
      Experience: "experience"
    };
    return categoryMap[searchOptions.sort.by] || "relevance";
  });
  
  const [isAscending, setIsAscending] = useState(() => {
    return searchOptions.sort.order === "Ascending";
  });

  useEffect(() => {
    const categoryMap: Record<SortCategory, "Relevance" | "Recency" | "Salary" | "Experience"> = {
      relevance: "Relevance",
      recent: "Recency",
      salary: "Salary", 
      experience: "Experience"
    };
    
    updateSearchOptions({
      sort: {
        by: categoryMap[sortCategory],
        order: isAscending ? "Ascending" : "Descending"
      }
    });
    
  }, [sortCategory, isAscending]);

  return (
    <div className="space-y-4">
      <p className="text-lg font-semibold">Sort By</p>
    
      <div className="flex gap-2">
        <Toggle
          className="w-full items-center justify-center rounded bg-neutral-100 text-neutral-900 transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-700 dark:text-white dark:hover:bg-neutral-600 rounded-md"
          disabled={sortCategory === "relevance"}
          onClick={() => setIsAscending(!isAscending)}
          type="button"
        >
          {isAscending ? (
            <div className="flex items-center gap-2">
              <ChevronsUp className="size-4" />
              <span>Most</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <ChevronsDown className="size-4" />
              <span>Least</span>
            </div>
          )}
        </Toggle>
        <div>
          <Select
            onValueChange={(value: SortCategory) => {
              setSortCategory(value);
              if (value === "relevance") {
                setIsAscending(true);
              }
            }}
            value={sortCategory}
          >
            <SelectTrigger className="flex w-full border-neutral-200 bg-white text-neutral-900 text-sm dark:border-neutral-600 dark:bg-neutral-700 dark:text-white">
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
      </div>
    </div>
  );
} 