"use client";

import { BrandLogo } from "@/components/BrandLogo";
import { ThemeIconSwap } from "@/components/ThemeToggle";
import { SignInDialog } from "@/components/auth/SignInDialog";
import { ChatRowOptions, ChatRowTitle } from "@/components/chat/ChatPanel";
import { Button } from "@/components/ui/button";
import { DrawerClose } from "@/components/ui/drawer";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useApp } from "@/contexts/AppContext";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { defaultSearchOptions, useSearchUI } from "@/contexts/SearchContext";
import { demoNewCount, DEMO_AGENT_CHATS } from "@/data/agent-demo";
import { DEMO_SAVED_SEARCHES, type DemoSavedSearch } from "@/data/saved-searches-demo";
import { useCollapsibleHeight } from "@/hooks/useCollapsibleHeight";
import { useSavedSearches } from "@/hooks/useSavedSearches";
import { useQuantizedContainerWidth } from "@/hooks/useContainerWidth";
import { getEditedTags, initialSearchState } from "@/lib/edited-filters";
import { cn } from "@/lib/utils";
import type { SearchState } from "@/types/search";
import type { Id } from "../../../convex/_generated/dataModel";
import { BarChart3, Bell, Building, ChevronDown, CircleUser, EllipsisVertical, House, Info, Mail, Pencil, Pin, Plus, Search, Sparkles, Trash2, Users, X, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

/** Inbox-style sidebar row: full-bleed hover, no radius, no outer margin. */
function inboxRowClass(active: boolean, extra?: string) {
  return cn(
    "group/row flex h-10 w-full items-center gap-2.5 rounded-none px-4 text-sm text-foreground transition-colors",
    active ? "bg-accent font-medium" : "hover:bg-accent/50",
    extra
  );
}

/** Drag-to-narrow snaps to ribbon below this sidebar width. */
const SIDEBAR_RIBBON_WIDTH_STEPS: readonly number[] = [140];

function RedditIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
    </svg>
  );
}

/**
 * Menu options migrated from the overflow / user menu into the sidebar
 * above Talent Agent and Classic Searches sections (Feedback #12).
 * Bottom actions (Employers, About Us, Reddit, Theme toggle) are moved to the bottom bar (Feedback #8).
 */
function NavigationOptions({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="py-0" aria-label="Main Navigation">
      <Link href="/" onClick={onNavigate} className={inboxRowClass(pathname === "/" || Boolean(pathname?.startsWith("/search/")))}>
        <House className="size-4 shrink-0 text-muted-foreground group-hover/row:text-foreground" />
        <span className="truncate font-medium">Find Jobs</span>
      </Link>

      <Link href="/tracker" onClick={onNavigate} className={inboxRowClass(pathname === "/tracker")}>
        <BarChart3 className="size-4 shrink-0 text-muted-foreground group-hover/row:text-foreground" />
        <span className="truncate font-medium">Job Tracker</span>
      </Link>

      <Link href="/account" onClick={onNavigate} className={inboxRowClass(pathname === "/account")}>
        <CircleUser className="size-4 shrink-0 text-muted-foreground group-hover/row:text-foreground" />
        <span className="truncate font-medium">Account</span>
      </Link>

      <Link href="/talent-network" onClick={onNavigate} className={inboxRowClass(pathname === "/talent-network")}>
        <Users className="size-4 shrink-0 text-muted-foreground group-hover/row:text-foreground" />
        <span className="truncate font-medium">Talent Network</span>
      </Link>

      <Link href="/inbox" onClick={onNavigate} className={inboxRowClass(pathname === "/inbox")}>
        <Mail className="size-4 shrink-0 text-muted-foreground group-hover/row:text-foreground" />
        <span className="truncate font-medium">Inbox</span>
      </Link>
    </nav>
  );
}

/**
 * Compact icon-only footer buttons at the bottom of the sidebar (Feedback #8):
 * Employers, About Us, Follow on Reddit, and Theme Toggle.
 */
function SidebarFooterActions() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex items-center justify-around gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href="https://tally.so/r/n9rv4p"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Employers"
              className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <Building className="size-4" />
            </a>
          </TooltipTrigger>
          <TooltipContent side="top">Employers</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="About Us"
              onClick={() => toast.info("HiringCafe — Transparent job search.")}
              className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <Info className="size-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">About Us</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href="https://reddit.com/r/hiringcafe"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow on Reddit"
              className="flex size-9 aspect-square items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <RedditIcon className="size-4" />
            </a>
          </TooltipTrigger>
          <TooltipContent side="top">Follow on Reddit</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              onClick={() => toggleDarkMode()}
              className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <ThemeIconSwap isDarkMode={isDarkMode} className="size-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">{isDarkMode ? "Switch to light mode" : "Switch to dark mode"}</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

/**
 * Collapsible sidebar group (icon + label + rows).
 */
function GroupSection({
  icon: Icon,
  iconClassName,
  iconDot = false,
  label,
  children,
  defaultOpen = true,
  headerHoverBg = true,
}: {
  icon: LucideIcon;
  iconClassName?: string;
  /** Small monochrome notification dot rendered on the group icon. */
  iconDot?: boolean;
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  /** Hover background behind the collapsible header (Feedback: Classic Searches needs none). */
  headerHoverBg?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const { contentRef, containerProps } = useCollapsibleHeight(open);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn("flex w-full items-center gap-1.5 px-4 py-2.5 text-left", headerHoverBg && "transition-colors hover:bg-accent/50")}
        aria-expanded={open}
      >
        <ChevronDown className={cn("size-3.5 shrink-0 text-muted-foreground transition-transform duration-200", !open && "-rotate-90")} />
        <span className="relative shrink-0">
          <Icon className={cn("size-4", iconClassName ?? "text-muted-foreground")} />
          {iconDot ? <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-muted-foreground ring-2 ring-background" /> : null}
        </span>
        <span className="truncate text-[15px] font-bold text-foreground">{label}</span>
      </button>
      <div {...containerProps}>
        <div ref={contentRef}>{children}</div>
      </div>
    </div>
  );
}

/** Brand-pink new-count counter-pill. */
export function NewCountBadge({ count }: { count: number }) {
  return <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 font-mono text-[10px] font-semibold tabular-nums leading-4 text-primary-foreground">{count}</span>;
}

/**
 * Sidebar rows for the Talent Agent group (demo conversations; open the chat rail).
 *
 * Rows share the chat rail's row treatment (`ChatRowTitle` + `ChatRowOptions`):
 * a fade-cutoff title and a three-dot options menu that reveals on row hover,
 * keyboard focus, or while the menu is open. The menu is rendered on every
 * route — the options never depend on the current page.
 *
 * The row gap and right padding are tightened so the new-count badge sits closer
 * to the sidebar edge and the title keeps more readable width before it fades.
 */
function AgentChatItems({ activeChatId, onSelect }: { activeChatId: string | null; onSelect?: (id: string) => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const { setActiveChatId, setChatOpen } = useSearchUI();

  const handleSelect = (id: string) => {
    if (onSelect) {
      onSelect(id);
      return;
    }
    const isMainSearchPage = pathname === "/" || Boolean(pathname?.startsWith("/search"));
    if (!isMainSearchPage) {
      router.push("/");
    }
    setActiveChatId(id);
    setChatOpen(true);
  };

  return (
    <div className="pb-2">
      {DEMO_AGENT_CHATS.map((chat) => (
        <div key={chat.id} className={inboxRowClass(activeChatId === chat.id, "gap-2 pr-3")}>
          <button
            type="button"
            onClick={() => handleSelect(chat.id)}
            className="flex min-w-0 flex-1 items-center justify-between gap-2 overflow-hidden text-left"
            title={chat.name}
          >
            <ChatRowTitle text={chat.name} />
          </button>
          <ChatRowOptions label={`Options for ${chat.name}`} />
          {activeChatId !== chat.id ? <NewCountBadge count={demoNewCount(chat.id)} /> : null}
        </div>
      ))}
    </div>
  );
}

/**
 * Sidebar rows for the "Classic Searches" group backed by real saved searches with demo fallback.
 *
 * Rows don't navigate — clicking applies the saved search's filters in place
 * (same route/query; the AppContext URL-sync effect updates `?searchState=`).
 * Only when the viewer isn't on a search route (e.g. `/account`) do we move
 * to the job board so the applied filters are visible.
 */
function ClassicSearchItems({ activeId, onNavigate }: { activeId: string | null; onNavigate?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const { searchOptions, setSearchOptions } = useApp();
  const { boardSearchQuery } = useSearchUI();
  const savedSearchesData = useSavedSearches() as any;
  const { convexUser, savedSearches, create, rename, remove } = savedSearchesData;
  const setAlerts = savedSearchesData.setAlerts ?? ((_id: any, _val: any) => toast.info("Daily alerts aren't wired up yet."));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [signInOpen, setSignInOpen] = useState(false);
  const [demoSearches, setDemoSearches] = useState<DemoSavedSearch[]>(DEMO_SAVED_SEARCHES);

  const hasRealData = Boolean(convexUser && savedSearches && savedSearches.length > 0);
  const isDemo = !hasRealData;
  const items: Array<any> = hasRealData ? savedSearches : demoSearches;

  const commitRename = (id: string) => {
    if (editingName.trim()) {
      if (isDemo) {
        setDemoSearches((prev) => prev.map((item) => (String(item._id) === String(id) ? { ...item, name: editingName.trim() } : item)));
      } else {
        void rename(id as Id<"savedSearches">, editingName.trim());
      }
    }
    setEditingId(null);
    setEditingName("");
  };

  const handleDelete = (id: string) => {
    if (isDemo) {
      setDemoSearches((prev) => prev.filter((item) => String(item._id) !== String(id)));
      toast.success("Deleted saved search.");
    } else {
      void remove(id as Id<"savedSearches">);
    }
    setEditingId(null);
  };

  const handleToggleAlerts = (search: any) => {
    if (isDemo) {
      const nextAlerts = !Boolean(search.alertsEnabled);
      setDemoSearches((prev) => prev.map((item) => (String(item._id) === String(search._id) ? { ...item, alertsEnabled: nextAlerts } : item)));
      toast.success(nextAlerts ? "Daily alerts turned on." : "Daily alerts turned off.");
    } else {
      void setAlerts(search._id, !Boolean(search.alertsEnabled));
    }
  };

  const isBase = useMemo(() => {
    const hasFilterEdits = getEditedTags(searchOptions, initialSearchState).size > 0;
    const hasQuery = Boolean(boardSearchQuery && boardSearchQuery.trim().length > 0);
    if (hasFilterEdits || hasQuery) return false;
    try {
      return JSON.stringify(searchOptions) === JSON.stringify(defaultSearchOptions);
    } catch {
      return !hasFilterEdits && !hasQuery;
    }
  }, [searchOptions, boardSearchQuery]);

  const isOneOfSavedSearches = useMemo(() => {
    if (items.length === 0) return false;
    const currentStr = JSON.stringify(searchOptions);
    return items.some((s) => {
      if (!s) return false;
      if (activeId && String(s._id) === activeId) {
        if (!s.searchState) return true;
        try {
          if (JSON.stringify(s.searchState) === currentStr) return true;
        } catch {
          return true;
        }
      }
      if (s.searchState) {
        try {
          if (JSON.stringify(s.searchState) === currentStr) return true;
        } catch {
          // ignore
        }
      }
      return false;
    });
  }, [items, searchOptions, activeId]);

  const canSaveCurrentSearch = !isBase && !isOneOfSavedSearches;

  const isMainSearchPage = pathname === "/" || Boolean(pathname?.startsWith("/search"));

  /**
   * Apply a saved search's filters without leaving the current route. Rows are
   * links with a different searchState, not different pages. Since the click
   * spreads the same slices the merge in `activeSearchIds` uses, the
   * highlighted row matches the filters exactly.
   */
  const applySearchState = (search: any) => {
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
      router.push("/");
    }
    onNavigate?.();
  };

  /** Row ids whose applied filters equal the current `searchOptions` (row highlight when no URL id). */
  const activeSearchIds = useMemo(() => {
    const currentStr = JSON.stringify(searchOptions);
    return new Set(
      items.flatMap((search) => {
        if (!search?.searchState) return [];
        try {
          return JSON.stringify({ ...defaultSearchOptions, ...(search.searchState as SearchState) }) === currentStr ? [String(search._id)] : [];
        } catch {
          return [];
        }
      })
    );
  }, [items, searchOptions]);

  const handleSaveSearch = async () => {
    if (!convexUser) {
      setSignInOpen(true);
      return;
    }

    try {
      const newId = await create("New Search", searchOptions);
      if (newId) {
        setEditingId(String(newId));
        setEditingName("New Search");
      }
    } catch {
      toast.error("Unable to save search right now.");
    }
  };

  return (
    <div className="pb-2">
      <SignInDialog open={signInOpen} onOpenChange={setSignInOpen} />

      {canSaveCurrentSearch ? (
        <div className="mx-2 mb-1.5">
          <Button
            type="button"
            variant="dashed"
            onClick={handleSaveSearch}
            className="flex h-9 w-full items-center justify-start gap-2 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
            aria-label="+ Save search"
          >
            <Plus className="size-4 shrink-0" />
            <span className="sr-only">+ </span>
            <span>Save search</span>
          </Button>
        </div>
      ) : null}

      {items.length === 0 ? (
        <p className="mx-4 px-3 py-2 text-sm text-muted-foreground">No saved searches yet.</p>
      ) : (
        items.map((search) => {
          const active = String(search._id) === activeId || activeSearchIds.has(String(search._id));
          return (
            <div key={String(search._id)} className={inboxRowClass(active, "gap-2 pr-3")}>
              {editingId === String(search._id) ? (
                <input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitRename(String(search._id));
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  onBlur={() => commitRename(String(search._id))}
                  autoFocus
                  className="h-7 w-full min-w-0 flex-1 rounded-md border-none bg-transparent text-sm font-medium text-foreground outline-none"
                />
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => applySearchState(search)}
                    className="flex min-w-0 flex-1 items-center justify-between gap-2 overflow-hidden text-left"
                    title={search.name}
                  >
                    <ChatRowTitle text={search.name} />
                  </button>
                  {/*
                    Reserve space for the ⋯ menu only while it is visible (row hover, keyboard focus, or open menu).
                    Idle rows collapse it to zero width so the title's fade/cutoff can use the full width up to the badge.
                  */}
                  <span className="-ml-2.5 flex w-0 shrink-0 overflow-hidden transition-[width] group-focus-within/row:w-6 group-hover/row:w-6 has-[button[data-state=open]]:w-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          aria-label="Search options"
                          onClick={(e) => e.stopPropagation()}
                          className="shrink-0 rounded-md p-1 text-foreground/80 transition-colors hover:text-foreground"
                        >
                          <EllipsisVertical className="size-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[200px]">
                        <DropdownMenuItem onSelect={() => void handleToggleAlerts(search)}>
                          <Bell className="mr-1 size-4" />
                          Get daily alerts
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => toast.info("Pinning isn't wired up yet.")}>
                          <Pin className="mr-1 size-4" />
                          Pin to top
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => {
                            setEditingId(String(search._id));
                            setEditingName(search.name);
                          }}
                        >
                          <Pencil className="mr-1 size-4" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive data-[highlighted]:text-destructive" onSelect={() => handleDelete(String(search._id))}>
                          <Trash2 className="mr-1 size-4 text-destructive" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </span>
                  {active ? null : <NewCountBadge count={demoNewCount(String(search._id))} />}
                </>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

/** Small icon ribbon rendered when the left sidebar is collapsed (Feedback #14). */
function IconRibbon({ activeSavedId, activeChatId, onSelectChat }: { activeSavedId: string | null; activeChatId: string | null; onSelectChat?: (id: string) => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { setChatOpen } = useSearchUI();

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex min-h-0 flex-1 w-full flex-col items-center justify-between overflow-x-hidden overflow-y-auto py-3">
        <div className="flex w-full flex-col items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/"
                aria-label="Find Jobs"
                className={cn(
                  "flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                  (pathname === "/" || Boolean(pathname?.startsWith("/search/"))) && "bg-muted text-foreground"
                )}
              >
                <House className="size-5" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Find Jobs</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/tracker"
                aria-label="Job Tracker"
                className={cn(
                  "flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                  pathname === "/tracker" && "bg-muted text-foreground"
                )}
              >
                <BarChart3 className="size-5" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Job Tracker</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/account"
                aria-label="Account"
                className={cn(
                  "flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                  pathname === "/account" && "bg-muted text-foreground"
                )}
              >
                <CircleUser className="size-5" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Account</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/talent-network"
                aria-label="Talent Network"
                className={cn(
                  "flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                  pathname === "/talent-network" && "bg-muted text-foreground"
                )}
              >
                <Users className="size-5" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Talent Network</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/inbox"
                aria-label="Inbox"
                className={cn(
                  "flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                  pathname === "/inbox" && "bg-muted text-foreground"
                )}
              >
                <Mail className="size-5" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Inbox</TooltipContent>
          </Tooltip>

          <hr className="my-2 w-8 border-border" />

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label="Talent Agent"
                onClick={() => {
                  if (onSelectChat) {
                    onSelectChat(activeChatId ?? DEMO_AGENT_CHATS[0].id);
                  } else {
                    const isMainSearch = pathname === "/" || Boolean(pathname?.startsWith("/search"));
                    if (!isMainSearch) {
                      router.push("/");
                    }
                    setChatOpen(true);
                  }
                }}
                className={cn(
                  "flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                  activeChatId && "bg-muted text-foreground"
                )}
              >
                <span className="relative flex items-center justify-center">
                  <Sparkles className="size-5" />
                  <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-muted-foreground ring-2 ring-background" />
                </span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Talent Agent</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/account"
                aria-label="Classic Searches"
                className={cn(
                  "flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                  activeSavedId && "bg-muted text-foreground"
                )}
              >
                <span className="relative flex items-center justify-center">
                  <Search className="size-5" />
                  <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-muted-foreground ring-2 ring-background" />
                </span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Classic Searches</TooltipContent>
          </Tooltip>
        </div>

        <div className="flex w-full flex-col items-center gap-1 pb-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href="https://tally.so/r/n9rv4p"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Employers"
                className="flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <Building className="size-5" />
              </a>
            </TooltipTrigger>
            <TooltipContent side="right">Employers</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label="About Us"
                onClick={() => toast.info("HiringCafe — Transparent job search.")}
                className="flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <Info className="size-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">About Us</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href="https://reddit.com/r/hiringcafe"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow on Reddit"
                className="flex size-10 aspect-square items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <RedditIcon className="size-5" />
              </a>
            </TooltipTrigger>
            <TooltipContent side="right">Follow on Reddit</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                onClick={() => toggleDarkMode()}
                className="flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <ThemeIconSwap isDarkMode={isDarkMode} className="size-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">{isDarkMode ? "Switch to light mode" : "Switch to dark mode"}</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}

/**
 * Brand header at the top of the sidebar nav:
 * - Ribbon / collapsed: shows HiringCafe brand logo only (with tooltip), centered.
 * - Expanded: shows HiringCafe brand logo + "CloneCafe" wordmark that truncates to fit sidebar width.
 * - Links to `/`.
 * - Optional close button for mobile drawer mode.
 */
function BrandHeader({ isRibbon, onClose }: { isRibbon: boolean; onClose?: () => void }) {
  const content = (
    <Link
      href="/"
      onClick={onClose}
      aria-label="CloneCafe"
      className={cn(
        "flex items-center rounded-md transition-opacity hover:opacity-90 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40",
        isRibbon ? "justify-center" : "min-w-0 max-w-full gap-2 overflow-hidden"
      )}
    >
      <BrandLogo showWordmark={!isRibbon} className="min-w-0" wordmarkClassName="text-xl" />
    </Link>
  );

  return (
    <div
      className={cn(
        "flex h-16 shrink-0 items-center border-b border-border",
        isRibbon ? "justify-center px-2" : "justify-between px-4"
      )}
    >
      {isRibbon ? (
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>{content}</TooltipTrigger>
            <TooltipContent side="right">CloneCafe</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <>
          {content}
          {onClose ? (
            <DrawerClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
                aria-label="Close navigation menu"
              >
                <X className="size-4" />
              </Button>
            </DrawerClose>
          ) : null}
        </>
      )}
    </div>
  );
}

/**
 * Left sidebar of the app frame:
 * 1. Brand header (BrandLogo + CloneCafe when expanded, BrandLogo only when collapsed, links to /)
 * 2. Navigation options (Find Jobs, Job Tracker, Account, Talent Network, Inbox)
 * 3. "Talent Agent" (demo chats)
 * 4. "Classic Searches" (saved searches with demo fallback, with "+ Save search" when search is modified)
 * 5. Bottom footer with compact icon buttons (Employers, About Us, Reddit, Theme toggle)
 *
 * Supports resizable layout and collapsed icon ribbon.
 */
export default function AppSidebar({
  className,
  collapsed: forcedCollapsed,
  onNavigate,
}: {
  className?: string;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const sidebarRef = useRef<HTMLElement>(null);
  // Width-based ribbon only when parent isn't forcing expanded/collapsed (drag-to-narrow).
  const containerWidth = useQuantizedContainerWidth(sidebarRef, SIDEBAR_RIBBON_WIDTH_STEPS);
  const isRibbon = forcedCollapsed === true || (forcedCollapsed !== false && containerWidth > 0 && containerWidth < 140);

  const pathname = usePathname();
  const router = useRouter();
  const activeSavedId = pathname?.startsWith("/search/") ? decodeURIComponent(pathname.slice("/search/".length)) : null;
  const { activeChatId, setActiveChatId, setChatOpen } = useSearchUI();

  const isMainSearchPage = pathname === "/" || Boolean(pathname?.startsWith("/search"));

  const openChat = (id: string) => {
    if (!isMainSearchPage) {
      router.push("/");
    }
    setActiveChatId(id);
    setChatOpen(true);
    onNavigate?.();
  };

  return (
    <aside ref={sidebarRef} className={cn("flex h-full w-full min-w-0 flex-col bg-background", className)}>
      <BrandHeader isRibbon={isRibbon} onClose={onNavigate} />
      {isRibbon ? (
        <IconRibbon activeSavedId={activeSavedId} activeChatId={activeChatId} onSelectChat={openChat} />
      ) : (
        <>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <NavigationOptions onNavigate={onNavigate} />
            <hr className="my-1 border-border" />
            <GroupSection icon={Sparkles} iconClassName="text-muted-foreground" label="Talent Agent" headerHoverBg={false}>
              <AgentChatItems activeChatId={activeChatId} onSelect={openChat} />
            </GroupSection>
            <hr className="my-2 border-border" />
            <GroupSection icon={Search} iconClassName="text-muted-foreground" iconDot label="Classic Searches" headerHoverBg={false}>
              <ClassicSearchItems activeId={activeSavedId} onNavigate={onNavigate} />
            </GroupSection>
          </div>
          <div className="shrink-0 border-t border-border px-3 py-2">
            <SidebarFooterActions />
          </div>
        </>
      )}
    </aside>
  );
}
