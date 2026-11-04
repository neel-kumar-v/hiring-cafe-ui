"use client";

import { generalSectionIds, generalStreamIds } from "@/data/search-filters";
import { createRefs, useScrollToSection } from "@/lib/scrollTo";
import ApplyForm from "./ApplyForm";
import ActivityOutcomes from "./ActivityOutcomes";
import DateRange from "./DateRange";
import Exclusion from "./Exclusion";
import Sorting from "./Sorting";
import { FilterSubsection } from "../util/FilterSubsection";

interface GeneralOptionsProps {
  scrollToSection?: string;
  clearScrollToSection?: () => void;
  filterIds?: string[];
}

export default function GeneralOptions({ scrollToSection, clearScrollToSection, filterIds }: GeneralOptionsProps) {
  const refs = createRefs(["date-range", "sorting", "apply-form", "exclusion", "activity-outcomes"]);

  useScrollToSection(scrollToSection, refs, clearScrollToSection);

  const shouldShow = (id: string) => !filterIds?.length || filterIds.includes(id);
  const showStream = [...generalStreamIds].some((id) => shouldShow(id));
  const showSections = [...generalSectionIds].some((id) => shouldShow(id));

  if (!showStream && !showSections) return null;

  return (
    <div className="space-y-5">
      {showStream ? (
        <div className="space-y-3">
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
        </div>
      ) : null}

      {showSections && shouldShow("activity-outcomes") ? (
        <FilterSubsection title="Activity & Outcomes">
          <div className="scroll-mt-14" ref={refs["activity-outcomes"]}>
            <ActivityOutcomes />
          </div>
        </FilterSubsection>
      ) : null}
    </div>
  );
}
