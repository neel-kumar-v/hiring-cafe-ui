import { getTimeSince } from "@/lib/job-info";
import { jobFadeClass } from "@/lib/jobs/fadeTransition";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";
import UniversalTooltip from "../../util/UniversalTooltip";

const ScrapeTime = ({
  postedAt,
  iconClassName = "w-3 h-3",
  textClassName = "text-xs",
  isTransitioning = false,
}: {
  postedAt: string;
  iconClassName?: string;
  textClassName?: string;
  isTransitioning?: boolean;
}) => {
  const { abbreviated, full } = getTimeSince(postedAt);
  return (
    <span className="col-span-1 justify-self-end">
      <UniversalTooltip content={`HiringCafe scraped this job ${full} ago`} side="bottom" >
        <div className="-translate-y-0.25 inline-flex cursor-default items-center gap-1 w-fit">
          <Clock
            className={`text-muted-foreground ${iconClassName}`}
          />
          <span className={cn("text-muted-foreground", textClassName, jobFadeClass(isTransitioning))}>{abbreviated}</span>
        </div>
      </UniversalTooltip>
    </span>
  );
};

export default ScrapeTime;
