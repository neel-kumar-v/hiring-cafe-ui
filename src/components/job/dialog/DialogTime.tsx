import React from "react";
import { getTimeSince } from "@/lib/utils";
import { MorphingTime, MorphingJobStats } from "../../ui/morphing-dialog";
import ScrapeTime from "../ScrapeTime";
import StatGroup from "../StatGroup";

const DialogTime = ({
  publishDate,
  viewedByUsers,
  savedFromUsers,
  appliedFromUsers,
  isBookmarked,
  isApplied,
  onBookmarkClick,
  onApplyClick,
}: {
  publishDate: string;
  viewedByUsers?: string[];
  savedFromUsers?: string[];
  appliedFromUsers?: string[];
  isBookmarked: boolean;
  isApplied: boolean;
  onBookmarkClick: (e: React.MouseEvent) => void;
  onApplyClick: (e: React.MouseEvent) => void;
}) => {
  const timeSince = getTimeSince(publishDate);
  if (!timeSince) return null;

  return (
    <div className="absolute top-8 left-8 flex items-center gap-3">
      <MorphingTime className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
        <ScrapeTime
          postedAt={publishDate}
          iconClassName="w-4 h-4"
          textClassName="text-md"
        />
      </MorphingTime>

      <MorphingJobStats className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
        <StatGroup
          viewedCount={viewedByUsers?.length || 0}
          savedCount={savedFromUsers?.length || 0}
          appliedCount={appliedFromUsers?.length || 0}
          isBookmarked={isBookmarked}
          isApplied={isApplied}
          handleBookmarkClick={onBookmarkClick}
          handleApplyClick={onApplyClick}
          iconClassName="w-4 h-4"
          textClassName="text-md"
        />
      </MorphingJobStats>
    </div>
  );
};

export default DialogTime;
