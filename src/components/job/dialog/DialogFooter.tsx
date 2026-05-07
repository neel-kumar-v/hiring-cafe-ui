import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { formatCompanyWebsite } from "@/lib/company-info";
import { Bookmark, CheckCheck, ChevronLeft, ChevronRight, ExternalLink, EyeOff, Link2, MessageSquareWarning, Send, Share2 } from "lucide-react";

export interface DialogFooterNavigationProps {
  currentJobIndex: number;
  totalJobs: number;
  onPrevious: () => void | Promise<void>;
  onNext: () => void | Promise<void>;
  onJobSelect: (index: number) => void | Promise<void>;
  onJobHover?: (index: number) => void;
  onPreviousHover?: () => void;
  onNextHover?: () => void;
  canGoPrevious?: boolean;
  canGoNext?: boolean;
}

const DialogFooterNavigation = ({
  currentJobIndex,
  totalJobs,
  onPrevious,
  onNext,
  onJobSelect,
  onJobHover,
  onPreviousHover,
  onNextHover,
  canGoPrevious = true,
  canGoNext = true,
}: DialogFooterNavigationProps) => {
  return (
    <div className="absolute top-0 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
      <div className="flex items-center gap-1 rounded-md border border-border bg-background px-1.5 py-1 shadow-sm dark:bg-card">
        <button
          aria-label="Previous job"
          className={cn(
            "flex size-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
            !canGoPrevious && "cursor-not-allowed opacity-40 hover:bg-transparent hover:text-muted-foreground"
          )}
          disabled={!canGoPrevious}
          onClick={() => void onPrevious()}
          onMouseEnter={onPreviousHover}
          type="button"
        >
          <ChevronLeft className="size-3" />
        </button>

        <div className="flex items-center gap-1 px-0.5">
          {Array.from({ length: totalJobs }).map((_, jobIndex) => (
            <button
              aria-label={`Go to job ${jobIndex + 1}`}
              className={cn("size-1.5 rounded-full transition-colors", jobIndex === currentJobIndex ? "bg-primary" : "bg-border hover:bg-muted-foreground/60")}
              key={jobIndex}
              onClick={() => void onJobSelect(jobIndex)}
              onMouseEnter={() => onJobHover?.(jobIndex)}
              type="button"
            />
          ))}
        </div>

        <button
          aria-label="Next job"
          className={cn(
            "flex size-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
            !canGoNext && "cursor-not-allowed opacity-40 hover:bg-transparent hover:text-muted-foreground"
          )}
          disabled={!canGoNext}
          onClick={() => void onNext()}
          onMouseEnter={onNextHover}
          type="button"
        >
          <ChevronRight className="size-3" />
        </button>
      </div>
    </div>
  );
};

const DialogFooter = ({
  isBookmarked,
  isApplied,
  onBookmarkToggle,
  onApplyToggle,
  applyUrl,
  companyWebsite,
  navigation,
}: {
  isBookmarked: boolean;
  isApplied: boolean;
  onBookmarkToggle: () => void;
  onApplyToggle: () => void;
  applyUrl: string;
  companyWebsite: string | null | undefined;
  navigation?: DialogFooterNavigationProps;
}) => {
  return (
    <div className="sticky right-0 bottom-0 left-0 bg-background dark:bg-card">
      <div className="relative md:border-t md:border-border dark:border-border">{navigation ? <DialogFooterNavigation {...navigation} /> : null}</div>
      <DialogActionButtons
        isApplied={isApplied}
        isBookmarked={isBookmarked}
        onApplyToggle={onApplyToggle}
        onBookmarkToggle={onBookmarkToggle}
        applyUrl={applyUrl}
        companyUrl={companyWebsite}
        showTopBorder={false}
        hasNavigation={Boolean(navigation)}
      />
    </div>
  );
};

export const DialogActionButtons = ({
  onBookmarkToggle,
  isBookmarked,
  onApplyToggle,
  isApplied,
  applyUrl,
  companyUrl: companyWebsite,
  showTopBorder = true,
  hasNavigation = false,
}: {
  onBookmarkToggle: () => void;
  isBookmarked: boolean;
  onApplyToggle: () => void;
  isApplied: boolean;
  applyUrl: string;
  companyUrl: string | null | undefined;
  showTopBorder?: boolean;
  hasNavigation?: boolean;
}) => {
  return (
    <div className="flex flex-col gap-1.5 sm:flex-col-reverse">
      <div className={cn("flex flex-wrap items-center justify-center gap-1.5 py-2 md:py-3", showTopBorder && "md:border-t md:border-border", hasNavigation && "pt-6 md:pt-6")}>
        <Button className="flex items-center gap-2" onClick={onBookmarkToggle} size="sm" variant="outline">
          <Bookmark className={`size-4 ${isBookmarked ? "fill-current" : ""}`} />
          {isBookmarked ? "Saved" : "Save"}
        </Button>

        <Button asChild size="sm" variant="outline">
          <a href={applyUrl} rel="noopener noreferrer" target="_blank">
            <Send className="size-4" />
            Apply Now
          </a>
        </Button>

        <Button className="flex items-center gap-2" onClick={onApplyToggle} size="sm" variant="outline">
          <CheckCheck className={`size-4 ${isApplied ? "fill-current" : ""}`} />
          {isApplied ? "Applied" : "Mark Applied"}
        </Button>

        <div className="mx-1 min-h-8 w-px hidden md:block bg-border align-self-stretch" />

        <Button className="flex items-center gap-2" size="sm" variant="outline">
          <Share2 className="size-4" />
          Share
        </Button>

        <Button asChild size="sm" variant="outline">
          <a href={formatCompanyWebsite(companyWebsite)} rel="noopener noreferrer" tabIndex={1} target="_blank">
            <Link2 className="size-4" />
            Company Site
          </a>
        </Button>

        <Button className="flex items-center gap-2" size="sm" variant="outline">
          <ExternalLink className="size-4" />
          All Jobs
        </Button>

        <div className="mx-1 min-h-8 w-px hidden md:block bg-border align-self-stretch max-[520px]:hidden" />

        <Button className="flex items-center gap-2 max-[520px]:hidden text-destructive!" size="sm" variant="outline">
          <EyeOff className="size-4 text-destructive!" />
          Hide
        </Button>

        <Button className="flex items-center gap-2 max-[520px]:hidden text-destructive!" size="sm" variant="outline">
          <MessageSquareWarning className="size-4 text-destructive!" />
          Report
        </Button>
      </div>

      {/* <Button className="flex items-center justify-center p-2 sm:p-4 sm:py-6" size="lg" variant="dialogHero">
        <span className="flex items-center justify-center gap-2">
          <BookUser className="size-4" />
          Contact Recruiter
        </span>
      </Button> */}
    </div>
  );
};

export default DialogFooter;
