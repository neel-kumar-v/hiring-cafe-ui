"use client";

import { useSearchUI, type SearchMode } from "@/contexts/SearchContext";
import { cn } from "@/lib/utils";
import { Search, Sparkles } from "lucide-react";
import { SlidingTabs, type SlidingTabOption } from "@/components/ui/sliding-tabs";

interface SearchModeToggleProps {
  className?: string;
  value?: SearchMode;
  onChange?: (mode: SearchMode) => void;
  size?: "xs" | "sm" | "md";
}

const SEARCH_MODE_OPTIONS: readonly SlidingTabOption<SearchMode>[] = [
  {
    id: "talent-agent",
    label: (
      <span className="inline-flex items-center gap-1.5 leading-none">
        <Sparkles className="size-3.5 sm:size-4 text-pink-600 dark:text-pink-400 shrink-0" />
        <span className="leading-none">Talent Agent</span>
      </span>
    ),
    ariaLabel: "Talent Agent search mode",
  },
  {
    id: "classic",
    label: (
      <span className="inline-flex items-center gap-1.5 leading-none">
        <Search className="size-3.5 sm:size-4 shrink-0" />
        <span className="leading-none">Classic Search</span>
      </span>
    ),
    ariaLabel: "Classic Search mode",
  },
];

/**
 * Segmented control toggle embedded inline inside the SearchBar pill.
 * Offers "Talent Agent" (AI prompt) and "Classic Search" (keyword + filters).
 */
export default function SearchModeToggle({ className, value, onChange, size = "md" }: SearchModeToggleProps) {
  const { searchMode: contextMode, setSearchMode: setContextMode } = useSearchUI();
  const currentMode = value ?? contextMode;
  const setMode = onChange ?? setContextMode;

  return (
    <SlidingTabs<SearchMode>
      ariaLabel="Search mode"
      role="radiogroup"
      shape="pill"
      tone="pill"
      size={size}
      value={currentMode}
      onChange={setMode}
      options={SEARCH_MODE_OPTIONS}
      className={cn("select-none shrink-0", className)}
    />
  );
}
