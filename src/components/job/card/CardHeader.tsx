import { useMediaQuery } from "@/hooks/useMediaQuery";
import { getCleanJobTitle, getCompensation, getLocations } from "@/lib/job-info";
import { CompensationRange } from "@/types/job";
import { DollarSign, MapPin } from "lucide-react";
import { useMemo } from "react";
import CardSkillMatch from "./CardSkillMatch";

const chipClass = "bg-secondary text-foreground/80 rounded-md px-2 py-0.5 text-xs";

const CardHeader = ({
  jobTitle,
  companyName,
  workplaceCities,
  commitments,
  workType,
  compensation,
  tools,
}: {
  jobTitle: string;
  companyName: string;
  workplaceCities: string[];
  commitments: string[];
  workType: string;
  compensation: CompensationRange;
  tools: string[];
}) => {
  const isDesktop = useMediaQuery("(min-width: 728px)");
  const locationForTitle = workplaceCities.length > 0 ? workplaceCities[0] : "";

  const skillMatchComponent = useMemo(() => {
    return <CardSkillMatch technicalTools={tools} />;
  }, [tools]);

  const locations = getLocations(workplaceCities);
  const salaryLabel = getCompensation(compensation);
  const workTypeTrimmed = workType.trim();

  return (
    <div className="mb-3 space-y-2">
      <div className="flex flex-row items-start justify-between gap-2">
        {isDesktop ? (
          <>
            <div className="line-clamp-2 flex-1 text-lg font-semibold text-foreground">{getCleanJobTitle(jobTitle, companyName, locationForTitle, tools)}</div>
            {/* <div className="-translate-y-0.5 flex shrink-0 items-center space-x-1">
              {skillMatchComponent}
            </div> */}
          </>
        ) : (
          <>
            <div className="line-clamp-2 text-lg font-semibold text-foreground">{getCleanJobTitle(jobTitle, companyName, locationForTitle, tools)}</div>
            <div className="-translate-y-0.5 flex shrink-0 items-center space-x-1">{skillMatchComponent}</div>
          </>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="text-muted-foreground flex flex-wrap items-center gap-1 text-xs">
          {locations.length > 0 &&
            (isDesktop ? (
              <div className="pointer-fine:max-h-6 pointer-fine:group-hover:max-h-36 pointer-fine:motion-reduce:max-h-full flex max-h-full flex-row flex-wrap items-center gap-1 overflow-hidden transition-all duration-700 ease-out">
                {locations.map((loc, index) => (
                  <span key={index} className={`flex items-center gap-1 ${chipClass}`}>
                    <MapPin className="h-3 w-3 shrink-0" />
                    {loc}
                  </span>
                ))}
              </div>
            ) : (
              locations.map((loc, index) => (
                <span key={index} className={`flex items-center gap-1 ${chipClass}`}>
                  <MapPin className="h-3 w-3 shrink-0" />
                  {loc}
                </span>
              ))
            ))}
          {salaryLabel ? (
            <div className="flex flex-wrap">
              <span className="bg-primary/20 text-foreground flex items-center gap-1 rounded-md px-2 py-0.5 text-xs">
                <DollarSign className="h-3 w-3 shrink-0" />
                {salaryLabel}
              </span>
            </div>
          ) : null}
          {commitments.map((commitment, index) => (
            <span key={`c-${index}`} className={chipClass}>
              {commitment}
            </span>
          ))}
          {workTypeTrimmed ? <span className={chipClass}>{workTypeTrimmed}</span> : null}
        </div>
      </div>
    </div>
  );
};

export default CardHeader;
