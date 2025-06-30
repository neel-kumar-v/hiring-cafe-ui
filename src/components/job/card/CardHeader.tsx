import React from "react";
import { DollarSign, MapPin } from "lucide-react";
import {
  MorphingJobTitle,
  MorphingLocation,
  MorphingSalary,
  MorphingTime,
} from "@/components/ui/morphing-dialog";
import { getCleanJobTitle, getLocations, getCompensation } from "@/lib/utils";
import { CompensationRange } from "@/types/jobs";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import ScrapeTime from "../util/ScrapeTime";

const LocationBadge = ({ location }: { location: string }) => (
  <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-md px-2 py-0.5 text-xs">
    <MapPin className="w-3 h-3" />
    {location}
  </span>
);

const CommitmentBadge = ({ commitment }: { commitment: string }) => (
  <span className="bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-md px-2 py-0.5 text-xs">
    {commitment}
  </span>
);

const WorkTypeBadge = ({ workType }: { workType: string }) => (
  <span className="bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-md px-2 py-0.5 text-xs">
    {workType}
  </span>
);

const SalaryBadge = ({ compensation }: { compensation: CompensationRange }) => {
  const compensationText = getCompensation(compensation);
  if (!compensationText) return null;

  return (
    <span className="flex items-center bg-pink-400/75 dark:bg-gray-700/75 rounded-md w-fit pl-1 px-2 py-0.5 text-black dark:text-pink-500/85">
      <DollarSign className="w-3 h-3 " />
      {compensationText}
    </span>
  );
};

const CardHeader = ({
  jobTitle,
  companyName,
  location,
  commitments,
  workType,
  compensation,
  postedAt,
}: {
  jobTitle: string;
  companyName: string;
  location: string;
  commitments: string[];
  workType: string;
  compensation: CompensationRange;
  postedAt: string;
}) => {
  const isDesktop = useMediaQuery("(min-width: 640px)");
  return (
    <div className="mb-4">
      <div className="flex flex-row justify-between items-center">
        {isDesktop ? (
          <>
            <MorphingJobTitle className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
              {getCleanJobTitle(jobTitle, companyName, location)}
            </MorphingJobTitle>
            <MorphingTime className="flex items-center space-x-1 -translate-y-3">
              <ScrapeTime postedAt={postedAt} />
            </MorphingTime>
          </>
        ) : (
          <>
            <div className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
              {getCleanJobTitle(jobTitle, companyName, location)}
            </div>
            <div className="flex items-center space-x-1 -translate-y-3">
              <ScrapeTime postedAt={postedAt} />
            </div>
          </>
        )}
      </div>
      <span className="text-xs text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1 flex-wrap">
        {getLocations(location).map((loc, index) =>
          isDesktop ? (
            <MorphingLocation key={index}>
              <LocationBadge location={loc} />
            </MorphingLocation>
          ) : (
            <LocationBadge key={index} location={loc} />
          )
        )}
        {commitments.map((commitment, index) => (
          <CommitmentBadge key={index} commitment={commitment} />
        ))}
        <WorkTypeBadge workType={workType} />
        {isDesktop ? (
          <MorphingSalary>
            <SalaryBadge compensation={compensation} />
          </MorphingSalary>
        ) : (
          <SalaryBadge compensation={compensation} />
        )}
      </span>
    </div>
  );
};

export default CardHeader;
