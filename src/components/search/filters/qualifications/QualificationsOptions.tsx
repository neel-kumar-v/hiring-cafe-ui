"use client";

import { createRefs, useScrollToSection } from "@/lib/scrollTo";
import Encouraged from "./Encouraged";
import Education from "./Education";
import Languages from "./Languages";
import Licenses from "./Licenses";
import Security from "./Security";
import { FilterSubsection } from "../util/FilterSubsection";

interface QualificationsOptionsProps {
  scrollToSection?: string;
  clearScrollToSection?: () => void;
  filterIds?: string[];
}

export default function QualificationsOptions({ scrollToSection, clearScrollToSection, filterIds }: QualificationsOptionsProps) {
  const refs = createRefs(["education", "licenses", "security", "languages", "encouraged"]);

  useScrollToSection(scrollToSection, refs, clearScrollToSection);

  const shouldShow = (id: string) => !filterIds?.length || filterIds.includes(id);

  return (
    <div className="space-y-5">
      {/*
        Sentence rows stream straight under the Requirements header — each carries its own copy in
        the FilterContainer (chrome="stream"), so no per-filter subheading. Only Education keeps one.
      */}
      <div className="space-y-3">
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

        {shouldShow("encouraged") ? (
          <div className="scroll-mt-14" ref={refs.encouraged}>
            <Encouraged />
          </div>
        ) : null}
      </div>

      {shouldShow("education") ? (
        <FilterSubsection title="Education">
          <div className="scroll-mt-14" ref={refs.education}>
            <Education />
          </div>
        </FilterSubsection>
      ) : null}
    </div>
  );
}
