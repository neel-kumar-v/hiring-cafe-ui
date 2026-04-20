"use client";

import { createRefs, useScrollToSection } from "@/lib/scrollTo";
import type { CategoryId } from "@/types/search";
import ApplyForm from "./ApplyForm";
import CurrentFilters from "./CurrentFilters";
import DateRange from "./DateRange";
import Encouraged from "./Encouraged";
import Exclusion from "./Exclusion";
import SavedSearches from "./SavedSearches";
import Sorting from "./Sorting";

interface GeneralOptionsProps {
  scrollToSection?: string;
  clearScrollToSection?: () => void;
  filterIds?: string[];
  handleCategoryClick: (categoryType: CategoryId) => void;
}

export default function GeneralOptions({ scrollToSection, clearScrollToSection, filterIds, handleCategoryClick }: GeneralOptionsProps) {
  const refs = createRefs(["filters", "saved", "date-range", "sorting", "apply-form", "exclusion", "encouraged"]);

  useScrollToSection(scrollToSection, refs, clearScrollToSection);

  const shouldShow = (id: string) => !filterIds?.length || filterIds.includes(id);

  return (
    <div className="space-y-4">
      {shouldShow("filters") ? (
        <div className="scroll-mt-14" ref={refs.filters}>
          <CurrentFilters handleCategoryClick={handleCategoryClick} />
        </div>
      ) : null}

      {shouldShow("saved") ? (
        <div className="scroll-mt-14" ref={refs.saved}>
          <SavedSearches />
        </div>
      ) : null}

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

      <br className="md:hidden" />
      <br className="md:hidden" />
      <br className="md:hidden" />
      <br className="md:hidden" />
    </div>
  );
}
