import { cn } from "@/lib/utils";
import { Bookmark, Eye, PhoneOutgoingIcon, Send } from "lucide-react";
import UniversalTooltip from "../../util/UniversalTooltip";
import StatIcon from "./StatIcon";

export const StatGroup = ({
  viewedCount,
  savedCount,
  appliedCount,
  isBookmarked,
  isApplied,
  isInterviewing = false,
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
  isInterviewing?: boolean;
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
        iconClassName={iconClassName}
        textClassName={textClassName}
      />
      <UniversalTooltip
        content={
          isBookmarked
            ? "You have saved this job"
            : savedCount === 0
              ? "Be the first to save this job!"
              : `Saved by ${savedCount} users`
        }
        side="bottom"
      >
        <span
          className="flex cursor-pointer items-center space-x-1"
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
              : `Applied by ${appliedCount} users. Click to apply.`
        }
        side="bottom"
      >
        <span
          className="flex cursor-pointer items-center space-x-1"
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
      <UniversalTooltip
        content={
          isInterviewing
            ? "You are interviewing for this job"
            : "No hiring.cafe users have marked that they are interviewing for this job"
        }
        side="bottom"
      >
        <span className="flex items-center space-x-1">
          {isInterviewing ? (
            <PhoneOutgoingIcon
              className={cn(
                "inline fill-pink-500 text-pink-500 dark:fill-pink-400 dark:text-pink-400",
                iconClassName
              )}
            />
          ) : (
            <PhoneOutgoingIcon
              className={cn(
                "inline text-neutral-500 dark:text-neutral-400",
                iconClassName
              )}
            />
          )}
          <span className={textClassName}>{isInterviewing ? 1 : 0}</span>
        </span>
      </UniversalTooltip>
    </>
  );
};

export default StatGroup;
