import { createRefs, useScrollToSection } from "@/lib/scrollTo";
import Education from "./Education";
import Languages from "./Languages";
import Licenses from "./Licenses";
import Security from "./Security";

interface QualificationsOptionsProps {
  scrollToSection?: string;
}

export default function QualificationsOptions({
  scrollToSection,
}: QualificationsOptionsProps) {
  const refs = createRefs([
    "education",
    "licenses",
    "security",
    "languages"
  ]);

  useScrollToSection(scrollToSection, refs);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-semibold text-lg">Qualifications</h3>
        <p className="text-neutral-600 dark:text-neutral-400">
          Filter jobs by education, certifications, security clearance, and language requirements.
        </p>
      </div>

      <div
        ref={refs.education}
        className="space-y-4 p-4 border border-neutral-200 rounded-lg dark:border-neutral-700 transition-all duration-500 ease-in-out"
      >
        <Education />
      </div>

      <div
        ref={refs.licenses}
        className="space-y-4 p-4 border border-neutral-200 rounded-lg dark:border-neutral-700 transition-all duration-500 ease-in-out"
      >
        <Licenses />
      </div>

      <div
        ref={refs.security}
        className="space-y-4 p-4 border border-neutral-200 rounded-lg dark:border-neutral-700 transition-all duration-500 ease-in-out"
      >
        <Security />
      </div>

      <div
        ref={refs.languages}
        className="space-y-4 p-4 border border-neutral-200 rounded-lg dark:border-neutral-700 transition-all duration-500 ease-in-out"
      >
        <Languages />
      </div>
      <br className="md:hidden" />
      <br className="md:hidden" />
    </div>
  );
} 