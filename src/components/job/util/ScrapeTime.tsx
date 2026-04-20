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
    <span className="col-span-1 justify-self-end">
      <UniversalTooltip content={`HiringCafe scraped this job ${full} ago`} side="bottom" >
        <div className="-translate-y-0.25 inline-flex cursor-default items-center gap-1 w-fit">
          <Clock
            className={`text-muted-foreground dark:text-muted-foreground ${iconClassName}`}
          />
          <span
            className={` text-muted-foreground dark:text-muted-foreground ${textClassName}`}
          >
            {abbreviated}
          </span>
        </div>
      </UniversalTooltip>
    </span>
  );
};

export default ScrapeTime;
