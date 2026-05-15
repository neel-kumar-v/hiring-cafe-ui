"use client";

import KanbanJobCardContents from "@/components/job/contents/KanbanJobCardContents";
import { KanbanBoard as KanbanBoardUI, KanbanCardWithDragHandle, KanbanCards, KanbanHeader, KanbanProvider } from "@/components/ui/kanban";
import { ActionBar, ActionBarGroup, ActionBarItem, ActionBarSelection, ActionBarSeparator } from "@/components/ui/action-bar";
import { useApp } from "@/contexts/AppContext";
import { useResponsiveBreakpoint } from "@/hooks/useMediaQuery";
import { useJobDetailsPrefetch } from "@/hooks/useJobDetailsPrefetch";
import { JOB_FADE_DURATION_MS } from "@/lib/jobs/fadeTransition";
import { getDetailsLookupId } from "@/lib/jobs/getDetailsLookupId";
import { buildSharePayload, selectRangeIds } from "@/lib/jobs/selection";
import { stableCompanyKey } from "@/lib/jobs/stableCompanyKey";
import type { JobStatus } from "@/types/app";
import type { JobCardResultDTO } from "@/types/convexJobs";
import { api } from "../../../convex/_generated/api";
import { useMutation } from "convex/react";
import { CheckCheck, Copy, EyeOff, MoveHorizontal, Share2, X } from "lucide-react";
import dynamic from "next/dynamic";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getAuthEmail } from "@/lib/local-auth";
import { toast } from "sonner";

const JobDialogContent = dynamic(() => import("../job/contents/JobDialogContent"), {
  loading: () => null,
  ssr: false,
});

const JobDrawerContent = dynamic(() => import("../job/contents/JobDrawerContent"), {
  loading: () => null,
  ssr: false,
});

const NAV_FADE_OUT_MS = JOB_FADE_DURATION_MS;
const NAV_SETTLE_MS = 50;

type JobCategory = "saved" | "applied" | "interviewing" | "rejected" | "hidden";

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

const KanbanBoard = memo(({ jobs, className, visibleCategories, selectionMode = false, onSelectionModeChange }: KanbanBoardProps) => {
  const { user, moveJob } = useApp();
  const hideForCurrentUser = useMutation(api.jobs.hideForCurrentUser);
  const { isDesktop } = useResponsiveBreakpoint();
  const { prefetch, prefetchNow } = useJobDetailsPrefetch({ delayMs: 140, maxInflight: 2, maxSeen: 600 });
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [fadeCompanyChromeNav, setFadeCompanyChromeNav] = useState(false);
  const [selectedJobIds, setSelectedJobIds] = useState<Set<string>>(new Set());
  const [anchorId, setAnchorId] = useState<string | null>(null);
  const transitionInFlightRef = useRef(false);

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
    const savedCount = kanbanData.filter((item) => item.column === "saved").length;
    const appliedCount = kanbanData.filter((item) => item.column === "applied").length;
    const interviewingCount = kanbanData.filter((item) => item.column === "interviewing").length;
    const rejectedCount = kanbanData.filter((item) => item.column === "rejected").length;
    const hiddenCount = kanbanData.filter((item) => item.column === "hidden").length;

    const allColumns = [
      { id: "saved", name: "Saved", count: savedCount },
      { id: "applied", name: "Applied", count: appliedCount },
      { id: "interviewing", name: "Interviewing", count: interviewingCount },
      { id: "rejected", name: "Rejected", count: rejectedCount },
      { id: "hidden", name: "Hidden", count: hiddenCount },
    ];

    if (visibleCategories) {
      return allColumns.filter((column) => visibleCategories[column.id as JobCategory]);
    }

    return allColumns;
  }, [kanbanData, visibleCategories]);
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
  const selectedRows = useMemo(() => Array.from(selectedJobIds).map((id) => jobMap.get(id)).filter(Boolean) as JobCardResultDTO[], [jobMap, selectedJobIds]);

  useEffect(() => {
    if (!selectedJobId) return;
    if (!jobMap.has(selectedJobId)) {
      setSelectedJobId(null);
      setDialogOpen(false);
      setDrawerOpen(false);
    }
  }, [jobMap, selectedJobId]);

  useEffect(() => {
    if (isDesktop) {
      setDrawerOpen(false);
      return;
    }
    setDialogOpen(false);
  }, [isDesktop]);

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

  const handleJobSelect = useCallback(
    (jobId: string, e: React.MouseEvent) => {
      const isModifier = e.shiftKey || e.ctrlKey || e.metaKey;
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
      const row = jobMap.get(jobId);
      if (!row) return;
      setSelectedJobId(jobId);
      if (isDesktop) setDialogOpen(true);
      else setDrawerOpen(true);
    },
    [anchorId, isDesktop, jobMap, onSelectionModeChange, orderedItems, selectionMode]
  );

  const selectedRow = selectedJobId ? (jobMap.get(selectedJobId) ?? null) : null;
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

  const selectedSequenceIndex = useMemo(
    () => (selectedJobId ? navigationSequence.findIndex((row) => row.job.externalId === selectedJobId) : -1),
    [navigationSequence, selectedJobId]
  );

  const prefetchNeighborsForSelected = useCallback(() => {
    if (!navigationSequence.length || selectedSequenceIndex === -1) return;
    if (navigationSequence.length < 2) return;
    const previousIndex = (selectedSequenceIndex - 1 + navigationSequence.length) % navigationSequence.length;
    const nextIndex = (selectedSequenceIndex + 1) % navigationSequence.length;
    prefetch(getDetailsLookupId(navigationSequence[previousIndex].job));
    if (nextIndex !== previousIndex) prefetch(getDetailsLookupId(navigationSequence[nextIndex].job));
  }, [navigationSequence, prefetch, selectedSequenceIndex]);

  const runNavigationTransition = useCallback(async (navigate: () => void, opts?: { fadeCompanyChrome?: boolean }) => {
    if (transitionInFlightRef.current) return;
    transitionInFlightRef.current = true;
    setFadeCompanyChromeNav(Boolean(opts?.fadeCompanyChrome));
    setIsTransitioning(true);
    try {
      await new Promise((resolve) => window.setTimeout(resolve, NAV_FADE_OUT_MS));
      navigate();
      await new Promise((resolve) => window.setTimeout(resolve, NAV_SETTLE_MS));
    } finally {
      transitionInFlightRef.current = false;
      setIsTransitioning(false);
      setFadeCompanyChromeNav(false);
    }
  }, []);

  const handlePrevious = useCallback(async () => {
    if (!navigationSequence.length || selectedSequenceIndex === -1) return;
    const previousIndex = (selectedSequenceIndex - 1 + navigationSequence.length) % navigationSequence.length;
    const current = navigationSequence[selectedSequenceIndex];
    const target = navigationSequence[previousIndex];
    const fadeCompanyChrome =
      stableCompanyKey(current.company, current.job) !== stableCompanyKey(target.company, target.job);
    prefetchNow(getDetailsLookupId(target.job));
    await runNavigationTransition(() => setSelectedJobId(target.job.externalId), { fadeCompanyChrome });
  }, [navigationSequence, prefetchNow, runNavigationTransition, selectedSequenceIndex]);

  const handleNext = useCallback(async () => {
    if (!navigationSequence.length || selectedSequenceIndex === -1) return;
    const nextIndex = (selectedSequenceIndex + 1) % navigationSequence.length;
    const current = navigationSequence[selectedSequenceIndex];
    const target = navigationSequence[nextIndex];
    const fadeCompanyChrome =
      stableCompanyKey(current.company, current.job) !== stableCompanyKey(target.company, target.job);
    prefetchNow(getDetailsLookupId(target.job));
    await runNavigationTransition(() => setSelectedJobId(target.job.externalId), { fadeCompanyChrome });
  }, [navigationSequence, prefetchNow, runNavigationTransition, selectedSequenceIndex]);

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

  const handleBulkSave = useCallback(() => {
    for (const row of selectedRows) {
      const current = getCurrentStatus(row.job.externalId);
      if (current !== "saved") moveJob(row.job.externalId, current as JobStatus, "saved");
    }
    toast.success(`Saved ${selectedRows.length} job${selectedRows.length === 1 ? "" : "s"}.`);
  }, [getCurrentStatus, moveJob, selectedRows]);

  const handleBulkApply = useCallback(() => {
    for (const row of selectedRows) {
      const current = getCurrentStatus(row.job.externalId);
      if (current !== "applied") moveJob(row.job.externalId, current as JobStatus, "applied");
    }
    toast.success(`Marked ${selectedRows.length} job${selectedRows.length === 1 ? "" : "s"} as applied.`);
  }, [getCurrentStatus, moveJob, selectedRows]);

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
    <div className={`h-full w-full ${className}`}>
      <KanbanProvider
        columns={columns}
        data={kanbanData}
        onDataChange={handleDataChange}
        className="h-full"
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
                    className={`mb-2 transition-shadow duration-200 hover:shadow-md ${selectedJobIds.has(row.job.externalId) ? "ring-2 ring-primary/40" : ""}`}
                    onJobClick={(e) => handleJobSelect(row.job.externalId, e)}
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

      <ActionBar open={selectionMode} onOpenChange={(open) => (!open ? clearSelectionMode() : onSelectionModeChange?.(open))}>
        <ActionBarSelection>
          Selection mode
          <ActionBarSeparator />
          {selectedJobIds.size} selected
        </ActionBarSelection>
        <ActionBarGroup>
          <ActionBarItem onSelect={(e) => e.preventDefault()} onClick={handleBulkSave}>
            Save
          </ActionBarItem>
          <ActionBarItem onSelect={(e) => e.preventDefault()} onClick={handleBulkApply}>
            <CheckCheck className="size-4" />
            Mark Applied
          </ActionBarItem>
          <ActionBarItem onSelect={(e) => e.preventDefault()} onClick={handleBulkShare}>
            <Share2 className="size-4" />
            Share
          </ActionBarItem>
          <ActionBarItem onSelect={(e) => e.preventDefault()} onClick={handleBulkHide}>
            <EyeOff className="size-4" />
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

      {isDesktop && selectedRow ? (
        <JobDialogContent
          company={selectedRow.company}
          currentJob={selectedRow.job}
          onDetailsResolved={prefetchNeighborsForSelected}
          isApplied={isApplied}
          isBookmarked={isBookmarked}
          isInterviewing={isInterviewing}
          fadeCompanyChrome={fadeCompanyChromeNav}
          isTransitioning={isTransitioning}
          onApplyToggle={handleApplyToggle}
          onBookmarkToggle={handleBookmarkToggle}
          onOpenChange={setDialogOpen}
          open={dialogOpen}
          outsideNavigation={{
            onPrevious: handlePrevious,
            onNext: handleNext,
            canGoPrevious: navigationSequence.length > 1,
            canGoNext: navigationSequence.length > 1,
            previousAriaLabel: "Previous kanban job",
            nextAriaLabel: "Next kanban job",
          }}
        />
      ) : null}

      {!isDesktop && selectedRow ? (
        <JobDrawerContent
          company={selectedRow.company}
          currentJob={selectedRow.job}
          onDetailsResolved={prefetchNeighborsForSelected}
          isApplied={isApplied}
          isBookmarked={isBookmarked}
          fadeCompanyChrome={fadeCompanyChromeNav}
          isTransitioning={isTransitioning}
          navigation={{
            onPrevious: handlePrevious,
            onNext: handleNext,
            canGoPrevious: navigationSequence.length > 1,
            canGoNext: navigationSequence.length > 1,
          }}
          onApplyToggle={handleApplyToggle}
          onBookmarkToggle={handleBookmarkToggle}
          onClose={() => setDrawerOpen(false)}
          open={drawerOpen}
        />
      ) : null}
    </div>
  );
});

KanbanBoard.displayName = "KanbanBoard";

export default KanbanBoard;
