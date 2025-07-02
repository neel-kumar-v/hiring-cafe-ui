import { getTimeSince } from "@/lib/utils";
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
  const abbrevTime = getTimeSince(postedAt)
    .replace("y", " years")
    .replace("mo", " months")
    .replace("d", " days")
    .replace("h", " hours")
    .replace("m", " minutes");
  return (
    <UniversalTooltip content={`HiringCafe scraped this job ${abbrevTime} ago`}>
      <span className="inline-flex items-center gap-1 cursor-default">
        <Clock
          className={`text-gray-400 dark:text-gray-500 ${iconClassName}`}
        />
        <span
          className={`text-gray-500 dark:text-gray-400 -translate-y-0.25 ${textClassName}`}
        >
          {getTimeSince(postedAt)}
        </span>
      </span>
    </UniversalTooltip>
  );
};

export default ScrapeTime;
