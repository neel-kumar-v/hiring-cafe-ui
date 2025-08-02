"use client";

import { createRefs, useScrollToSection } from "@/lib/scrollTo";
import Departments from "./Departments";
import JobTitles from "./JobTitles";

export default function RoleDepartmentOptions({
  scrollToSection,
}: {
  scrollToSection?: string;
}) {
  const refs = createRefs([
    "departments",
    "job-titles"
  ]);

  useScrollToSection(scrollToSection, refs);

  return (
    <div className="space-y-8">

      <div
        ref={refs.departments}
        className="space-y-4 p-4 border border-neutral-200 rounded-lg dark:border-neutral-700 transition-all duration-500 ease-in-out"
      >
        <Departments />
      </div>

      <div
        ref={refs["job-titles"]}
        className="space-y-4 p-4 border border-neutral-200 rounded-lg dark:border-neutral-700 transition-all duration-500 ease-in-out"
      >
        <JobTitles />
      </div>
      <br className="md:hidden" />
      <br className="md:hidden" />
    </div>
  );
} 