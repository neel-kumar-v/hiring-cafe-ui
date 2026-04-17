"use client";

import { createRefs, useScrollToSection } from "@/lib/scrollTo";
import Location from "./Location";
import WorkplaceActivity from "./WorkplaceActivity";

interface LocationOptionsProps {
  scrollToSection?: string;
  clearScrollToSection?: () => void;
  filterIds?: string[];
}

export default function LocationOptions({ scrollToSection, clearScrollToSection, filterIds }: LocationOptionsProps) {
  const refs = createRefs(["location", "workplace-activity"]);

  useScrollToSection(scrollToSection, refs, clearScrollToSection);

  const shouldShow = (id: string) => !filterIds?.length || filterIds.includes(id);

  return (
    <div className="space-y-8">
      {shouldShow("location") ? (
        <div className="scroll-mt-14" ref={refs.location}>
          <Location />
        </div>
      ) : null}

      {shouldShow("workplace-activity") ? (
        <div className="scroll-mt-14" ref={refs["workplace-activity"]}>
          <WorkplaceActivity />
        </div>
      ) : null}

      <br className="md:hidden" />
      <br className="md:hidden" />
    </div>
  );
}
