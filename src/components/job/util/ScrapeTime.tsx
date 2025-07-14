import { getTimeSince } from "@/lib/job-info";
import { Clock } from "lucide-react";
import UniversalTooltip from "../../util/UniversalTooltip";

const ScrapeTime = ({
  postedAt,
  iconClassName = "w-3 h-3",
  textClassName = "text-xs",
}: {
  postedAt: string;
  iconClassName?: string;
  textClassName?: string;
}) => {
  const { abbreviated, full } = getTimeSince(postedAt);
  return (
    <UniversalTooltip content={`HiringCafe scraped this job ${full} ago`}>
      <span className="-translate-y-0.25 inline-flex cursor-default items-center gap-1">
        <Clock
          className={`text-neutral-400 dark:text-neutral-500 ${iconClassName}`}
        />
        <span
          className={` text-neutral-500 dark:text-neutral-400 ${textClassName}`}
        >
          {abbreviated}
        </span>
      </span>
    </UniversalTooltip>
  );
};

export default ScrapeTime;
