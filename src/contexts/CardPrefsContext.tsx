"use client";

import type React from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

/** Per-card display preferences, persisted to localStorage. */
export interface CardPrefs {
  /** When true, the skills/tools chip strip does not expand on card hover. */
  disableSkillsHoverExpansion: boolean;
  /** When true, the requirements/description block does not expand on card hover. */
  disableDescriptionHoverExpansion: boolean;
  /** When true, the locations chip strip does not expand on card hover. */
  disableLocationsHoverExpansion: boolean;
}

const STORAGE_KEY = "hiring-cafe-card-prefs";

const DEFAULT_PREFS: CardPrefs = {
  disableSkillsHoverExpansion: false,
  disableDescriptionHoverExpansion: false,
  disableLocationsHoverExpansion: false,
};

function parseStoredPrefs(stored: string): Partial<CardPrefs> | null {
  try {
    const parsed: unknown = JSON.parse(stored);
    if (typeof parsed !== "object" || parsed === null) return null;
    return parsed as Partial<CardPrefs>;
  } catch {
    return null;
  }
}

interface CardPrefsContextType {
  prefs: CardPrefs;
  setPref: <K extends keyof CardPrefs>(key: K, value: CardPrefs[K]) => void;
}

const CardPrefsContext = createContext<CardPrefsContextType | undefined>(undefined);

export function CardPrefsProvider({ children }: { children: React.ReactNode }) {
  // Start from defaults and hydrate from localStorage on mount (matches the
  // DarkModeContext pattern) so SSR markup and the first client render agree.
  const [prefs, setPrefs] = useState<CardPrefs>(DEFAULT_PREFS);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === null) return;
      const parsed = parseStoredPrefs(stored);
      if (parsed) {
        setPrefs({
          disableSkillsHoverExpansion: parsed.disableSkillsHoverExpansion === true,
          disableDescriptionHoverExpansion: parsed.disableDescriptionHoverExpansion === true,
          disableLocationsHoverExpansion: parsed.disableLocationsHoverExpansion === true,
        });
      }
    } catch {
      // Corrupt or unavailable storage: keep defaults.
    }
  }, []);

  const setPref = useCallback(<K extends keyof CardPrefs>(key: K, value: CardPrefs[K]) => {
    setPrefs((previous) => {
      const next = { ...previous, [key]: value };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore storage failures
      }
      return next;
    });
  }, []);

  const value = useMemo<CardPrefsContextType>(() => ({ prefs, setPref }), [prefs, setPref]);

  return <CardPrefsContext.Provider value={value}>{children}</CardPrefsContext.Provider>;
}

export function useCardPrefs() {
  const context = useContext(CardPrefsContext);
  if (context === undefined) {
    throw new Error("useCardPrefs must be used within a CardPrefsProvider");
  }
  return context;
}
