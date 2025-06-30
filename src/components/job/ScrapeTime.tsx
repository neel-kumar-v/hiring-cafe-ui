import { getTimeSince } from "@/lib/utils";
import { Clock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const ScrapeTime = ({ postedAt, iconClassName = "w-3 h-3", textClassName = "text-xs" }: { postedAt: string, iconClassName?: string, textClassName?: string }) => {
  const abbrevTime = getTimeSince(postedAt).replace("y", " years").replace("mo", " months").replace("d", " days").replace("h", " hours").replace("m", " minutes");
  return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center gap-1 cursor-default">
              <Clock className={`text-gray-400 dark:text-gray-500 ${iconClassName}`} />
              <span className={`text-gray-500 dark:text-gray-400 ${textClassName}`}>
                {getTimeSince(postedAt)}
              </span>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            HiringCafe scraped this job {abbrevTime} ago
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
  );
};

export default ScrapeTime;