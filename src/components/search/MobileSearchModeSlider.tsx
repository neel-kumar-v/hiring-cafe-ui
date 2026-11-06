"use client";

import { SlidingTabs, type SlidingTabOption } from "@/components/ui/sliding-tabs";
import { useSearchUI, type SearchMode } from "@/contexts/SearchContext";
import { cn } from "@/lib/utils";
import { Search, Sparkles } from "lucide-react";

const SEARCH_MODE_OPTIONS: readonly SlidingTabOption<SearchMode>[] = [
  {
    id: "talent-agent",
    icon: <Sparkles className="size-4 shrink-0 text-primary" />,
    label: "Talent Agent",
    ariaLabel: "Talent Agent search mode",
  },
  {
    id: "classic",
    icon: <Search className="size-4 shrink-0" />,
    label: "Classic Search",
    ariaLabel: "Classic Search mode",
  },
];

/**
 * Mobile-only segmented control shown ABOVE the search field (the inline
 * `SearchModeToggle` inside the search pill is suppressed below `md`).
 * Full content width, equal halves, labels always visible. Talent Agent keeps
 * its pink sparkles. The desktop inline toggle is unchanged.
 */
export default function MobileSearchModeSlider({ className }: { className?: string }) {
  const { searchMode, setSearchMode } = useSearchUI();

  return (
    <div className={cn("px-4 md:hidden", className)}>
      <SlidingTabs<SearchMode>
        ariaLabel="Search mode"
        role="radiogroup"
        // Painted trough: the unselected half sits on the visible muted track and
        // the selected half keeps a stronger fill (card surface) on top of it.
        tone="default"
        shape="pill"
        size="md"
        value={searchMode}
        onChange={setSearchMode}
        options={SEARCH_MODE_OPTIONS}
        className="flex w-full select-none"
        tabClassName="min-w-0 flex-1 basis-0"
      />
    </div>
  );
}
