import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { formatCompanyWebsite } from "@/lib/company-info";
import type { CompanyDTO, JobDTO } from "@/types/convexJobs";
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
  company,
  isBookmarked,
  isApplied,
  onBookmarkClick,
  onApplyClick,
  applyUrl,
}: {
  children: React.ReactNode;
  currentJob: JobDTO;
  company: CompanyDTO | null;
  isBookmarked: boolean;
  isApplied: boolean;
  onBookmarkClick: (e: React.MouseEvent) => void;
  onApplyClick: (e: React.MouseEvent) => void;
  applyUrl: string;
}) => {
  const companyName = company?.name ?? "";
  const companyWebsite = company?.homepageUri ?? "";

  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent className="min-w-64">
        <ContextMenuItem onClick={onBookmarkClick}>
          {isBookmarked ? (
            <Bookmark className="mr-2 size-4 fill-current text-primary dark:text-primary" />
          ) : (
            <Bookmark className="mr-2 size-4" />
          )}
          {isBookmarked ? "Unsave Job" : "Save Job"}
        </ContextMenuItem>
        <ContextMenuItem className="group">
          <a href={applyUrl} target="_blank" rel="noopener noreferrer external" className="flex items-center gap-2 group-hover:underline">
            <Send className="mr-2 size-4" />
            Apply Now
          </a>
        </ContextMenuItem>
        {applyUrl && (
          <ContextMenuItem onClick={onApplyClick}>
            <CheckCheck className="mr-2 size-4" />
            {isApplied ? "Unmark Applied" : "Mark Applied"}
          </ContextMenuItem>
        )}
        <ContextMenuSeparator />
        <ContextMenuItem>
          <ExternalLink className="mr-2 size-4" />
          View all Jobs from {companyName}
        </ContextMenuItem>
        <ContextMenuItem className="group">
          <a href={formatCompanyWebsite(companyWebsite)} target="_blank" rel="noopener noreferrer external" className="flex items-center gap-2 group-hover:underline">
            <Link2 className="mr-2 size-4" />
            Go to Company Website
          </a>
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
