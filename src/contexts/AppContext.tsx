"use client";

import { JobStatus, User } from "@/types/app";
import { SearchState } from "@/types/search";
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react";
import { defaultSearchOptions } from "./SearchContext";
import { getAuthEmail, onAuthChanged } from "@/lib/local-auth";
import { decodeSearchState, encodeSearchState } from "@/lib/url-search-state";

interface AppContextType {
  // User state
  user: User;
  setUser: (user: User) => void;

  // Search state
  searchOptions: SearchState;
  setSearchOptions: (options: SearchState) => void;
  updateSearchOptions: (updates: Partial<SearchState>) => void;
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  syncChanges: () => void;

  // Combined functionality
  currentSavedSearchId: string | null;
  setCurrentSavedSearchId: (id: string | null) => void;
  saveCurrentSearch: (name?: string) => string;

  // Job state
  addJob: (jobId: string, status: "saved" | "applied" | "interviewing" | "rejected" | "hidden") => void;
  removeJob: (jobId: string, status: "saved" | "applied" | "interviewing" | "rejected" | "hidden") => void;
  moveJob: (
    jobId: string,
    fromStatus: "saved" | "applied" | "interviewing" | "rejected" | "hidden",
    toStatus: "saved" | "applied" | "interviewing" | "rejected" | "hidden"
  ) => void;

  // Skill management
  addSkill: (skill: string) => void;
  removeSkill: (skill: string) => void;
}

const defaultUser: User = {
  name: "Guest",
  email: "",
  skills: [],
  savedSearches: [],
  saved: [],
  applied: [],
  interviewing: [],
  rejected: [],
  hidden: [],
};

function getUserStorageKey(email: string | null) {
  const normalized = (email ?? "").trim().toLowerCase();
  return normalized ? `hiring-cafe-user-data:${normalized}` : "hiring-cafe-user-data:guest";
}

// Helper functions for localStorage
const saveUserToStorage = (user: User, email: string | null) => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem(getUserStorageKey(email), JSON.stringify(user));
    }
  } catch (error) {
    console.error("Failed to save user data to localStorage:", error);
  }
};

const loadUserFromStorage = (email: string | null): User | null => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const stored = localStorage.getItem(getUserStorageKey(email));
      if (stored) {
        return JSON.parse(stored);
      }
    }
  } catch (error) {
    console.error("Failed to load user data from localStorage:", error);
  }
  return null;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // User state - initialize from localStorage or use default
  const [user, setUser] = useState<User>(() => {
    if (typeof window !== "undefined") {
      const email = getAuthEmail();
      const storedUser = loadUserFromStorage(email);
      return storedUser || { ...defaultUser, email: email ?? "" };
    }
    return defaultUser;
  });

  // Search state
  const [searchOptions, setSearchOptions] = useState<SearchState>(defaultSearchOptions);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [currentSavedSearchId, setCurrentSavedSearchId] = useState<string | null>(null);

  // Save user data to localStorage whenever it changes (but not on initial render)
  const isFirstRender = useRef(true);
  const hasHydratedSearchStateRef = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
      }
      saveUserToStorage(user, getAuthEmail());
    }
  }, [user]);

  // --- URL <-> searchOptions sync ---
  const lastAppliedUrlStateRef = useRef<string | null>(null);
  const lastWrittenUrlStateRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const applyStateFromUrl = () => {
      const raw = new URLSearchParams(window.location.search).get("searchState");
      hasHydratedSearchStateRef.current = true;

      if (!raw) {
        lastAppliedUrlStateRef.current = null;
        return;
      }

      if (raw === lastAppliedUrlStateRef.current) return;

      const decoded = decodeSearchState(raw);
      if (!decoded) return;

      lastAppliedUrlStateRef.current = raw;
      lastWrittenUrlStateRef.current = raw;
      setSearchOptions(decoded);
    };

    applyStateFromUrl();
    window.addEventListener("popstate", applyStateFromUrl);
    return () => window.removeEventListener("popstate", applyStateFromUrl);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !hasHydratedSearchStateRef.current) return;

    const raw = encodeSearchState(searchOptions);
    if (raw === lastWrittenUrlStateRef.current) return;

    const id = window.setTimeout(() => {
      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.set("searchState", raw);

      lastWrittenUrlStateRef.current = raw;
      lastAppliedUrlStateRef.current = raw;
      window.history.replaceState(window.history.state, "", nextUrl);
    }, 250);

    return () => window.clearTimeout(id);
  }, [searchOptions]);

  // When the local-dev auth email changes, swap to the corresponding profile.
  useEffect(() => {
    return onAuthChanged(() => {
      const email = getAuthEmail();
      const stored = loadUserFromStorage(email);
      setUser(stored || { ...defaultUser, email: email ?? "" });
    });
  }, []);

  const updateSearchOptions = (updates: Partial<SearchState>) => {
    setSearchOptions((prev) => {
      const newOptions = { ...prev, ...updates };

      // If we're editing a saved search, sync the changes
      if (currentSavedSearchId) {
        setUser((prevUser) => ({
          ...prevUser,
          savedSearches: prevUser.savedSearches.map((search) => (search.id === currentSavedSearchId ? { ...search, searchState: newOptions, modifiedAt: new Date() } : search)),
        }));
      }

      return newOptions;
    });
    setHasUnsavedChanges(true);
  };

  const syncChanges = () => {
    setHasUnsavedChanges(false);
  };

  const saveCurrentSearch = (name: string = "New Search") => {
    // If we're currently editing a saved search, first save any changes to it
    if (currentSavedSearchId) {
      setUser((prevUser) => ({
        ...prevUser,
        savedSearches: prevUser.savedSearches.map((search) =>
          search.id === currentSavedSearchId ? { ...search, searchState: JSON.parse(JSON.stringify(searchOptions)), modifiedAt: new Date() } : search
        ),
      }));
    }

    // Create a new saved search
    const newId = Date.now().toString();
    setUser((prev) => {
      const newSearch = {
        id: newId,
        name,
        searchState: JSON.parse(JSON.stringify(searchOptions)),
        modifiedAt: new Date(),
      };
      return {
        ...prev,
        savedSearches: [newSearch, ...prev.savedSearches],
      };
    });

    // Switch to editing the new saved search
    setCurrentSavedSearchId(newId);
    setHasUnsavedChanges(false);

    return newId;
  };

  const addJob = (jobId: string, status: JobStatus) => {
    setUser((prev) => ({
      ...prev,
      [status]: [...prev[status], jobId],
    }));
  };

  const removeJob = (jobId: string, status: JobStatus) => {
    setUser((prev) => ({
      ...prev,
      [status]: prev[status].filter((id) => id !== jobId),
    }));
  };

  const moveJob = (jobId: string, fromStatus: JobStatus, toStatus: JobStatus) => {
    setUser((prev) => {
      // If moving from same status to same status, just return current state
      if (fromStatus === toStatus) {
        return prev;
      }

      return {
        ...prev,
        [fromStatus]: prev[fromStatus].filter((id) => id !== jobId),
        [toStatus]: [...prev[toStatus], jobId],
      };
    });
  };

  const addSkill = (skill: string) => {
    setUser((prev) => ({
      ...prev,
      skills: [...prev.skills, skill].filter((s, i, arr) => arr.indexOf(s) === i), // Remove duplicates
    }));
  };

  const removeSkill = (skill: string) => {
    setUser((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  return (
    <AppContext.Provider
      value={{
        // User state
        user,
        setUser,

        // Search state
        searchOptions,
        setSearchOptions,
        updateSearchOptions,
        hasUnsavedChanges,
        setHasUnsavedChanges,
        syncChanges,

        // Combined functionality
        currentSavedSearchId,
        setCurrentSavedSearchId,
        saveCurrentSearch,

        // Job state
        addJob,
        removeJob,
        moveJob,

        // Skill management
        addSkill,
        removeSkill,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
