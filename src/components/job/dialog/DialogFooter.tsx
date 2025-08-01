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
    <div className="sticky right-0 bottom-0 left-0 border-neutral-200  bg-white  dark:border-neutral-700 dark:bg-neutral-800">
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
    <div className="flex flex-col gap-3 sm:flex-col-reverse">
      <div className="flex flex-wrap items-center justify-center gap-3 sm:px-4 md:pb-4 pt-4 md:pt-0">
        <Button className="flex items-center gap-2" onClick={onBookmarkToggle} size="sm" variant="outline">
          <Bookmark className={`size-4 ${isBookmarked ? "fill-current" : ""}`} />
          {isBookmarked ? "Saved" : "Save"}
        </Button>

        <a
          href={applyUrl}
          target="_blank"
          className="flex items-center gap-2 rounded-md text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-pink-400 text-pink-700 hover:border-pink-400 hover:bg-pink-400 hover:text-black dark:border-pink-400 dark:text-pink-400 dark:hover:border-pink-800 dark:hover:bg-pink-800 dark:hover:text-white px-3 py-[5px]"
          tabIndex={0}
          role="button"
        >
          <Send className="size-4" />
          Apply Now
        </a>

        <Button className="flex items-center gap-2" onClick={onApplyToggle} size="sm" variant="outline">
          <CheckCheck className={`size-4 ${isApplied ? "fill-current" : ""}`} />
          {isApplied ? "Applied" : "Mark Applied"}
        </Button>

        <div className="mx-1 min-h-[2rem] w-px bg-border align-self-stretch" />

        <Button className="flex items-center gap-2" size="sm" variant="outline">
          <Share2 className="size-4" />
          Share
        </Button>

        <a
          href={formatCompanyWebsite(companyWebsite)}
          target="_blank"
          className="flex items-center gap-2 rounded-md text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input hover:bg-input/50  px-3 py-[5px]"
          tabIndex={1}
          role="button"
        >
          <Link2 className="size-4" />
          Company Site
        </a>

        <Button className="flex items-center gap-2" size="sm" variant="outline">
          <ExternalLink className="size-4" />
          All Jobs
        </Button>

        <div className="mx-1 min-h-[2rem] w-px bg-border align-self-stretch max-[520px]:hidden" />

        <Button className="flex items-center gap-2 max-[520px]:hidden !text-destructive" size="sm" variant="outline">
          <EyeOff className="size-4 !text-destructive" />
          Hide
        </Button>

        <Button className="flex items-center gap-2 max-[520px]:hidden !text-destructive" size="sm" variant="outline">
          <MessageSquareWarning className="size-4 !text-destructive" />
          Report
        </Button>
      </div>

      <Button
        className="w-full max-sm:bg-white/10 max-sm:dark:bg-white/10 sm:bg-transparent sm:hover:bg-transparent dark:sm:border-neutral-700 sm:border-neutral-200  sm:border-1 sm:border-x-0 sm:rounded-none text-black dark:text-white max-sm:hover:bg-pink-400 dark:max-sm:hover:bg-pink-400/75 transition-all duration-300 ease-in-out flex items-center justify-center sm:p-4 sm:py-6 p-2"
        size="lg"
        variant="default"
      >
        <span className="flex items-center justify-center gap-2 sm:hover:bg-pink-400 dark:sm:hover:bg-pink-400/75 p-2 rounded-md transition-all duration-300 ease-in-out">
          <BookUser className="size-4" />
          Contact Recruiter
        </span>
      </Button>
    </div>
  );
};

export default DialogFooter;
