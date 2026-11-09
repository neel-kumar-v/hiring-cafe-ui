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
  /** When true, every element loses its border radius. */
  squareCorners: boolean;
  /** When true, menu highlights linger so the previous row trails the next. */
  hoverTrail: boolean;
  /** When true, the floating card-settings control stays off until the shortcut. */
  floatingToolbarHidden: boolean;
  /**
   * When true, every talent-agent / chat / AI search surface is hidden and
   * the app stays on classic search only.
   */
  noAi: boolean;
}

const STORAGE_KEY = "hiring-cafe-card-prefs";
const SQUARE_CORNERS_STYLE_ID = "card-prefs-square-corners-style";

/*
 * Copy of the globals.css square-corners reset, injected at the END of <head>
 * while the preference is on. Reason it exists: Tailwind v4 emits utilities
 * inside `@layer utilities`, and per the CSS cascade the `!important` order of
 * layers is REVERSED — layered important beats unlayered important, so
 * utilities like `last:rounded-b-sm!` defeat any unlayered `border-radius: 0
 * !important` rule in globals.css. A `@layer` first declared in this injected
 * sheet sorts after every layer declared earlier (theme, base, components,
 * utilities), so the important declarations inside it win over important
 * utilities. The unlayered copy below is a belt-and-braces fallback for
 * environments that resolve layers differently.
 */
const SQUARE_CORNERS_CSS = `
@layer card-prefs-square {
  html.square-corners {
    --radius: 0px;
    --radius-xs: 0px;
    --radius-sm: 0px;
    --radius-md: 0px;
    --radius-lg: 0px;
    --radius-xl: 0px;
    --radius-2xl: 0px;
    --radius-3xl: 0px;
    --radius-4xl: 0px;
  }
  html.square-corners,
  html.square-corners * {
    border-radius: 0 !important;
    border-top-left-radius: 0 !important;
    border-top-right-radius: 0 !important;
    border-bottom-right-radius: 0 !important;
    border-bottom-left-radius: 0 !important;
    border-start-start-radius: 0 !important;
    border-start-end-radius: 0 !important;
    border-end-start-radius: 0 !important;
    border-end-end-radius: 0 !important;
  }
}
html.square-corners {
  --radius: 0px;
  --radius-xs: 0px;
  --radius-sm: 0px;
  --radius-md: 0px;
  --radius-lg: 0px;
  --radius-xl: 0px;
  --radius-2xl: 0px;
  --radius-3xl: 0px;
  --radius-4xl: 0px;
}
html.square-corners,
html.square-corners * {
  border-radius: 0 !important;
  border-top-left-radius: 0 !important;
  border-top-right-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
  border-bottom-left-radius: 0 !important;
  border-start-start-radius: 0 !important;
  border-start-end-radius: 0 !important;
  border-end-start-radius: 0 !important;
  border-end-end-radius: 0 !important;
}
`;

/** First visit: every hover expansion is on, the menu trail is on, corners stay rounded. */
const DEFAULT_PREFS: CardPrefs = {
  disableSkillsHoverExpansion: false,
  disableDescriptionHoverExpansion: false,
  disableLocationsHoverExpansion: false,
  squareCorners: false,
  hoverTrail: true,
  floatingToolbarHidden: false,
  noAi: false,
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
          squareCorners: parsed.squareCorners === true,
          hoverTrail: parsed.hoverTrail !== false,
          floatingToolbarHidden: parsed.floatingToolbarHidden === true,
          noAi: parsed.noAi === true,
        });
      }
    } catch {
      // Corrupt or unavailable storage: keep defaults.
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("square-corners", prefs.squareCorners);
    root.classList.toggle("hover-trail", prefs.hoverTrail);

    // Square corners must also beat Tailwind's layered `!`-important radius
    // utilities (see SQUARE_CORNERS_CSS above), so inject a stylesheet at the
    // end of <head> while the preference is on and remove it when off.
    if (prefs.squareCorners) {
      if (!document.getElementById(SQUARE_CORNERS_STYLE_ID)) {
        const style = document.createElement("style");
        style.id = SQUARE_CORNERS_STYLE_ID;
        style.textContent = SQUARE_CORNERS_CSS;
        document.head.appendChild(style);
      }
    } else {
      document.getElementById(SQUARE_CORNERS_STYLE_ID)?.remove();
    }
  }, [prefs.squareCorners, prefs.hoverTrail]);

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
