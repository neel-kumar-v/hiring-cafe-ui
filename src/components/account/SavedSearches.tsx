"use client";

import { AllFilter } from "@/components/search/filters/util/AllFilter";
import { useApp } from "@/contexts/AppContext";
import type { CategoryId, SearchState } from "@/types/search";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { CalendarIcon, Edit, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";

export default function SavedSearches() {
  const router = useRouter();
  const { setSearchOptions } = useApp();
  const { user: convexUser, email } = useCurrentUser();
  const savedSearches = useQuery(
    api.savedSearches.listByUser,
    convexUser ? { userId: convexUser._id } : "skip"
  );
  const renameSavedSearch = useMutation(api.savedSearches.rename);
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

  const handleCategoryClick = (categoryType: CategoryId) => {
    // This would typically open the search filters dialog
    console.log("Category clicked:", categoryType);
  };

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h2 className="mb-4 text-xl font-semibold text-foreground">
        Saved Searches
      </h2>
      {!convexUser ? (
        <p className="text-muted-foreground italic">
          Sign in{email ? "" : " with an email"} to see saved searches.
        </p>
      ) : (savedSearches ?? []).length > 0 ? (
        <div className="space-y-6">
          {(savedSearches ?? []).map((search) => (
            <div
              key={String(search._id)}
              className="rounded-lg border border-border p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
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
                      className="border-none bg-transparent text-lg font-semibold text-foreground outline-none"
                    />
                  ) : (
                    <div className="group flex items-center">
                      <h3
                        className="cursor-pointer text-lg font-semibold text-foreground transition-colors hover:underline"
                        onClick={() => handleEditStart(search._id, search.name)}
                      >
                        {search.name}
                      </h3>
                      <button
                        onClick={() => handleEditStart(search._id, search.name)}
                        className="-ml-3 rounded p-1 opacity-0 transition-all duration-300 ease-out hover:bg-accent group-hover:ml-2 group-hover:opacity-100"
                      >
                        <Edit className="size-4 text-muted-foreground" />
                      </button>
                    </div>
                  )}
                  <span className="flex items-center gap-1 rounded-md bg-muted p-2 text-sm font-normal text-muted-foreground">
                    <CalendarIcon className="size-4" /> {new Date(search.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <button
                  className="inline-flex cursor-pointer items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition-all hover:bg-accent"
                  onClick={() => {
                    setSearchOptions(search.searchState as SearchState);
                    router.push("/");
                    toast.success("Loaded saved search.");
                  }}
                  type="button"
                >
                  <Search className="size-4" /> Go to Search
                </button>
              </div>
              <AllFilter
                searchOptions={search.searchState as SearchState}
                handleCategoryClick={handleCategoryClick}
                showButton={false}
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground italic">
          No saved searches yet.
        </p>
      )}
    </div>
  );
} 
