"use client";

import { Button } from "@/components/ui/button";
import { Hitbox } from "@/components/ui/hitbox";
import { SignInDialog } from "@/components/auth/SignInDialog";
import { useApp } from "@/contexts/AppContext";
import { defaultSearchOptions, useSearchUI } from "@/contexts/SearchContext";
import { useSavedSearches } from "@/hooks/useSavedSearches";
import { getEditedTags } from "@/lib/edited-filters";
import { cn } from "@/lib/utils";
import { ChevronUp, Plus, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export default function HomeSearchActions() {
  const { searchOptions, setSearchOptions, setHasUnsavedChanges } = useApp();
  const { convexUser, savedSearches, create } = useSavedSearches();
  const {
    showFilterRibbon,
    setShowFilterRibbon,
    jobBoardSelectionMode,
    setJobBoardSelectionMode,
  } = useSearchUI();
  const [signInOpen, setSignInOpen] = useState(false);

  const hasEditedFilters = useMemo(() => {
    return getEditedTags(searchOptions).size > 0;
  }, [searchOptions]);

  const hasSavedSearches = (savedSearches ?? []).length > 0;
  const shouldShowSavedSearchArea = hasSavedSearches || hasEditedFilters;

  const handleSaveSearch = async () => {
    if (!convexUser) {
      setSignInOpen(true);
      return;
    }

    try {
      await create("New Search", searchOptions);
    } catch {
      toast.error("Unable to save search right now.");
    }
  };

  const handleClearFilters = () => {
    setSearchOptions(defaultSearchOptions);
    setHasUnsavedChanges(false);
    toast.success("Filters cleared.");
  };

  const handleRibbonToggle = () => {
    setShowFilterRibbon(!showFilterRibbon);
  };

  if (!shouldShowSavedSearchArea) {
    // In this "truly empty" state, the ribbon toggle is rendered in the
    // quick-filters bar (30 days / Relevance / ...) to save vertical headroom.
    return null;
  }

  return (
    <>
      <SignInDialog onOpenChange={setSignInOpen} open={signInOpen} />
      <div className="mx-auto flex max-w-full flex-col gap-3 px-4 py-4 transition-[padding] duration-500 ease-in-out lg:px-8 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-foreground/80">
            Saved searches:
          </span>
          {hasEditedFilters ? (
            <Hitbox size="sm" radius="lg">
              <Button
                className="h-9 px-4 text-sm"
                onClick={handleSaveSearch}
                variant="dashed"
              >
                <Plus className="size-4" />
                Save Current Search
              </Button>
            </Hitbox>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3 xl:justify-end">
          {hasEditedFilters ? (
            <Hitbox size="sm" radius="lg">
              <Button
                className="h-9 px-4 text-sm"
                onClick={handleClearFilters}
                variant="destructive"
              >
                <RotateCcw className="size-4" />
                Clear filters
              </Button>
            </Hitbox>
          ) : null}
          <div className="hidden md:block">
            <Hitbox size="sm" radius="lg">
              <Button
                className="h-9 rounded-lg px-4 text-sm"
                onClick={handleRibbonToggle}
                variant="outline"
              >
                <ChevronUp className={cn("size-4 transition-transform", !showFilterRibbon && "rotate-180")} />
                {showFilterRibbon ? "Collapse filter ribbon" : "Expand filter ribbon"}
              </Button>
            </Hitbox>
          </div>
          <div className="hidden md:block">
            <Hitbox size="sm" radius="lg">
              <Button
                className="h-9 rounded-lg px-4 text-sm"
                onClick={() => setJobBoardSelectionMode(!jobBoardSelectionMode)}
                variant={jobBoardSelectionMode ? "default" : "outline"}
              >
                Select jobs
              </Button>
            </Hitbox>
          </div>
        </div>
      </div>
    </>
  );
}
