import { getTimeSince } from "@/lib/job-info";
import type React from "react";
import ScrapeTime from "../util/ScrapeTime";
import StatGroup from "../util/StatGroup";

const DialogStats = ({
  publishDate,
  viewedCount = 0,
  savedCount = 0,
  appliedCount = 0,
  isBookmarked,
  isApplied,
  isInterviewing = false,
  onBookmarkClick,
  applyUrl,
}: {
  publishDate?: string;
  viewedCount?: number;
  savedCount?: number;
  appliedCount?: number;
  isBookmarked: boolean;
  isApplied: boolean;
  isInterviewing?: boolean;
  onBookmarkClick: (e: React.MouseEvent) => void;
  applyUrl: string;
}) => {
  if (!publishDate) return null;
  const timeSince = getTimeSince(publishDate);
  if (!timeSince) return null;

  return (
    <div className="absolute top-8 left-8 flex items-center gap-3">
      <div className="flex items-center gap-1 text-muted-foreground text-sm dark:text-muted-foreground">
        <ScrapeTime
          iconClassName="size-4"
          postedAt={publishDate}
          textClassName="text-md"
        />
      </div>

      <div className="flex items-center space-x-3 text-muted-foreground text-sm dark:text-muted-foreground">
        <StatGroup
          appliedCount={appliedCount}
          handleBookmarkClick={onBookmarkClick}
          iconClassName="size-4"
          isApplied={isApplied}
          isBookmarked={isBookmarked}
          isInterviewing={isInterviewing}
          savedCount={savedCount}
          textClassName="text-md"
          viewedCount={viewedCount + 1}
          applyUrl={applyUrl}
        />
      </div>
    </div>
  );
};

export default DialogStats;
