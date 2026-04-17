import { formatCompanyName } from "@/lib/company-info";
import { getCleanJobTitle } from "@/lib/job-info";

const DialogJobTitle = ({
  jobTitle,
  companyName,
  workplaceCities,
  tools,
}: {
  jobTitle: string;
  companyName: string;
  workplaceCities: string[];
  tools: string[];
}) => {
  const locationForTitle = workplaceCities.length > 0 ? workplaceCities[0] : "";
  const cleanTitle = getCleanJobTitle(
    jobTitle,
    companyName,
    locationForTitle,
    tools
  );
  const className =
    "z-20 mb-4 flex flex-row flex-wrap items-center gap-2 border-neutral-200 py-4 font-bold text-3xl text-neutral-900 sm:border-b md:pt-6 dark:border-neutral-700 dark:text-white";

  return (
    <div className={className}>
      <span>
        {cleanTitle}&nbsp;<span>@ {formatCompanyName(companyName)}</span>
      </span>
    </div>
  );
};

export default DialogJobTitle;
