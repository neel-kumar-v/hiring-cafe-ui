import { getTimeSince } from "@/lib/job-info";
import type React from "react";
import ScrapeTime from "../util/ScrapeTime";
import DialogStatGroup from "../util/DialogStatGroup";

const DialogStats = ({
  publishDate,
  publishDateMillis,
  createdAt,
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
  publishDateMillis?: number | null;
  createdAt?: number | null;
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
  if (!publishDate && (publishDateMillis === undefined || publishDateMillis === null) && (createdAt === undefined || createdAt === null)) return null;
  const timeSince = getTimeSince(publishDate ?? "", publishDateMillis, createdAt);
  if (!timeSince.abbreviated) return null;

  return (
    <div className="absolute top-8 left-8 flex items-center gap-3">
      <div className="flex items-center gap-1 leading-none text-muted-foreground text-sm dark:text-muted-foreground">
        <ScrapeTime
          iconClassName="size-4"
          isTransitioning={isTransitioning}
          postedAt={publishDate ?? ""}
          postedAtMillis={publishDateMillis}
          createdAt={createdAt}
          textClassName="text-sm leading-none"
        />
      </div>

      <div className="flex items-center space-x-3 leading-none text-muted-foreground text-sm dark:text-muted-foreground">
        <DialogStatGroup
          appliedCount={appliedCount}
          handleBookmarkClick={onBookmarkClick}
          iconClassName="size-4"
          isApplied={isApplied}
          isBookmarked={isBookmarked}
          isInterviewing={isInterviewing}
          isTransitioning={isTransitioning}
          savedCount={savedCount}
          textClassName="text-sm leading-none"
          viewedCount={viewedCount + 1}
          applyUrl={applyUrl}
        />
      </div>
    </div>
  );
};

export default DialogStats;
