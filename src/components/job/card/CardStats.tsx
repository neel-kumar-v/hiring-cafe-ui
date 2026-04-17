import type React from "react";
import { StatGroup } from "../util/StatGroup";

const CardStats = ({
  viewedByUsers = [],
  savedFromUsers = [],
  appliedFromUsers = [],
  isBookmarked = false,
  isApplied = false,
  isInterviewing = false,
  onBookmarkToggle,
  applyUrl,
}: {
  viewedByUsers?: string[];
  savedFromUsers?: string[];
  appliedFromUsers?: string[];
  isBookmarked?: boolean;
  isApplied?: boolean;
  isInterviewing?: boolean;
  onBookmarkToggle: (e: React.MouseEvent) => void;
  applyUrl: string;
}) => {
  const viewedCount = viewedByUsers.length + 1;
  const savedCount = savedFromUsers.length + (isBookmarked ? 1 : 0);
  const appliedCount = appliedFromUsers.length + (isApplied ? 1 : 0);

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBookmarkToggle(e);
  };

  const handleGeneralClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div onClick={handleGeneralClick}>
      <div className="flex w-fit items-center space-x-3 pr-4 text-neutral-400 text-md dark:text-neutral-500">
        <StatGroup
          appliedCount={appliedCount}
          handleBookmarkClick={handleBookmarkClick}
          isApplied={isApplied}
          isBookmarked={isBookmarked}
          isInterviewing={isInterviewing}
          savedCount={savedCount}
          viewedCount={viewedCount}
          iconClassName="size-3"
          applyUrl={applyUrl}
        />
      </div>
    </div>
  );
};

export default CardStats;
