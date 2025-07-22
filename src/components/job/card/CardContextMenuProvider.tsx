import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import type { Job } from "@/types/job";
import {
  Bookmark,
  CheckCheck,
  ExternalLink,
  EyeOff,
  Link2,
  MessageSquareWarning,
  Send,
  Share2,
} from "lucide-react";

const CardContextMenuProvider = ({
  children,
  currentJob,
  isBookmarked,
  isApplied,
  onBookmarkClick,
  onApplyClick,
  applyUrl,
}: {
  children: React.ReactNode;
  currentJob: Job;
  isBookmarked: boolean;
  isApplied: boolean;
  onBookmarkClick: (e: React.MouseEvent) => void;
  onApplyClick: (e: React.MouseEvent) => void;
  applyUrl: string;
}) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent className="min-w-64">
        <ContextMenuItem onClick={onBookmarkClick}>
          {isBookmarked ? (
            <Bookmark className="mr-2 size-4 fill-current text-pink-500 dark:text-pink-400" />
          ) : (
            <Bookmark className="mr-2 size-4" />
          )}
          {isBookmarked ? "Unsave Job" : "Save Job"}
        </ContextMenuItem>
        <ContextMenuItem>
          <a href={applyUrl} target="_blank" className="flex items-center gap-2">
            <Send className="mr-2 size-4" />
            Apply Now
          </a>
        </ContextMenuItem>
        <ContextMenuItem onClick={onApplyClick}>
          <CheckCheck className="mr-2 size-4" />
          {isApplied ? "Unmark Applied" : "Mark Applied"}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>
          <ExternalLink className="mr-2 size-4" />
          View all Jobs from {currentJob.v5_processed_company_data.name}
        </ContextMenuItem>
        <ContextMenuItem>
          <Link2 className="mr-2 size-4" />
          Go to Company Website
        </ContextMenuItem>
        <ContextMenuItem>
          <Share2 className="mr-2 size-4" />
          Share Job
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem className="!text-destructive">
          <EyeOff className="mr-2 size-4 !text-destructive" />
          Hide Job
        </ContextMenuItem>
        <ContextMenuItem className="!text-destructive">
          <MessageSquareWarning className="mr-2 size-4 !text-destructive" />
          Report Job
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default CardContextMenuProvider;
