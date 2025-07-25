import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSearch } from "@/contexts/SearchContext";
import { useUser } from "@/contexts/UserContext";
import { CategoryId } from "@/types/search";
import { Calendar, Edit, Eye, Plus, Search } from "lucide-react";
import { useRef, useState } from "react";
import { AllFilter } from "../util/AllFilter";

export default function SavedSearches() {
  const { searchOptions, setSearchOptions } = useSearch();
  const { user, setUser } = useUser();
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
    setUser(prev => ({
      ...prev,
      savedSearches: prev.savedSearches.map(search =>
        search.id === id ? { ...search, name: editingName, modifiedAt: new Date() } : search
      )
    }));
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

  const handleLoadSearch = (search: typeof user.savedSearches[number]) => {
    setSearchOptions(search.searchState);
  };

  const handleCategoryClick = (categoryId: CategoryId) => {
    console.log("Category clicked:", categoryId);
  };

  const handleSaveSearch = () => {
    const newId = Date.now().toString();
    setUser(prev => {
      const newSearch = {
        id: newId,
        name: "New Search",
        searchState: JSON.parse(JSON.stringify(searchOptions)),
        modifiedAt: new Date()
      };
      setTimeout(() => {
        handleEditStart(newId, "New Search");
      }, 0);
      return {
        ...prev,
        savedSearches: [newSearch, ...prev.savedSearches]
      };
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="font-semibold text-lg text-text">Saved Searches</p>
        <Button size="sm" variant="default" onClick={handleSaveSearch}>
          <Plus className="size-4 mr-1" /> Save Search
        </Button>
      </div>
      {user.savedSearches.length === 0 ? (
        <p className="text-muted-foreground text-sm">No saved searches yet. Create your first search to see it here.</p>
      ) : (
        <div className="space-y-3">
          {user.savedSearches.map((search) => (
            <div
              key={search.id}
              className="group flex items-center justify-between mt-3 border-b border-border/20 last-of-type:border-b-0"
            >
              <div className="flex-1 min-w-0">
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
                    className="w-full bg-transparent border-none outline-none text-text font-medium"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <span
                      className="font-medium text-text cursor-pointer hover:underline transition-colors"
                      onClick={() => handleEditStart(search.id, search.name)}
                    >
                      {search.name}
                    </span>
                    <button
                      onClick={() => handleEditStart(search.id, search.name)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-accent rounded"
                    >
                      <Edit className="size-3 text-muted-foreground hover:text-text" />
                    </button>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1 flex items-center">
                  <Calendar className="size-3 mr-1" /> {search.modifiedAt instanceof Date ? search.modifiedAt.toLocaleDateString() : new Date(search.modifiedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="flex items-center gap-1 pointer-none:hidden max-sm:hidden"
                    >
                      <Eye className="size-3" />
                      View Search
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left" align="start" className="w-80 max-h-none overflow-y-auto p-0">
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 