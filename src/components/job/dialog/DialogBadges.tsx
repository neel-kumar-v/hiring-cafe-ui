import { useMediaQuery } from "@/hooks/useMediaQuery";
import { getCompensation, getLocations } from "@/lib/job-info";
import { CompensationRange } from "@/types/job";
import { DollarSign, MapPin } from "lucide-react";

const DialogBadges = ({
  workplaceCities,
  workType,
  commitments,
  compensation,
  compact = false,
}: {
  workplaceCities: string[];
  workType: string;
  commitments: string[];
  compensation: CompensationRange;
  compact?: boolean;
}) => {
  const isDesktop = useMediaQuery("(min-width: 728px)");
  return (
    <div className={compact ? "" : "mb-6"}>
      <div className={`flex flex-wrap ${compact ? "gap-1.5" : "gap-3"}`}>
        {getLocations(workplaceCities).length > 0 ? (
          isDesktop ? (
            <div className={`flex flex-row flex-wrap items-center ${compact ? "gap-1" : "gap-2"}`}>
              {getLocations(workplaceCities).map((loc, index) => (
                <span
                  className={`flex items-center ${compact ? "gap-1" : "gap-2"} bg-secondary dark:bg-secondary rounded-lg ${compact ? "px-2 py-1 text-sm" : "px-3 py-2"} text-foreground/80 dark:text-foreground/80`}
                  key={index}
                >
                  <MapPin className={compact ? "w-3 h-3" : "size-4"} />
                  {loc}
                </span>
              ))}
            </div>
          ) : (
            getLocations(workplaceCities).map((loc, index) => (
              <span
                key={index}
                className={`flex items-center ${compact ? "gap-1" : "gap-2"} bg-secondary dark:bg-secondary rounded-lg ${compact ? "px-2 py-1 text-sm" : "px-3 py-2"} text-foreground/80 dark:text-foreground/80`}
              >
                <MapPin className={compact ? "w-3 h-3" : "size-4"} />
                {loc}
              </span>
            ))
          )
        ) : null}
        {isDesktop ? (
          <div className={`flex flex-row flex-wrap items-center ${compact ? "gap-1" : "gap-2"}`}>
            {commitments.map((commitment, index) => (
              <span
                key={index}
                className={`bg-secondary dark:bg-secondary rounded-lg ${compact ? "px-2 py-1 text-sm" : "px-3 py-2"} text-foreground/80 dark:text-foreground/80`}
              >
                {commitment}
              </span>
            ))}
          </div>
        ) : (
          commitments.map((commitment, index) => (
            <span
              key={index}
              className={`bg-secondary dark:bg-secondary rounded-lg ${compact ? "px-2 py-1 text-sm" : "px-3 py-2"} text-foreground/80 dark:text-foreground/80`}
            >
              {commitment}
            </span>
          ))
        )}
        {isDesktop ? (
          <div className={`bg-secondary dark:bg-secondary rounded-lg ${compact ? "px-2 py-1 text-sm" : "px-3 py-2"} text-foreground/80 dark:text-foreground/80`}>
            {workType}
          </div>
        ) : (
          <span className={`bg-secondary dark:bg-secondary rounded-lg ${compact ? "px-2 py-1 text-sm" : "px-3 py-2"} text-foreground/80 dark:text-foreground/80`}>
            {workType}
          </span>
        )}
        {getCompensation(compensation) ? (
          isDesktop ? (
            <span className={`flex items-center ${compact ? "gap-1" : "gap-2"} rounded-lg ${compact ? "px-2 py-1 text-sm" : "px-3 py-2"} bg-primary/20 text-foreground dark:text-foreground`}>
              <DollarSign className={compact ? "w-3 h-3" : "size-4"} />
              {getCompensation(compensation)}
            </span>
          ) : (
            <span className={`flex items-center ${compact ? "gap-1" : "gap-2"} rounded-lg ${compact ? "px-2 py-1 text-sm" : "px-3 py-2"} bg-primary/20 text-foreground dark:text-foreground`}>
              <DollarSign className={compact ? "w-3 h-3" : "size-4"} />
              {getCompensation(compensation)}
            </span>
          )
        ) : null}
      </div>
    </div>
  );
};

export default DialogBadges;
