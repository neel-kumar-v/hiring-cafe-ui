"use client";

import { Button } from "@/components/ui/button";
import { Hitbox } from "@/components/ui/hitbox";
import { useApp } from "@/contexts/AppContext";
import { defaultSearchOptions, useSearchUI } from "@/contexts/SearchContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getEditedTags } from "@/lib/edited-filters";
import { cn } from "@/lib/utils";
import { api } from "../../../convex/_generated/api";
import { useMutation } from "convex/react";
import { ChevronUp, Plus, RotateCcw } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";

export default function HomeSearchActions() {
  const { user: convexUser } = useCurrentUser();
  const createSavedSearch = useMutation(api.savedSearches.create);
  const {
    user,
    searchOptions,
    setSearchOptions,
    setCurrentSavedSearchId,
    setHasUnsavedChanges,
  } = useApp();
  const {
    showFilterRibbon,
    setShowFilterRibbon,
  } = useSearchUI();

  const hasEditedFilters = useMemo(() => {
    return getEditedTags(searchOptions).size > 0;
  }, [searchOptions]);

  const hasSavedSearches = user.savedSearches.length > 0;
  const shouldShowSavedSearchArea = hasSavedSearches || hasEditedFilters;

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

  if (!shouldShowSavedSearchArea) {
    // In this "truly empty" state, the ribbon toggle is rendered in the
    // quick-filters bar (30 days / Relevance / ...) to save vertical headroom.
    return null;
  }

  return (
    <div>
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
        </div>
      </div>
    </div>
  );
}
