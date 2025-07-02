import React from "react";
import {
  Bookmark,
  BookUser,
  Send,
  CheckCheck,
  Share2,
  EyeOff,
  MessageSquareWarning,
  Link2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const DialogFooter = ({
  isBookmarked,
  isApplied,
  onBookmarkToggle,
  onApplyToggle,
}: {
  isBookmarked: boolean;
  isApplied: boolean;
  onBookmarkToggle: () => void;
  onApplyToggle: () => void;
}) => {
  return (
    <div className="sticky bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
      <DialogActionButtons
        onBookmarkToggle={onBookmarkToggle}
        isBookmarked={isBookmarked}
        onApplyToggle={onApplyToggle}
        isApplied={isApplied}
      />
    </div>
  );
};

export const DialogActionButtons = ({
  onBookmarkToggle,
  isBookmarked,
  onApplyToggle,
  isApplied,
}: {
  onBookmarkToggle: () => void;
  isBookmarked: boolean;
  onApplyToggle: () => void;
  isApplied: boolean;
}) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 ">
      <Button
        variant="outline"
        size="sm"
        onClick={onBookmarkToggle}
        className="flex items-center gap-2"
      >
        <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
        {isBookmarked ? "Saved" : "Save"}
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2 text-pink-700 dark:text-pink-400 hover:text-white dark:hover:text-white border-pink-500 dark:border-pink-400 hover:bg-pink-600 hover:border-pink-600 dark:hover:bg-pink-800 dark:hover:border-pink-800"
      >
        <Send className="w-4 h-4" />
        Apply Now
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onApplyToggle}
        className="flex items-center gap-2"
      >
        <CheckCheck className={`w-4 h-4 ${isApplied ? "fill-current" : ""}`} />
        {isApplied ? "Applied" : "Mark Applied"}
      </Button>

      <div className="mx-1 bg-border w-px min-h-[2rem] align-self-stretch" />

      <Button variant="outline" size="sm" className="flex items-center gap-2 max-sm:hidden">
        <BookUser className="w-4 h-4" />
        Contact Recruiter
      </Button>

      <Button variant="outline" size="sm" className="flex items-center gap-2">
        <Share2 className="w-4 h-4" />
        Share
      </Button>

      <Button variant="outline" size="sm" className="flex items-center gap-2">
        <Link2 className="w-4 h-4" />
        Company Site
      </Button>

      <Button variant="outline" size="sm" className="flex items-center gap-2">
        <ExternalLink className="w-4 h-4" />
        All Jobs
      </Button>

      <div className="mx-1 bg-border w-px min-h-[2rem] align-self-stretch max-sm:hidden" />

      <Button variant="outline" size="sm" className="flex items-center gap-2 max-sm:hidden">
        <EyeOff className="w-4 h-4" />
        Hide
      </Button>

      <Button variant="outline" size="sm" className="flex items-center gap-2 max-sm:hidden">
        <MessageSquareWarning className="w-4 h-4" />
        Report
      </Button>
    </div>
  );
};

export default DialogFooter;
