import { getTimeSince } from "@/lib/job-info";
import type React from "react";
import ScrapeTime from "../util/ScrapeTime";
import DialogStatGroup from "../util/DialogStatGroup";

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
  isTransitioning = false,
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
  isTransitioning?: boolean;
}) => {
  if (!publishDate) return null;
  const timeSince = getTimeSince(publishDate);
  if (!timeSince) return null;

  return (
    <div className="absolute top-8 left-8 flex items-center gap-3">
      <div className="flex items-center gap-1 text-muted-foreground text-sm dark:text-muted-foreground">
        <ScrapeTime
          iconClassName="size-4"
          isTransitioning={isTransitioning}
          postedAt={publishDate}
          textClassName="text-md"
        />
      </div>

      <div className="flex items-center space-x-3 text-muted-foreground text-sm dark:text-muted-foreground">
        <DialogStatGroup
          appliedCount={appliedCount}
          handleBookmarkClick={onBookmarkClick}
          iconClassName="size-4"
          isApplied={isApplied}
          isBookmarked={isBookmarked}
          isInterviewing={isInterviewing}
          isTransitioning={isTransitioning}
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
