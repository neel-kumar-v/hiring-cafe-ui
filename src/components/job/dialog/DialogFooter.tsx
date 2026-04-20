import { Button } from "@/components/ui/button";

import { formatCompanyWebsite } from "@/lib/company-info";
import { Bookmark, BookUser, CheckCheck, ExternalLink, EyeOff, Link2, MessageSquareWarning, Send, Share2 } from "lucide-react";

const DialogFooter = ({
  isBookmarked,
  isApplied,
  onBookmarkToggle,
  onApplyToggle,
  applyUrl,
  companyWebsite,
}: {
  isBookmarked: boolean;
  isApplied: boolean;
  onBookmarkToggle: () => void;
  onApplyToggle: () => void;
  applyUrl: string;
  companyWebsite: string | null | undefined;
}) => {
  return (
    <div className="sticky right-0 bottom-0 left-0 border-border  bg-background  dark:border-border dark:bg-card">
      <DialogActionButtons
        isApplied={isApplied}
        isBookmarked={isBookmarked}
        onApplyToggle={onApplyToggle}
        onBookmarkToggle={onBookmarkToggle}
        applyUrl={applyUrl}
        companyUrl={companyWebsite}
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
}: {
  onBookmarkToggle: () => void;
  isBookmarked: boolean;
  onApplyToggle: () => void;
  isApplied: boolean;
  applyUrl: string;
  companyUrl: string | null | undefined;
}) => {
  return (
    <div className="flex flex-col gap-1.5 sm:flex-col-reverse">
      <div className="flex flex-wrap items-center justify-center gap-1.5 md:py-3 max-md:pb-4 border-t border-border">
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

        <div className="mx-1 min-h-8 w-px bg-border align-self-stretch" />

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

        <div className="mx-1 min-h-8 w-px bg-border align-self-stretch max-[520px]:hidden" />

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
