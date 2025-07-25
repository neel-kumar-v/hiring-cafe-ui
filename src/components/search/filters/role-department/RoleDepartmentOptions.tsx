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
      <div>
        <h3 className="font-semibold text-lg">Role & Department</h3>
        <p className="text-neutral-600 dark:text-neutral-400">
          Filter jobs by department and specific job titles or keywords.
        </p>
      </div>

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