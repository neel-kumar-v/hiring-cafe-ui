"use client";

import { AllFilter } from "@/components/search/filters/util/AllFilter";
import { SlidingTabs, type SlidingTabOption } from "@/components/ui/sliding-tabs";
import { useApp } from "@/contexts/AppContext";
import { defaultSearchOptions, useSearchUI } from "@/contexts/SearchContext";
import { DEMO_AGENT_CHATS, type DemoAgentChat } from "@/data/agent-demo";
import { DEMO_SAVED_SEARCHES, type DemoSavedSearch } from "@/data/saved-searches-demo";
import { useSavedSearches } from "@/hooks/useSavedSearches";
import { cn } from "@/lib/utils";
import type { SearchState } from "@/types/search";
import type { Id } from "../../../convex/_generated/dataModel";
import { Bell, CalendarIcon, Edit, Search, Sparkles, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useIsomorphicLayoutEffect } from "@/hooks/use-isomorphic-layout-effect";

type SavedSearchTab = "all" | "agent" | "classic";

export default function SavedSearches() {
  const router = useRouter();
  const { setSearchOptions } = useApp();
  const { setActiveChatId, setChatOpen } = useSearchUI();
  const { convexUser, savedSearches, rename, remove } = useSavedSearches();

  // Tabs: "all", "agent", "classic"
  const [filterTab, setFilterTab] = useState<SavedSearchTab>("all");

  // Talent agent demo chats
  const [agentSearches, setAgentSearches] = useState<DemoAgentChat[]>(DEMO_AGENT_CHATS);
  const [editingAgentId, setEditingAgentId] = useState<string | null>(null);
  const [editingAgentName, setEditingAgentName] = useState("");

  // Classic searches: real convex data if available, otherwise fallback demo searches
  const hasRealClassic = Boolean(convexUser && savedSearches && savedSearches.length > 0);
  const [demoClassicSearches, setDemoClassicSearches] = useState<DemoSavedSearch[]>(DEMO_SAVED_SEARCHES);
  const classicSearches = hasRealClassic ? savedSearches! : demoClassicSearches;

  const [editingClassicId, setEditingClassicId] = useState<string | null>(null);
  const [editingClassicName, setEditingClassicName] = useState("");

  const inputRefs = useRef<{ [id: string]: HTMLInputElement | null }>({});

  // Agent chat handlers
  const handleAgentEditStart = (id: string, name: string) => {
    setEditingAgentId(id);
    setEditingAgentName(name);
    setTimeout(() => {
      inputRefs.current[`agent-${id}`]?.focus();
    }, 0);
  };

  const handleAgentEditSave = (id: string) => {
    const trimmed = editingAgentName.trim();
    if (trimmed) {
      setAgentSearches((prev) => prev.map((item) => (item.id === id ? { ...item, name: trimmed } : item)));
    }
    setEditingAgentId(null);
    setEditingAgentName("");
  };

  const handleAgentEditCancel = () => {
    setEditingAgentId(null);
    setEditingAgentName("");
  };

  const handleAgentDelete = (id: string) => {
    setAgentSearches((prev) => prev.filter((item) => item.id !== id));
    toast.success("Removed talent agent search.");
  };

  const handleOpenAgent = (agent: DemoAgentChat) => {
    setActiveChatId(agent.id);
    setChatOpen(true);
    router.push("/");
    toast.success(`Opened agent: ${agent.name}`);
  };

  // Classic search handlers
  const handleClassicEditStart = (id: string, name: string) => {
    setEditingClassicId(id);
    setEditingClassicName(name);
    setTimeout(() => {
      inputRefs.current[`classic-${id}`]?.focus();
    }, 0);
  };

  const handleClassicEditSave = (id: string) => {
    const trimmed = editingClassicName.trim() || "Untitled";
    if (hasRealClassic) {
      void rename(id as Id<"savedSearches">, trimmed);
    } else {
      setDemoClassicSearches((prev) => prev.map((item) => (String(item._id) === id ? { ...item, name: trimmed } : item)));
    }
    setEditingClassicId(null);
    setEditingClassicName("");
  };

  const handleClassicEditCancel = () => {
    setEditingClassicId(null);
    setEditingClassicName("");
  };

  const handleClassicDelete = (id: string) => {
    if (hasRealClassic) {
      void remove(id as Id<"savedSearches">);
    } else {
      setDemoClassicSearches((prev) => prev.filter((item) => String(item._id) !== id));
    }
    toast.success("Deleted saved search.");
  };

  const handleLoadClassic = (search: { searchState?: any; name: string }) => {
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
    router.push("/");
    toast.success("Loaded saved search.");
  };

  const handleCategoryClick: Parameters<typeof AllFilter>[0]["handleCategoryClick"] = () => {};

  const showAgentSection = filterTab === "all" || filterTab === "agent";
  const showClassicSection = filterTab === "all" || filterTab === "classic";

  const filterTabOptions: readonly SlidingTabOption<SavedSearchTab>[] = [
    {
      id: "all",
      label: `All (${agentSearches.length + classicSearches.length})`,
      ariaLabel: "All saved searches",
    },
    {
      id: "agent",
      label: (
        <span className="inline-flex items-center gap-1.5 leading-none">
          <Sparkles className="size-3.5 shrink-0 text-agent" />
          <span className="leading-none">Talent Agent ({agentSearches.length})</span>
        </span>
      ),
      ariaLabel: "Talent agent searches",
    },
    {
      id: "classic",
      label: (
        <span className="inline-flex items-center gap-1.5 leading-none">
          <Bell className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="leading-none">Classic ({classicSearches.length})</span>
        </span>
      ),
      ariaLabel: "Classic saved searches",
    },
  ];

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      {/* Header with Title and Type Tabs */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-foreground">Saved Searches</h2>

        <SlidingTabs<SavedSearchTab>
          options={filterTabOptions}
          value={filterTab}
          onChange={setFilterTab}
          ariaLabel="Saved search type"
          size="sm"
          className="self-start sm:self-auto"
        />
      </div>

      <div className="space-y-8">
        {/* Talent Agent Group */}
        {showAgentSection ? (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-agent" />
                <h3 className="text-base font-semibold text-foreground">Talent Agent</h3>
                <span className="rounded-full bg-agent/10 px-2 py-0.5 text-xs font-medium text-agent">{agentSearches.length} active</span>
              </div>
            </div>

            {agentSearches.length === 0 ? (
              <p className="text-sm italic text-muted-foreground">No talent agent searches yet.</p>
            ) : (
              <div className="space-y-4">
                {agentSearches.map((agent) => (
                  <div key={agent.id} className="rounded-lg border border-border bg-card/60 p-4 transition-all hover:border-agent/30">
                    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-wrap items-center gap-2">
                        {editingAgentId === agent.id ? (
                          <input
                            type="text"
                            value={editingAgentName}
                            ref={(el) => {
                              inputRefs.current[`agent-${agent.id}`] = el;
                            }}
                            onChange={(e) => setEditingAgentName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleAgentEditSave(agent.id);
                              if (e.key === "Escape") handleAgentEditCancel();
                            }}
                            onBlur={() => handleAgentEditSave(agent.id)}
                            className="rounded border border-primary/40 bg-background px-2 py-0.5 text-base font-semibold text-foreground outline-none"
                          />
                        ) : (
                          <div className="group flex items-center">
                            <h4
                              className="cursor-pointer text-base font-semibold text-foreground transition-colors hover:underline"
                              onClick={() => handleAgentEditStart(agent.id, agent.name)}
                            >
                              {agent.name}
                            </h4>
                            <button
                              type="button"
                              onClick={() => handleAgentEditStart(agent.id, agent.name)}
                              className="-ml-2 rounded p-1 opacity-0 transition-all duration-200 hover:bg-accent group-hover:ml-1.5 group-hover:opacity-100"
                              title="Rename agent"
                            >
                              <Edit className="size-3.5 text-muted-foreground" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-agent/10 px-3 py-1.5 text-sm font-medium text-agent transition-all hover:bg-agent/20"
                          onClick={() => handleOpenAgent(agent)}
                        >
                          <Sparkles className="size-3.5" /> Go to Agent
                        </button>
                        <button
                          type="button"
                          className="inline-flex cursor-pointer items-center gap-1 rounded-md p-1.5 text-sm text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleAgentDelete(agent.id)}
                          title="Delete agent search"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>

                    {agent.prompt ? <AgentPromptQuote prompt={agent.prompt} /> : null}

                    {agent.criteria && agent.criteria.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {agent.criteria.map((c, i) => (
                          <span key={i} className="rounded-md border border-border/70 bg-background/80 px-2 py-0.5 text-xs text-muted-foreground">
                            {c}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : null}

        {/* Classic Searches Group */}
        {showClassicSection ? (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <div className="flex items-center gap-2">
                <Bell className="size-4 text-muted-foreground" />
                <h3 className="text-base font-semibold text-foreground">Classic Searches</h3>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{classicSearches.length} saved</span>
              </div>
            </div>

            {classicSearches.length === 0 ? (
              <p className="text-sm italic text-muted-foreground">No classic saved searches yet.</p>
            ) : (
              <div className="space-y-6">
                {classicSearches.map((search) => {
                  const searchId = String((search as any)._id);
                  const isEditing = editingClassicId === searchId;
                  const searchState = (search.searchState ?? {}) as SearchState;
                  const safeSearchOptions: SearchState = {
                    ...defaultSearchOptions,
                    ...searchState,
                    activity_outcomes: searchState.activity_outcomes ?? defaultSearchOptions.activity_outcomes,
                  };

                  return (
                    <div key={searchId} className="rounded-lg border border-border bg-card/60 p-4 transition-all hover:border-border/80">
                      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap items-center gap-2">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editingClassicName}
                              ref={(el) => {
                                inputRefs.current[`classic-${searchId}`] = el;
                              }}
                              onChange={(e) => setEditingClassicName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleClassicEditSave(searchId);
                                if (e.key === "Escape") handleClassicEditCancel();
                              }}
                              onBlur={() => handleClassicEditSave(searchId)}
                              className="rounded border border-primary/40 bg-background px-2 py-0.5 text-base font-semibold text-foreground outline-none"
                            />
                          ) : (
                            <div className="group flex items-center">
                              <h4
                                className="cursor-pointer text-base font-semibold text-foreground transition-colors hover:underline"
                                onClick={() => handleClassicEditStart(searchId, search.name)}
                              >
                                {search.name}
                              </h4>
                              <button
                                type="button"
                                onClick={() => handleClassicEditStart(searchId, search.name)}
                                className="-ml-2 rounded p-1 opacity-0 transition-all duration-200 hover:bg-accent group-hover:ml-1.5 group-hover:opacity-100"
                                title="Rename search"
                              >
                                <Edit className="size-3.5 text-muted-foreground" />
                              </button>
                            </div>
                          )}

                          <span className="flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            <CalendarIcon className="size-3" /> {search.updatedAt ? new Date(search.updatedAt).toLocaleDateString() : "Saved recently"}
                          </span>

                          {(search as any).alertsEnabled ? (
                            <span className="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                              <Bell className="size-3" /> Daily alerts
                            </span>
                          ) : null}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium transition-all hover:bg-accent"
                            onClick={() => handleLoadClassic(search)}
                            type="button"
                          >
                            <Search className="size-3.5" /> Go to Search
                          </button>
                          <button
                            type="button"
                            className="inline-flex cursor-pointer items-center gap-1 rounded-md p-1.5 text-sm text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleClassicDelete(searchId)}
                            title="Delete saved search"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>

                      <AllFilter searchOptions={safeSearchOptions} handleCategoryClick={handleCategoryClick} showButton={false} />
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Agent prompt quote block. Long prompts scroll horizontally instead of
 * wrapping, so every card keeps the same one-line height. Hidden content at
 * a scroll edge gets a vignette fade mask (fully faded at the edge, opaque
 * in the readable middle) — only while that edge actually hides text.
 */
function AgentPromptQuote({ prompt }: { prompt: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  useIsomorphicLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let frameId: number | null = null;
    const updateEdges = () => {
      const maxScrollLeft = el.scrollWidth - el.clientWidth;
      if (maxScrollLeft <= 1) {
        setEdges((prev) => (prev.start && prev.end ? prev : { start: true, end: true }));
        return;
      }
      const start = el.scrollLeft <= 1;
      const end = el.scrollLeft >= maxScrollLeft - 1;
      setEdges((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
    };

    updateEdges();

    const onScroll = () => {
      if (frameId !== null) return;
      frameId = requestAnimationFrame(() => {
        frameId = null;
        updateEdges();
      });
    };

    const resizeObserver = new ResizeObserver(updateEdges);
    resizeObserver.observe(el);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      resizeObserver.disconnect();
      el.removeEventListener("scroll", onScroll);
      if (frameId !== null) cancelAnimationFrame(frameId);
    };
  }, [prompt]);

  const maskStyle: React.CSSProperties | undefined = useMemo(() => {
    if (edges.start && edges.end) return undefined;
    let gradient: string;
    if (edges.start) {
      gradient = "linear-gradient(to right, black calc(100% - 1.75rem), transparent 100%)";
    } else if (edges.end) {
      gradient = "linear-gradient(to right, transparent 0, black 1.25rem, black 100%)";
    } else {
      gradient = "linear-gradient(to right, transparent 0, black 1.25rem, black calc(100% - 1.75rem), transparent 100%)";
    }
    return {
      maskImage: gradient,
      WebkitMaskImage: gradient,
    };
  }, [edges]);

  return (
    <div className="relative mb-3 rounded-md bg-muted/40 text-xs text-muted-foreground sm:text-sm" title={prompt}>
      <div ref={scrollRef} style={maskStyle} className="overflow-x-auto overscroll-x-contain whitespace-nowrap p-2.5 scrollbar-none">
        <span className="font-semibold text-foreground">Agent prompt: </span>&ldquo;{prompt}&rdquo;
      </div>
    </div>
  );
}
