import { MorphingJobStats } from "@/components/ui/morphing-dialog";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type React from "react";
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
        <MorphingJobStats className="flex w-fit items-center space-x-3 pr-4 text-neutral-500 text-xs dark:text-neutral-400">
          <StatGroup
            appliedCount={appliedCount}
            handleApplyClick={handleApplyClick}
            handleBookmarkClick={handleBookmarkClick}
            isApplied={isApplied}
            isBookmarked={isBookmarked}
            savedCount={savedCount}
            viewedCount={viewedCount}
          />
        </MorphingJobStats>
      ) : (
        <div className="flex w-fit items-center space-x-3 pr-4 text-neutral-500 text-xs dark:text-neutral-400">
          <StatGroup
            appliedCount={appliedCount}
            handleApplyClick={handleApplyClick}
            handleBookmarkClick={handleBookmarkClick}
            isApplied={isApplied}
            isBookmarked={isBookmarked}
            savedCount={savedCount}
            viewedCount={viewedCount}
          />
        </div>
      )}
    </div>
  );
};

export default CardStats;
