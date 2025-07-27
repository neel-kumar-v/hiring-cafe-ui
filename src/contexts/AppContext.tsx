"use client";

import { SearchState } from "@/types/search";
import { User } from "@/types/user";
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
}



const defaultUser: User = {
  name: "Demo User",
  savedSearches: []
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
        saveCurrentSearch
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