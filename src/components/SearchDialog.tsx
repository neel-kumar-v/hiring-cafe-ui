import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { SearchDialogContent, SearchDrawerContent } from "./search/contents";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  from?: string;
  isDarkMode?: boolean;
}

function SearchDialogInner({ open, onOpenChange, from, isDarkMode }: SearchDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 728px)");

  if (!isDesktop) {
    return (
      <Drawer onOpenChange={onOpenChange} open={open}>
        <DrawerContent className="w-full max-w-full rounded-t-xl">
          <DrawerHeader className="border-neutral-200 border-b px-6 py-4 dark:border-neutral-700">
            <VisuallyHidden>
              <DrawerTitle>Create your Job Search</DrawerTitle>
            </VisuallyHidden>
          </DrawerHeader>

          <SearchDrawerContent
            from={from}
            onOpenChange={onOpenChange}
            open={open}
          />
        </DrawerContent>
      </Drawer>
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
