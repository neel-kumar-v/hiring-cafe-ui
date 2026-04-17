"use client";

import { createRefs, useScrollToSection } from "@/lib/scrollTo";
import Shifts from "./Shifts";
import Travel from "./Travel";

interface AvailabilityOptionsProps {
  scrollToSection?: string;
  clearScrollToSection?: () => void;
  filterIds?: string[];
}

export default function AvailabilityOptions({ scrollToSection, clearScrollToSection, filterIds }: AvailabilityOptionsProps) {
  const refs = createRefs(["shifts", "travel"]);

  useScrollToSection(scrollToSection, refs, clearScrollToSection);

  const shouldShow = (id: string) => !filterIds?.length || filterIds.includes(id);

  return (
    <div className="space-y-8">
      {shouldShow("shifts") ? (
        <div className="scroll-mt-14" ref={refs.shifts}>
          <Shifts />
        </div>
      ) : null}

      {shouldShow("travel") ? (
        <div className="scroll-mt-14" ref={refs.travel}>
          <Travel />
        </div>
      ) : null}

      <br className="md:hidden" />
      <br className="md:hidden" />
    </div>
  );
}
