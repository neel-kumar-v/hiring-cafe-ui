"use client";

import { useApp } from "@/contexts/AppContext";
import { defaultSearchOptions, useSearchUI } from "@/contexts/SearchContext";
import { DEMO_AGENT_CHATS } from "@/data/agent-demo";
import { DEMO_SAVED_SEARCHES, type DemoSavedSearch } from "@/data/saved-searches-demo";
import { overflowEdgeMaskStyle, useOverflowScrollEdges } from "@/hooks/useOverflowScrollEdges";
import { useSavedSearches } from "@/hooks/useSavedSearches";
import { cn } from "@/lib/utils";
import type { SearchState } from "@/types/search";
import { usePathname, useRouter } from "next/navigation";

interface SavedSearchCard {
  id: string;
  name: string;
  searchState?: Partial<SearchState>;
}

/**
 * Apply a classic saved search in place, matching `ClassicSearchItems` in the sidebar.
 * Spreads the same slices so the highlighted sidebar row matches the filters.
 * Only leaves the current route when the viewer isn't already on a search page.
 */
function applyClassicSearch(search: SavedSearchCard, isMainSearchPage: boolean, setSearchOptions: (state: SearchState) => void, push: (href: string) => void) {
  if (search.searchState) {
    setSearchOptions({
      ...defaultSearchOptions,
      ...(search.searchState as SearchState),
      activity_outcomes: (search.searchState as SearchState).activity_outcomes ?? {
        views: "All",
        applications: "All",
        saves: "All",
        reportedOutcomes: { interviews: false, offers: false, ghostProne: false, highRejection: false },
      },
    });
  }
  if (!isMainSearchPage) {
    push("/");
  }
}

/**
 * Mobile-only horizontal row of saved searches for the active mode.
 * Talent Agent shows the sidebar's demo agent chats; Classic shows
 * `useSavedSearches` with the same demo fallback. Omitted when the mode has none.
 */
export default function MobileSavedSearchCards({ className }: { className?: string }) {
  const { searchMode, setActiveChatId, setChatOpen } = useSearchUI();
  const { setSearchOptions } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const { convexUser, savedSearches } = useSavedSearches();

  const isMainSearchPage = pathname === "/" || Boolean(pathname?.startsWith("/search"));
  const hasRealData = Boolean(convexUser && savedSearches && savedSearches.length > 0);
  const classicItems: DemoSavedSearch[] = hasRealData ? (savedSearches as DemoSavedSearch[]) : DEMO_SAVED_SEARCHES;

  const cards: SavedSearchCard[] =
    searchMode === "talent-agent"
      ? DEMO_AGENT_CHATS.map((chat) => ({ id: chat.id, name: chat.name }))
      : classicItems.map((search) => ({ id: String(search._id), name: search.name, searchState: search.searchState }));

  const { ref: scrollRef, edges } = useOverflowScrollEdges<HTMLDivElement>();

  if (cards.length === 0) return null;

  const selectCard = (card: SavedSearchCard) => {
    if (searchMode === "talent-agent") {
      if (!isMainSearchPage) {
        router.push("/");
      }
      setActiveChatId(card.id);
      setChatOpen(true);
      return;
    }
    applyClassicSearch(card, isMainSearchPage, setSearchOptions, (href) => router.push(href));
  };

  return (
    <div className={cn("md:hidden", className)}>
      <div
        ref={scrollRef}
        style={overflowEdgeMaskStyle(edges)}
        className="flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {cards.map((card) => (
          <button
            key={card.id}
            type="button"
            title={card.name}
            onClick={() => selectCard(card)}
            className="h-8 w-36 shrink-0 truncate rounded-full border border-border bg-card px-2.5 text-left text-xs font-medium text-foreground transition-colors hover:bg-accent"
          >
            {card.name}
          </button>
        ))}
      </div>
    </div>
  );
}
