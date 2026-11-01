"use client";

import { createRefs, useScrollToSection } from "@/lib/scrollTo";
import Departments from "./Departments";
import JobTitles from "./JobTitles";
import { FilterSubsection } from "../util/FilterSubsection";

interface RoleDepartmentOptionsProps {
  scrollToSection?: string;
  clearScrollToSection?: () => void;
  filterIds?: string[];
}

export default function RoleDepartmentOptions({ scrollToSection, clearScrollToSection, filterIds }: RoleDepartmentOptionsProps) {
  const refs = createRefs(["departments", "job-titles"]);

  useScrollToSection(scrollToSection, refs, clearScrollToSection);

  const shouldShow = (id: string) => !filterIds?.length || filterIds.includes(id);

  return (
    <div className="space-y-5">
      {shouldShow("departments") ? (
        <FilterSubsection title="Departments">
          <div className="scroll-mt-14" ref={refs.departments}>
            <Departments />
          </div>
        </FilterSubsection>
      ) : null}

      {shouldShow("job-titles") ? (
        <FilterSubsection
          title="Job Titles & Keywords"
          help="Setup a boolean search for job keywords. e.g. 'software engineer AND NOT (react OR angular)' searches for software engineers that don't have react or angular in their job title."
        >
          <div className="scroll-mt-14" ref={refs["job-titles"]}>
            <JobTitles />
          </div>
        </FilterSubsection>
      ) : null}
    </div>
  );
}
