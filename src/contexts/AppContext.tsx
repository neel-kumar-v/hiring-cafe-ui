"use client";

import { JobStatus, User } from "@/types/app";
import { SearchState } from "@/types/search";
import { createContext, ReactNode, useContext, useState } from "react";
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
  saveCurrentSearch: (name?: string) => void;

  // Job state
  addJob: (jobId: string, status: "saved" | "applied" | "interviewing" | "rejected" | "hidden") => void;
  removeJob: (jobId: string, status: "saved" | "applied" | "interviewing" | "rejected" | "hidden") => void;
  moveJob: (jobId: string, fromStatus: "saved" | "applied" | "interviewing" | "rejected" | "hidden", toStatus: "saved" | "applied" | "interviewing" | "rejected" | "hidden") => void;
}



const defaultUser: User = {
  name: "Demo User",
  savedSearches: [],
  saved: [
    "successfactors___com___BNSF___1311623400",
    "ashby___tenex___3b828a98-6e81-4300-a966-eecd4da37a31",
    "jobvite___tylertech___owuxwfwN",
    "smartrecruiters___servicenow___eaba760e-a87d-46cf-a0c4-4cff07984f85",
    "grnhse___twitch___8093301002"
  ],
  applied: [
    "successfactors___com___BNSF___1310731800",
    "ashby___jerry___441a20b6-31e5-4887-8bfd-cc16a1e5bcae",
    "smartrecruiters___experian___f28ce494-9a36-4c53-9c1f-fd9935c5d5b0"
  ],
  interviewing: [
    "grnhse___stubhubinc___4633507101",
    "grnhse___nice___4645364101"
  ],
  rejected: [
    "successfactors___com___advanceameP___1311540100"
  ],
  hidden: [
    "jobvite___tylertech___oN5ywfwG"
  ]
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // User state
  const [user, setUser] = useState<User>(defaultUser);
  
  // Search state
  const [searchOptions, setSearchOptions] = useState<SearchState>(defaultSearchOptions);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [currentSavedSearchId, setCurrentSavedSearchId] = useState<string | null>(null);

  const updateSearchOptions = (updates: Partial<SearchState>) => {
    setSearchOptions(prev => {
      const newOptions = { ...prev, ...updates };
      
      // If we're editing a saved search, sync the changes
      if (currentSavedSearchId) {
        setUser(prevUser => ({
          ...prevUser,
          savedSearches: prevUser.savedSearches.map(search =>
            search.id === currentSavedSearchId
              ? { ...search, searchState: newOptions, modifiedAt: new Date() }
              : search
          )
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
    const newId = Date.now().toString();
    setUser(prev => {
      const newSearch = {
        id: newId,
        name,
        searchState: JSON.parse(JSON.stringify(searchOptions)),
        modifiedAt: new Date()
      };
      return {
        ...prev,
        savedSearches: [newSearch, ...prev.savedSearches]
      };
    });
    setCurrentSavedSearchId(newId);
    setHasUnsavedChanges(false);
  };

  const addJob = (jobId: string, status: JobStatus) => {
    setUser(prev => ({
      ...prev,
      [status]: [...prev[status], jobId]
    }));
  };

  const removeJob = (jobId: string, status: JobStatus) => {
    setUser(prev => ({
      ...prev,
      [status]: prev[status].filter(id => id !== jobId)
    }));
  };

  const moveJob = (jobId: string, fromStatus: JobStatus, toStatus: JobStatus) => {
    setUser(prev => ({
      ...prev,
      [fromStatus]: prev[fromStatus].filter(id => id !== jobId),
      [toStatus]: [...prev[toStatus], jobId]
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
        moveJob
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