"use client";

import { createRefs, useScrollToSection } from "@/lib/scrollTo";
import Shifts from "./Shifts";
import Travel from "./Travel";
import { FilterSubsection } from "../util/FilterSubsection";

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
    <div className="space-y-5">
      {shouldShow("shifts") ? (
        <FilterSubsection title="Shifts & Schedules">
          <div className="scroll-mt-14" ref={refs.shifts}>
            <Shifts />
          </div>
        </FilterSubsection>
      ) : null}

      {shouldShow("travel") ? (
        <FilterSubsection title="Travel Requirement">
          <div className="scroll-mt-14" ref={refs.travel}>
            <Travel />
          </div>
        </FilterSubsection>
      ) : null}
    </div>
  );
}
