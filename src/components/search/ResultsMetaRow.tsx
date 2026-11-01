"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SlidingTabs, type SlidingTabOption } from "@/components/ui/sliding-tabs";
import { useApp } from "@/contexts/AppContext";
import { useSearchUI, type JobBoardLayout } from "@/contexts/SearchContext";
import type { SortOptions } from "@/types/search";
import { cn } from "@/lib/utils";
import { getJobGridColumnsForWidth, JOB_GRID_WIDTH_STEPS, useQuantizedContainerWidth } from "@/hooks/useContainerWidth";
import { Bell, Check, ChevronDown, Share2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

/** Single-select cadence for job-alert emails: exactly one of Off / Daily / Weekly / Monthly. */
type NotificationFrequency = "off" | "daily" | "weekly" | "monthly";

/** Shared with the navbar notification bell so both controls stay in sync. */
const NOTIFICATION_FREQUENCY_STORAGE_KEY = "notifications.frequency";

const NOTIFICATION_FREQUENCY_OPTIONS: { value: NotificationFrequency; label: string }[] = [
  { value: "off", label: "Off" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

function readStoredNotificationFrequency(): NotificationFrequency {
  try {
    const stored = window.localStorage.getItem(NOTIFICATION_FREQUENCY_STORAGE_KEY);
    if (stored && NOTIFICATION_FREQUENCY_OPTIONS.some((option) => option.value === stored)) {
      return stored as NotificationFrequency;
    }
  } catch {
    // Storage unavailable (e.g. private mode) — keep the "off" default.
  }
  return "off";
}

/**
 * Button inside the "Email me new jobs" pill: opens the notification-frequency
 * menu and shows the current setting ("Turn on" while off, otherwise the cadence).
 */
export function useNotificationFrequency() {
  const [frequency, setFrequencyState] = useState<NotificationFrequency>("off");

  useEffect(() => {
    setFrequencyState(readStoredNotificationFrequency());
    const sync = () => setFrequencyState(readStoredNotificationFrequency());
    window.addEventListener("storage", sync);
    window.addEventListener("notifications-frequency-change", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("notifications-frequency-change", sync);
    };
  }, []);

  const setFrequency = useCallback((next: NotificationFrequency) => {
    setFrequencyState(next);
    try {
      window.localStorage.setItem(NOTIFICATION_FREQUENCY_STORAGE_KEY, next);
    } catch {
      // Storage unavailable — the in-memory selection still applies.
    }
    window.dispatchEvent(new Event("notifications-frequency-change"));
  }, []);

  return [frequency, setFrequency] as const;
}

function NotificationFrequencyMenu() {
  const [frequency, setFrequency] = useNotificationFrequency();

  const current = NOTIFICATION_FREQUENCY_OPTIONS.find((option) => option.value === frequency) ?? NOTIFICATION_FREQUENCY_OPTIONS[0];

  const handleFrequencyChange = (next: string) => {
    const option = NOTIFICATION_FREQUENCY_OPTIONS.find((candidate) => candidate.value === next);
    if (!option) return;
    setFrequency(option.value);
    toast.success(option.value === "off" ? "Notification alerts turned off." : `Notification alerts set to ${option.label}.`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {frequency === "off" ? "Turn on" : current.label}
          <ChevronDown className="size-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {NOTIFICATION_FREQUENCY_OPTIONS.map((option) => (
          <DropdownMenuItem key={option.value} onSelect={() => handleFrequencyChange(option.value)}>
            <Check className={cn("mr-1 size-4", frequency === option.value ? "opacity-100" : "opacity-0")} />
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const SORT_PRESETS: { label: string; value: SortOptions }[] = [
  { label: "Relevance", value: { by: "Relevance", order: "Most" } },
  { label: "Most recent", value: { by: "Recency", order: "Most" } },
  { label: "Oldest", value: { by: "Recency", order: "Least" } },
  { label: "Highest salary", value: { by: "Salary", order: "Most" } },
  { label: "Lowest salary", value: { by: "Salary", order: "Least" } },
  { label: "Most experience", value: { by: "Experience", order: "Most" } },
  { label: "Least experience", value: { by: "Experience", order: "Least" } },
];

export function SortControl({ className }: { className?: string } = {}) {
  const { searchOptions, updateSearchOptions } = useApp();
  const current = SORT_PRESETS.find((preset) => preset.value.by === searchOptions.sort.by && preset.value.order === searchOptions.sort.order) ?? SORT_PRESETS[0];

  return (
    <div className={cn("flex items-center gap-1 text-sm whitespace-nowrap", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-md font-semibold text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {current.label}
            <ChevronDown className="size-3.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-44">
          {SORT_PRESETS.map((preset) => (
            <DropdownMenuItem key={preset.label} onSelect={() => updateSearchOptions({ sort: preset.value })}>
              <Check className={cn("mr-1 size-4", current.label === preset.label ? "opacity-100" : "opacity-0")} />
              {preset.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

const BOARD_LAYOUT_OPTIONS: readonly SlidingTabOption<JobBoardLayout>[] = [
  { id: "masonry", label: "Waterfall", ariaLabel: "Waterfall view" },
  { id: "grid", label: "Grid", ariaLabel: "Grid view" },
  { id: "list", label: "List", ariaLabel: "List view" },
];

/**
 * Waterfall / Grid / List switch for the results board. Mirrors the All/Unread
 * sliding tabs so both view controls share one visual language.
 */
export function BoardLayoutControl({ className }: { className?: string } = {}) {
  const { boardLayout, setBoardLayout } = useSearchUI();

  return (
    <SlidingTabs<JobBoardLayout>
      ariaLabel="Job board layout"
      role="radiogroup"
      shape="pill"
      tone="primary"
      size="sm"
      value={boardLayout}
      onChange={setBoardLayout}
      options={BOARD_LAYOUT_OPTIONS}
      className={cn("hidden @min-[640px]:inline-flex", className)}
      tabClassName="h-7 px-3"
    />
  );
}

interface BoardActionsProps {
  unreadCount?: number;
}

/** "All" shows every job, "Unread" narrows the board to the jobs labeled New. */
type BoardView = "all" | "unread";

export function BoardActions({ unreadCount: unreadCountProp }: BoardActionsProps = {}) {
  const { unreadView, setUnreadView, unreadCount: unreadCountFromContext } = useSearchUI();
  // Count of loaded New jobs is published by JobBoard via SearchUI; the prop wins
  // for callers that render the band without a mounted board.
  const unreadCount = unreadCountProp ?? unreadCountFromContext;
  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard.");
    } catch {
      toast.error("Unable to copy link right now.");
    }
  };

  const isUnreadDisabled = !unreadView && (!unreadCount || unreadCount <= 0);

  const viewOptions = useMemo<readonly SlidingTabOption<BoardView>[]>(
    () => [
      { id: "all", label: "All" },
      { id: "unread", label: `Unread ${unreadCount ?? 0}`, disabled: isUnreadDisabled },
    ],
    [unreadCount, isUnreadDisabled]
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* All / Unread sliding tabs — "Unread" shows only the jobs labeled New */}
      <SlidingTabs<BoardView>
        ariaLabel="Job view"
        role="radiogroup"
        shape="pill"
        tone="primary"
        size="sm"
        value={unreadView ? "unread" : "all"}
        onChange={(next) => setUnreadView(next === "unread")}
        options={viewOptions}
        tabClassName="h-7 px-3 [&:disabled]:pointer-events-none"
      />

      <Button type="button" size="sm" onClick={share} className="h-8 rounded-full bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90">
        <Share2 className="size-3.5" />
        Share
      </Button>

      <div className="flex h-8 items-center gap-2 rounded-full border border-primary/25 bg-primary/5 pl-3 pr-1 text-xs transition-colors hover:border-primary/40 hover:bg-primary/10 dark:bg-primary/10">
        <Bell className="size-3.5 text-primary" />
        <span className="text-xs font-medium text-primary">Email me new jobs</span>
        <NotificationFrequencyMenu />
      </div>
    </div>
  );
}

export interface ResultsHeaderBandProps {
  jobCount?: number | null;
  companyCount?: number | null;
  showSortControl?: boolean;
  unreadCount?: number;
  className?: string;
}

/**
 * Unified toolbar row:
 * Relevance sort control and the layout tabs on the left,
 * All/Unread toggle (with disabled 0 count), Share button, and Email me new jobs on the right.
 * No bottom border/divider (Feedback #5).
 * Reduced horizontal chrome padding (Feedback #3).
 */
export default function ResultsHeaderBand({ jobCount, companyCount, showSortControl = true, unreadCount, className }: ResultsHeaderBandProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const containerWidth = useQuantizedContainerWidth(containerRef, JOB_GRID_WIDTH_STEPS);
  const isOneColumn = containerWidth > 0 ? getJobGridColumnsForWidth(containerWidth) <= 1 : (typeof window !== "undefined" ? window.innerWidth < 640 : false);

  return (
    <div className={cn("px-4 py-3 transition-[padding] duration-500 ease-in-out lg:px-8", className)}>
      <div ref={containerRef} className="@container flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4">
          {showSortControl && <SortControl />}
          {!isOneColumn && <BoardLayoutControl />}
        </div>
        <BoardActions unreadCount={unreadCount} />
      </div>
    </div>
  );
}
