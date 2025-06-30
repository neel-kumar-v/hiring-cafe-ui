import React from "react";
import { MorphingJobStats } from "@/components/ui/morphing-dialog";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { StatGroup } from "../util/StatGroup";

const CardStats = ({
  viewedByUsers = [],
  savedFromUsers = [],
  appliedFromUsers = [],
  isBookmarked = false,
  isApplied = false,
  onBookmarkToggle,
  onApplyToggle,
}: {
  viewedByUsers?: string[];
  savedFromUsers?: string[];
  appliedFromUsers?: string[];
  isBookmarked?: boolean;
  isApplied?: boolean;
  onBookmarkToggle: (e: React.MouseEvent) => void;
  onApplyToggle: (e: React.MouseEvent) => void;
}) => {
  const isDesktop = useMediaQuery("(min-width: 640px)");
  const viewedCount = viewedByUsers.length + 1; // +1 for current user
  const savedCount = savedFromUsers.length + (isBookmarked ? 1 : 0);
  const appliedCount = appliedFromUsers.length + (isApplied ? 1 : 0);

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBookmarkToggle(e);
  };

  const handleApplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onApplyToggle(e);
  };

  const handleGeneralClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div onClick={handleGeneralClick}>
      {isDesktop ? (
        <MorphingJobStats className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400 w-fit pr-4">
          <StatGroup
            viewedCount={viewedCount}
            savedCount={savedCount}
            appliedCount={appliedCount}
            isBookmarked={isBookmarked}
            isApplied={isApplied}
            handleBookmarkClick={handleBookmarkClick}
            handleApplyClick={handleApplyClick}
          />
        </MorphingJobStats>
      ) : (
        <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400 w-fit pr-4">
          <StatGroup
            viewedCount={viewedCount}
            savedCount={savedCount}
            appliedCount={appliedCount}
            isBookmarked={isBookmarked}
            isApplied={isApplied}
            handleBookmarkClick={handleBookmarkClick}
            handleApplyClick={handleApplyClick}
          />
        </div>
      )}
    </div>
  );
};

export default CardStats;
