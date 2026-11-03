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
  iconOnly?: boolean;
}

const SEARCH_MODE_OPTIONS: readonly SlidingTabOption<SearchMode>[] = [
  {
    id: "talent-agent",
    icon: <Sparkles className="size-3.5 sm:size-4 text-primary shrink-0" />,
    label: "Talent Agent",
    ariaLabel: "Talent Agent search mode",
  },
  {
    id: "classic",
    icon: <Search className="size-3.5 sm:size-4 shrink-0" />,
    label: "Classic Search",
    ariaLabel: "Classic Search mode",
  },
];

/**
 * Segmented control toggle embedded inline inside the SearchBar pill.
 * Offers "Talent Agent" (AI prompt) and "Classic Search" (keyword + filters).
 * Full control height is maintained across responsive breakpoints, with labels
 * collapsing to icon-only at narrow container widths (< 520px).
 */
export default function SearchModeToggle({ className, value, onChange, size = "sm", iconOnly }: SearchModeToggleProps) {
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
      iconOnly={iconOnly}
      labelClassName="hidden @min-[520px]:inline"
      className={cn("select-none shrink-0", className)}
      tabClassName="px-2.5 sm:px-3"
    />
  );
}
