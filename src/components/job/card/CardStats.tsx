import type React from "react";
import { StatGroup } from "../util/StatGroup";

const CardStats = ({
  viewedCount = 0,
  savedCount = 0,
  appliedCount = 0,
  isBookmarked = false,
  isApplied = false,
  isInterviewing = false,
  onBookmarkToggle,
  applyUrl,
}: {
  viewedCount?: number;
  savedCount?: number;
  appliedCount?: number;
  isBookmarked?: boolean;
  isApplied?: boolean;
  isInterviewing?: boolean;
  onBookmarkToggle: (e: React.MouseEvent) => void;
  applyUrl: string;
}) => {
  const viewedTotal = viewedCount + 1;
  const savedTotal = savedCount + (isBookmarked ? 1 : 0);
  const appliedTotal = appliedCount + (isApplied ? 1 : 0);

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBookmarkToggle(e);
  };

  const handleGeneralClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div onClick={handleGeneralClick}>
      <div className="flex w-fit items-center space-x-3 pr-4 text-muted-foreground text-md dark:text-muted-foreground">
        <StatGroup
          appliedCount={appliedTotal}
          handleBookmarkClick={handleBookmarkClick}
          isApplied={isApplied}
          isBookmarked={isBookmarked}
          isInterviewing={isInterviewing}
          savedCount={savedTotal}
          viewedCount={viewedTotal}
          iconClassName="size-3"
          applyUrl={applyUrl}
        />
      </div>
    </div>
  );
};

export default CardStats;
