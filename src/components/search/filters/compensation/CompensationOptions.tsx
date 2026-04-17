"use client";

import { createRefs, useScrollToSection } from "@/lib/scrollTo";
import Benefits from "./Benefits";
import Commitment from "./Commitment";
import Experience from "./Experience";
import Salary from "./Salary";

interface CompensationOptionsProps {
  scrollToSection?: string;
  clearScrollToSection?: () => void;
  filterIds?: string[];
}

export default function CompensationOptions({ scrollToSection, clearScrollToSection, filterIds }: CompensationOptionsProps) {
  const refs = createRefs(["salary", "commitment", "experience", "benefits"]);

  useScrollToSection(scrollToSection, refs, clearScrollToSection);

  const shouldShow = (id: string) => !filterIds?.length || filterIds.includes(id);

  return (
    <div className="space-y-8">
      {shouldShow("salary") ? (
        <div className="scroll-mt-14" ref={refs.salary}>
          <Salary />
        </div>
      ) : null}

      {shouldShow("commitment") ? (
        <div className="scroll-mt-14" ref={refs.commitment}>
          <Commitment />
        </div>
      ) : null}

      {shouldShow("experience") ? (
        <div className="scroll-mt-14" ref={refs.experience}>
          <Experience />
        </div>
      ) : null}

      {shouldShow("benefits") ? (
        <div className="scroll-mt-14" ref={refs.benefits}>
          <Benefits />
        </div>
      ) : null}

      <br className="md:hidden" />
      <br className="md:hidden" />
    </div>
  );
}
