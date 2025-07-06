import { useReducedMotion } from "@/contexts/ReducedMotionContext";
import { getTimeSince } from "@/lib/utils";
import type React from "react";
import { MorphingJobStats, MorphingTime } from "../../ui/morphing-dialog";
import ScrapeTime from "../util/ScrapeTime";
import StatGroup from "../util/StatGroup";

const DialogStats = ({
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
  const { prefersReducedMotion } = useReducedMotion();
  if (!timeSince) return null;

  return (
    <div className="absolute top-8 left-8 flex items-center gap-3">
      {!prefersReducedMotion ? (
        <MorphingTime className="flex items-center gap-1 text-neutral-500 text-sm dark:text-neutral-400">
          <ScrapeTime
            iconClassName="w-4 h-4"
            postedAt={publishDate}
            textClassName="text-md"
          />
        </MorphingTime>
      ) : (
        <div className="flex items-center gap-1 text-neutral-500 text-sm dark:text-neutral-400">
          <ScrapeTime
            iconClassName="w-4 h-4"
            postedAt={publishDate}
            textClassName="text-md"
          />
        </div>
      )}

      {!prefersReducedMotion ? (
        <MorphingJobStats className="flex items-center space-x-3 text-neutral-500 text-xs dark:text-neutral-400">
          <StatGroup
            appliedCount={appliedFromUsers?.length || 0}
            handleApplyClick={onApplyClick}
            handleBookmarkClick={onBookmarkClick}
            iconClassName="w-4 h-4"
            isApplied={isApplied}
            isBookmarked={isBookmarked}
            savedCount={savedFromUsers?.length || 0}
            textClassName="text-md"
            viewedCount={(viewedByUsers?.length || 0) + 1}
          />
        </MorphingJobStats>
      ) : (
        <div className="flex items-center space-x-3 text-neutral-500 text-xs dark:text-neutral-400">
          <StatGroup
            appliedCount={appliedFromUsers?.length || 0}
            handleApplyClick={onApplyClick}
            handleBookmarkClick={onBookmarkClick}
            iconClassName="w-4 h-4"
            isApplied={isApplied}
            isBookmarked={isBookmarked}
            savedCount={savedFromUsers?.length || 0}
            textClassName="text-md"
            viewedCount={(viewedByUsers?.length || 0) + 1}
          />
        </div>
      )}
    </div>
  );
};

export default DialogStats;
