import { createRefs, useScrollToSection } from "@/lib/scrollTo";
import Company from "./Company";
import Founding from "./Founding";
import Industry from "./Industry";
import Size from "./Size";
import Stage from "./Stage";

interface CompanyOptionsProps {
  isDarkMode?: boolean;
  scrollToSection?: string;
}

export default function CompanyOptions({
  isDarkMode = false,
  scrollToSection,
}: CompanyOptionsProps) {
  const refs = createRefs([
    "company",
    "industry",
    "stage",
    "size",
    "founding"
  ]);

  useScrollToSection(scrollToSection, refs);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-semibold text-lg">Company</h3>
        <p className="text-neutral-600 dark:text-neutral-400">
          Filter jobs by company characteristics and information.
        </p>
      </div>

      <div
        ref={refs.company}
        className="space-y-4 p-4 border border-neutral-200 rounded-lg dark:border-neutral-700 transition-all duration-500 ease-in-out"
      >
        <Company isDarkMode={isDarkMode} />
      </div>

      <div
        ref={refs.industry}
        className="space-y-4 p-4 border border-neutral-200 rounded-lg dark:border-neutral-700 transition-all duration-500 ease-in-out"
      >
        <Industry isDarkMode={isDarkMode} />
      </div>

      <div
        ref={refs.stage}
        className="space-y-4 p-4 border border-neutral-200 rounded-lg dark:border-neutral-700 transition-all duration-500 ease-in-out"
      >
        <Stage isDarkMode={isDarkMode} />
      </div>

      <div
        ref={refs.size}
        className="space-y-4 p-4 border border-neutral-200 rounded-lg dark:border-neutral-700 transition-all duration-500 ease-in-out"
      >
        <Size isDarkMode={isDarkMode} />
      </div>

      <div
        ref={refs.founding}
        className="space-y-4 p-4 border border-neutral-200 rounded-lg dark:border-neutral-700 transition-all duration-500 ease-in-out"
      >
        <Founding isDarkMode={isDarkMode} />
      </div>
    </div>
  );
} 