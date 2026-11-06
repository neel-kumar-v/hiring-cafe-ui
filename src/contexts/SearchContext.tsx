"use client";

import { SearchState } from "@/types/search";
import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";

export const defaultSearchOptions: SearchState = {
  sort: { by: "Relevance", order: "Most" },
  date_range: { magnitude: 6, unit: "Months" },
  apply_form: "All",
  exclusion: [],
  activity_outcomes: {
    views: "All",
    applications: "All",
    saves: "All",
    reportedOutcomes: {
      interviews: false,
      offers: false,
      ghostProne: false,
      highRejection: false,
    },
  },
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
      address: { formatted: "New York, NY, USA", components: [] },
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

export type SearchMode = "classic" | "talent-agent";

/** Presentation of the browse results: masonry columns, uniform grid, or single-column list. */
export type JobBoardLayout = "masonry" | "grid" | "list";

interface SearchUIContextType {
  searchDialogOpen: boolean;
  setSearchDialogOpen: (open: boolean) => void;
  searchDialogFrom: string;
  setSearchDialogFrom: (from: string) => void;
  showLegacyFilters: boolean;
  setShowLegacyFilters: (show: boolean) => void;
  handleSearchIconClick: (category: string) => void;
  /** Header search text; drives the home job board query. */
  boardSearchQuery: string;
  setBoardSearchQuery: (value: string) => void;
  jobBoardSelectionMode: boolean;
  setJobBoardSelectionMode: (enabled: boolean) => void;

  /** "All" vs "Unread" board view for the jobs-labeled-New filter (BoardActions ↔ JobBoard). */
  unreadView: boolean;
  setUnreadView: (value: boolean) => void;
  /** Count of currently loaded board jobs that are New; published from JobBoard, read by BoardActions. */
  unreadCount: number;
  setUnreadCount: (count: number) => void;

  /** Jobs seen in this browsing session; seen jobs no longer display the New badge. */
  seenJobIds: Set<string>;
  markJobSeen: (idOrIds: string | string[]) => void;
  isJobSeen: (id?: string | null) => boolean;

  /** Layout of the browse results (BoardLayoutControl ↔ JobBoard). */
  boardLayout: JobBoardLayout;
  setBoardLayout: (layout: JobBoardLayout) => void;

  // New-design app shell (docs/redesign-structure-plan.md)
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  /** Demo talent-agent chat currently displayed in the chat rail. */
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
  /** Title shown centered in the navbar (active view name). */
  navbarTitle: string;
  setNavbarTitle: (title: string) => void;

  /** Active search experience mode: 'classic' keyword/filters vs 'talent-agent' AI prompt */
  searchMode: SearchMode;
  setSearchMode: (mode: SearchMode) => void;

  /**
   * Whether the shared search bar is currently showing its Location and
   * Compensation segments. FilterPillBar hides those chips while true so the
   * same control isn't rendered twice. Published by SearchBar from the same
   * width rules Autocomplete uses to show the segments.
   */
  searchBarShowsLocation: boolean;
  searchBarShowsSalary: boolean;
  setSearchBarSegments: (segments: { location: boolean; salary: boolean }) => void;
}

const SIDEBAR_STORAGE_KEY = "hiring-cafe-sidebar-open";
const SEARCH_MODE_STORAGE_KEY = "hiring-cafe-search-mode";
const BOARD_LAYOUT_STORAGE_KEY = "hiring-cafe-board-layout";
const SEEN_JOBS_STORAGE_KEY = "hiring-cafe-seen-jobs";
const BOARD_LAYOUTS: readonly JobBoardLayout[] = ["masonry", "grid", "list"];

function isBoardLayout(value: string | null): value is JobBoardLayout {
  return value !== null && BOARD_LAYOUTS.includes(value as JobBoardLayout);
}

function readStoredSeenJobs(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.sessionStorage.getItem(SEEN_JOBS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return new Set(parsed.filter((item): item is string => typeof item === "string" && Boolean(item)));
      }
    }
  } catch {
    // sessionStorage not available
  }
  return new Set();
}

function persistSeenJobs(seenSet: Set<string>): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(SEEN_JOBS_STORAGE_KEY, JSON.stringify(Array.from(seenSet)));
  } catch {
    // ignore
  }
}

const SearchUIContext = createContext<SearchUIContextType | undefined>(undefined);

export function SearchUIProvider({ children }: { children: ReactNode }) {
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [searchDialogFrom, setSearchDialogFrom] = useState("");
  const [showLegacyFilters, setShowLegacyFilters] = useState(true);
  const [boardSearchQuery, setBoardSearchQuery] = useState("");
  const [jobBoardSelectionMode, setJobBoardSelectionMode] = useState(false);
  const [unreadView, setUnreadView] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [seenJobIds, setSeenJobIds] = useState<Set<string>>(() => readStoredSeenJobs());

  const markJobSeen = useCallback((idOrIds: string | string[]) => {
    const ids = (Array.isArray(idOrIds) ? idOrIds : [idOrIds]).filter(Boolean);
    if (ids.length === 0) return;
    setSeenJobIds((previous) => {
      let changed = false;
      const next = new Set(previous);
      for (const id of ids) {
        if (!next.has(id)) {
          next.add(id);
          changed = true;
        }
      }
      if (!changed) return previous;
      persistSeenJobs(next);
      return next;
    });
  }, []);

  const isJobSeen = useCallback(
    (id?: string | null) => {
      return Boolean(id && seenJobIds.has(id));
    },
    [seenJobIds]
  );

  const [boardLayout, setBoardLayoutState] = useState<JobBoardLayout>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(BOARD_LAYOUT_STORAGE_KEY);
        if (isBoardLayout(stored)) return stored;
        // First visit on a phone: the one-column list is the mobile-native
        // presentation. Wider viewports open on grid.
        if (window.matchMedia?.("(max-width: 767px)").matches) return "list";
      } catch {
        return "grid";
      }
    }
    return "grid";
  });
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem(SIDEBAR_STORAGE_KEY) !== "false";
      } catch {
        return true;
      }
    }
    return true;
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [navbarTitle, setNavbarTitle] = useState("Home");
  const [searchBarShowsLocation, setSearchBarShowsLocation] = useState(false);
  const [searchBarShowsSalary, setSearchBarShowsSalary] = useState(false);
  const [searchMode, setSearchMode] = useState<SearchMode>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(SEARCH_MODE_STORAGE_KEY);
        if (stored === "talent-agent" || stored === "classic") {
          return stored;
        }
      } catch {
        return "classic";
      }
    }
    return "classic";
  });

  const handleSidebarOpenChange = (open: boolean) => {
    setSidebarOpen(open);
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, open ? "true" : "false");
    } catch {
      // ignore storage failures
    }
  };

  const handleSearchModeChange = (mode: SearchMode) => {
    // Mode only. Filters (`searchOptions`) stay as they are.
    setSearchMode(mode);
    try {
      localStorage.setItem(SEARCH_MODE_STORAGE_KEY, mode);
    } catch {
      // ignore storage failures
    }
  };

  const setSearchBarSegments = useCallback((segments: { location: boolean; salary: boolean }) => {
    setSearchBarShowsLocation((previous) => (previous === segments.location ? previous : segments.location));
    setSearchBarShowsSalary((previous) => (previous === segments.salary ? previous : segments.salary));
  }, []);

  const handleBoardLayoutChange = (layout: JobBoardLayout) => {
    setBoardLayoutState(layout);
    try {
      localStorage.setItem(BOARD_LAYOUT_STORAGE_KEY, layout);
    } catch {
      // ignore storage failures
    }
  };

  const handleSearchIconClick = (category: string) => {
    setSearchDialogFrom(category);
    setSearchDialogOpen(true);
  };

  const value = useMemo<SearchUIContextType>(
    () => ({
      searchDialogOpen,
      setSearchDialogOpen,
      searchDialogFrom,
      setSearchDialogFrom,
      showLegacyFilters,
      setShowLegacyFilters,
      handleSearchIconClick,
      boardSearchQuery,
      setBoardSearchQuery,
      jobBoardSelectionMode,
      setJobBoardSelectionMode,
      unreadView,
      setUnreadView,
      unreadCount,
      setUnreadCount,
      seenJobIds,
      markJobSeen,
      isJobSeen,
      boardLayout,
      setBoardLayout: handleBoardLayoutChange,
      sidebarOpen,
      setSidebarOpen: handleSidebarOpenChange,
      mobileSidebarOpen,
      setMobileSidebarOpen,
      chatOpen,
      setChatOpen,
      activeChatId,
      setActiveChatId,
      navbarTitle,
      setNavbarTitle,
      searchMode,
      setSearchMode: handleSearchModeChange,
      searchBarShowsLocation,
      searchBarShowsSalary,
      setSearchBarSegments,
    }),
    [
      searchDialogOpen,
      searchDialogFrom,
      showLegacyFilters,
      boardSearchQuery,
      jobBoardSelectionMode,
      unreadView,
      unreadCount,
      seenJobIds,
      markJobSeen,
      isJobSeen,
      boardLayout,
      sidebarOpen,
      mobileSidebarOpen,
      chatOpen,
      activeChatId,
      navbarTitle,
      searchMode,
      searchBarShowsLocation,
      searchBarShowsSalary,
      setSearchBarSegments,
    ]
  );

  return <SearchUIContext.Provider value={value}>{children}</SearchUIContext.Provider>;
}

export function useSearchUI() {
  const context = useContext(SearchUIContext);
  if (!context) {
    throw new Error("useSearchUI must be used within a SearchUIProvider");
  }
  return context;
}
