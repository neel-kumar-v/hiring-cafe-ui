"use client";

import KanbanJobCardContents from "@/components/job/contents/KanbanJobCardContents";
import { KanbanBoard as KanbanBoardUI, KanbanCardWithDragHandle, KanbanCards, KanbanHeader, KanbanProvider } from "@/components/ui/kanban";
import { ActionBar, ActionBarGroup, ActionBarItem, ActionBarSelection, ActionBarSeparator } from "@/components/ui/action-bar";
import { useApp } from "@/contexts/AppContext";
import { JobPreviewOverlay, useJobPreviewSequence } from "@/hooks/useJobPreview";
import { buildSharePayload, selectRangeIds } from "@/lib/jobs/selection";
import type { JobStatus } from "@/types/app";
import type { JobCardResultDTO } from "@/types/convexJobs";
import type { JobCategory } from "@/types/tracker";
import { api } from "../../../convex/_generated/api";
import { useMutation } from "convex/react";
import { CheckCheck, Copy, EyeOff, MoveHorizontal, Share2, X } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useContainerWidth } from "@/hooks/useContainerWidth";
import { getAuthEmail } from "@/lib/local-auth";
import { toast } from "sonner";

interface KanbanBoardProps {
  jobs: JobCardResultDTO[];
  className?: string;
  visibleCategories?: Record<JobCategory, boolean>;
  selectionMode?: boolean;
  onSelectionModeChange?: (enabled: boolean) => void;
}

type KanbanColumn = {
  id: string;
  name: string;
  count: number;
};

/** Matches `min-w-[280px]` on kanban columns; keep in sync with `KanbanBoard` in ui/kanban. */
const MIN_KANBAN_COLUMN_WIDTH = 280;
/** Matches `gap-4` on the kanban provider grid. */
const KANBAN_COLUMN_GAP = 16;
/** Priority when fitting a subset of columns on narrower board widths. */
const KANBAN_CATEGORY_PRIORITY: readonly JobCategory[] = ["saved", "applied", "interviewing", "rejected", "hidden"];
const DEFAULT_VISIBLE_CATEGORIES: Record<JobCategory, boolean> = {
  saved: true,
  applied: true,
  interviewing: true,
  rejected: true,
  hidden: false,
};

function maxKanbanColumnsForWidth(width: number): number {
  // n * minWidth + (n - 1) * gap <= width
  return Math.max(1, Math.floor((width + KANBAN_COLUMN_GAP) / (MIN_KANBAN_COLUMN_WIDTH + KANBAN_COLUMN_GAP)));
}

const KanbanBoard = memo(({ jobs, className, visibleCategories, selectionMode = false, onSelectionModeChange }: KanbanBoardProps) => {
  const { user, moveJob } = useApp();
  const hideForCurrentUser = useMutation(api.jobs.hideForCurrentUser);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const containerWidth = useContainerWidth(containerRef);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedJobIds, setSelectedJobIds] = useState<Set<string>>(new Set());
  const [anchorId, setAnchorId] = useState<string | null>(null);

  const kanbanData = useMemo(() => {
    const allJobIds = new Set([...user.saved, ...user.applied, ...user.interviewing, ...user.rejected, ...user.hidden]);
    const userJobs = jobs.filter(({ job }) => allJobIds.has(job.externalId));
    const additionalJobs = jobs.slice(0, 5).filter(({ job }) => !allJobIds.has(job.externalId));
    const jobsToShow = [...userJobs, ...additionalJobs];

    return jobsToShow.map(({ job }) => {
      let column = "saved";
      if (user.applied.includes(job.externalId)) column = "applied";
      else if (user.interviewing.includes(job.externalId)) column = "interviewing";
      else if (user.rejected.includes(job.externalId)) column = "rejected";
      else if (user.hidden.includes(job.externalId)) column = "hidden";
      return { id: job.externalId, name: job.title, column };
    });
  }, [jobs, user]);

  const jobMap = useMemo(() => {
    const allJobIds = new Set([...user.saved, ...user.applied, ...user.interviewing, ...user.rejected, ...user.hidden]);
    const userJobs = jobs.filter(({ job }) => allJobIds.has(job.externalId));
    const additionalJobs = jobs.slice(0, 5).filter(({ job }) => !allJobIds.has(job.externalId));
    const jobsToShow = [...userJobs, ...additionalJobs];
    return new Map(jobsToShow.map((row) => [row.job.externalId, row]));
  }, [jobs, user]);

  const columns: KanbanColumn[] = useMemo(() => {
    const counts: Record<JobCategory, number> = {
      saved: 0,
      applied: 0,
      interviewing: 0,
      rejected: 0,
      hidden: 0,
    };
    for (const item of kanbanData) {
      const key = item.column as JobCategory;
      if (key in counts) counts[key] += 1;
    }

    const labels: Record<JobCategory, string> = {
      saved: "Saved",
      applied: "Applied",
      interviewing: "Interviewing",
      rejected: "Rejected",
      hidden: "Hidden",
    };

    const visibility = visibleCategories ?? DEFAULT_VISIBLE_CATEGORIES;
    const available = KANBAN_CATEGORY_PRIORITY.filter((id) => visibility[id]).map((id) => ({
      id,
      name: labels[id],
      count: counts[id],
    }));

    // On narrower screens (before list mode) keep only the highest-priority
    // columns that still fit at card width.
    const effectiveWidth = containerWidth > 0 ? containerWidth : MIN_KANBAN_COLUMN_WIDTH * 4 + KANBAN_COLUMN_GAP * 3;
    return available.slice(0, maxKanbanColumnsForWidth(effectiveWidth));
  }, [kanbanData, visibleCategories, containerWidth]);
  const columnOrder = useMemo(() => columns.map((column) => column.id), [columns]);
  const orderedItems = useMemo(() => {
    const byColumn = new Map<string, { id: string }[]>();
    for (const columnId of columnOrder) byColumn.set(columnId, []);
    for (const item of kanbanData) {
      if (!byColumn.has(item.column)) continue;
      byColumn.get(item.column)!.push({ id: item.id });
    }
    return columnOrder.flatMap((columnId) => byColumn.get(columnId) ?? []);
  }, [columnOrder, kanbanData]);
  const selectedRows = useMemo(
    () =>
      Array.from(selectedJobIds)
        .map((id) => jobMap.get(id))
        .filter(Boolean) as JobCardResultDTO[],
    [jobMap, selectedJobIds]
  );

  const getCurrentStatus = useCallback(
    (jobId: string): JobCategory => {
      if (user.applied.includes(jobId)) return "applied";
      if (user.interviewing.includes(jobId)) return "interviewing";
      if (user.rejected.includes(jobId)) return "rejected";
      if (user.hidden.includes(jobId)) return "hidden";
      return "saved";
    },
    [user.applied, user.hidden, user.interviewing, user.rejected]
  );

  const handleDataChange = useCallback(
    (newData: { id: string; name: string; column: string }[]) => {
      newData.forEach((item) => {
        const currentStatus = getCurrentStatus(item.id);
        if (currentStatus !== item.column) {
          moveJob(item.id, currentStatus as JobStatus, item.column as JobStatus);
        }
      });
    },
    [getCurrentStatus, moveJob]
  );

  const clearSelectionMode = useCallback(() => {
    onSelectionModeChange?.(false);
    setSelectedJobIds(new Set());
    setAnchorId(null);
  }, [onSelectionModeChange]);

  const selectedColumnId = selectedJobId ? (kanbanData.find((item) => item.id === selectedJobId)?.column ?? null) : null;

  const jobsByColumn = useMemo(() => {
    const grouped = new Map<string, JobCardResultDTO[]>();
    for (const column of columns) {
      grouped.set(column.id, []);
    }
    for (const item of kanbanData) {
      if (!grouped.has(item.column)) continue;
      const row = jobMap.get(item.id);
      if (!row) continue;
      grouped.get(item.column)!.push(row);
    }
    return grouped;
  }, [columns, jobMap, kanbanData]);

  const rotatedColumnOrder = useMemo(() => {
    if (!columnOrder.length) return [];
    if (!selectedColumnId) return columnOrder;
    const selectedColumnIndex = columnOrder.indexOf(selectedColumnId);
    if (selectedColumnIndex === -1) return columnOrder;
    return [...columnOrder.slice(selectedColumnIndex), ...columnOrder.slice(0, selectedColumnIndex)];
  }, [columnOrder, selectedColumnId]);

  const navigationSequence = useMemo(() => rotatedColumnOrder.flatMap((columnId) => jobsByColumn.get(columnId) ?? []), [jobsByColumn, rotatedColumnOrder]);

  const {
    isDesktop,
    dialogOpen,
    setDialogOpen,
    drawerOpen,
    setDrawerOpen,
    isTransitioning,
    fadeCompanyChrome,
    selectedRow,
    canNavigate,
    openJob,
    prefetchNeighbors,
    handlePrevious,
    handleNext,
    previousAriaLabel,
    nextAriaLabel,
  } = useJobPreviewSequence({
    sequence: navigationSequence,
    selectedId: selectedJobId,
    onSelectId: setSelectedJobId,
    prefetchOptions: { delayMs: 140, maxInflight: 2, maxSeen: 600 },
    previousAriaLabel: "Previous kanban job",
    nextAriaLabel: "Next kanban job",
  });

  const handleJobMouseDown = useCallback((e: React.MouseEvent) => {
    if (!(e.shiftKey || e.ctrlKey || e.metaKey)) return;
    e.preventDefault();
    window.getSelection()?.removeAllRanges();
  }, []);

  const handleJobSelect = useCallback(
    (jobId: string, e: React.MouseEvent) => {
      const isModifier = e.shiftKey || e.ctrlKey || e.metaKey;
      if (isModifier) window.getSelection()?.removeAllRanges();
      if (isModifier && !selectionMode) {
        onSelectionModeChange?.(true);
        setSelectedJobIds(new Set([jobId]));
        setAnchorId(jobId);
        return;
      }
      if (selectionMode) {
        if (e.shiftKey) {
          const anchor = anchorId ?? jobId;
          const rangeIds = selectRangeIds(orderedItems, anchor, jobId);
          setSelectedJobIds((prev) => {
            const next = new Set(prev);
            for (const id of rangeIds) next.add(id);
            return next;
          });
          if (!anchorId) setAnchorId(jobId);
          return;
        }
        if (e.ctrlKey || e.metaKey) {
          setSelectedJobIds((prev) => {
            const next = new Set(prev);
            if (next.has(jobId)) next.delete(jobId);
            else next.add(jobId);
            return next;
          });
          if (!anchorId) setAnchorId(jobId);
          return;
        }
        setSelectedJobIds((prev) => new Set(prev).add(jobId));
        if (!anchorId) setAnchorId(jobId);
        return;
      }
      if (!jobMap.has(jobId)) return;
      openJob(jobId);
    },
    [anchorId, jobMap, onSelectionModeChange, openJob, orderedItems, selectionMode]
  );

  const isBookmarked = useMemo(
    () =>
      selectedRow
        ? user.saved.includes(selectedRow.job.externalId) || user.applied.includes(selectedRow.job.externalId) || user.interviewing.includes(selectedRow.job.externalId)
        : false,
    [selectedRow, user.applied, user.interviewing, user.saved]
  );

  const isApplied = useMemo(
    () => (selectedRow ? user.applied.includes(selectedRow.job.externalId) || user.interviewing.includes(selectedRow.job.externalId) : false),
    [selectedRow, user.applied, user.interviewing]
  );

  const isInterviewing = useMemo(() => (selectedRow ? user.interviewing.includes(selectedRow.job.externalId) : false), [selectedRow, user.interviewing]);

  const handleBookmarkToggle = useCallback(() => {
    if (!selectedRow) return;
    const jobId = selectedRow.job.externalId;
    const currentStatus = getCurrentStatus(jobId);
    if (isBookmarked) {
      if (user.saved.includes(jobId)) moveJob(jobId, "saved", "hidden");
      if (user.applied.includes(jobId)) moveJob(jobId, "applied", "hidden");
      if (user.interviewing.includes(jobId)) moveJob(jobId, "interviewing", "hidden");
      return;
    }
    moveJob(jobId, currentStatus as JobStatus, "saved");
  }, [getCurrentStatus, isBookmarked, moveJob, selectedRow, user.applied, user.interviewing, user.saved]);

  const handleApplyToggle = useCallback(() => {
    if (!selectedRow) return;
    const jobId = selectedRow.job.externalId;
    const currentStatus = getCurrentStatus(jobId);
    if (isApplied) {
      if (user.applied.includes(jobId)) moveJob(jobId, "applied", "saved");
      if (user.interviewing.includes(jobId)) moveJob(jobId, "interviewing", "saved");
      return;
    }
    moveJob(jobId, currentStatus as JobStatus, "applied");
  }, [getCurrentStatus, isApplied, moveJob, selectedRow, user.applied, user.interviewing]);

  const moveSelectedToColumn = useCallback(
    (targetColumn: string) => {
      for (const jobId of selectedJobIds) {
        const currentStatus = getCurrentStatus(jobId);
        if (currentStatus !== targetColumn) moveJob(jobId, currentStatus as JobStatus, targetColumn as JobStatus);
      }
    },
    [getCurrentStatus, moveJob, selectedJobIds]
  );

  const handleMoveLeft = useCallback(() => {
    for (const jobId of selectedJobIds) {
      const current = getCurrentStatus(jobId);
      const idx = columnOrder.indexOf(current);
      if (idx > 0) moveJob(jobId, current as JobStatus, columnOrder[idx - 1] as JobStatus);
    }
  }, [columnOrder, getCurrentStatus, moveJob, selectedJobIds]);

  const handleMoveRight = useCallback(() => {
    for (const jobId of selectedJobIds) {
      const current = getCurrentStatus(jobId);
      const idx = columnOrder.indexOf(current);
      if (idx !== -1 && idx < columnOrder.length - 1) moveJob(jobId, current as JobStatus, columnOrder[idx + 1] as JobStatus);
    }
  }, [columnOrder, getCurrentStatus, moveJob, selectedJobIds]);

  const allSelectedSaved = useMemo(
    () => selectedRows.length > 0 && selectedRows.every((row) => getCurrentStatus(row.job.externalId) === "saved"),
    [getCurrentStatus, selectedRows]
  );
  const allSelectedApplied = useMemo(
    () =>
      selectedRows.length > 0 &&
      selectedRows.every((row) => {
        const status = getCurrentStatus(row.job.externalId);
        return status === "applied" || status === "interviewing";
      }),
    [getCurrentStatus, selectedRows]
  );

  const handleBulkSave = useCallback(() => {
    if (allSelectedSaved) {
      for (const row of selectedRows) {
        const current = getCurrentStatus(row.job.externalId);
        if (current === "saved") moveJob(row.job.externalId, "saved", "hidden");
      }
      toast.success(`Unsaved ${selectedRows.length} job${selectedRows.length === 1 ? "" : "s"}.`);
      return;
    }
    for (const row of selectedRows) {
      const current = getCurrentStatus(row.job.externalId);
      if (current !== "saved") moveJob(row.job.externalId, current as JobStatus, "saved");
    }
    toast.success(`Saved ${selectedRows.length} job${selectedRows.length === 1 ? "" : "s"}.`);
  }, [allSelectedSaved, getCurrentStatus, moveJob, selectedRows]);

  const handleBulkApply = useCallback(() => {
    if (allSelectedApplied) {
      for (const row of selectedRows) {
        const current = getCurrentStatus(row.job.externalId);
        if (current === "applied" || current === "interviewing") moveJob(row.job.externalId, current as JobStatus, "saved");
      }
      toast.success(`Unmarked ${selectedRows.length} job${selectedRows.length === 1 ? "" : "s"} as applied.`);
      return;
    }
    for (const row of selectedRows) {
      const current = getCurrentStatus(row.job.externalId);
      if (current !== "applied") moveJob(row.job.externalId, current as JobStatus, "applied");
    }
    toast.success(`Marked ${selectedRows.length} job${selectedRows.length === 1 ? "" : "s"} as applied.`);
  }, [allSelectedApplied, getCurrentStatus, moveJob, selectedRows]);

  const handleBulkShare = useCallback(async () => {
    const payload = buildSharePayload(
      selectedRows.flatMap((row) => {
        const jobUrl = `${window.location.origin}/tracker?job=${encodeURIComponent(row.job.externalId)}`;
        return [jobUrl, row.job.applyUrl ?? null];
      })
    );
    if (!payload) {
      toast.error("No links available to share.");
      return;
    }
    try {
      await navigator.clipboard.writeText(payload);
      toast.success("Copied selected job links.");
    } catch {
      toast.error("Unable to copy links right now.");
    }
  }, [selectedRows]);

  const handleBulkHide = useCallback(async () => {
    const externalIds = selectedRows.map((row) => row.job.externalId);
    if (!externalIds.length) return;
    const res = await hideForCurrentUser({ externalIds, viewerEmail: getAuthEmail() ?? undefined });
    if (!res.ok) {
      toast.error("Please sign in to hide jobs.");
      return;
    }
    for (const row of selectedRows) {
      const current = getCurrentStatus(row.job.externalId);
      if (current !== "hidden") moveJob(row.job.externalId, current as JobStatus, "hidden");
    }
    toast.success(`Hidden ${externalIds.length} job${externalIds.length === 1 ? "" : "s"}.`);
    clearSelectionMode();
  }, [clearSelectionMode, getCurrentStatus, hideForCurrentUser, moveJob, selectedRows]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && selectionMode) clearSelectionMode();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [clearSelectionMode, selectionMode]);

  const downloadApplicationLinks = useCallback(
    (columnId: string) => {
      const columnJobs = kanbanData
        .filter((item) => item.column === columnId)
        .map((item) => jobMap.get(item.id))
        .filter(Boolean) as JobCardResultDTO[];
      const applicationLinks = columnJobs.map((row) => row.job.applyUrl).filter(Boolean);
      if (!applicationLinks.length) {
        alert("No application links found in this column.");
        return;
      }
      const textContent = applicationLinks.join("\n");
      const blob = new Blob([textContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${columnId}-application-links.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    [jobMap, kanbanData]
  );

  return (
    // Natural-flow board: columns grow with their cards and the page owns the
    // scroll, so there is no per-column scroll region to get stuck in. The grid
    // stretches columns to the tallest one, and every column's card list stays
    // shorter than that, so nothing clips.
    <div ref={containerRef} className={`w-full ${className ?? ""}`}>
      <KanbanProvider
        columns={columns}
        data={kanbanData}
        onDataChange={handleDataChange}
        className="w-full"
        onDragEnd={(event) => {
          const activeId = String(event.active.id);
          const over = event.over;
          if (!over || !selectionMode || !selectedJobIds.has(activeId)) return;
          const overId = String(over.id);
          const overItem = kanbanData.find((item) => item.id === overId);
          const targetColumn = overItem?.column ?? (columnOrder.includes(overId) ? overId : null);
          if (!targetColumn) return;
          moveSelectedToColumn(targetColumn);
        }}
      >
        {(column) => (
          <KanbanBoardUI key={column.id} id={column.id} className="h-full">
            <KanbanHeader className="group flex items-center justify-between">
              <span className="font-semibold">{column.name}</span>
              <div className="flex items-center gap-2">
                <button
                  className="rounded p-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:bg-muted"
                  onClick={() => downloadApplicationLinks(column.id)}
                  title="Copy list of application links"
                >
                  <Copy className="h-4 w-4 text-muted-foreground" />
                </button>
                <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">{column.count}</span>
              </div>
            </KanbanHeader>
            <KanbanCards id={column.id} key={column.id} className="flex-1">
              {(item) => {
                const row = jobMap.get(item.id);
                if (!row) return null;

                return (
                  <KanbanCardWithDragHandle
                    key={item.id}
                    id={item.id}
                    name={item.name}
                    column={item.column}
                    className={`mb-2 select-none transition-shadow duration-200 hover:shadow-md ${selectedJobIds.has(row.job.externalId) ? "ring-2 ring-primary/40" : ""}`}
                    onJobClick={(e) => handleJobSelect(row.job.externalId, e)}
                    onJobMouseDown={handleJobMouseDown}
                    dragHandleOnly={true}
                  >
                    <KanbanJobCardContents job={row.job} company={row.company} />
                  </KanbanCardWithDragHandle>
                );
              }}
            </KanbanCards>
          </KanbanBoardUI>
        )}
      </KanbanProvider>

      <ActionBar
        open={selectionMode}
        onOpenChange={(open) => (!open ? clearSelectionMode() : onSelectionModeChange?.(open))}
        className="border border-border/60 bg-background shadow-xl dark:border-border"
      >
        <ActionBarSelection>
          Selection mode
          <ActionBarSeparator />
          {selectedJobIds.size} selected
        </ActionBarSelection>
        <ActionBarGroup>
          <ActionBarItem onSelect={(e) => e.preventDefault()} onClick={handleBulkSave}>
            {allSelectedSaved ? "Unsave" : "Save"}
          </ActionBarItem>
          <ActionBarItem onSelect={(e) => e.preventDefault()} onClick={handleBulkApply}>
            <CheckCheck className="size-4" />
            {allSelectedApplied ? "Unmark Applied" : "Mark Applied"}
          </ActionBarItem>
          <ActionBarItem onSelect={(e) => e.preventDefault()} onClick={handleBulkShare}>
            <Share2 className="size-4" />
            Share
          </ActionBarItem>
          <ActionBarItem
            className="text-destructive! hover:text-destructive! focus-visible:text-destructive! [&_svg]:text-destructive!"
            onSelect={(e) => e.preventDefault()}
            onClick={handleBulkHide}
          >
            <EyeOff className="size-4 text-destructive!" />
            Hide
          </ActionBarItem>
          <ActionBarItem onSelect={(e) => e.preventDefault()} onClick={handleMoveLeft}>
            <MoveHorizontal className="size-4" />
            Move left
          </ActionBarItem>
          <ActionBarItem onSelect={(e) => e.preventDefault()} onClick={handleMoveRight}>
            <MoveHorizontal className="size-4" />
            Move right
          </ActionBarItem>
          <select
            className="h-8 rounded border bg-background px-2 text-sm"
            onChange={(e) => {
              if (!e.target.value) return;
              moveSelectedToColumn(e.target.value);
            }}
            value=""
          >
            <option value="" disabled>
              Move to...
            </option>
            {columns.map((column) => (
              <option key={column.id} value={column.id}>
                {column.name}
              </option>
            ))}
          </select>
          <ActionBarItem onSelect={(e) => e.preventDefault()} onClick={clearSelectionMode}>
            <X className="size-4" />
            Exit
          </ActionBarItem>
        </ActionBarGroup>
      </ActionBar>

      <JobPreviewOverlay
        job={selectedRow?.job ?? null}
        company={selectedRow?.company ?? null}
        isDesktop={isDesktop}
        dialogOpen={dialogOpen}
        drawerOpen={drawerOpen}
        onDialogOpenChange={setDialogOpen}
        onDrawerClose={() => setDrawerOpen(false)}
        isApplied={isApplied}
        isBookmarked={isBookmarked}
        isInterviewing={isInterviewing}
        fadeCompanyChrome={fadeCompanyChrome}
        isTransitioning={isTransitioning}
        onApplyToggle={handleApplyToggle}
        onBookmarkToggle={handleBookmarkToggle}
        onDetailsResolved={prefetchNeighbors}
        onPrevious={handlePrevious}
        onNext={handleNext}
        canGoPrevious={canNavigate}
        canGoNext={canNavigate}
        previousAriaLabel={previousAriaLabel}
        nextAriaLabel={nextAriaLabel}
      />
    </div>
  );
});

KanbanBoard.displayName = "KanbanBoard";

export default KanbanBoard;
