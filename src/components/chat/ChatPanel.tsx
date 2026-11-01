"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DEMO_AGENT_FALLBACK_REPLY, DEMO_AGENT_INTRO, DEMO_AGENT_CHATS, type DemoChatMessage } from "@/data/agent-demo";
import { useSearchUI } from "@/contexts/SearchContext";
import { useNotificationFrequency } from "@/components/search/ResultsMetaRow";
import { useCollapsibleHeight } from "@/hooks/useCollapsibleHeight";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import { ArrowUp, Bell, Check, ChevronDown, ChevronUp, EllipsisVertical, Lightbulb, MessagesSquare, Pencil, Pin, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode, type Ref } from "react";
import { toast } from "sonner";

const AUTHORED_AT = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
const AUTHORED_TIME = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });

function nowLabel() {
  const d = new Date();
  return `${AUTHORED_AT.format(d)}, ${AUTHORED_TIME.format(d)}`;
}

/**
 * Horizontal fade / scroll-vignette title for chat rows.
 * Shows as much text as fits and fades the cut-off edge when the text overflows.
 *
 * The fade is deliberately short (14px) so only the very tail of a long title
 * is dimmed — the readable run of text stays as wide as the row allows.
 *
 * Shared by the docked chat rail and the left sidebar's chat list so both
 * surfaces treat long conversation titles the same way.
 */
export function ChatRowTitle({ text, className }: { text: string; className?: string }) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let frameId: number | null = null;
    const scheduleUpdate = () => {
      if (frameId !== null) return;
      frameId = requestAnimationFrame(() => {
        frameId = null;
        const overflowing = el.scrollWidth > el.clientWidth + 1;
        setIsOverflowing((prev) => (prev === overflowing ? prev : overflowing));
      });
    };

    scheduleUpdate();
    const resizeObserver = new ResizeObserver(scheduleUpdate);
    resizeObserver.observe(el);
    return () => {
      resizeObserver.disconnect();
      if (frameId !== null) cancelAnimationFrame(frameId);
    };
  }, [text]);

  return (
    <span
      ref={containerRef}
      onScroll={(e) => {
        if (e.currentTarget.scrollLeft !== 0) {
          e.currentTarget.scrollLeft = 0;
        }
      }}
      className={cn("block min-w-0 flex-1 overflow-hidden whitespace-nowrap text-left", className)}
      style={
        isOverflowing
          ? {
              maskImage: "linear-gradient(to right, black calc(100% - 14px), transparent 100%)",
              WebkitMaskImage: "linear-gradient(to right, black calc(100% - 14px), transparent 100%)",
            }
          : undefined
      }
    >
      {text}
    </span>
  );
}

/**
 * Three-dot options menu for a chat row (Pin to top / Rename / Delete).
 *
 * The trigger stays collapsed (zero width) until the row is hovered, keyboard
 * focused, or the menu is open, so idle rows give the whole width to the title.
 * The negative left margin pulls the collapsed slot over the title's faded tail,
 * so revealing the trigger doesn't push the title around.
 * Host rows must carry the `group/row` class for the reveal animation.
 */
export function ChatRowOptions({ label, onPin, onRename, onDelete }: { label: string; onPin?: () => void; onRename?: () => void; onDelete?: () => void }) {
  return (
    <span className="-ml-2.5 flex w-0 shrink-0 overflow-hidden transition-[width] group-focus-within/row:w-6 group-hover/row:w-6 has-[button[data-state=open]]:w-6">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={label}
            onClick={(e) => e.stopPropagation()}
            className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-background hover:text-foreground"
          >
            <EllipsisVertical className="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px] rounded-xl shadow-lg">
          <DropdownMenuItem
            onSelect={() => {
              if (onPin) onPin();
              else toast.info("Pinning isn't wired up yet.");
            }}
          >
            <Pin className="mr-1 size-4" />
            Pin to top
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              if (onRename) onRename();
              else toast.info("Renaming chats isn't wired up yet.");
            }}
          >
            <Pencil className="mr-1 size-4" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive data-[highlighted]:text-destructive"
            onSelect={() => {
              if (onDelete) onDelete();
              else toast.info("Deleting chats isn't wired up yet.");
            }}
          >
            <Trash2 className="mr-1 size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </span>
  );
}

/** Renders **bold**, `inline code`, and keeps line breaks (the chat's tiny markdown subset). */
function MarkdownLite({ text }: { text: string }) {
  const parts = useMemo(() => text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g), [text]);
  return (
    <span className="whitespace-pre-line">
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("`") && part.endsWith("`") && part.length > 1) {
          return (
            <code key={i} className="rounded bg-muted-foreground/15 px-1 py-0.5 font-mono text-[12px]">
              {part.slice(1, -1)}
            </code>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

function AgentThinking({ text, children }: { text?: string; children?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { contentRef, containerProps } = useCollapsibleHeight(open);
  return (
    <div>
      <button type="button" onClick={() => setOpen(!open)} className="flex items-center gap-2 text-sm text-foreground hover:underline">
        <svg className="size-4 text-agent" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2l1.8 5.7L19.5 9.5c.5.2.5.9 0 1.1l-5.7 1.8L12 18.1l-1.8-5.7-5.7-1.8c-.5-.2-.5-.9 0-1.1l5.7-1.8L12 2z" />
          <path d="M19 15l.9 2.6 2.6.9-2.6.9L19 22l-.9-2.6-2.6-.9 2.6-.9L19 15z" />
        </svg>
        <span>{open ? "Hide agent thinking" : "Show agent thinking"}</span>
        <ChevronDown className={cn("size-3.5 text-muted-foreground transition-transform duration-200", open && "rotate-180")} />
      </button>
      <div {...containerProps}>
        <div ref={contentRef}>
          {/* Expanded body matches the real site's thinking: bulb marker + italic prose with `code` keys */}
          {text ? (
            <div className="mt-2 flex gap-2">
              <Lightbulb className="mt-0.5 size-4 shrink-0 text-muted-foreground/80" />
              <div className="min-w-0 text-sm italic leading-relaxed text-muted-foreground">
                <MarkdownLite text={text} />
              </div>
            </div>
          ) : null}
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * Inline "Running job searches" card the agent posts after running searches
 * (green activity dot, chevron collapse, green-check rows with violet job pills).
 */
function RunningSearchesCard({ rows }: { rows: { name: string; jobs: number }[] }) {
  const [open, setOpen] = useState(true);
  const { contentRef, containerProps } = useCollapsibleHeight(open);
  const totalJobs = rows.reduce((sum, row) => sum + row.jobs, 0);
  return (
    <div className="mt-2 ml-6 w-full max-w-md rounded-xl border border-border bg-muted/60 px-4 py-3">
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center gap-2.5 text-left" aria-expanded={open}>
        <Search className="size-4 shrink-0 text-foreground" />
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">Running job searches</span>
        <span className="size-2 shrink-0 rounded-full bg-success" />
        <ChevronDown className={cn("size-3.5 shrink-0 text-muted-foreground transition-transform duration-200", !open && "-rotate-90")} />
      </button>
      <div className="mt-0.5 text-xs text-muted-foreground">
        {rows.length} search{rows.length === 1 ? "" : "es"} ran · {totalJobs} jobs
      </div>
      <div {...containerProps}>
        <div ref={contentRef}>
          <div className="space-y-1.5 pt-2.5">
            {rows.map((row) => (
              <div key={row.name} className="flex items-center gap-2.5">
                <Check className="size-4 shrink-0 text-success" />
                <span className="min-w-0 flex-1 truncate text-sm text-foreground">{row.name}</span>
                <span className="shrink-0 rounded-full bg-agent px-2 py-0.5 text-[11px] font-semibold text-agent-foreground">{row.jobs} jobs</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatMessageView({ message }: { message: DemoChatMessage }) {
  if (message.role === "user") {
    return (
      <div className="ml-auto w-fit max-w-[85%]">
        {message.at ? (
          <div className="mb-1 text-right text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            You <span className="mx-0.5">·</span> {message.at}
          </div>
        ) : null}
        <div className="rounded-2xl bg-muted px-4 py-2.5 text-[15px] whitespace-pre-line break-words">{message.text}</div>
      </div>
    );
  }
  const hasCot = Boolean(message.thinking || message.searchCard);
  return (
    <div className="space-y-2 text-[15px] leading-relaxed text-foreground">
      {hasCot ? <AgentThinking text={message.thinking}>{message.searchCard ? <RunningSearchesCard rows={message.searchCard.rows} /> : null}</AgentThinking> : null}
      <MarkdownLite text={message.text} />
    </div>
  );
}

function ChatComposer({ onSend }: { onSend: (text: string) => void }) {
  const [draft, setDraft] = useState("");
  const send = () => {
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft("");
  };
  return (
    <div className="px-4 pb-3">
      <div className="rounded-3xl bg-muted p-3">
        <textarea
          rows={2}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="How can we improve your search results?"
          className="block max-h-32 w-full resize-none bg-transparent text-[15px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground"
        />
        <div className="mt-1 flex items-center justify-end">
          <button
            type="button"
            aria-label="Send"
            disabled={!draft.trim()}
            onClick={send}
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-full text-white transition-colors",
              draft.trim() ? "bg-agent hover:bg-agent/90" : "bg-muted-foreground/40"
            )}
          >
            <ArrowUp className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ChatBody({ chatId, className }: { chatId: string; className?: string }) {
  const [notificationFrequency] = useNotificationFrequency();
  const [threads, setThreads] = useState<Record<string, DemoChatMessage[]>>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  /** Which scroll edges still have hidden content — drives the top/bottom vignettes. */
  const [scrollEdges, setScrollEdges] = useState({ start: false, end: false });
  const messages = threads[chatId] ?? DEMO_AGENT_INTRO;

  const append = (id: string, message: DemoChatMessage) => {
    setThreads((prev) => {
      const thread = prev[id] ?? DEMO_AGENT_INTRO;
      return { ...prev, [id]: [...thread, message] };
    });
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [chatId, messages.length]);

  // track whether content overflows past the top/bottom of the scroll viewport (scroll vignettes)
  useEffect(() => {
    const viewport = scrollRef.current;
    if (!viewport) return;

    let frameId: number | null = null;
    const scheduleUpdate = () => {
      if (frameId !== null) return;
      frameId = requestAnimationFrame(() => {
        frameId = null;
        const start = viewport.scrollTop > 1;
        const end = viewport.scrollTop + viewport.clientHeight < viewport.scrollHeight - 1;
        setScrollEdges((previous) => (previous.start === start && previous.end === end ? previous : { start, end }));
      });
    };

    const resizeObserver = new ResizeObserver(scheduleUpdate);
    resizeObserver.observe(viewport);
    for (const child of Array.from(viewport.children)) {
      resizeObserver.observe(child);
    }
    viewport.addEventListener("scroll", scheduleUpdate, { passive: true });
    scheduleUpdate();
    return () => {
      resizeObserver.disconnect();
      viewport.removeEventListener("scroll", scheduleUpdate);
      if (frameId !== null) cancelAnimationFrame(frameId);
    };
  }, [chatId, messages.length]);

  // initialize the per-chat thread when switching conversations
  useEffect(() => {
    setThreads((prev) => (chatId in prev ? prev : { ...prev, [chatId]: DEMO_AGENT_INTRO }));
  }, [chatId]);

  const handleSend = (text: string) => {
    append(chatId, { id: `user-${Date.now()}`, role: "user", at: nowLabel(), text });
    window.setTimeout(() => {
      append(chatId, { id: `agent-${Date.now()}`, role: "agent", text: DEMO_AGENT_FALLBACK_REPLY });
    }, 900);
  };

  return (
    <>
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <div ref={scrollRef} className={cn("h-full space-y-5 overflow-y-auto px-4 py-5", className)}>
          {messages.map((message) => (
            <ChatMessageView key={message.id} message={message} />
          ))}
        </div>
        {scrollEdges.start ? <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-10 h-6 bg-gradient-to-b from-background to-transparent" /> : null}
        {scrollEdges.end ? <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-6 bg-gradient-to-t from-background to-transparent" /> : null}
      </div>
      <div className="border-t border-border pt-1">
        {notificationFrequency === "off" ? (
          <div className="flex h-9 items-center justify-center gap-1.5">
            <Bell className="size-4 text-foreground/70" />
            <span className="text-sm">Get new jobs by email</span>
            <button type="button" className="text-sm font-medium text-agent hover:underline" onClick={() => toast.info("Demo — email alerts aren't wired up yet.")}>
              Turn on
            </button>
            <ChevronUp className="size-3.5 text-muted-foreground" />
          </div>
        ) : null}
        <ChatComposer onSend={handleSend} />
      </div>
    </>
  );
}

/**
 * Right-side talent-agent chat rail from the new design (UI-only — no real agent).
 * ≥xl: docked column · below: overlay + backdrop (mirrors the screenshot).
 */
export default function ChatPanel({
  docked,
  width = 400,
  onResizeStart,
  panelRef,
}: {
  docked?: boolean;
  width?: number;
  onResizeStart?: (event: ReactPointerEvent) => void;
  /** Parent ref for drag-resize: per-frame widths are written straight to this element. */
  panelRef?: Ref<HTMLDivElement>;
} = {}) {
  const { chatOpen, setChatOpen, activeChatId, setActiveChatId } = useSearchUI();
  const isDocked = useMediaQuery("(min-width: 1280px)");

  // fallback to first demo chat when opened without a target conversation
  useEffect(() => {
    if (chatOpen && activeChatId == null) setActiveChatId(DEMO_AGENT_CHATS[0].id);
  }, [chatOpen, activeChatId, setActiveChatId]);

  if (!chatOpen) return null;

  const chatId = activeChatId ?? DEMO_AGENT_CHATS[0].id;
  const activeChat = DEMO_AGENT_CHATS.find((chat) => chat.id === chatId) ?? DEMO_AGENT_CHATS[0];

  if (docked || isDocked) {
    return (
      <div ref={panelRef} className="fixed inset-y-0 right-0 z-30 hidden h-full flex-col border-l border-border bg-background xl:flex" style={{ width }}>
        {onResizeStart ? (
          <button
            type="button"
            aria-label="Resize chat sidebar"
            className="absolute inset-y-0 left-0 z-10 w-1.5 cursor-col-resize bg-transparent transition-colors hover:bg-primary/30"
            onPointerDown={onResizeStart}
          />
        ) : null}
        <div className="flex h-16 shrink-0 items-center justify-center border-b border-border px-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="flex max-w-full items-center gap-2 rounded-md px-2 py-1 text-foreground transition-colors hover:bg-accent">
                <MessagesSquare className="size-[18px] shrink-0 text-muted-foreground" />
                <span className="truncate text-sm font-semibold">{activeChat.name}</span>
                <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-[320px] rounded-xl shadow-lg">
              {DEMO_AGENT_CHATS.map((chat) => (
                <DropdownMenuItem key={chat.id} onSelect={() => setActiveChatId(chat.id)}>
                  <span className="truncate">{chat.name}</span>
                  {chat.id === chatId ? <Check className="ml-auto size-4 shrink-0" /> : null}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <ChatBody chatId={chatId} />
      </div>
    );
  }

  return (
    <>
      <div aria-hidden className="fixed inset-0 z-40 bg-black/40" onClick={() => setChatOpen(false)} />
      <div ref={panelRef} className="fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-[420px] flex-col bg-background shadow-2xl" style={{ width: Math.min(width, 420) }}>
        <div className="flex h-16 shrink-0 items-center justify-center border-b border-border px-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="flex max-w-full items-center gap-2 rounded-md px-2 py-1 text-foreground transition-colors hover:bg-accent">
                <MessagesSquare className="size-[18px] shrink-0 text-muted-foreground" />
                <span className="truncate text-sm font-semibold">{activeChat.name}</span>
                <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-[320px] rounded-xl shadow-lg">
              {DEMO_AGENT_CHATS.map((chat) => (
                <DropdownMenuItem key={chat.id} onSelect={() => setActiveChatId(chat.id)}>
                  <span className="truncate">{chat.name}</span>
                  {chat.id === chatId ? <Check className="ml-auto size-4 shrink-0" /> : null}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <ChatBody chatId={chatId} />
      </div>
    </>
  );
}
