"use client";

import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import { defaultSearchOptions, useSearchUI } from "@/contexts/SearchContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { cn } from "@/lib/utils";
import { api } from "../../../convex/_generated/api";
import { useMutation } from "convex/react";
import { ChevronUp, Plus, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export default function HomeSearchActions() {
  const { user: convexUser } = useCurrentUser();
  const createSavedSearch = useMutation(api.savedSearches.create);
  const {
    searchOptions,
    setSearchOptions,
    setCurrentSavedSearchId,
    setHasUnsavedChanges,
  } = useApp();
  const {
    showFilterRibbon,
    setShowFilterRibbon,
  } = useSearchUI();

  const handleSaveSearch = async () => {
    if (!convexUser) {
      toast.error("Sign in first to save searches.");
      return;
    }

    try {
      await createSavedSearch({
        userId: convexUser._id,
        name: "New Search",
        searchState: searchOptions,
      });
      toast.success("Search saved successfully.");
    } catch {
      toast.error("Unable to save search right now.");
    }
  };

  const handleClearFilters = () => {
    setSearchOptions(defaultSearchOptions);
    setCurrentSavedSearchId(null);
    setHasUnsavedChanges(false);
    toast.success("Filters cleared.");
  };

  const handleRibbonToggle = () => {
    setShowFilterRibbon(!showFilterRibbon);
  };

  return (
    <div className="border-neutral-200 border-b bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800">
      <div className="mx-auto flex max-w-full flex-col gap-3 px-4 py-4 transition-[padding] duration-500 ease-in-out lg:px-8 xl:px-12 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Saved searches:
          </span>
          <Button
            className="h-9 rounded-full border-dashed border-neutral-400 bg-transparent px-4 text-sm text-neutral-900 hover:bg-neutral-100 dark:border-neutral-600 dark:text-white dark:hover:bg-neutral-700"
            onClick={handleSaveSearch}
            variant="outline"
          >
            <Plus className="size-4" />
            Save Current Search
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3 xl:justify-end">
          <Button
            className={cn(
              "h-9 rounded-full px-4 text-sm",
              "bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
            )}
            onClick={handleClearFilters}
            variant="destructive"
          >
            <RotateCcw className="size-4" />
            Clear filters
          </Button>
          <Button
            className="h-9 rounded-full px-4 text-sm"
            onClick={handleRibbonToggle}
            variant="outline"
          >
            <ChevronUp className={cn("size-4 transition-transform", !showFilterRibbon && "rotate-180")} />
            {showFilterRibbon ? "Collapse filter ribbon" : "Expand filter ribbon"}
          </Button>
        </div>
      </div>
    </div>
  );
}
