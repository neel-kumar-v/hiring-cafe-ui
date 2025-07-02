import React from "react";
import { DollarSign, MapPin } from "lucide-react";
import {
  MorphingJobTitle,
  MorphingLocation,
  MorphingSalary,
  MorphingTime,
  MorphingCommitments,
  MorphingWorkType,
} from "@/components/ui/morphing-dialog";
import { getCleanJobTitle, getLocations, getCompensation } from "@/lib/utils";
import { CompensationRange } from "@/types/jobs";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import ScrapeTime from "../util/ScrapeTime";

const CardHeader = ({
  jobTitle,
  companyName,
  workplaceCities,
  commitments,
  workType,
  compensation,
  postedAt,
}: {
  jobTitle: string;
  companyName: string;
  workplaceCities: string[];
  commitments: string[];
  workType: string;
  compensation: CompensationRange;
  postedAt: string;
}) => {
  const isDesktop = useMediaQuery("(min-width: 640px)");
  // For getCleanJobTitle, we'll use the first city or an empty string
  const locationForTitle = workplaceCities.length > 0 ? workplaceCities[0] : "";

  return (
    <div className="mb-4">
      <div className="flex flex-row justify-between items-center">
        {isDesktop ? (
          <>
            <MorphingJobTitle className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 flex-1">
              {getCleanJobTitle(jobTitle, companyName, locationForTitle)}
            </MorphingJobTitle>
            <MorphingTime className="flex items-center space-x-1 -translate-y-0.5">
              <ScrapeTime postedAt={postedAt} />
            </MorphingTime>
          </>
        ) : (
          <>
            <div className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
              {getCleanJobTitle(jobTitle, companyName, locationForTitle)}
            </div>
            <div className="flex items-center space-x-1 -translate-y-3">
              <ScrapeTime postedAt={postedAt} />
            </div>
          </>
        )}
      </div>
      <span className="text-xs text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1 flex-wrap">
        {workplaceCities.length > 0 &&
          (isDesktop ? (
            <MorphingLocation className="flex flex-row flex-wrap items-center gap-1">
              {getLocations(workplaceCities)
                .slice(0, 4)
                .map((loc, index) => (
                  <span
                    key={index}
                    className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-md px-2 py-0.5 text-xs"
                  >
                    <MapPin className="w-3 h-3" />
                    {loc}
                  </span>
                ))}
            </MorphingLocation>
          ) : (
            getLocations(workplaceCities)
              .slice(0, 4)
              .map((loc, index) => (
                <span
                  key={index}
                  className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-md px-2 py-0.5 text-xs"
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
                className="bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-md px-2 py-0.5 text-xs"
              >
                {commitment}
              </span>
            ))}
          </MorphingCommitments>
        ) : (
          commitments.map((commitment, index) => (
            <span
              key={index}
              className="bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-md px-2 py-0.5 text-xs"
            >
              {commitment}
            </span>
          ))
        )}
        {isDesktop ? (
          <MorphingWorkType>
            <span className="bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-md px-2 py-0.5 text-xs">
              {workType}
            </span>
          </MorphingWorkType>
        ) : (
          <span className="bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-md px-2 py-0.5 text-xs">
            {workType}
          </span>
        )}
        {getCompensation(compensation) &&
          (isDesktop ? (
            <MorphingSalary>
              <span className="flex items-center gap-1 bg-pink-400/75 dark:bg-gray-700/75 rounded-md px-2 py-0.5 text-black dark:text-pink-500/85 text-xs">
                <DollarSign className="w-3 h-3" />
                {getCompensation(compensation)}
              </span>
            </MorphingSalary>
          ) : (
            <span className="flex items-center gap-1 bg-pink-400/75 dark:bg-gray-700/75 rounded-md px-2 py-0.5 text-black dark:text-pink-500/85 text-xs">
              <DollarSign className="w-3 h-3" />
              {getCompensation(compensation)}
            </span>
          ))}
      </span>
    </div>
  );
};

export default CardHeader;
