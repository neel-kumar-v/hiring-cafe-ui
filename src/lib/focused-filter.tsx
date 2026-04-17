"use client";

import { createContext, type ReactNode, useContext, useMemo, useState } from "react";

type FocusedFilterContextValue = {
  focusedFilterId: string | null;
  setFocusedFilterId: (id: string | null) => void;
};

const FocusedFilterContext = createContext<FocusedFilterContextValue | null>(null);

export function FocusedFilterProvider({ children }: { children: ReactNode }) {
  const [focusedFilterId, setFocusedFilterId] = useState<string | null>(null);

  const value = useMemo(
    () => ({ focusedFilterId, setFocusedFilterId }),
    [focusedFilterId]
  );

  return (
    <FocusedFilterContext.Provider value={value}>
      {children}
    </FocusedFilterContext.Provider>
  );
}

export function useFocusedFilter(): FocusedFilterContextValue {
  const context = useContext(FocusedFilterContext);

  if (!context) {
    throw new Error("useFocusedFilter must be used within a FocusedFilterProvider");
  }

  return context;
}
