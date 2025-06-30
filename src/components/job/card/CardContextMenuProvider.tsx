import { Job } from "@/types/jobs";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Bookmark,
  Send,
  ExternalLink,
  Share2,
  EyeOff,
  Flag,
  Link2,
} from "lucide-react";

const CardContextMenuProvider = ({
  children,
  currentJob,
  isBookmarked,
  isApplied,
  onBookmarkClick,
  onApplyClick,
}: {
  children: React.ReactNode;
  currentJob: Job;
  isBookmarked: boolean;
  isApplied: boolean;
  onBookmarkClick: (e: React.MouseEvent) => void;
  onApplyClick: (e: React.MouseEvent) => void;
}) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent className="min-w-64">
        <ContextMenuItem onClick={onBookmarkClick}>
          {isBookmarked ? (
            <Bookmark className="mr-2 h-4 w-4 fill-current text-pink-500 dark:text-pink-400" />
          ) : (
            <Bookmark className="mr-2 h-4 w-4" />
          )}
          {isBookmarked ? "Unsave Job" : "Save Job"}
        </ContextMenuItem>
        <ContextMenuItem onClick={onApplyClick}>
          {isApplied ? (
            <Send className="mr-2 h-4 w-4 text-pink-500 dark:text-pink-400 fill-pink-500 dark:fill-pink-400" />
          ) : (
            <Send className="mr-2 h-4 w-4" />
          )}
          {isApplied ? "Unmark Applied" : "Apply Directly"}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>
          <ExternalLink className="mr-2 h-4 w-4" />
          View all Jobs from {currentJob.v5_processed_company_data.name}
        </ContextMenuItem>
        <ContextMenuItem>
          <Link2 className="mr-2 h-4 w-4" />
          Go to Company Website
        </ContextMenuItem>
        <ContextMenuItem>
          <Share2 className="mr-2 h-4 w-4" />
          Share Job
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>
          <EyeOff className="mr-2 h-4 w-4" />
          Hide Job
        </ContextMenuItem>
        <ContextMenuItem>
          <Flag className="mr-2 h-4 w-4" />
          Report Job
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default CardContextMenuProvider;
