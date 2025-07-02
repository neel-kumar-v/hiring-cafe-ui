import React from "react";
import { MapPin, DollarSign } from "lucide-react";
import {
  MorphingLocation,
  MorphingSalary,
  MorphingCommitments,
  MorphingWorkType,
} from "@/components/ui/morphing-dialog";
import { getLocations, getCompensation } from "@/lib/utils";
import { CompensationRange } from "@/types/jobs";
import { useMediaQuery } from "@/hooks/useMediaQuery";

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
  const isDesktop = useMediaQuery("(min-width: 640px)");
  return (
    <div className={compact ? "" : "mb-6"}>
      <div className={`flex flex-wrap ${compact ? "gap-1" : "gap-3"}`}>
        {isDesktop ? (
          <MorphingLocation className="flex flex-row flex-wrap items-center gap-2">
            {getLocations(workplaceCities).map((loc, index) => (
              <span
                className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700/50 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-300"
                key={index}
              >
                <MapPin className="w-4 h-4" />
                {loc}
              </span>
            ))}
          </MorphingLocation>
        ) : (
          getLocations(workplaceCities).map((loc, index) => (
            <span
              key={index}
              className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700/50 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-300"
            >
              <MapPin className="w-4 h-4" />
              {loc}
            </span>
          ))
        )}
        {isDesktop ? (
          <MorphingCommitments className="flex flex-row flex-wrap items-center gap-2">
            {commitments.map((commitment, index) => (
              <span
                key={index}
                className="bg-gray-100 dark:bg-gray-700/50 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-300"
              >
                {commitment}
              </span>
            ))}
          </MorphingCommitments>
        ) : (
          commitments.map((commitment, index) => (
            <span
              key={index}
              className="bg-gray-100 dark:bg-gray-700/50 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-300"
            >
              {commitment}
            </span>
          ))
        )}
        {isDesktop ? (
          <MorphingWorkType className="bg-gray-100 dark:bg-gray-700/50 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-300">
            {workType}
          </MorphingWorkType>
        ) : (
          <span className="bg-gray-100 dark:bg-gray-700/50 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-300">
            {workType}
          </span>
        )}
        {getCompensation(compensation) &&
          (isDesktop ? (
            <MorphingSalary>
              <span className="flex items-center gap-2 rounded-lg px-3 py-2 bg-pink-400/75 dark:bg-gray-700/75 text-black dark:text-pink-500/85">
                <DollarSign className="w-4 h-4" />
                {getCompensation(compensation)}
              </span>
            </MorphingSalary>
          ) : (
            <span className="flex items-center gap-2 rounded-lg px-3 py-2 bg-pink-400/75 dark:bg-gray-700/75 text-black dark:text-pink-500/85">
              <DollarSign className="w-4 h-4" />
              {getCompensation(compensation)}
            </span>
          ))}
      </div>
    </div>
  );
};

export default DialogBadges;
