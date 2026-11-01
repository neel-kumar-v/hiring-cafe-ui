"use client";

import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from "react";

type FocusedFilterIdContextValue = {
  focusedFilterId: string | null;
  setFocusedFilterId: (id: string | null) => void;
};

type FilterSearchQueryContextValue = {
  filterSearchQuery: string;
  setFilterSearchQuery: (query: string) => void;
};

const FocusedFilterIdContext = createContext<FocusedFilterIdContextValue | null>(null);

/** Stable empty query — use around desktop filter panels so typing in sidebar search does not re-render filters. */
export const EMPTY_FILTER_SEARCH_QUERY: FilterSearchQueryContextValue = {
  filterSearchQuery: "",
  setFilterSearchQuery: () => {},
};

const FilterSearchQueryContext = createContext<FilterSearchQueryContextValue>(EMPTY_FILTER_SEARCH_QUERY);

export function FocusedFilterProvider({ children }: { children: ReactNode }) {
  const [focusedFilterId, setFocusedFilterIdState] = useState<string | null>(null);

  const setFocusedFilterId = useCallback((id: string | null) => {
    setFocusedFilterIdState(id);
  }, []);

  const focusedValue = useMemo(() => ({ focusedFilterId, setFocusedFilterId }), [focusedFilterId, setFocusedFilterId]);

  return <FocusedFilterIdContext.Provider value={focusedValue}>{children}</FocusedFilterIdContext.Provider>;
}

export function FilterSearchQueryProvider({ children, value }: { children: ReactNode; value: FilterSearchQueryContextValue }) {
  return <FilterSearchQueryContext.Provider value={value}>{children}</FilterSearchQueryContext.Provider>;
}

export function useFocusedFilterId(): FocusedFilterIdContextValue {
  const context = useContext(FocusedFilterIdContext);
  if (!context) {
    throw new Error("useFocusedFilterId must be used within a FocusedFilterProvider");
  }
  return context;
}

export function useFilterSearchQuery(): FilterSearchQueryContextValue {
  return useContext(FilterSearchQueryContext);
}

/** Subscribes to both focused id and filter search query (sidebar / dialog chrome). */
export function useFocusedFilter() {
  return { ...useFocusedFilterId(), ...useFilterSearchQuery() };
}
