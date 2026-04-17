"use client";

import { createRefs, useScrollToSection } from "@/lib/scrollTo";
import Education from "./Education";
import Languages from "./Languages";
import Licenses from "./Licenses";
import Security from "./Security";

interface QualificationsOptionsProps {
  scrollToSection?: string;
  clearScrollToSection?: () => void;
  filterIds?: string[];
}

export default function QualificationsOptions({ scrollToSection, clearScrollToSection, filterIds }: QualificationsOptionsProps) {
  const refs = createRefs(["education", "licenses", "security", "languages"]);

  useScrollToSection(scrollToSection, refs, clearScrollToSection);

  const shouldShow = (id: string) => !filterIds?.length || filterIds.includes(id);

  return (
    <div className="space-y-8">
      {shouldShow("education") ? (
        <div className="scroll-mt-14" ref={refs.education}>
          <Education />
        </div>
      ) : null}

      {shouldShow("licenses") ? (
        <div className="scroll-mt-14" ref={refs.licenses}>
          <Licenses />
        </div>
      ) : null}

      {shouldShow("security") ? (
        <div className="scroll-mt-14" ref={refs.security}>
          <Security />
        </div>
      ) : null}

      {shouldShow("languages") ? (
        <div className="scroll-mt-14" ref={refs.languages}>
          <Languages />
        </div>
      ) : null}

      <br className="md:hidden" />
      <br className="md:hidden" />
    </div>
  );
}
