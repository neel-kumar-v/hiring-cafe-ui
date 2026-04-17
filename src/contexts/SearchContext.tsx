"use client";

import { SearchState } from "@/types/search";
import { createContext, ReactNode, useContext, useState } from "react";

export const defaultSearchOptions: SearchState = {
  sort: { by: "Relevance", order: "Most" },
  date_range: { magnitude: 30, unit: "Days" },
  apply_form: "All",
  exclusion: [],
  department: "All",
  salary: {
    min_range: { min: 0, max: 0 },
    max_range: { min: 0, max: 0 },
    listedUnit: "Any",
    unit: "Yearly",
    currency: "USD",
    undisclosed: false,
  },
  commitment: "All",
  experience: {
    level: "All",
    role: "All",
    individualContributor: null,
    peopleManager: null,
  },
  job_titles: {
    title: {},
    technical: {},
    description: {},
    requirements: {},
  },
  education: {
    associate: {
      preferences: null,
      keywords: { include: [], exclude: "None" },
    },
    bachelor: {
      preferences: null,
      keywords: { include: [], exclude: "None" },
    },
    master: {
      preferences: null,
      keywords: { include: [], exclude: "None" },
    },
    doctorate: {
      preferences: null,
      keywords: { include: [], exclude: "None" },
    },
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
    night: null,
    weekend: "None",
    holiday: "None",
    overtime: "None",
    oncall: "All",
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
      address: { formatted: "Chester Springs, PA, USA", components: [] },
      geographical: { latitude: 0, longitude: 0 },
    },
    location: [],
    workplace_type: "All",
    workplace_activity: {
      environment: "All",
      mobility: "All",
      physical_intensity: "All",
      cognitive_intensity: "All",
      computer_usage: "All",
      oral_communication: "All",
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
  size: "All",
  founding_year: { min: 0, max: 0 },
};

interface SearchUIContextType {
  searchDialogOpen: boolean;
  setSearchDialogOpen: (open: boolean) => void;
  searchDialogFrom: string;
  setSearchDialogFrom: (from: string) => void;
  showFilterRibbon: boolean;
  setShowFilterRibbon: (show: boolean) => void;
  showLegacyFilters: boolean;
  setShowLegacyFilters: (show: boolean) => void;
  handleSearchIconClick: (category: string) => void;
  /** Header search text; drives the home job board query. */
  boardSearchQuery: string;
  setBoardSearchQuery: (value: string) => void;
}

const SearchUIContext = createContext<SearchUIContextType | undefined>(undefined);

export function SearchUIProvider({ children }: { children: ReactNode }) {
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [searchDialogFrom, setSearchDialogFrom] = useState("");
  const [showFilterRibbon, setShowFilterRibbon] = useState(true);
  const [showLegacyFilters, setShowLegacyFilters] = useState(false);
  const [boardSearchQuery, setBoardSearchQuery] = useState("");

  const handleSearchIconClick = (category: string) => {
    setSearchDialogFrom(category);
    setSearchDialogOpen(true);
  };

  return (
    <SearchUIContext.Provider
      value={{
        searchDialogOpen,
        setSearchDialogOpen,
        searchDialogFrom,
        setSearchDialogFrom,
        showFilterRibbon,
        setShowFilterRibbon,
        showLegacyFilters,
        setShowLegacyFilters,
        handleSearchIconClick,
        boardSearchQuery,
        setBoardSearchQuery,
      }}
    >
      {children}
    </SearchUIContext.Provider>
  );
}

export function useSearchUI() {
  const context = useContext(SearchUIContext);
  if (context === undefined) {
    throw new Error("useSearchUI must be used within a SearchUIProvider");
  }
  return context;
} 
