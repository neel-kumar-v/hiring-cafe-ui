import { createRefs, useScrollToSection } from "@/lib/scrollTo";
import Location from "./Location";
import WorkplaceActivity from "./WorkplaceActivity";
// import WorkplaceType from "./WorkplaceTyp e";
  
export default function LocationOptions({
  scrollToSection,
}: {
  scrollToSection?: string;
}) {
  const refs = createRefs([
    "location",
    "workplace-activity",
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

      {/* <div
        ref={refs["workplace-type"]}
        className="space-y-4 p-4 border border-neutral-200 rounded-lg dark:border-neutral-700 transition-all duration-500 ease-in-out"
      >
        <WorkplaceType />
      </div> */}

      <div
        ref={refs["workplace-activity"]}
        className="space-y-4 p-4 border border-neutral-200 rounded-lg dark:border-neutral-700 transition-all duration-500 ease-in-out"
      >
        <WorkplaceActivity />
      </div>
      <br className="md:hidden" />
      <br className="md:hidden" />
    </div>
  );
} 