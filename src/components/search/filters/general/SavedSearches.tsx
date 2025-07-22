import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSearch } from "@/contexts/SearchContext";
import { CategoryId, SearchState } from "@/types/search";
import { Calendar, Edit, Eye, Search } from "lucide-react";
import { useState } from "react";
import { AllFilter } from "../util/AllFilter";

interface SavedSearch {
  id: string;
  name: string;
  searchState: SearchState;
  createdAt: Date;
}

export default function SavedSearches() {
  const { setSearchOptions } = useSearch();
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([
    {
      id: "1",
      name: "Software Engineer Remote",
      searchState: {
        sort: { by: "Relevance", order: "Most" },
        date_range: { magnitude: 7, unit: "Days" },
        apply_form: "All",
        exclusion: [],
        benefits: [],
        encouraged: [],
        department: "All",
        salary: { min_range: { min: 80000, max: 90000 }, max_range: { min: 120000, max: 150000 }, listedUnit: "Yearly", unit: "Yearly", currency: "USD", undisclosed: false },
        commitment: "All",
        experience: { level: "All", role: "None" },
        job_titles: { 
          title: "Software Engineer", 
          technical: {
            AND: [
              "Git",
              "Go",
              {
                NOT: {
                  OR: ["excel", "word", "outlook"]
                }
              }
            ]
          }, 
          description: "", 
          requirements: "" 
        },
        education: {
          associate: { preferences: null, keywords: { include: [], exclude: "None" } },
          bachelor: { preferences: null, keywords: { include: [], exclude: "None" } },
          master: { preferences: null, keywords: { include: [], exclude: "None" } },
          doctorate: { preferences: null, keywords: { include: [], exclude: "None" } }
        },
        license_certification: { hide_required: false, keywords: { include: [], exclude: "None" } },
        security_clearance: [],
        language: { include: [], exclude: "None" },
        shift_preferences: {
          morning: null,
          afternoon: null,
          evening: null,
          weekend: "None",
          holiday: "None",
          overtime: "None",
          oncall: "None"
        },
        travel_requirements: { air: "All", land: "All" },
        location: {
          defaultUserLocation: false,
          userLocation: {
            searched: false,
            id: "",
            types: [],
            address: { formatted: "", components: [] },
            geographical: { latitude: 0, longitude: 0 }
          },
          location: [],
          workplace_type: ["Remote"],
          environment: "All",
          demands: {
            mobility: "All",
            physical_intensity: "All",
            cognitive_intensity: "All",
            computer_usage: "All",
            oral_communication: "All"
          }
        },
        company: { include: [], exclude: "None" },
        industry: {
          profit: "All",
          activities: { include: [], exclude: "None" },
          industry: { include: [], exclude: "None" },
          usa_jobs: "All"
        },
        stage_funding: {
          current: "All",
          investors: { include: [], exclude: "None" },
          latest_round: { min: 0, max: 0 },
          latest_round_type: { include: [], exclude: "None" },
          latest_round_amount: { min: 0, max: 0 }
        },
        size: { min: 0, max: 0 },
        founding_year: { min: 0, max: 0 }
      },
      createdAt: new Date("2024-01-15")
    },
    {
      id: "2", 
      name: "Data Scientist Entry Level",
      searchState: {
        sort: { by: "Recency", order: "Most" },
        date_range: { magnitude: 30, unit: "Days" },
        apply_form: "Fast",
        exclusion: [],
        benefits: [],
        encouraged: [],
        department: ["Data and Analytics"],
        salary: { min_range: { min: 60000, max: 90000 }, max_range: { min: 120000, max: 150000 }, listedUnit: "Yearly", unit: "Yearly", currency: "USD", undisclosed: false },
        commitment: ["Full Time"],
        experience: { level: ["Entry Level"], role: "None" },
        job_titles: { title: "Data Scientist", technical: "Python SQL", description: "", requirements: "" },
        education: {
          associate: { preferences: null, keywords: { include: [], exclude: "None" } },
          bachelor: { preferences: ["Required"], keywords: { include: ["Computer Science", "Statistics"], exclude: "None" } },
          master: { preferences: ["Preferred"], keywords: { include: [], exclude: "None" } },
          doctorate: { preferences: null, keywords: { include: [], exclude: "None" } }
        },
        license_certification: { hide_required: false, keywords: { include: [], exclude: "None" } },
        security_clearance: [],
        language: { include: [], exclude: "None" },
        shift_preferences: {
          morning: null,
          afternoon: null,
          evening: null,
          weekend: "None",
          holiday: "None",
          overtime: "None",
          oncall: "None"
        },
        travel_requirements: { air: "All", land: "All" },
        location: {
          defaultUserLocation: true,
          userLocation: {
            searched: false,
            id: "",
            types: [],
            address: { formatted: "", components: [] },
            geographical: { latitude: 0, longitude: 0 }
          },
          location: [],
          workplace_type: "All",
          environment: "All",
          demands: {
            mobility: "All",
            physical_intensity: "All",
            cognitive_intensity: "All",
            computer_usage: "All",
            oral_communication: "All"
          }
        },
        company: { include: [], exclude: "None" },
        industry: {
          profit: "All",
          activities: { include: [], exclude: "None" },
          industry: { include: [], exclude: "None" },
          usa_jobs: "All"
        },
        stage_funding: {
          current: "All",
          investors: { include: [], exclude: "None" },
          latest_round: { min: 0, max: 0 },
          latest_round_type: { include: [], exclude: "None" },
          latest_round_amount: { min: 0, max: 0 }
        },
        size: { min: 0, max: 0 },
        founding_year: { min: 0, max: 0 }
      },
      createdAt: new Date("2024-01-10")
    }
  ]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const handleEditStart = (search: SavedSearch) => {
    setEditingId(search.id);
    setEditingName(search.name);
  };

  const handleEditSave = (id: string) => {
    setSavedSearches(prev => 
      prev.map(search => 
        search.id === id 
          ? { ...search, name: editingName }
          : search
      )
    );
    setSavedSearches(prev =>
      prev.map(search =>
        search.id === id
          ? { ...search, name: editingName, createdAt: new Date() }
          : search
      )
    );
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

  const handleLoadSearch = (search: SavedSearch) => {
    setSearchOptions(search.searchState);
  };

  const handleCategoryClick = (categoryId: CategoryId) => {
    console.log("Category clicked:", categoryId);
  };

  return (
    <div>
      <p className="font-semibold text-lg text-text">Saved Searches</p>
      
      {savedSearches.length === 0 ? (
        <p className="text-muted-foreground text-sm">No saved searches yet. Create your first search to see it here.</p>
      ) : (
        <div className="space-y-3">
          {savedSearches.map((search) => (
            <div
              key={search.id}
              className="group flex items-center justify-between mt-3 border-b border-border/20 last-of-type:border-b-0"
            >
              <div className="flex-1 min-w-0">
                {editingId === search.id ? (
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, search.id)}
                    onBlur={() => handleEditSave(search.id)}
                    className="w-full bg-transparent border-none outline-none text-text font-medium"
                    autoFocus
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <span 
                      className="font-medium text-text cursor-pointer hover:underline transition-colors"
                      onDoubleClick={() => handleEditStart(search)}
                    >
                      {search.name}
                    </span>
                    <button
                      onClick={() => handleEditStart(search)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-accent rounded"
                    >
                      <Edit className="size-3 text-muted-foreground hover:text-text" />
                    </button>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1 flex items-center">
                  <Calendar className="size-3 mr-1" /> {search.createdAt.toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <Tooltip >
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