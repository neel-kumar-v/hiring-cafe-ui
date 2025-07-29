import {
  MorphingCommitments,
  MorphingJobTitle,
  MorphingLocation,
  MorphingSalary,
  MorphingTime,
  MorphingWorkType,
} from "@/components/ui/motion/morphing-dialog";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { getCleanJobTitle, getCompensation, getLocations } from "@/lib/job-info";
import { CompensationRange } from "@/types/job";
import { DollarSign, MapPin } from "lucide-react";
import ScrapeTime from "../util/ScrapeTime";

const CardHeader = ({
  jobTitle,
  companyName,
  workplaceCities,
  commitments,
  workType,
  compensation,
  postedAt,
  tools,
}: {
  jobTitle: string;
  companyName: string;
  workplaceCities: string[];
  commitments: string[];
  workType: string;
  compensation: CompensationRange;
  postedAt: string;
  tools: string[];
}) => {
  const isDesktop = useMediaQuery("(min-width: 728px)");
  // For getCleanJobTitle, we'll use the first city or an empty string
  const locationForTitle = workplaceCities.length > 0 ? workplaceCities[0] : "";
  const calculateMaxHeight = () => {
    return (Math.floor(workplaceCities.length / 3) + 1) * 6;
  };

  // Needs tailwind to create these classes
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const possibleHeights = "pointer-fine:group-hover:max-h-36 pointer-fine:group-hover:max-h-30 pointer-fine:group-hover:max-h-24 pointer-fine:group-hover:max-h-18 pointer-fine:group-hover:max-h-12 pointer-fine:group-hover:max-h-6"

  return (
    <div className="mb-4">
      <div className="flex flex-row justify-between items-center">
        {isDesktop ? (
          <>
            <MorphingJobTitle className="text-lg font-semibold text-neutral-900 dark:text-white mb-2 line-clamp-2 flex-1">
              {getCleanJobTitle(jobTitle, companyName, locationForTitle, tools)}
            </MorphingJobTitle>
            <MorphingTime className="flex items-center space-x-1 -translate-y-0.5">
              <ScrapeTime postedAt={postedAt} />
            </MorphingTime>
          </>
        ) : (
          <>
            <div className="text-lg font-semibold text-neutral-900 dark:text-white mb-2 line-clamp-2">
              {getCleanJobTitle(jobTitle, companyName, locationForTitle, tools)}
            </div>
            <div className="flex items-center space-x-1 -translate-y-0.5">
              <ScrapeTime postedAt={postedAt} />
            </div>
          </>
        )}
      </div>
      <span className="text-xs text-neutral-600 dark:text-neutral-400 mb-2 flex items-center gap-1 flex-wrap">
        {workplaceCities.length > 0 &&
          (isDesktop ? (
            <MorphingLocation className={`flex flex-row flex-wrap items-center gap-1 pointer-fine:max-h-6  pointer-fine:group-hover:max-h-${calculateMaxHeight()} max-h-full pointer-fine:motion-reduce:max-h-full  overflow-hidden transition-all duration-700 ease-out`}>
              {getLocations(workplaceCities).map((loc, index) => (
                <span
                  key={index}
                  className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-700/50 text-neutral-700 dark:text-neutral-300 rounded-md px-2 py-0.5 text-xs"
                >
                  <MapPin className="w-3 h-3" />
                  {loc}
                </span>
              ))}
            </MorphingLocation>
          ) : (
            getLocations(workplaceCities).map((loc, index) => (
              <span
                key={index}
                className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-700/50 text-neutral-700 dark:text-neutral-300 rounded-md px-2 py-0.5 text-xs"
              >
                <MapPin className="w-3 h-3" />
                {loc}
              </span>
            ))
          ))}
        {isDesktop ? (
          <MorphingCommitments className="flex flex-row flex-wrap items-center gap-1">
            {commitments.map((commitment, index) => (
              <span
                key={index}
                className="bg-neutral-100 dark:bg-neutral-700/50 text-neutral-700 dark:text-neutral-300 rounded-md px-2 py-0.5 text-xs"
              >
                {commitment}
              </span>
            ))}
          </MorphingCommitments>
        ) : (
          commitments.map((commitment, index) => (
            <span
              key={index}
              className="bg-neutral-100 dark:bg-neutral-700/50 text-neutral-700 dark:text-neutral-300 rounded-md px-2 py-0.5 text-xs"
            >
              {commitment}
            </span>
          ))
        )}
        {isDesktop ? (
          <MorphingWorkType>
            <span className="bg-neutral-100 dark:bg-neutral-700/50 text-neutral-700 dark:text-neutral-300 rounded-md px-2 py-0.5 text-xs">
              {workType}
            </span>
          </MorphingWorkType>
        ) : (
          <span className="bg-neutral-100 dark:bg-neutral-700/50 text-neutral-700 dark:text-neutral-300 rounded-md px-2 py-0.5 text-xs">
            {workType}
          </span>
        )}
        {getCompensation(compensation) &&
          (isDesktop ? (
            <MorphingSalary>
              <span className="flex items-center gap-1 bg-pink-400/75 dark:bg-pink-400/60 rounded-md px-2 py-0.5 text-black dark:text-white text-xs">
                <DollarSign className="w-3 h-3" />
                {getCompensation(compensation)}
              </span>
            </MorphingSalary>
          ) : (
            <span className="flex items-center gap-1 bg-pink-400/75 dark:bg-pink-400/60 rounded-md px-2 py-0.5 text-black dark:text-white text-xs">
              <DollarSign className="w-3 h-3" />
              {getCompensation(compensation)}
            </span>
          ))}
      </span>
    </div>
  );
};

export default CardHeader;
