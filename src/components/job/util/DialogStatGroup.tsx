import { jobFadeClass } from "@/lib/jobs/fadeTransition";
import { cn } from "@/lib/utils";
import { Bookmark, Eye, PhoneOutgoingIcon, Send } from "lucide-react";
import UniversalTooltip from "../../util/UniversalTooltip";
import StatIcon from "./StatIcon";

export const DialogStatGroup = ({
  viewedCount,
  savedCount,
  appliedCount,
  isBookmarked,
  isApplied,
  isInterviewing = false,
  handleBookmarkClick,
  applyUrl,
  iconClassName = "w-3 h-3",
  textClassName = "text-sm",
  isTransitioning = false,
}: {
  viewedCount: number;
  savedCount: number;
  appliedCount: number;
  isBookmarked: boolean;
  isApplied: boolean;
  isInterviewing?: boolean;
  handleBookmarkClick: (e: React.MouseEvent) => void;
  applyUrl: string;
  iconClassName?: string;
  textClassName?: string;
  isTransitioning?: boolean;
}) => {
  return (
    <>
      <StatIcon
        count={viewedCount}
        icon={Eye}
        tooltipText={viewedCount === 1 ? "Only viewed by you" : `Viewed by ${viewedCount} users`}
        iconClassName={iconClassName}
        isTransitioning={isTransitioning}
        textClassName={textClassName}
      />

      {savedCount > 0 && (
        <UniversalTooltip
          content={isBookmarked ? "You have saved this job" : `Saved by ${savedCount} users`}
          side="bottom"
        >
          <span className="flex cursor-pointer items-center space-x-1" onClick={handleBookmarkClick}>
            {isBookmarked ? (
              <Bookmark className={cn("inline fill-current text-primary", iconClassName)} />
            ) : (
              <Bookmark className={cn("inline text-muted-foreground", iconClassName)} />
            )}
            <span className={cn(textClassName, jobFadeClass(isTransitioning))}>{savedCount}</span>
          </span>
        </UniversalTooltip>
      )}

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
        <a className="flex cursor-pointer items-center space-x-1" href={applyUrl} target="_blank" rel="noopener noreferrer external">
          {isApplied ? (
            <Send className={cn("inline fill-primary text-primary", iconClassName)} />
          ) : (
            <Send className={cn("inline text-muted-foreground", iconClassName)} />
          )}
          <span className={cn(textClassName, jobFadeClass(isTransitioning))}>{appliedCount}</span>
        </a>
      </UniversalTooltip>

      {isInterviewing && (
        <UniversalTooltip content="You are interviewing for this job" side="bottom">
          <span className="flex items-center space-x-1">
            <PhoneOutgoingIcon className={cn("inline fill-primary text-primary", iconClassName)} />
            <span className={cn(textClassName, jobFadeClass(isTransitioning))}>1</span>
          </span>
        </UniversalTooltip>
      )}
    </>
  );
};

export default DialogStatGroup;

