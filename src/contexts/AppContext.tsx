"use client";

import { JobStatus, User } from "@/types/app";
import { SearchState } from "@/types/search";
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react";
import { defaultSearchOptions } from "./SearchContext";

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
  name: "Test User",
  email: "test@gmail.com",
  skills: [
    "React",
    "Java",
    "Python",
    "C++",
    "C#",
    "Flask",
    "Node.js",
    "Git",
    "GitHub",
    "GitLab",
    "CI/CD",
    "OOP",

    "Next.js",
    "React Native",
    "Expo",
    "Vue.js",
    "HTML",
    "CSS",
    "SQL",
    "NoSQL",
    "JavaScript",
    "TypeScript",
    "Node.js",
    "Docker",
    "Kubernetes",
    "AWS",
    "Azure",
    "Linux",
    "iOS",
    "Android",
    "Swift",
    "Kotlin",
    "Flutter",
  ],
  savedSearches: [],
  saved: [
    "ashby___glide___7902b474-592f-4618-9c7c-23216d033bda",
    "ashby___ramp___83075cf0-9c22-4475-9c6b-e21923a96df8",
    "grnhse___affirm___6661800003",
    "smartrecruiters___paloaltonetworks2___9dd25fe8-bc0f-46ab-bd86-7976534bbc60",
    "workday___adobe-wd5-external_experienced___software-engineer_r157663-1",
  ],
  applied: ["ashby___ramp___a1229aec-1105-4c47-8533-b912e732ed89", "grnhse___pendo___8080105002", "smartrecruiters___oteemoinc___9b60020a-5548-42af-9052-7720fccff5a9"],
  interviewing: ["grnhse___stubhubinc___4633507101", "grnhse___stubhubinc___4648169101"],
  rejected: ["successfactors___com___hiitechnic___1313448700"],
  hidden: ["grnhse___dvtrading___4589615005"],
};

// localStorage key for user data
const USER_STORAGE_KEY = "hiring-cafe-user-data";

// Helper functions for localStorage
const saveUserToStorage = (user: User) => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    }
  } catch (error) {
    console.error("Failed to save user data to localStorage:", error);
  }
};

const loadUserFromStorage = (): User | null => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
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
      const storedUser = loadUserFromStorage();
      return storedUser || defaultUser;
    }
    return defaultUser;
  });

  // Search state
  const [searchOptions, setSearchOptions] = useState<SearchState>(defaultSearchOptions);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [currentSavedSearchId, setCurrentSavedSearchId] = useState<string | null>(null);

  // Save user data to localStorage whenever it changes (but not on initial render)
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
      }
      saveUserToStorage(user);
    }
  }, [user]);

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
