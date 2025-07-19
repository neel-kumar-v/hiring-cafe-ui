import { createRefs, useScrollToSection } from "@/lib/scrollTo";
import Location from "./Location";
import Options from "./Options";
import WorkplaceType from "./WorkplaceType";

interface LocationOptionsProps {
  isDarkMode?: boolean;
  scrollToSection?: string;
}

export default function LocationOptions({
  isDarkMode = false,
  scrollToSection,
}: LocationOptionsProps) {
  const refs = createRefs([
    "location",
    "workplace-type",
    "options"
  ]);

  useScrollToSection(scrollToSection, refs);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-semibold text-lg">Location</h3>
        <p className="text-neutral-600 dark:text-neutral-400">
          Filter jobs by location and work arrangement preferences.
        </p>
      </div>

      <div
        ref={refs.location}
        className="space-y-4 p-4 border border-neutral-200 rounded-lg dark:border-neutral-700 transition-all duration-500 ease-in-out"
      >
        <Location isDarkMode={isDarkMode} />
      </div>

      <div
        ref={refs["workplace-type"]}
        className="space-y-4 p-4 border border-neutral-200 rounded-lg dark:border-neutral-700 transition-all duration-500 ease-in-out"
      >
        <WorkplaceType isDarkMode={isDarkMode} />
      </div>

      <div
        ref={refs.options}
        className="space-y-4 p-4 border border-neutral-200 rounded-lg dark:border-neutral-700 transition-all duration-500 ease-in-out"
      >
        <Options isDarkMode={isDarkMode} />
      </div>
    </div>
  );
} 