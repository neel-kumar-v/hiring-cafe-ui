import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { useApp } from "@/contexts/AppContext";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { ChevronsDown, ChevronsUp } from "lucide-react";
import { useEffect, useState } from "react";
import FilterContainer from "../util/FilterContainer";


type SortCategory = "relevance" | "recent" | "salary" | "experience";

export default function Sorting() {
  const { isDarkMode } = useDarkMode();
  const { searchOptions, updateSearchOptions } = useApp();
  
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
    return searchOptions.sort.order === "Most";
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
        order: isAscending ? "Most" : "Least"
      }
    });
    
  }, [sortCategory, isAscending]);

  return (
    <FilterContainer title="Sort By">
    
      <div className="flex gap-2">
        <Toggle
          className="w-full items-center justify-center text-text transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 rounded-md border-input border-1"
          disabled={sortCategory === "relevance"}
          onClick={() => setIsAscending(!isAscending)}
          type="button"
        >
          {isAscending ? (
            <div className="flex items-center gap-2">
              <ChevronsUp className="size-4" />
              <span className="!text-text">Most</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <ChevronsDown className="size-4" />
              <span className="!text-text">Least</span>
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
            <SelectTrigger className="w-full text-text placeholder:text-muted-foreground text-sm">
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
    </FilterContainer>
  );
} 