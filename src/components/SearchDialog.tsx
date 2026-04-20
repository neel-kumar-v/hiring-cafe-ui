"use client";

import { ResponsiveDialog, ResponsiveDialogContent, ResponsiveDialogDescription, ResponsiveDialogTitle } from "@/components/ui/responsive-dialog";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { useSearchUI } from "@/contexts/SearchContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { SearchDialogContent } from "./search/contents";
import SearchOverlayContent from "./search/contents/SearchOverlayContent";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  from?: string;
  isDarkMode?: boolean;
}

export default function SearchDialog({ open, onOpenChange, from, isDarkMode }: SearchDialogProps) {
  const isMobile = useIsMobile(768);

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent
        className={`border border-border/60 bg-background p-0 dark:border-border  ${
          isMobile ? "h-[100dvh] max-h-[100dvh] w-full max-w-none rounded-none border-0" : "h-[90vh] w-[800px] min-w-[80vw] max-w-[90vw]"
        } ${isDarkMode ? "dark" : ""}`}
      >
        <ResponsiveDialogTitle className="sr-only">Create your Job Search</ResponsiveDialogTitle>
        <ResponsiveDialogDescription className="sr-only">Configure your job search filters and preferences.</ResponsiveDialogDescription>

        {isMobile ? (
          <SearchOverlayContent open={open} onOpenChange={onOpenChange} from={from} singlePage={true} />
        ) : (
          <SearchDialogContent from={from} onOpenChange={onOpenChange} open={open} singlePage={true} />
        )}
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

export function SearchDialogWrapper() {
  const { searchDialogOpen, setSearchDialogOpen, searchDialogFrom } = useSearchUI();
  const { isDarkMode } = useDarkMode();

  return <SearchDialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen} from={searchDialogFrom} isDarkMode={isDarkMode} />;
}
