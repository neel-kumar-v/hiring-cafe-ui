"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { SlidingTabs } from "@/components/ui/sliding-tabs";
import { Textarea } from "@/components/ui/textarea";
import { TooltipProvider } from "@/components/ui/tooltip";
import CompanyLogo from "@/components/job/util/CompanyLogo";
import { DEMO_MAIL_THREADS, getMessagePreview, type MailThread, type ThreadQuickAction } from "@/data/inbox-demo";
import { extractDomainFromCompanyWebsite } from "@/lib/company-info";
import { toUiCompany } from "@/lib/jobs/toUiCompany";
import { formatCompactRelativeTime } from "@/lib/relative-time";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Check,
  Clock,
  ExternalLink,
  FileText,
  Link2,
  MessageSquare,
  Search,
  UserPlus,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

interface ThreadReply {
  id: string;
  text: string;
  timestamp: string;
}

const COMPANY_WEBSITES: Record<string, string> = {
  Stripe: "https://stripe.com",
  Linear: "https://linear.app",
  Vercel: "https://vercel.com",
  Anthropic: "https://anthropic.com",
  Figma: "https://figma.com",
  Notion: "https://notion.so",
  Ramp: "https://ramp.com",
};

function getCompanyUrl(company: string): string {
  if (COMPANY_WEBSITES[company]) {
    return COMPANY_WEBSITES[company];
  }
  const clean = company.toLowerCase().replace(/[^a-z0-9]/g, "");
  return `https://www.${clean}.com`;
}

function getThreadCompanyData(thread: MailThread) {
  const url = getCompanyUrl(thread.company);
  const domain = thread.companyDomain || extractDomainFromCompanyWebsite(url) || undefined;
  return toUiCompany({
    _id: `company-${thread.id}`,
    companyId: thread.company.toLowerCase(),
    name: thread.company,
    homepageUri: url,
    canonicalDomain: domain,
    imageUrl: thread.companyLogo,
    industries: [],
    activities: [],
    jobIdsPreview: [],
  });
}

const DEFAULT_QUICK_ACTIONS: ThreadQuickAction[] = [
  { id: "act-interested", kind: "interested", label: "Interested" },
  { id: "act-availability", kind: "availability", label: "Give availability" },
  { id: "act-custom", kind: "custom-reply", label: "Custom reply" },
  { id: "act-not-interested", kind: "not-interested", label: "Not interested" },
  { id: "act-company-site", kind: "company-site" },
  { id: "act-mute", kind: "mute" },
];

/** Shared bento cell chrome — sharp rectangles, shared borders with neighbors. */
const QUICK_ACTION_BENTO_CELL =
  "h-auto min-h-9 w-full justify-center gap-1.5 !rounded-none !border-0 !border-r !border-b !border-border !shadow-none px-3 py-2.5 text-xs font-medium focus-visible:z-10 focus-visible:ring-1 focus-visible:ring-primary/40";

function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(urlRegex);
  return matches ? Array.from(new Set(matches)) : [];
}

const AVAILABILITY_PRESETS = [
  "This Thursday & Friday afternoons (2:00 PM – 5:00 PM EST)",
  "Next week Monday – Wednesday mornings (9:30 AM – 12:00 PM EST)",
  "Flexible anytime this week between 11:00 AM – 4:00 PM EST",
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function InboxPage() {
  const searchParams = useSearchParams();
  const threadParam = searchParams?.get("thread") ?? null;
  const initialThreadId =
    threadParam && DEMO_MAIL_THREADS.some((thread) => thread.id === threadParam) ? threadParam : DEMO_MAIL_THREADS[0].id;

  const [threads, setThreads] = useState<MailThread[]>(DEMO_MAIL_THREADS);
  const [selectedId, setSelectedId] = useState<string>(initialThreadId);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [replyText, setReplyText] = useState("");
  const [isCustomReplying, setIsCustomReplying] = useState(false);
  const [mutedThreadIds, setMutedThreadIds] = useState<Set<string>>(() => new Set());
  const [threadReplies, setThreadReplies] = useState<Record<string, ThreadReply[]>>({});
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);
  const [selectedAvailabilitySlot, setSelectedAvailabilitySlot] = useState(AVAILABILITY_PRESETS[0]);
  const [customAvailabilityNote, setCustomAvailabilityNote] = useState("");
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!threadParam) return;
    const match = DEMO_MAIL_THREADS.find((thread) => thread.id === threadParam);
    if (!match) return;
    setSelectedId(match.id);
    setMobileView("detail");
    setThreads((prev) => prev.map((item) => (item.id === match.id ? { ...item, unread: false } : item)));
  }, [threadParam]);

  const selectedThread = useMemo(() => threads.find((t) => t.id === selectedId) || threads[0], [threads, selectedId]);

  const filteredThreads = useMemo(() => {
    return threads.filter((t) => {
      if (filter === "unread" && !t.unread) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = t.name.toLowerCase().includes(q);
        const matchesCompany = t.company.toLowerCase().includes(q);
        const matchesSubject = t.subject.toLowerCase().includes(q);
        const matchesText = t.text.toLowerCase().includes(q);
        if (!matchesName && !matchesCompany && !matchesSubject && !matchesText) {
          return false;
        }
      }
      return true;
    });
  }, [threads, filter, searchQuery]);

  const extractedLinks = useMemo(() => {
    return selectedThread ? extractUrls(selectedThread.text) : [];
  }, [selectedThread]);

  const isThreadMuted = Boolean(selectedThread && mutedThreadIds.has(selectedThread.id));
  const currentReplies = selectedThread ? threadReplies[selectedThread.id] || [] : [];

  const activeQuickActions = useMemo(() => {
    return selectedThread?.quickActions && selectedThread.quickActions.length > 0
      ? selectedThread.quickActions
      : DEFAULT_QUICK_ACTIONS;
  }, [selectedThread]);

  const handleSelectThread = (thread: MailThread) => {
    setSelectedId(thread.id);
    setMobileView("detail");
    setIsCustomReplying(false);
    setReplyText("");
    if (thread.unread) {
      setThreads((prev) => prev.map((item) => (item.id === thread.id ? { ...item, unread: false } : item)));
    }
  };

  const addReply = (threadId: string, text: string) => {
    const newReply: ThreadReply = {
      id: `reply-${Date.now()}`,
      text,
      timestamp: "Just now",
    };
    setThreadReplies((prev) => ({
      ...prev,
      [threadId]: [...(prev[threadId] || []), newReply],
    }));
  };

  const handleInterested = (customMessage?: string) => {
    if (!selectedThread) return;
    const firstName = selectedThread.name.split(" ")[0];
    const message =
      customMessage ||
      `Hi ${firstName},\n\nThanks for reaching out! I'm interested in learning more about the ${selectedThread.subject.replace(/^(re:\s*|following up\s*-\s*)/i, "")} and would love to connect.`;
    addReply(selectedThread.id, message);
    toast.success(`Replied to ${selectedThread.name}: Interested in learning more.`);
  };

  const handleNotInterested = (actionLabel?: string) => {
    if (!selectedThread) return;
    const firstName = selectedThread.name.split(" ")[0];
    const message = `Hi ${firstName},\n\nThank you for thinking of me! I'm not currently open to new opportunities, but I appreciate you reaching out and would love to stay in touch for the future.`;
    addReply(selectedThread.id, message);
    toast.success(`Politely declined intro from ${selectedThread.name}.`);
  };

  const handleQuickReply = (message: string, toastLabel: string) => {
    if (!selectedThread) return;
    addReply(selectedThread.id, message);
    toast.success(`Sent reply to ${selectedThread.name}: ${toastLabel}`);
  };

  const handleSendAvailability = () => {
    if (!selectedThread) return;
    const firstName = selectedThread.name.split(" ")[0];
    const times = customAvailabilityNote.trim() || selectedAvailabilitySlot;
    const message = `Hi ${firstName},\n\nI'd be happy to chat! Here is my general availability:\n• ${times}\n\nLet me know what time works best on your end, or feel free to send over a calendar invite.`;
    addReply(selectedThread.id, message);
    setIsAvailabilityOpen(false);
    setCustomAvailabilityNote("");
    toast.success(`Availability sent to ${selectedThread.name}.`);
  };

  const handleToggleMute = () => {
    if (!selectedThread) return;
    setMutedThreadIds((prev) => {
      const next = new Set(prev);
      if (next.has(selectedThread.id)) {
        next.delete(selectedThread.id);
        toast.success(`Unmuted notifications from ${selectedThread.name}.`);
      } else {
        next.add(selectedThread.id);
        toast.success(`Muted thread from ${selectedThread.name}. Notifications disabled.`);
      }
      return next;
    });
  };

  const handleSendCustomReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedThread) {
      toast.error("Please enter a reply before sending.");
      return;
    }
    addReply(selectedThread.id, replyText.trim());
    toast.success(`Reply sent to ${selectedThread.name}.`);
    setReplyText("");
    setIsCustomReplying(false);
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="h-[calc(100vh-4rem)] w-full overflow-hidden bg-background">
        <ResizablePanelGroup direction="horizontal" className="h-full w-full items-stretch">
          {/* Left Pane: Message List */}
          <ResizablePanel
            defaultSize={40}
            minSize={28}
            maxSize={55}
            className={cn("flex flex-col border-r border-border bg-background", mobileView === "detail" ? "hidden md:flex" : "flex")}
          >
            {/* Header: Search + All mail / Unread toggle */}
            <div className="flex h-14 shrink-0 items-center justify-between gap-2 px-4">
              <div className="relative w-40 sm:w-48">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="search"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      (e.target as HTMLInputElement).blur();
                    }
                  }}
                  className="h-9 w-full bg-background pl-8 text-sm border-border placeholder:text-muted-foreground focus-visible:ring-primary/40"
                />
              </div>

              <SlidingTabs
                options={[
                  { id: "all", label: "All mail" },
                  { id: "unread", label: "Unread" },
                ]}
                value={filter}
                onChange={setFilter}
                ariaLabel="Filter messages"
                size="sm"
                className="rounded-lg shrink-0"
              />
            </div>

            <Separator />

            {/* Scrollable Threads List */}
            <div className="flex-1 overflow-y-auto">
              {filteredThreads.length === 0 ? (
                <div className="flex h-32 flex-col items-center justify-center text-center text-sm text-muted-foreground">No messages found</div>
              ) : (
                filteredThreads.map((thread) => {
                  const isSelected = thread.id === selectedThread.id;
                  const isMuted = mutedThreadIds.has(thread.id);
                  return (
                    <button
                      key={thread.id}
                      type="button"
                      onClick={() => handleSelectThread(thread)}
                      className={cn(
                        "group flex w-full items-start gap-2.5 rounded-none border-b border-border px-3.5 py-3 text-left transition-colors focus-visible:outline-none focus-visible:bg-accent/50",
                        isSelected ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-accent/50"
                      )}
                    >
                      {/* Unread indicator dot */}
                      <span
                        className={cn(
                          "mt-3.5 size-2 shrink-0 rounded-full transition-opacity",
                          thread.unread ? "bg-primary opacity-100" : "opacity-0"
                        )}
                        aria-hidden
                      />

                      {/* Company Logo on left */}
                      <div className="shrink-0 mt-0.5">
                        <CompanyLogo
                          companyData={getThreadCompanyData(thread)}
                          size="sm"
                          variant="inbox"
                          className="size-10"
                        />
                      </div>

                      {/* Thread Row Content */}
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <div className="flex w-full items-center justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-1.5">
                            <span className="truncate text-sm font-semibold text-foreground">{thread.name}</span>
                            <span aria-hidden className="shrink-0 text-xs text-muted-foreground">
                              ·
                            </span>
                            <span className="truncate text-xs font-medium text-muted-foreground">{thread.company}</span>
                          </div>
                          <div className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                            {isMuted && <VolumeX className="size-3 text-muted-foreground" aria-label="Thread muted" />}
                            <Clock className="size-3.5 shrink-0" />
                            {formatCompactRelativeTime(thread.date)}
                          </div>
                        </div>

                        <div className="text-xs font-medium text-foreground/90 line-clamp-1">{thread.subject}</div>

                        <div className="truncate text-xs text-muted-foreground">
                          {getMessagePreview(thread.text)}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </ResizablePanel>

          <ResizableHandle className="hidden w-1 bg-transparent after:hidden md:flex" />

          {/* Right Pane: Message Detail & Quick Action Bar */}
          <ResizablePanel defaultSize={60} minSize={40} className={cn("flex flex-col bg-background", mobileView === "list" ? "hidden md:flex" : "flex")}>
            {/* Message Detail Header */}
            {selectedThread ? (
              <>
                <div className="flex items-start justify-between p-4 gap-4">
                  <div className="flex items-start gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 md:hidden text-muted-foreground hover:text-foreground -ml-1 mr-1 shrink-0"
                      onClick={() => setMobileView("list")}
                      aria-label="Back to messages"
                    >
                      <ArrowLeft className="size-4" />
                    </Button>
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground ring-1 ring-border">
                      {getInitials(selectedThread.name)}
                    </div>
                    <div className="grid gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">{selectedThread.name}</span>
                        {isThreadMuted && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground ring-1 ring-border/50">
                            <VolumeX className="size-3" />
                            Muted
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">{selectedThread.company}</span>
                      <span className="text-xs font-medium text-foreground/90">{selectedThread.subject}</span>
                    </div>
                  </div>
                  <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3.5 shrink-0" />
                    {selectedThread.timestamp}
                  </span>
                </div>

                <Separator />

                {/* Email Body & Replies */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <div className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">{selectedThread.text}</div>

                  {currentReplies.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-border/50">
                      {currentReplies.map((reply) => (
                        <div key={reply.id} className="flex flex-col items-end">
                          <div className="flex items-center gap-1.5 mb-1 text-xs text-muted-foreground">
                            <span className="font-semibold text-foreground">You</span>
                            <span>·</span>
                            <span>{reply.timestamp}</span>
                          </div>
                          <div className="max-w-[85%] rounded-2xl rounded-tr-xs bg-primary/10 border border-primary/20 px-4 py-2.5 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                            {reply.text}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Bottom Quick Action Bar */}
                <div className="bg-background">
                  <div className="space-y-3">
                    {/* Quick Action Buttons — bento grid, shared borders */}
                    <div className="overflow-hidden border border-border">
                      <div className="grid grid-cols-2 sm:grid-cols-3 -mb-px -mr-px">
                        {activeQuickActions.map((action) => {
                          switch (action.kind) {
                            case "interested":
                              return (
                                <Button
                                  key={action.id}
                                  type="button"
                                  size="sm"
                                  onClick={() => handleInterested(action.replyText)}
                                  className={cn(
                                    QUICK_ACTION_BENTO_CELL,
                                    "bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-700/40"
                                  )}
                                >
                                  <Check className="size-3.5" />
                                  {action.label || "Interested"}
                                </Button>
                              );

                            case "availability":
                              return (
                                <Button
                                  key={action.id}
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setIsAvailabilityOpen(true)}
                                  className={cn(QUICK_ACTION_BENTO_CELL, "bg-background text-foreground hover:bg-accent/50")}
                                >
                                  <Calendar className="size-3.5 text-primary" />
                                  {action.label || "Give availability"}
                                </Button>
                              );

                            case "not-interested":
                              return (
                                <Button
                                  key={action.id}
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleNotInterested(action.label)}
                                  className={cn(
                                    QUICK_ACTION_BENTO_CELL,
                                    "bg-background text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                  )}
                                >
                                  <X className="size-3.5" />
                                  {action.label || "Not interested"}
                                </Button>
                              );

                            case "custom-reply":
                              return (
                                <Button
                                  key={action.id}
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setIsCustomReplying((prev) => !prev);
                                    setTimeout(() => textareaRef.current?.focus(), 50);
                                  }}
                                  className={cn(
                                    QUICK_ACTION_BENTO_CELL,
                                    "text-foreground hover:bg-accent/50",
                                    isCustomReplying ? "bg-accent text-accent-foreground" : "bg-background"
                                  )}
                                >
                                  <MessageSquare className="size-3.5 text-muted-foreground" />
                                  {action.label || "Custom reply"}
                                </Button>
                              );

                            case "request-info":
                              return (
                                <Button
                                  key={action.id}
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleQuickReply(
                                      action.replyText || "Could you please share more details or the full specification?",
                                      action.label || "Requested info"
                                    )
                                  }
                                  className={cn(QUICK_ACTION_BENTO_CELL, "bg-background text-foreground hover:bg-accent/50")}
                                >
                                  <FileText className="size-3.5 text-primary" />
                                  {action.label || "Request info"}
                                </Button>
                              );

                            case "referral":
                              return (
                                <Button
                                  key={action.id}
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleQuickReply(
                                      action.replyText || "I'd be glad to refer a colleague who could be a great fit.",
                                      action.label || "Offered referral"
                                    )
                                  }
                                  className={cn(QUICK_ACTION_BENTO_CELL, "bg-background text-foreground hover:bg-accent/50")}
                                >
                                  <UserPlus className="size-3.5 text-muted-foreground" />
                                  {action.label || "Refer colleague"}
                                </Button>
                              );

                            case "company-site":
                              return (
                                <Button
                                  key={action.id}
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  asChild
                                  className={cn(QUICK_ACTION_BENTO_CELL, "bg-background text-foreground hover:bg-accent/50")}
                                >
                                  <a href={action.url || getCompanyUrl(selectedThread.company)} target="_blank" rel="noopener noreferrer">
                                    <Building2 className="size-3.5 text-muted-foreground" />
                                    {action.label || `${selectedThread.company} site`}
                                    <ExternalLink className="size-3 text-muted-foreground" />
                                  </a>
                                </Button>
                              );

                            case "recruiter-link": {
                              const linkUrl = action.url || extractedLinks[0] || getCompanyUrl(selectedThread.company);
                              return (
                                <Button
                                  key={action.id}
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  asChild
                                  className={cn(QUICK_ACTION_BENTO_CELL, "bg-background text-foreground hover:bg-accent/50")}
                                >
                                  <a href={linkUrl} target="_blank" rel="noopener noreferrer">
                                    <Link2 className="size-3.5 text-primary" />
                                    {action.label || "Open recruiter link"}
                                    <ExternalLink className="size-3 text-muted-foreground" />
                                  </a>
                                </Button>
                              );
                            }

                            case "view-roles":
                              return (
                                <Button
                                  key={action.id}
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  asChild
                                  className={cn(QUICK_ACTION_BENTO_CELL, "bg-background text-foreground hover:bg-accent/50")}
                                >
                                  <a href={`/?search=${encodeURIComponent(selectedThread.company)}`} target="_blank" rel="noopener noreferrer">
                                    <Search className="size-3.5 text-muted-foreground" />
                                    {action.label || `View ${selectedThread.company} roles`}
                                    <ExternalLink className="size-3 text-muted-foreground" />
                                  </a>
                                </Button>
                              );

                            case "mute":
                              return (
                                <Button
                                  key={action.id}
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={handleToggleMute}
                                  className={cn(
                                    QUICK_ACTION_BENTO_CELL,
                                    "transition-colors",
                                    isThreadMuted
                                      ? "bg-accent text-accent-foreground hover:bg-accent/80"
                                      : "bg-background text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                                  )}
                                >
                                  {isThreadMuted ? (
                                    <>
                                      <Volume2 className="size-3.5 text-muted-foreground" />
                                      Unmute
                                    </>
                                  ) : (
                                    <>
                                      <VolumeX className="size-3.5" />
                                      Mute
                                    </>
                                  )}
                                </Button>
                              );

                            default:
                              return null;
                          }
                        })}
                      </div>
                    </div>

                    {/* Expandable Custom Reply Composer */}
                    {isCustomReplying && (
                      <form onSubmit={handleSendCustomReply} className="px-4 pb-4 pt-2 border-t border-border/60 space-y-2.5 animate-in fade-in-50 duration-150">
                        <Textarea
                          ref={textareaRef}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={`Reply to ${selectedThread.name}...`}
                          className="min-h-[85px] resize-none border-border bg-background focus-visible:ring-primary/40 text-sm"
                          autoFocus
                        />
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setIsCustomReplying(false);
                              setReplyText("");
                            }}
                            className="h-8 text-xs text-muted-foreground hover:text-foreground"
                          >
                            Cancel
                          </Button>
                          <Button type="submit" size="sm" className="h-8 bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-4 text-xs">
                            Send reply
                          </Button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>

                {/* Give Availability Dialog */}
                <Dialog open={isAvailabilityOpen} onOpenChange={setIsAvailabilityOpen}>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Share your availability</DialogTitle>
                      <DialogDescription className="sr-only">
                        Send available time slots to {selectedThread.name} at {selectedThread.company}.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 py-2">
                      <label className="text-xs font-semibold text-muted-foreground">Select a time preset:</label>
                      <div className="space-y-2">
                        {AVAILABILITY_PRESETS.map((preset) => {
                          const isSelected = selectedAvailabilitySlot === preset && !customAvailabilityNote.trim();
                          return (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => {
                                setSelectedAvailabilitySlot(preset);
                                setCustomAvailabilityNote("");
                              }}
                              className={cn(
                                "w-full text-left rounded-lg border p-3 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                                isSelected
                                  ? "border-primary bg-primary/5 text-foreground font-medium"
                                  : "border-border hover:bg-accent/50 text-muted-foreground hover:text-foreground"
                              )}
                            >
                              {preset}
                            </button>
                          );
                        })}
                      </div>

                      <div className="space-y-1.5 pt-2">
                        <label className="text-xs font-semibold text-muted-foreground">Or enter custom times / note:</label>
                        <Input
                          placeholder="e.g., Any afternoon next week or calendly.com/your-name"
                          value={customAvailabilityNote}
                          onChange={(e) => setCustomAvailabilityNote(e.target.value)}
                          className="h-9 text-xs"
                        />
                      </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                      <Button type="button" variant="ghost" size="sm" onClick={() => setIsAvailabilityOpen(false)} className="text-xs">
                        Cancel
                      </Button>
                      <Button type="button" size="sm" onClick={handleSendAvailability} className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-xs">
                        Send availability
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-muted-foreground">No message selected</div>
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </TooltipProvider>
  );
}
