import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Bookmark, Send, Eye } from "lucide-react";
import StatIcon from "./StatIcon";
import { cn } from "@/lib/utils";

export const StatGroup = ({
  viewedCount,
  savedCount,
  appliedCount,
  isBookmarked,
  isApplied,
  handleBookmarkClick,
  handleApplyClick,
  iconClassName="w-3 h-3",
  textClassName="text-sm",
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
        icon={Eye}
        count={viewedCount}
        tooltipText={
          viewedCount === 1
            ? "Only viewed by you"
            : `Viewed by ${viewedCount} users`
        }
      />
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className="flex items-center space-x-1 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            onClick={handleBookmarkClick}
          >
            {isBookmarked ? (
              <Bookmark className={cn("inline text-pink-500 dark:text-pink-400 fill-current", iconClassName)} />
            ) : (
              <Bookmark className={cn("inline text-gray-500 dark:text-gray-400", iconClassName)} />
            )}
            <span className={textClassName}>{savedCount}</span>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {isBookmarked
              ? "You have saved this job"
              : savedCount === 0
              ? "Be the first to save this job!"
              : `Saved by ${savedCount} users`}
          </p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className="flex items-center space-x-1 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            onClick={handleApplyClick}
          >
            {isApplied ? (
              <Send className={cn("inline text-pink-500 dark:text-pink-400 fill-pink-500 dark:fill-pink-400", iconClassName)} />
            ) : (
              <Send className={cn("inline text-gray-500 dark:text-gray-400", iconClassName)} />
            )}
            <span className={textClassName}>{appliedCount}</span>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {isApplied
              ? "You have applied to this job"
              : appliedCount === 0
              ? "Be the first to apply to this job!"
              : `Applied by ${appliedCount} users`}
          </p>
        </TooltipContent>
      </Tooltip>
    </>
  );
};

export default StatGroup;
