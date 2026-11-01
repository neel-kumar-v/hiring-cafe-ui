"use client";

import { generalSectionIds, generalStreamIds } from "@/data/search-filters";
import { createRefs, useScrollToSection } from "@/lib/scrollTo";
import ApplyForm from "./ApplyForm";
import ActivityOutcomes from "./ActivityOutcomes";
import DateRange from "./DateRange";
import Encouraged from "./Encouraged";
import Exclusion from "./Exclusion";
import Sorting from "./Sorting";

interface GeneralOptionsProps {
  scrollToSection?: string;
  clearScrollToSection?: () => void;
  filterIds?: string[];
}

export default function GeneralOptions({ scrollToSection, clearScrollToSection, filterIds }: GeneralOptionsProps) {
  const refs = createRefs(["date-range", "sorting", "apply-form", "exclusion", "activity-outcomes", "encouraged"]);

  useScrollToSection(scrollToSection, refs, clearScrollToSection);

  const shouldShow = (id: string) => !filterIds?.length || filterIds.includes(id);
  const showStream = [...generalStreamIds].some((id) => shouldShow(id));
  const showSections = [...generalSectionIds].some((id) => shouldShow(id));

  if (!showStream && !showSections) return null;

  return (
    <div className="space-y-4">
      {showStream ? (
        // Same `space-y-4` row rhythm as every other category body (Compensation, Company, …).
        <div className="space-y-4">
          {shouldShow("date-range") ? (
            <div className="scroll-mt-14" ref={refs["date-range"]}>
              <DateRange />
            </div>
          ) : null}

          {shouldShow("sorting") ? (
            <div className="scroll-mt-14" ref={refs.sorting}>
              <Sorting />
            </div>
          ) : null}

          {shouldShow("apply-form") ? (
            <div className="scroll-mt-14" ref={refs["apply-form"]}>
              <ApplyForm />
            </div>
          ) : null}

          {shouldShow("exclusion") ? (
            <div className="scroll-mt-14" ref={refs.exclusion}>
              <Exclusion />
            </div>
          ) : null}

          {shouldShow("encouraged") ? (
            <div className="scroll-mt-14" ref={refs.encouraged}>
              <Encouraged />
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Multi-control subsections keep their own chrome + a sidebar nav row under General. */}
      {showSections && shouldShow("activity-outcomes") ? (
        <div className="scroll-mt-14" ref={refs["activity-outcomes"]}>
          <ActivityOutcomes />
        </div>
      ) : null}
    </div>
  );
}
