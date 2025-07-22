import { createRefs, useScrollToSection } from "@/lib/scrollTo";
import Location from "./Location";
import Options from "./Options";
import WorkplaceType from "./WorkplaceType";
  
export default function LocationOptions({
  scrollToSection,
}: {
  scrollToSection?: string;
}) {
  const refs = createRefs([
    "location",
    "workplace-type",
    "options"
  ]);

  useScrollToSection(scrollToSection, refs);

  return (
    <div className="space-y-8">


      <div
        ref={refs.location}
        className="space-y-4 p-4 border border-neutral-200 rounded-lg dark:border-neutral-700 transition-all duration-500 ease-in-out"
      >
        <Location />
      </div>

      <div
        ref={refs["workplace-type"]}
        className="space-y-4 p-4 border border-neutral-200 rounded-lg dark:border-neutral-700 transition-all duration-500 ease-in-out"
      >
        <WorkplaceType />
      </div>

      <div
        ref={refs.options}
        className="space-y-4 p-4 border border-neutral-200 rounded-lg dark:border-neutral-700 transition-all duration-500 ease-in-out"
      >
        <Options />
      </div>
    </div>
  );
} 