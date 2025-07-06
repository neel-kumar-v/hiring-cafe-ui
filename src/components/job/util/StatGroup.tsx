import { cn } from "@/lib/utils";
import { Bookmark, Eye, Send } from "lucide-react";
import UniversalTooltip from "../../util/UniversalTooltip";
import StatIcon from "./StatIcon";

export const StatGroup = ({
  viewedCount,
  savedCount,
  appliedCount,
  isBookmarked,
  isApplied,
  handleBookmarkClick,
  handleApplyClick,
  iconClassName = "w-3 h-3",
  textClassName = "text-sm",
}: {
  viewedCount: number;
  savedCount: number;
  appliedCount: number;
  isBookmarked: boolean;
  isApplied: boolean;
  handleBookmarkClick: (e: React.MouseEvent) => void;
  handleApplyClick: (e: React.MouseEvent) => void;
  iconClassName?: string;
  textClassName?: string;
}) => {
  return (
    <>
      <StatIcon
        count={viewedCount}
        icon={Eye}
        tooltipText={
          viewedCount === 1
            ? "Only viewed by you"
            : `Viewed by ${viewedCount} users`
        }
      />
      <UniversalTooltip
        content={
          isBookmarked
            ? "You have saved this job"
            : savedCount === 0
              ? "Be the first to save this job!"
              : `Saved by ${savedCount} users`
        }
      >
        <span
          className="flex cursor-pointer items-center space-x-1 transition-colors hover:text-neutral-700 dark:hover:text-neutral-200"
          onClick={handleBookmarkClick}
        >
          {isBookmarked ? (
            <Bookmark
              className={cn(
                "inline fill-current text-pink-500 dark:text-pink-400",
                iconClassName
              )}
            />
          ) : (
            <Bookmark
              className={cn(
                "inline text-neutral-500 dark:text-neutral-400",
                iconClassName
              )}
            />
          )}
          <span className={textClassName}>{savedCount}</span>
        </span>
      </UniversalTooltip>
      <UniversalTooltip
        content={
          isApplied
            ? "You have applied to this job"
            : appliedCount === 0
              ? "Be the first to apply to this job!"
              : `Applied by ${appliedCount} users`
        }
      >
        <span
          className="flex cursor-pointer items-center space-x-1 transition-colors hover:text-neutral-700 dark:hover:text-neutral-200"
          onClick={handleApplyClick}
        >
          {isApplied ? (
            <Send
              className={cn(
                "inline fill-pink-500 text-pink-500 dark:fill-pink-400 dark:text-pink-400",
                iconClassName
              )}
            />
          ) : (
            <Send
              className={cn(
                "inline text-neutral-500 dark:text-neutral-400",
                iconClassName
              )}
            />
          )}
          <span className={textClassName}>{appliedCount}</span>
        </span>
      </UniversalTooltip>
    </>
  );
};

export default StatGroup;
