import { createRefs, useScrollToSection } from "@/lib/scrollTo";
import Benefits from "./Benefits";
import Commitment from "./Commitment";
import Experience from "./Experience";
import Salary from "./Salary";

interface CompensationOptionsProps {
  scrollToSection?: string;
}

export default function CompensationOptions({
  scrollToSection,
}: CompensationOptionsProps) {
  const refs = createRefs([
    "salary",
    "commitment", 
    "experience",
    "benefits"
  ]);

  useScrollToSection(scrollToSection, refs);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-semibold text-lg">Compensation & Levels</h3>
        <p className="text-neutral-600 dark:text-neutral-400">
          Configure your compensation preferences and requirements.
        </p>
      </div>

      <div
        ref={refs.salary}
        className="space-y-4 p-4 border border-neutral-200 rounded-lg dark:border-neutral-700 transition-all duration-500 ease-in-out"
      >
        <Salary />
      </div>

      <div
        ref={refs.commitment}
        className="space-y-4 p-4 border border-neutral-200 rounded-lg dark:border-neutral-700 transition-all duration-500 ease-in-out"
      >
        <Commitment />
      </div>

      <div
        ref={refs.experience}
        className="space-y-4 p-4 border border-neutral-200 rounded-lg dark:border-neutral-700 transition-all duration-500 ease-in-out"
      >
        <Experience />
      </div>

      <div
        ref={refs.benefits}
        className="space-y-4 p-4 border border-neutral-200 rounded-lg dark:border-neutral-700 transition-all duration-500 ease-in-out"
      >
        <Benefits />
      </div>
    </div>
  );
} 