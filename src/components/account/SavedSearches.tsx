"use client";

import { AllFilter } from "@/components/search/filters/util/AllFilter";
import { useApp } from "@/contexts/AppContext";
import { SavedSearch, User } from "@/types/app";
import { CategoryId } from "@/types/search";
import { CalendarIcon, Edit, Search } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface SavedSearchesProps {
  user: User;
}

export default function SavedSearches({ user }: SavedSearchesProps) {
  const { setUser } = useApp();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const inputRefs = useRef<{ [id: string]: HTMLInputElement | null }>({});

  const handleEditStart = (id: string, name: string) => {
    setEditingId(id);
    setEditingName(name);
    setTimeout(() => {
      inputRefs.current[id]?.focus();
    }, 0);
  };

  const handleEditSave = (id: string) => {
    setUser({
      ...user,
      savedSearches: user.savedSearches.map((search: SavedSearch) =>
        search.id === id ? { ...search, name: editingName, modifiedAt: new Date() } : search
      )
    });
    setEditingId(null);
    setEditingName("");
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
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
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
      <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
        Saved Searches
      </h2>
      {user.savedSearches.length > 0 ? (
        <div className="space-y-6">
          {user.savedSearches.map((search) => (
            <div
              key={search.id}
              className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {editingId === search.id ? (
                    <input
                      type="text"
                      value={editingName}
                      ref={el => {
                        inputRefs.current[search.id] = el;
                        return;
                      }}
                      onChange={e => setEditingName(e.target.value)}
                      onKeyDown={e => handleKeyDown(e, search.id)}
                      onBlur={() => handleEditSave(search.id)}
                      className="bg-transparent border-none outline-none text-lg font-semibold text-neutral-900 dark:text-white"
                    />
                                     ) : (
                     <div className="group flex items-center">
                       <h3 
                         className="text-lg font-semibold text-neutral-900 dark:text-white cursor-pointer hover:underline transition-colors"
                         onClick={() => handleEditStart(search.id, search.name)}
                       >
                         {search.name}
                       </h3>
                       <button
                         onClick={() => handleEditStart(search.id, search.name)}
                         className="-ml-3 opacity-0 transition-all duration-300 ease-out group-hover:ml-2 group-hover:opacity-100 p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded"
                       >
                         <Edit className="size-4 text-neutral-600 dark:text-neutral-400" />
                       </button>
                     </div>
                   )}
                  <span className="text-sm text-neutral-600 dark:text-neutral-400 flex items-center gap-1 p-2 bg-background/15 rounded-md font-normal">
                    <CalendarIcon className="size-4"/> {search.modifiedAt.toLocaleDateString()}
                  </span>
                </div>
                <button
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  onClick={() => toast.info("Demo: Doesn't Work")}
                  type="button"
                >
                  <Search className="size-4" /> Go to Search
                </button>
              </div>
              <AllFilter
                searchOptions={search.searchState}
                handleCategoryClick={handleCategoryClick}
                showButton={false}
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-neutral-500 dark:text-neutral-400 italic">
          No saved searches yet.
        </p>
      )}
    </div>
  );
} 