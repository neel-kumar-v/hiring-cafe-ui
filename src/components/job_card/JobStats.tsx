import React from "react";
import { Eye, Bookmark, Send } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import StatIcon from "./StatIcon";

const JobStats = ({
  viewedByUsers = [],
  savedFromUsers = [],
  appliedFromUsers = [],
  isBookmarked = false,
  isApplied = false,
  onBookmarkToggle,
  onApplyToggle,
}: {
  viewedByUsers?: string[];
  savedFromUsers?: string[];
  appliedFromUsers?: string[];
  isBookmarked?: boolean;
  isApplied?: boolean;
  onBookmarkToggle: (e: React.MouseEvent) => void;
  onApplyToggle: (e: React.MouseEvent) => void;
}) => {
  const viewedCount = viewedByUsers.length + 1; // +1 for current user
  const savedCount = savedFromUsers.length + (isBookmarked ? 1 : 0);
  const appliedCount = appliedFromUsers.length + (isApplied ? 1 : 0);

  return (
    <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
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
            onClick={onBookmarkToggle}
          >
            {isBookmarked ? (
              <Bookmark className="w-3 h-3 inline text-pink-500 dark:text-pink-400 fill-current" />
            ) : (
              <Bookmark className="w-3 h-3 inline text-gray-500 dark:text-gray-400" />
            )}
            <span>{savedCount}</span>
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
            onClick={onApplyToggle}
          >
            {isApplied ? (
              <Send className="w-3 h-3 inline text-pink-500 dark:text-pink-400 fill-pink-500 dark:fill-pink-400" />
            ) : (
              <Send className="w-3 h-3 inline text-gray-500 dark:text-gray-400" />
            )}
            <span>{appliedCount}</span>
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
    </div>
  );
};

export default JobStats;
