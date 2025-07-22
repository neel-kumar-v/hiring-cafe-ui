import { createRefs, useScrollToSection } from "@/lib/scrollTo";
import Company from "./Company";
import Founding from "./Founding";
import Industry from "./Industry";
import Size from "./Size";
import Stage from "./Stage";

interface CompanyOptionsProps {
  scrollToSection?: string;
}

export default function CompanyOptions({
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


      <div
        ref={refs.company}
        className="space-y-4 p-4 border border-neutral-200 rounded-lg dark:border-neutral-700 transition-all duration-500 ease-in-out"
      >
        <Company />
      </div>

      <div
        ref={refs.industry}
        className="space-y-4 p-4 border border-neutral-200 rounded-lg dark:border-neutral-700 transition-all duration-500 ease-in-out"
      >
        <Industry />
      </div>

      <div
        ref={refs.stage}
        className="space-y-4 p-4 border border-neutral-200 rounded-lg dark:border-neutral-700 transition-all duration-500 ease-in-out"
      >
        <Stage />
      </div>

      <div
        ref={refs.size}
        className="space-y-4 p-4 border border-neutral-200 rounded-lg dark:border-neutral-700 transition-all duration-500 ease-in-out"
      >
        <Size />
      </div>

      <div
        ref={refs.founding}
        className="space-y-4 p-4 border border-neutral-200 rounded-lg dark:border-neutral-700 transition-all duration-500 ease-in-out"
      >
        <Founding />
      </div>
    </div>
  );
} 