import { createRefs, useScrollToSection } from "@/lib/scrollTo";
import Shifts from "./Shifts";
import Travel from "./Travel";

interface AvailabilityOptionsProps {
  isDarkMode?: boolean;
  scrollToSection?: string;
}

export default function AvailabilityOptions({
  isDarkMode = false,
  scrollToSection,
}: AvailabilityOptionsProps) {
  const refs = createRefs([
    "shifts",
    "travel"
  ]);

  useScrollToSection(scrollToSection, refs);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-semibold text-lg">Availability</h3>
        <p className="text-neutral-600 dark:text-neutral-400">
          Filter jobs by work schedules and travel requirements.
        </p>
      </div>

      <div
        ref={refs.shifts}
        className="space-y-4 p-4 border border-neutral-200 rounded-lg dark:border-neutral-700 transition-all duration-500 ease-in-out"
      >
        <Shifts isDarkMode={isDarkMode} />
      </div>

      <div
        ref={refs.travel}
        className="space-y-4 p-4 border border-neutral-200 rounded-lg dark:border-neutral-700 transition-all duration-500 ease-in-out"
      >
        <Travel isDarkMode={isDarkMode} />
      </div>
    </div>
  );
} 