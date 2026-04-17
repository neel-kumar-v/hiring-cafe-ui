"use client";

import { createRefs, useScrollToSection } from "@/lib/scrollTo";
import Company from "./Company";
import Founding from "./Founding";
import Industry from "./Industry";
import Size from "./Size";
import Stage from "./Stage";

interface CompanyOptionsProps {
  scrollToSection?: string;
  clearScrollToSection?: () => void;
  filterIds?: string[];
}

export default function CompanyOptions({ scrollToSection, clearScrollToSection, filterIds }: CompanyOptionsProps) {
  const refs = createRefs(["company", "industry", "stage", "size", "founding"]);

  useScrollToSection(scrollToSection, refs, clearScrollToSection);

  const shouldShow = (id: string) => !filterIds?.length || filterIds.includes(id);

  return (
    <div className="space-y-8">
      {shouldShow("company") ? (
        <div className="scroll-mt-14" ref={refs.company}>
          <Company />
        </div>
      ) : null}

      {shouldShow("industry") ? (
        <div className="scroll-mt-14" ref={refs.industry}>
          <Industry />
        </div>
      ) : null}

      {shouldShow("stage") ? (
        <div className="scroll-mt-14" ref={refs.stage}>
          <Stage />
        </div>
      ) : null}

      {shouldShow("size") ? (
        <div className="scroll-mt-14" ref={refs.size}>
          <Size />
        </div>
      ) : null}

      {shouldShow("founding") ? (
        <div className="scroll-mt-14" ref={refs.founding}>
          <Founding />
        </div>
      ) : null}

      <br className="md:hidden" />
      <br className="md:hidden" />
    </div>
  );
}
