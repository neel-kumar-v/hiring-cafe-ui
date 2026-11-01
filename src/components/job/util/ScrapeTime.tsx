import { getJobTimeDisplay, JobTimeDisplay } from "@/lib/job-info";
import { jobFadeClass } from "@/lib/jobs/fadeTransition";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";
import UniversalTooltip from "../../util/UniversalTooltip";

/**
 * The tooltip has to describe what the timestamp actually is: an (estimated) publish
 * date of the job, or the moment HiringCafe scraped the job when no publish date exists.
 */
const describeTime = ({ full, source, isPublishEstimateUnreliable }: JobTimeDisplay): string => {
  if (source === "publish") {
    if (isPublishEstimateUnreliable) return "Publish date is in the future — shown as new";
    return full === "just now" || full === "less than a minute" ? "Posted just now" : `Posted ${full} ago`;
  }
  return full === "just now" || full === "less than a minute" ? "HiringCafe scraped this job just now" : `HiringCafe scraped this job ${full} ago`;
};

const ScrapeTime = ({
  postedAt,
  postedAtMillis,
  createdAt,
  iconClassName = "w-3 h-3",
  textClassName = "text-xs",
  className,
  isTransitioning = false,
}: {
  postedAt: string;
  postedAtMillis?: number | null;
  createdAt?: number | null;
  iconClassName?: string;
  textClassName?: string;
  className?: string;
  isTransitioning?: boolean;
}) => {
  const time = getJobTimeDisplay(postedAt, postedAtMillis, createdAt);
  // Nothing worth showing (no usable timestamp, or a scrape time of a few seconds ago).
  if (!time.abbreviated) return null;

  return (
    <span className={cn("inline-flex items-center", className)}>
      <UniversalTooltip content={describeTime(time)} side="bottom">
        <div className="inline-flex cursor-default items-center gap-1 leading-none w-fit">
          <Clock className={cn("shrink-0 text-muted-foreground", iconClassName)} />
          <span className={cn("text-muted-foreground leading-none", textClassName, jobFadeClass(isTransitioning))}>{time.abbreviated}</span>
        </div>
      </UniversalTooltip>
    </span>
  );
};

export default ScrapeTime;
