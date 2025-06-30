import React from "react";
import { MapPin, DollarSign } from "lucide-react";
import {
  MorphingLocation,
  MorphingSalary,
} from "@/components/ui/morphing-dialog";
import { getLocations, getCompensation } from "@/lib/utils";
import { CompensationRange } from "@/types/jobs";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const DialogBadges = ({
  location,
  workType,
  commitments,
  compensation,
  compact = false,
}: {
  location: string;
  workType: string;
  commitments: string[];
  compensation: CompensationRange;
  compact?: boolean;
}) => {
  const isDesktop = useMediaQuery("(min-width: 640px)");
  return (
    <div className={compact ? "" : "mb-6"}>
      <div className={`flex flex-wrap ${compact ? "gap-1" : "gap-3"}`}>
        {getLocations(location).map((loc, index) =>
          isDesktop ? (
            <MorphingLocation key={index}>
              <span className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700/50 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-300">
                <MapPin className="w-4 h-4" />
                {loc}
              </span>
            </MorphingLocation>
          ) : (
            <span
              key={index}
              className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700/50 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-300"
            >
              <MapPin className="w-4 h-4" />
              {loc}
            </span>
          )
        )}
        <span className="bg-gray-100 dark:bg-gray-700/50 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-300">
          {workType}
        </span>
        {commitments.map((commitment, index) => (
          <span
            key={index}
            className="bg-gray-100 dark:bg-gray-700/50 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-300"
          >
            {commitment}
          </span>
        ))}
        {getCompensation(compensation) &&
          (isDesktop ? (
            <MorphingSalary>
              <span className="flex items-center gap-2 bg-pink-100 dark:bg-pink-900/20 rounded-lg px-3 py-2 text-pink-700 dark:text-pink-300">
                <DollarSign className="w-4 h-4" />
                {getCompensation(compensation)}
              </span>
            </MorphingSalary>
          ) : (
            <span className="flex items-center gap-2 bg-pink-100 dark:bg-pink-900/20 rounded-lg px-3 py-2 text-pink-700 dark:text-pink-300">
              <DollarSign className="w-4 h-4" />
              {getCompensation(compensation)}
            </span>
          ))}
      </div>
    </div>
  );
};

export default DialogBadges;
