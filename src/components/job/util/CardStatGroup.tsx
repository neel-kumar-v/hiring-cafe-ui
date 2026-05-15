import { jobFadeClass } from "@/lib/jobs/fadeTransition";
import { cn } from "@/lib/utils";
import { Bookmark, Eye, PhoneOutgoingIcon, Send } from "lucide-react";
import UniversalTooltip from "../../util/UniversalTooltip";
import StatIcon from "./StatIcon";

type HoverSwapTextProps = {
  count: number;
  label: string;
  labelHoverWidthClassName: string;
  textClassName: string;
  isTransitioning: boolean;
};

const HoverSwapText = ({ count, label, labelHoverWidthClassName, textClassName, isTransitioning }: HoverSwapTextProps) => {
  return (
    <span className={cn("inline-flex items-center", textClassName, jobFadeClass(isTransitioning))}>
      <span
        className={cn(
          "tabular-nums inline-flex overflow-hidden whitespace-nowrap transition-[width,opacity,transform,padding] duration-300 ease-out",
          "w-fit opacity-100 translate-y-0 group-hover:w-0 group-hover:opacity-0 group-hover:translate-y-1"
        )}
      >
        {count}
      </span>
      <span
        className={cn(
          "inline-flex overflow-hidden whitespace-nowrap transition-[width,opacity,transform,padding] duration-300 ease-out",
          "w-0 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0",
          labelHoverWidthClassName
        )}
      >
        {label}
      </span>
    </span>
  );
};

export const CardStatGroup = ({
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
  onApplyClick,
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
  onApplyClick?: (e: React.MouseEvent) => void;
}) => {
  const savedTooltip =
    savedCount === 0 && !isBookmarked ? "Be the first to save this job" : isBookmarked ? "You have saved this job" : `Saved by ${savedCount} users`;

  const appliedTooltip = isApplied
    ? "You have applied to this job"
    : appliedCount === 0
      ? "Be the first to apply to this job!"
      : `Applied by ${appliedCount} users. Click to apply.`;

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

      <UniversalTooltip content={savedTooltip} side="bottom">
        <button
          className={cn(
            "group flex h-6 cursor-pointer items-center gap-1.5 rounded-full group-hover:px-2 py-1 leading-none transition-colors duration-300 ease-out",
            "bg-transparent text-muted-foreground",
            "group-hover:bg-primary group-hover:text-primary-foreground"
          )}
          onClick={handleBookmarkClick}
          type="button"
        >
          {isBookmarked ? (
            <Bookmark className={cn("inline fill-current text-primary group-hover:text-primary-foreground", iconClassName)} />
          ) : (
            <Bookmark className={cn("inline text-muted-foreground group-hover:text-primary-foreground", iconClassName)} />
          )}

          <HoverSwapText
            count={savedCount}
            label={isBookmarked ? "Saved" : "Save"}
            labelHoverWidthClassName={isBookmarked ? "group-hover:w-[5ch]" : "group-hover:w-[4ch]"}
            textClassName={cn(textClassName, "group-hover:text-primary-foreground")}
            isTransitioning={isTransitioning}
          />
        </button>
      </UniversalTooltip>

      <UniversalTooltip content={appliedTooltip} side="bottom">
        <a
          className={cn(
            "group flex h-6 cursor-pointer items-center gap-1.5 rounded-full group-hover:px-2 py-1 leading-none transition-colors duration-300 ease-out",
            "bg-transparent text-muted-foreground",
            "group-hover:bg-primary group-hover:text-primary-foreground"
          )}
          href={applyUrl}
          target="_blank"
          rel="noopener noreferrer external"
          onClick={onApplyClick}
        >
          {isApplied ? (
            <Send className={cn("inline fill-primary text-primary group-hover:fill-current group-hover:text-primary-foreground", iconClassName)} />
          ) : (
            <Send className={cn("inline text-muted-foreground group-hover:text-primary-foreground", iconClassName)} />
          )}

          <HoverSwapText
            count={appliedCount}
            label={isApplied ? "Applied" : "Apply"}
            labelHoverWidthClassName={isApplied ? "group-hover:w-[7ch]" : "group-hover:w-[5ch]"}
            textClassName={cn(textClassName, "group-hover:text-primary-foreground")}
            isTransitioning={isTransitioning}
          />
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

export default CardStatGroup;

