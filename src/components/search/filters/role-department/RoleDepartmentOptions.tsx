"use client";

import { createRefs, useScrollToSection } from "@/lib/scrollTo";
import Departments from "./Departments";
import JobTitles from "./JobTitles";

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
    <div className="space-y-8">
      {shouldShow("departments") ? (
        <div className="scroll-mt-14" ref={refs.departments}>
          <Departments />
        </div>
      ) : null}

      {shouldShow("job-titles") ? (
        <div className="scroll-mt-14" ref={refs["job-titles"]}>
          <JobTitles />
        </div>
      ) : null}

      <br className="md:hidden" />
      <br className="md:hidden" />
    </div>
  );
}
