import { SearchState } from "@/types/search";
import { createContext, ReactNode, useContext, useState } from "react";

interface SearchContextType {
  searchOptions: SearchState;
  setSearchOptions: (options: SearchState) => void;
  updateSearchOptions: (updates: Partial<SearchState>) => void;
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  syncChanges: () => void;
}

const defaultSearchOptions: SearchState = {
  sort: { by: "Relevance", order: "Descending" },
  date_range: { magnitude: 30, unit: "Days" },
  apply_form: "All",
  exclusion: [],
  department: "All",
  salary: {
    range: { min: 0, max: 0 },
    unit: "Yearly",
    currency: "USD",
    undisclosed: false,
  },
  commitment: "All",
  experience: {
    level: "All",
    role: "None",
  },
  job_titles: {
    title: {},
    technical: {},
    description: {},
    requirements: {},
  },
  education: {
    preferences: null,
    keywords: { include: [], exclude: "None" },
  },
  license_certification: {
    hide_required: false,
    keywords: { include: [], exclude: "None" },
  },
  security_clearance: "All",
  language: { include: [], exclude: "None" },
  shift_preferences: {
    morning: null,
    afternoon: null,
    evening: null,
    weekend: "None",
    holiday: "None",
    overtime: "None",
    oncall: "None",
  },
  travel_requirements: {
    air: "All",
    land: "All",
  },
  benefits: null,
  encouraged: null,
  location: {
    defaultUserLocation: true,
    userLocation: {
      searched: false,
      id: "",
      types: [],
      address: { formatted: "", components: [] },
      geographical: { latitude: 0, longitude: 0 },
    },
    location: [],
    workplace_type: "Remote",
    environment: "Office",
    demands: {
      mobility: "Sitting",
      physical_intensity: "Low",
      cognitive_intensity: "Low",
      computer_usage: "Low",
      oral_communication: "Low",
    },
  },
  company: { include: [], exclude: "None" },
  industry: {
    profit: "All",
    activities: { include: [], exclude: "None" },
    industry: { include: [], exclude: "None" },
    usa_jobs: "All",
  },
  stage_funding: {
    current: "All",
    investors: { include: [], exclude: "None" },
    latest_round: { min: 0, max: 0 },
    latest_round_type: { include: [], exclude: "None" },
    latest_round_amount: { min: 0, max: 0 },
  },
  size: { min: 0, max: 0 },
  founding_year: { min: 0, max: 0 },
};

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchOptions, setSearchOptions] = useState<SearchState>(defaultSearchOptions);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const updateSearchOptions = (updates: Partial<SearchState>) => {
    setSearchOptions(prev => ({ ...prev, ...updates }));
    setHasUnsavedChanges(true);
  };

  const syncChanges = () => {
    setHasUnsavedChanges(false);
  };

  return (
    <SearchContext.Provider
      value={{
        searchOptions,
        setSearchOptions,
        updateSearchOptions,
        hasUnsavedChanges,
        setHasUnsavedChanges,
        syncChanges,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
} 