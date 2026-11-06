"use client";

import type React from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type ThemeMode = "light" | "dark" | "system";

/** Stored theme mode: explicit light/dark, or follow the OS. */
const THEME_STORAGE_KEY = "theme";
/** Legacy boolean storage ("true"/"false" JSON) from before `theme` existed. */
const LEGACY_DARK_MODE_STORAGE_KEY = "darkMode";

function isThemeMode(value: unknown): value is ThemeMode {
  return value === "light" || value === "dark" || value === "system";
}

function readStoredMode(): ThemeMode | null {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (isThemeMode(stored)) return stored;
    // One-time migration from the legacy boolean key.
    const legacy = localStorage.getItem(LEGACY_DARK_MODE_STORAGE_KEY);
    if (legacy !== null) {
      let mode: ThemeMode = "dark";
      try {
        mode = JSON.parse(legacy) ? "dark" : "light";
      } catch {
        // Keep the dark default for unparseable legacy values.
      }
      localStorage.setItem(THEME_STORAGE_KEY, mode);
      localStorage.removeItem(LEGACY_DARK_MODE_STORAGE_KEY);
      return mode;
    }
  } catch {
    // localStorage unavailable (private mode, etc.) — fall through.
  }
  return null;
}

interface DarkModeContextType {
  /** Stored mode: `light`, `dark`, or `system` (follows the OS). */
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  /** Resolved boolean — `theme === "system"` resolves via `prefers-color-scheme`. */
  isDarkMode: boolean;
  /** Set an explicit light/dark mode (leaves `system` if currently active). */
  setIsDarkMode: (darkMode: boolean) => void;
  toggleDarkMode: () => void;
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  // Preserve the historical default (dark) until the stored value hydrates.
  const [theme, setThemeState] = useState<ThemeMode>("dark");
  const [systemDark, setSystemDark] = useState(true);

  // Initialize the stored mode and track OS `prefers-color-scheme` changes.
  useEffect(() => {
    const storedMode = readStoredMode();
    if (storedMode) {
      setThemeState(storedMode);
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemDark(mediaQuery.matches);
    const onSystemChange = (event: MediaQueryListEvent) => {
      setSystemDark(event.matches);
    };
    mediaQuery.addEventListener("change", onSystemChange);
    return () => mediaQuery.removeEventListener("change", onSystemChange);
  }, []);

  // Persist the mode whenever it changes.
  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage failures.
    }
  }, [theme]);

  const isDarkMode = theme === "system" ? systemDark : theme === "dark";

  // Apply the resolved mode to the document.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const setTheme = (next: ThemeMode) => setThemeState(next);

  const setIsDarkMode = (darkMode: boolean) => {
    setThemeState(darkMode ? "dark" : "light");
  };

  const toggleDarkMode = () => {
    setThemeState(isDarkMode ? "light" : "dark");
  };

  const value = useMemo(() => ({ theme, setTheme, isDarkMode, setIsDarkMode, toggleDarkMode }), [theme, isDarkMode]);

  return <DarkModeContext.Provider value={value}>{children}</DarkModeContext.Provider>;
}

export function useDarkMode() {
  const context = useContext(DarkModeContext);
  if (context === undefined) {
    throw new Error("useDarkMode must be used within a DarkModeProvider");
  }
  return context;
}
