import { formatCompanyName } from "@/lib/company-info";
import { getCleanJobTitle } from "@/lib/job-info";
import { jobFadeClass } from "@/lib/jobs/fadeTransition";

const DialogJobTitle = ({
  jobTitle,
  companyName,
  workplaceCities,
  tools,
  isTransitioning = false,
  fadeCompanyChrome = false,
}: {
  jobTitle: string;
  companyName: string;
  workplaceCities: string[];
  tools: string[];
  isTransitioning?: boolean;
  /** When true with `isTransitioning`, fades the @ company line (same-collection job hops keep this false). */
  fadeCompanyChrome?: boolean;
}) => {
  const locationForTitle = workplaceCities.length > 0 ? workplaceCities[0] : "";
  const cleanTitle = getCleanJobTitle(
    jobTitle,
    companyName,
    locationForTitle,
    tools
  );
  const className =
    "z-20 mb-4 flex flex-row flex-wrap items-center gap-2 border-border py-4 font-bold text-3xl text-foreground sm:border-b md:pt-6 dark:border-border dark:text-foreground";

  const fadeCompanyLine = isTransitioning && fadeCompanyChrome;

  return (
    <div className={className}>
      <span>
        <span className={jobFadeClass(isTransitioning)}>{cleanTitle}</span>
        &nbsp;<span className={jobFadeClass(fadeCompanyLine)}>@ {formatCompanyName(companyName)}</span>
      </span>
    </div>
  );
};

export default DialogJobTitle;
