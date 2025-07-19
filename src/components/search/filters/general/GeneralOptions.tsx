import { createRefs, useScrollToSection } from "@/lib/scrollTo";
import ApplyForm from "./ApplyForm";
import CurrentFilters from "./CurrentFilters";
import DateRange from "./DateRange";
import Encouraged from "./Encouraged";
import Exclusion from "./Exclusion";
import SavedSearches from "./SavedSearches";
import Sorting from "./Sorting";

interface GeneralOptionsProps {
  isDarkMode?: boolean;
  scrollToSection?: string;
}

export default function GeneralOptions({
  isDarkMode = false,
  scrollToSection,
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
    <div className="space-y-8">
      <div>
        <h3 className="font-semibold text-lg">General</h3>
        <p className="text-neutral-600 dark:text-neutral-400">
          Configure general search options and preferences.
        </p>
      </div>

      <div
        ref={refs.filters}
        className="space-y-4 p-4 border border-neutral-200 rounded-lg dark:border-neutral-700 transition-all duration-500 ease-in-out"
      >
        <CurrentFilters isDarkMode={isDarkMode} />
      </div>

      <div
        ref={refs.saved}
        className="space-y-4 p-4 border border-neutral-200 rounded-lg dark:border-neutral-700 transition-all duration-500 ease-in-out"
      >
        <SavedSearches isDarkMode={isDarkMode} />
      </div>

      <div
        ref={refs["date-range"]}
        className="space-y-4 p-4 border border-neutral-200 rounded-lg dark:border-neutral-700 transition-all duration-500 ease-in-out"
      >
        <DateRange isDarkMode={isDarkMode} />
      </div>

      <div
        ref={refs.sorting}
        className="space-y-4 p-4 border border-neutral-200 rounded-lg dark:border-neutral-700 transition-all duration-500 ease-in-out"
      >
        <Sorting isDarkMode={isDarkMode} />
      </div>

      <div
        ref={refs["apply-form"]}
        className="space-y-4 p-4 border border-neutral-200 rounded-lg dark:border-neutral-700 transition-all duration-500 ease-in-out"
      >
        <ApplyForm isDarkMode={isDarkMode} />
      </div>

      <div
        ref={refs.exclusion}
        className="space-y-4 p-4 border border-neutral-200 rounded-lg dark:border-neutral-700 transition-all duration-500 ease-in-out"
      >
        <Exclusion isDarkMode={isDarkMode} />
      </div>

      <div
        ref={refs.encouraged}
        className="space-y-4 p-4 border border-neutral-200 rounded-lg dark:border-neutral-700 transition-all duration-500 ease-in-out"
      >
        <Encouraged isDarkMode={isDarkMode} />
      </div>
    </div>
  );
} 