import { createRefs, useScrollToSection } from "@/lib/scrollTo";
import ApplyForm from "./ApplyForm";
import CurrentFilters from "./CurrentFilters";
import DateRange from "./DateRange";
import Encouraged from "./Encouraged";
import Exclusion from "./Exclusion";
import SavedSearches from "./SavedSearches";
import Sorting from "./Sorting";
import { CategoryId } from "@/types/search";

interface GeneralOptionsProps {
  isDarkMode?: boolean;
  scrollToSection?: string;
  handleCategoryClick: (categoryType: CategoryId) => void;
}

export default function GeneralOptions({
  isDarkMode = false,
  scrollToSection,
  handleCategoryClick,
}: GeneralOptionsProps) {
  const refs = createRefs([
    "filters",
    "saved", 
    "date-range",
    "sorting",
    "apply-form",
    "exclusion",
    "encouraged"
  ]);

  useScrollToSection(scrollToSection, refs);

  return (
    <div className="space-y-2">
      <div
        ref={refs.filters}
        className="space-y-4 p-4 border border-border/20 rounded-lg transition-all duration-500 ease-in-out"
      >
        <CurrentFilters isDarkMode={isDarkMode} handleCategoryClick={handleCategoryClick} />
      </div>

      <div
        ref={refs.saved}
        className="space-y-4 p-4 border border-border/20 rounded-lg transition-all duration-500 ease-in-out"
      >
        <SavedSearches isDarkMode={isDarkMode} />
      </div>

      <div
        ref={refs["date-range"]}
        className="space-y-4 p-4 border border-border/20 rounded-lg transition-all duration-500 ease-in-out"
      >
        <DateRange isDarkMode={isDarkMode} />
      </div>

      <div
        ref={refs.sorting}
        className="space-y-4 p-4 border border-border/20 rounded-lg transition-all duration-500 ease-in-out"
      >
        <Sorting isDarkMode={isDarkMode} />
      </div>

      <div
        ref={refs["apply-form"]}
        className="space-y-4 p-4 border border-border/20 rounded-lg transition-all duration-500 ease-in-out"
      >
        <ApplyForm isDarkMode={isDarkMode} />
      </div>

      <div
        ref={refs.exclusion}
        className="space-y-4 p-4 border border-border/20 rounded-lg transition-all duration-500 ease-in-out"
      >
        <Exclusion isDarkMode={isDarkMode} />
      </div>

      <div
        ref={refs.encouraged}
        className="space-y-4 p-4 border border-border/20 rounded-lg transition-all duration-500 ease-in-out"
      >
        <Encouraged isDarkMode={isDarkMode} />
      </div>
      <br />
      <br />
    </div>
  );
} 