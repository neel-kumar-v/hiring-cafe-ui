import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { SearchDialogContent } from "./search/contents";
import SearchOverlayContent from "./search/contents/SearchOverlayContent";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  from?: string;
  isDarkMode?: boolean;
}

function SearchDialogInner({ open, onOpenChange, from, isDarkMode }: SearchDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 728px)");

  if (!isDesktop) {
    if (!open) return null;

    return (
      <div
        className="fixed inset-0 z-50 flex flex-col bg-white md:hidden dark:bg-neutral-900"
        onClick={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        <SearchOverlayContent
          open={open}
          onOpenChange={onOpenChange}
          from={from}
        />
      </div>
    );
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent
        className={`h-[90vh] w-[800px] min-w-[80vw] max-w-[90vw] border border-neutral-100 bg-white p-0 dark:border-neutral-700 dark:bg-neutral-800 aria-describedby="search-dialog-content" ${
          isDarkMode ? "dark" : ""
        }`}
      >
        <VisuallyHidden >
          <DialogTitle className="text-2xl">Create your Job Search</DialogTitle>
        </VisuallyHidden>

        <SearchDialogContent
          from={from}
          onOpenChange={onOpenChange}
          open={open}
        />
      </DialogContent>
    </Dialog>
  );
}

export default function SearchDialog(props: SearchDialogProps) {
  return <SearchDialogInner {...props} />;
}
