import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { SearchProvider, useSearch } from "@/contexts/SearchContext";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useEffect } from "react";
import { SearchDialogContent, SearchDrawerContent } from "./search/contents";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  from?: string;
  isDarkMode?: boolean;
}

function SearchDialogInner({ open, onOpenChange, from, isDarkMode }: SearchDialogProps) {
  const { hasUnsavedChanges, syncChanges } = useSearch();
  const isDesktop = useMediaQuery("(min-width: 728px)");

  useEffect(() => {
    if (!open && hasUnsavedChanges) {
      syncChanges();
    }
  }, [open, hasUnsavedChanges, syncChanges]);

  if (!isDesktop) {
    return (
      <Drawer onOpenChange={onOpenChange} open={open}>
        <DrawerContent className="w-full max-w-full rounded-t-xl">
          <DrawerHeader className="border-neutral-200 border-b px-6 py-4 dark:border-neutral-700">
            <DrawerTitle className="text-2xl">
              Create your Job Search
            </DrawerTitle>
          </DrawerHeader>

          <SearchDrawerContent
            from={from}
            onOpenChange={onOpenChange}
            open={open}
            isDarkMode={isDarkMode}
          />

          <DrawerFooter>
            <div className={`flex justify-end ${isDarkMode ? "dark" : ""}`}>
              {hasUnsavedChanges && (
                <button
                  className="rounded-md border-[1px] border-black dark:border-white px-4 py-2 text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black cursor-pointer transition-all duration-300 ease-in-out"
                  onClick={() => {
                    syncChanges();
                    onOpenChange(false);
                  }}
                >
                  Apply Settings
                </button>
              )}
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent
        className={`h-[90vh] w-[800px] min-w-[80vw] max-w-[90vw] border border-neutral-100 bg-white p-0 dark:border-neutral-700 dark:bg-neutral-800 ${
          isDarkMode ? "dark" : ""
        }`}
      >
        <DialogHeader className="border-neutral-200 border-b px-6 py-4 h-min dark:border-neutral-700">
          <DialogTitle className="text-2xl">Create your Job Search</DialogTitle>
        </DialogHeader>

        <SearchDialogContent
          from={from}
          onOpenChange={onOpenChange}
          open={open}
          isDarkMode={isDarkMode}
        />
      </DialogContent>
    </Dialog>
  );
}

export default function SearchDialog(props: SearchDialogProps) {
  return (
    <SearchProvider>
      <SearchDialogInner {...props} />
    </SearchProvider>
  );
}
