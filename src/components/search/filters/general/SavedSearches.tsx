"use client";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useApp } from "@/contexts/AppContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { CategoryId, SearchState } from "@/types/search";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Calendar, Edit, Eye, Plus, Search } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { AllFilter } from "../util/AllFilter";
import FilterContainer from "../util/FilterContainer";

export default function SavedSearches() {
  const { searchOptions, setSearchOptions } = useApp();
  const { user: convexUser, email } = useCurrentUser();
  const savedSearches = useQuery(
    api.savedSearches.listByUser,
    convexUser ? { userId: convexUser._id } : "skip"
  );
  const createSavedSearch = useMutation(api.savedSearches.create);
  const renameSavedSearch = useMutation(api.savedSearches.rename);
  const removeSavedSearch = useMutation(api.savedSearches.remove);

  const [editingId, setEditingId] = useState<Id<"savedSearches"> | null>(null);
  const [editingName, setEditingName] = useState("");
  const inputRefs = useRef<{ [id: string]: HTMLInputElement | null }>({});

  const handleEditStart = (id: Id<"savedSearches">, name: string) => {
    setEditingId(id);
    setEditingName(name);
    setTimeout(() => {
      inputRefs.current[String(id)]?.focus();
    }, 0);
  };

  const handleEditSave = (id: Id<"savedSearches">) => {
    void renameSavedSearch({ id, name: editingName.trim() || "Untitled" });
    setEditingId(null);
    setEditingName("");
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: Id<"savedSearches">) => {
    if (e.key === "Enter") {
      handleEditSave(id);
    } else if (e.key === "Escape") {
      handleEditCancel();
    }
  };

  const handleLoadSearch = (search: { searchState: SearchState }) => {
    setSearchOptions(search.searchState);
  };

  const handleCategoryClick = (categoryId: CategoryId) => {
    console.log("Category clicked:", categoryId);
  };

  const handleSaveSearch = () => {
    if (!convexUser) {
      toast.error("Sign in first to save searches.");
      return;
    }
    void (async () => {
      const newId = await createSavedSearch({
        userId: convexUser._id,
        name: "New Search",
        searchState: searchOptions,
      });
      setTimeout(() => handleEditStart(newId, "New Search"), 0);
      toast.success("Search saved successfully!");
    })();
  };

  return (
    <FilterContainer
      categoryId="saved"
      title="Saved Searches"
      actions={
        <Button size="sm" variant="outline" onClick={handleSaveSearch}>
          <Plus className="size-4" /> Save Current Search
        </Button>
      }
    >
      {!convexUser ? (
        <p className="text-sm text-muted-foreground">
          Sign in{email ? "" : " with an email"} to save searches.
        </p>
      ) : (savedSearches ?? []).length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No saved searches yet. Create your first search to see it here.
        </p>
      ) : (
        <div className="space-y-3">
          {(savedSearches ?? []).map((search) => (
            <div
              key={String(search._id)}
              className="group mt-3 flex items-center justify-between border-b border-border/20 last-of-type:border-b-0"
            >
              <div className="min-w-0 flex-1">
                {editingId === search._id ? (
                  <input
                    type="text"
                    value={editingName}
                    ref={(el) => {
                      inputRefs.current[String(search._id)] = el;
                      return;
                    }}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, search._id)}
                    onBlur={() => handleEditSave(search._id)}
                    className="w-full border-none bg-transparent font-medium text-text outline-none"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <span
                      className="cursor-pointer font-medium text-text transition-colors hover:underline"
                      onClick={() => handleEditStart(search._id, search.name)}
                    >
                      {search.name}
                    </span>
                    <button
                      onClick={() => handleEditStart(search._id, search.name)}
                      className="rounded p-1 opacity-0 transition-opacity duration-200 hover:bg-accent group-hover:opacity-100"
                    >
                      <Edit className="size-3 text-muted-foreground hover:text-text" />
                    </button>
                  </div>
                )}
                <p className="mt-1 flex items-center text-xs text-muted-foreground">
                  <Calendar className="mr-1 size-3" />
                  {new Date(search.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="ml-4 flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="pointer-none:hidden flex items-center gap-1 max-sm:hidden"
                    >
                      <Eye className="size-3" />
                      View Search
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left" align="start" className="max-h-none w-80 overflow-y-auto p-0">
                    <div className="p-4">
                      <AllFilter
                        handleCategoryClick={handleCategoryClick}
                        searchOptions={search.searchState}
                        showButton={false}
                      />
                    </div>
                  </TooltipContent>
                </Tooltip>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleLoadSearch(search)}
                  className="flex items-center gap-1"
                >
                  <Search className="size-3" />
                  Load Search
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    void removeSavedSearch({ id: search._id });
                    toast.success("Deleted saved search.");
                  }}
                  className="flex items-center gap-1 text-destructive"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </FilterContainer>
  );
}
