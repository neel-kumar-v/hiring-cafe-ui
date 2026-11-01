import type { JobCardResultDTO } from "@/types/convexJobs";
import { useMutation, usePaginatedQuery } from "convex/react";
import dynamic from "next/dynamic";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActionBar, ActionBarGroup, ActionBarItem, ActionBarSelection, ActionBarSeparator } from "@/components/ui/action-bar";
import { buildSharePayload } from "@/lib/jobs/selection";
import { CheckCheck, EyeOff, Share2, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";
import { getAuthEmail } from "../lib/local-auth";
import { useApp } from "../contexts/AppContext";
import { useSearchUI, type JobBoardLayout } from "../contexts/SearchContext";
import { useJobBoardSelection } from "../hooks/useJobBoardSelection";
import { JobPreviewOverlay, useJobPreviewChrome } from "../hooks/useJobPreview";
import { getJobGridColumnsForWidth, JOB_GRID_WIDTH_STEPS, useQuantizedContainerWidth } from "../hooks/useContainerWidth";
import {
  buildJobBoardDisplayedCollections,
  flattenJobBoardPositions,
  getJobBoardCollectionKey,
  jobBoardFadeCompanyChromeBetweenFlatNeighbors,
  jobBoardFadeCompanyChromeBetweenJobs,
  jobBoardFlatIndexForSelection,
  jobBoardRememberedJobIndex,
  JOB_BOARD_PAGE_LIMIT,
  JOB_BOARD_PREFILL_VIEWPORT_MARGIN_PX,
  type JobBoardSelectedPosition,
} from "../lib/jobs/jobBoard";
import { shouldOpenJobFromUserClick } from "../lib/jobs/agentationJobOpenGate";
import { getDetailsLookupId } from "../lib/jobs/getDetailsLookupId";
import { toConvexJobSearchFilters } from "../lib/search/toConvexFilters";
import { isJobNew } from "./job/card/NewBadge";
import JobBoardCardSkeleton, { JobBoardListRowSkeleton } from "./job/JobBoardCardSkeleton";
import JobBoardListRow from "./job/JobBoardListRow";

const JobBoardCard = dynamic(() => import("./job/JobBoardCard"), {
  ssr: false,
});

// Keep bulk hides within the Convex mutation contract instead of retrying or
// fanning out one mutation per selected card.
const MAX_BULK_HIDE_JOBS = 200;

/**
 * Splits items row-major so masonry columns keep the board's reading order
 * (left-to-right across a row, then down). Used instead of one CSS grid so a
 * card's hover expansion only pushes down the cards below it in its own
 * column, not every card in the row.
 */
function splitIntoColumns<T>(items: readonly T[], columnCount: number): T[][] {
  const columnItems: T[][] = Array.from({ length: Math.max(1, columnCount) }, () => []);
  items.forEach((item, index) => {
    columnItems[index % columnItems.length].push(item);
  });
  return columnItems;
}

const JobBoard = ({ jobCount }: { jobCount?: number }) => {
  const { boardSearchQuery, boardLayout, jobBoardSelectionMode, setJobBoardSelectionMode, unreadView, setUnreadCount, isJobSeen, markJobSeen } = useSearchUI();
  const { searchOptions, user, addJob, removeJob } = useApp();
  const hideForCurrentUser = useMutation(api.jobs.hideForCurrentUser);
  const { isDesktop, dialogOpen, setDialogOpen, drawerOpen, setDrawerOpen, isTransitioning, fadeCompanyChrome, prefetch, prefetchNow, openPreview, closePreview, runTransition } =
    useJobPreviewChrome({ delayMs: 140, maxInflight: 3, maxSeen: 600 });
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedQuery(boardSearchQuery.trim()), 280);
    return () => window.clearTimeout(id);
  }, [boardSearchQuery]);

  const containerRef = useRef<HTMLDivElement>(null);
  // Quantized to the grid-column breakpoints: during sidebar/chat drag-resize
  // the observer fires every frame, and stepping on thresholds only (the only
  // thing `columns` reacts to) keeps the board from re-rendering while dragging.
  const containerWidth = useQuantizedContainerWidth(containerRef, JOB_GRID_WIDTH_STEPS);
  const columns = getJobGridColumnsForWidth(containerWidth);

  // A container narrow enough for a single column can't fit the waterfall or
  // grid presentation, so the board degrades to the list layout — exactly what
  // the List tab shows. Width 0 means "not measured yet" (SSR / first paint):
  // check window width as client fallback to avoid layout flash.
  const isSingleColumn = containerWidth > 0 ? columns <= 1 : typeof window !== "undefined" ? window.innerWidth < 640 : false;
  const effectiveLayout: JobBoardLayout = isSingleColumn ? "list" : boardLayout;

  const initialCount = columns * 4;
  const [visibleRowCount, setVisibleRowCount] = useState(initialCount);
  const [revealLoading, setRevealLoading] = useState(false);
  const [jobIndexByCollection, setJobIndexByCollection] = useState<Record<string, number>>({});
  const [selectedPosition, setSelectedPosition] = useState<JobBoardSelectedPosition | null>(null);
  const [pendingGroupAdvance, setPendingGroupAdvance] = useState(false);
  const [pendingJobAdvance, setPendingJobAdvance] = useState(false);

  const convexFilters = useMemo(() => toConvexJobSearchFilters(searchOptions), [searchOptions]);

  const {
    results: accumulatedJobs,
    status,
    loadMore,
    isLoading,
  } = usePaginatedQuery(
    api.jobs.search,
    { q: debouncedQuery || undefined, filters: convexFilters, sort: { by: debouncedQuery ? "relevance" : "recent", order: "desc" }, viewerEmail: getAuthEmail() ?? undefined },
    { initialNumItems: JOB_BOARD_PAGE_LIMIT }
  );

  useEffect(() => {
    setVisibleRowCount(columns * 4);
  }, [columns]);

  const accumulatedRows = useMemo(() => {
    return accumulatedJobs as unknown as JobCardResultDTO[];
  }, [accumulatedJobs]);

  const [unreadSessionRows, setUnreadSessionRows] = useState<JobCardResultDTO[] | null>(null);

  // Unseen jobs labeled New according to the stable hash and session seen tracking
  const unseenNewRows = useMemo(() => accumulatedRows.filter((row) => isJobNew(row.job) && !isJobSeen(row.job.externalId)), [accumulatedRows, isJobSeen]);

  useEffect(() => {
    if (unreadView) {
      setUnreadSessionRows((prev) => {
        const unseen = accumulatedRows.filter((row) => isJobNew(row.job) && !isJobSeen(row.job.externalId));
        if (!prev) {
          if (unseen.length > 0) {
            markJobSeen(unseen.map((r) => r.job.externalId));
          }
          return unseen;
        }
        const existingIds = new Set(prev.map((r) => r.job.externalId));
        const newlyLoaded = unseen.filter((r) => !existingIds.has(r.job.externalId));
        if (newlyLoaded.length > 0) {
          markJobSeen(newlyLoaded.map((r) => r.job.externalId));
          return [...prev, ...newlyLoaded];
        }
        return prev;
      });
    } else {
      setUnreadSessionRows(null);
    }
  }, [accumulatedRows, isJobSeen, markJobSeen, unreadView]);

  useEffect(() => {
    if (unreadView) {
      setUnreadCount(unreadSessionRows?.length ?? 0);
    } else {
      setUnreadCount(unseenNewRows.length);
    }
  }, [setUnreadCount, unreadSessionRows?.length, unreadView, unseenNewRows.length]);

  // Unread view narrows the board to the session's unread jobs so the number shown
  // in the toggle always matches what is displayed.
  const boardRows = useMemo(() => (unreadView ? (unreadSessionRows ?? unseenNewRows) : accumulatedRows), [accumulatedRows, unreadSessionRows, unreadView, unseenNewRows]);

  const displayedCollections = useMemo(() => {
    // In unread view show every loaded New job instead of the scroll cap so the
    // board matches the Unread count.
    return buildJobBoardDisplayedCollections(boardRows, unreadView ? Math.max(visibleRowCount, boardRows.length) : visibleRowCount);
  }, [boardRows, unreadView, visibleRowCount]);

  // Search results indexed row-major, then split across the masonry columns.
  // Kept beside `displayedCollections` because both masonry and grid read from
  // the same capped collection list.
  const collectionsByColumn = useMemo(
    () =>
      splitIntoColumns(
        displayedCollections.map((collection, collectionIndex) => ({ collection, collectionIndex })),
        columns
      ),
    [columns, displayedCollections]
  );

  const requestMoreForNavigation = useCallback(() => {
    if (revealLoading || isLoading) return;
    if (visibleRowCount < accumulatedRows.length) {
      setRevealLoading(true);
      window.setTimeout(() => {
        setVisibleRowCount((count) => Math.min(count + 8, accumulatedRows.length));
        setRevealLoading(false);
      }, 100);
      return;
    }
    if (status === "CanLoadMore") {
      loadMore(JOB_BOARD_PAGE_LIMIT);
    }
  }, [accumulatedRows.length, isLoading, loadMore, revealLoading, status, visibleRowCount]);

  const loadMoreItems = useCallback(() => {
    if (visibleRowCount >= accumulatedRows.length && status === "CanLoadMore" && !isLoading && !revealLoading) {
      loadMore(JOB_BOARD_PAGE_LIMIT);
      return;
    }
    if (visibleRowCount < accumulatedRows.length) {
      requestMoreForNavigation();
    }
  }, [accumulatedRows.length, isLoading, loadMore, requestMoreForNavigation, revealLoading, status, visibleRowCount]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2000) {
        loadMoreItems();
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadMoreItems]);

  useEffect(() => {
    if (status === "LoadingFirstPage" || revealLoading || isLoading) return;
    if (!displayedCollections.length) return;

    const canLoadMore = visibleRowCount < accumulatedRows.length || status === "CanLoadMore";
    if (!canLoadMore) return;

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const targetBottom = window.innerHeight + JOB_BOARD_PREFILL_VIEWPORT_MARGIN_PX;
    if (rect.bottom < targetBottom) {
      loadMoreItems();
    }
  }, [accumulatedRows.length, displayedCollections.length, isLoading, loadMoreItems, revealLoading, status, visibleRowCount]);

  // When selective filters (e.g. location) filter out all rows on a page, the query
  // returns an empty page with status "CanLoadMore". Auto-fetch next pages so the client
  // continues scanning until matching jobs are found or results are exhausted.
  useEffect(() => {
    if (status === "CanLoadMore" && !isLoading && !revealLoading && accumulatedJobs.length === 0) {
      loadMore(JOB_BOARD_PAGE_LIMIT);
    }
  }, [accumulatedJobs.length, isLoading, loadMore, revealLoading, status]);

  useEffect(() => {
    if (!displayedCollections.length) {
      setSelectedPosition(null);
      closePreview();
      return;
    }
    if (!selectedPosition) return;
    if (selectedPosition.collectionIndex >= displayedCollections.length) {
      const fallbackCollectionIndex = displayedCollections.length - 1;
      const fallbackCollection = displayedCollections[fallbackCollectionIndex];
      const fallbackJobIndex = Math.max(0, Math.min(selectedPosition.jobIndex, fallbackCollection.jobs.length - 1));
      setSelectedPosition({ collectionIndex: fallbackCollectionIndex, jobIndex: fallbackJobIndex });
      return;
    }
    const collection = displayedCollections[selectedPosition.collectionIndex];
    const clampedJobIndex = Math.max(0, Math.min(selectedPosition.jobIndex, collection.jobs.length - 1));
    if (clampedJobIndex !== selectedPosition.jobIndex) {
      setSelectedPosition({ collectionIndex: selectedPosition.collectionIndex, jobIndex: clampedJobIndex });
    }
  }, [closePreview, displayedCollections, selectedPosition]);

  const updateCollectionJobIndex = useCallback(
    (collectionIndex: number, nextJobIndex: number) => {
      const collection = displayedCollections[collectionIndex];
      if (!collection || !collection.jobs.length) return;
      const clampedJobIndex = Math.max(0, Math.min(nextJobIndex, collection.jobs.length - 1));
      const key = getJobBoardCollectionKey(collection, collectionIndex);
      setJobIndexByCollection((prev) => (prev[key] === clampedJobIndex ? prev : { ...prev, [key]: clampedJobIndex }));
      setSelectedPosition((prev) => (prev && prev.collectionIndex === collectionIndex && prev.jobIndex !== clampedJobIndex ? { ...prev, jobIndex: clampedJobIndex } : prev));
    },
    [displayedCollections]
  );

  const setSelection = useCallback(
    (nextSelection: JobBoardSelectedPosition) => {
      const collection = displayedCollections[nextSelection.collectionIndex];
      if (!collection || !collection.jobs.length) return false;
      const clampedJobIndex = Math.max(0, Math.min(nextSelection.jobIndex, collection.jobs.length - 1));
      const finalSelection = { collectionIndex: nextSelection.collectionIndex, jobIndex: clampedJobIndex };
      setSelectedPosition(finalSelection);
      const key = getJobBoardCollectionKey(collection, nextSelection.collectionIndex);
      setJobIndexByCollection((prev) => (prev[key] === clampedJobIndex ? prev : { ...prev, [key]: clampedJobIndex }));
      return true;
    },
    [displayedCollections]
  );

  const openJobDetails = useCallback(
    (collectionIndex: number, jobIndex: number) => {
      if (!shouldOpenJobFromUserClick()) return;
      const job = displayedCollections[collectionIndex]?.jobs[jobIndex];
      if (job?.externalId) {
        markJobSeen(job.externalId);
      }
      const didSelect = setSelection({ collectionIndex, jobIndex });
      if (!didSelect) return;
      openPreview();
    },
    [displayedCollections, markJobSeen, openPreview, setSelection]
  );

  const selectedCollection = selectedPosition ? displayedCollections[selectedPosition.collectionIndex] : null;
  const selectedJob = selectedCollection ? selectedCollection.jobs[selectedPosition?.jobIndex ?? 0] : null;
  const selectedCompany = selectedCollection?.company ?? null;

  useEffect(() => {
    if (selectedJob?.externalId) {
      markJobSeen(selectedJob.externalId);
    }
  }, [markJobSeen, selectedJob?.externalId]);

  const flattenedPositions = useMemo(() => flattenJobBoardPositions(displayedCollections), [displayedCollections]);
  const flatSelectionOrder = useMemo(
    () =>
      flattenedPositions.map((item) => ({
        id: item.job.externalId,
        collectionIndex: item.collectionIndex,
        jobIndex: item.jobIndex,
      })),
    [flattenedPositions]
  );
  const {
    selectedIds: selectedJobIds,
    clear: clearSelectionMode,
    handleCardClick: handleCardSelectionClick,
  } = useJobBoardSelection({
    orderedIds: flatSelectionOrder.map((item) => item.id),
    selectionMode: jobBoardSelectionMode,
    setSelectionMode: setJobBoardSelectionMode,
    onOpen: (jobId) => {
      const item = flatSelectionOrder.find((row) => row.id === jobId);
      if (item) openJobDetails(item.collectionIndex, item.jobIndex);
    },
  });

  useEffect(() => {
    if (selectedJobIds.size > 0) {
      markJobSeen(Array.from(selectedJobIds));
    }
  }, [markJobSeen, selectedJobIds]);

  const selectedJobs = useMemo(() => {
    const selected = new Set(selectedJobIds);
    return flatSelectionOrder
      .filter((item) => selected.has(item.id))
      .map((item) => displayedCollections[item.collectionIndex]?.jobs[item.jobIndex])
      .filter(Boolean);
  }, [displayedCollections, flatSelectionOrder, selectedJobIds]);

  const selectedFlatIndex = useMemo(() => jobBoardFlatIndexForSelection(flattenedPositions, selectedPosition), [flattenedPositions, selectedPosition]);

  const isBookmarked = useMemo(
    () =>
      selectedJob ? user.saved.includes(selectedJob.externalId) || user.applied.includes(selectedJob.externalId) || user.interviewing.includes(selectedJob.externalId) : false,
    [selectedJob, user.applied, user.interviewing, user.saved]
  );

  const isApplied = useMemo(
    () => (selectedJob ? user.applied.includes(selectedJob.externalId) || user.interviewing.includes(selectedJob.externalId) : false),
    [selectedJob, user.applied, user.interviewing]
  );

  const isInterviewing = useMemo(() => (selectedJob ? user.interviewing.includes(selectedJob.externalId) : false), [selectedJob, user.interviewing]);

  const handleBookmarkToggle = useCallback(() => {
    if (!selectedJob) return;
    if (isBookmarked) {
      if (user.saved.includes(selectedJob.externalId)) removeJob(selectedJob.externalId, "saved");
      if (user.applied.includes(selectedJob.externalId)) removeJob(selectedJob.externalId, "applied");
      if (user.interviewing.includes(selectedJob.externalId)) removeJob(selectedJob.externalId, "interviewing");
      return;
    }
    addJob(selectedJob.externalId, "saved");
  }, [addJob, isBookmarked, removeJob, selectedJob, user.applied, user.interviewing, user.saved]);

  const handleApplyToggle = useCallback(() => {
    if (!selectedJob) return;
    if (isApplied) {
      if (user.applied.includes(selectedJob.externalId)) removeJob(selectedJob.externalId, "applied");
      if (user.interviewing.includes(selectedJob.externalId)) removeJob(selectedJob.externalId, "interviewing");
      return;
    }
    addJob(selectedJob.externalId, "applied");
  }, [addJob, isApplied, removeJob, selectedJob, user.applied, user.interviewing]);

  const handleBulkSave = useCallback(() => {
    for (const row of selectedJobs) {
      if (!row) continue;
      const jobId = row.externalId;
      if (!user.saved.includes(jobId)) addJob(jobId, "saved");
    }
    toast.success(`Saved ${selectedJobs.length} job${selectedJobs.length === 1 ? "" : "s"}.`);
  }, [addJob, selectedJobs, user.saved]);

  const handleBulkApply = useCallback(() => {
    for (const row of selectedJobs) {
      if (!row) continue;
      const jobId = row.externalId;
      if (!user.applied.includes(jobId)) addJob(jobId, "applied");
    }
    toast.success(`Marked ${selectedJobs.length} job${selectedJobs.length === 1 ? "" : "s"} as applied.`);
  }, [addJob, selectedJobs, user.applied]);

  const handleBulkShare = useCallback(async () => {
    const payload = buildSharePayload(
      selectedJobs.flatMap((job) => {
        const jobUrl = `${window.location.origin}/?job=${encodeURIComponent(job.externalId)}`;
        return [jobUrl, job.applyUrl ?? null];
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
  }, [selectedJobs]);

  const handleBulkHide = useCallback(async () => {
    const externalIds = selectedJobs.slice(0, MAX_BULK_HIDE_JOBS).map((job) => job.externalId);
    if (!externalIds.length) return;
    if (selectedJobs.length > MAX_BULK_HIDE_JOBS) {
      toast.info(`Only the first ${MAX_BULK_HIDE_JOBS} selected jobs will be hidden.`);
    }
    const res = await hideForCurrentUser({ externalIds, viewerEmail: getAuthEmail() ?? undefined });
    if (!res.ok) {
      toast.error("Please sign in to hide jobs.");
      return;
    }
    for (const jobId of externalIds) {
      if (user.saved.includes(jobId)) removeJob(jobId, "saved");
      if (user.applied.includes(jobId)) removeJob(jobId, "applied");
      if (user.interviewing.includes(jobId)) removeJob(jobId, "interviewing");
      if (user.rejected.includes(jobId)) removeJob(jobId, "rejected");
      if (!user.hidden.includes(jobId)) addJob(jobId, "hidden");
    }
    toast.success(`Hidden ${externalIds.length} job${externalIds.length === 1 ? "" : "s"}.`);
    clearSelectionMode();
  }, [addJob, clearSelectionMode, hideForCurrentUser, removeJob, selectedJobs, user.applied, user.hidden, user.interviewing, user.rejected, user.saved]);

  const prefetchJobAtNow = useCallback(
    (collectionIndex: number, jobIndex: number) => {
      const collection = displayedCollections[collectionIndex];
      const job = collection?.jobs[jobIndex];
      if (!job) return;
      prefetchNow(getDetailsLookupId(job));
    },
    [displayedCollections, prefetchNow]
  );

  const prefetchJobAt = useCallback(
    (collectionIndex: number, jobIndex: number) => {
      const collection = displayedCollections[collectionIndex];
      const job = collection?.jobs[jobIndex];
      if (!job) return;
      prefetch(getDetailsLookupId(job));
    },
    [displayedCollections, prefetch]
  );

  const prefetchNeighborsForSelected = useCallback(() => {
    if (!selectedPosition || !selectedCollection) return;
    if (selectedCollection.jobs.length < 2) return;

    const previousIndex = (selectedPosition.jobIndex - 1 + selectedCollection.jobs.length) % selectedCollection.jobs.length;
    const nextIndex = (selectedPosition.jobIndex + 1) % selectedCollection.jobs.length;
    if (previousIndex !== selectedPosition.jobIndex) prefetchJobAt(selectedPosition.collectionIndex, previousIndex);
    if (nextIndex !== selectedPosition.jobIndex && nextIndex !== previousIndex) prefetchJobAt(selectedPosition.collectionIndex, nextIndex);
  }, [prefetchJobAt, selectedCollection, selectedPosition]);

  const handleFooterPrevious = useCallback(async () => {
    if (!selectedPosition || !selectedCollection || selectedCollection.jobs.length < 2) return;
    const previousIndex = (selectedPosition.jobIndex - 1 + selectedCollection.jobs.length) % selectedCollection.jobs.length;
    prefetchJobAtNow(selectedPosition.collectionIndex, previousIndex);
    await runTransition(() => setSelection({ collectionIndex: selectedPosition.collectionIndex, jobIndex: previousIndex }), {
      fadeCompanyChrome: false,
    });
  }, [prefetchJobAtNow, runTransition, selectedCollection, selectedPosition, setSelection]);

  const handleFooterNext = useCallback(async () => {
    if (!selectedPosition || !selectedCollection || selectedCollection.jobs.length < 2) return;
    const nextIndex = (selectedPosition.jobIndex + 1) % selectedCollection.jobs.length;
    prefetchJobAtNow(selectedPosition.collectionIndex, nextIndex);
    await runTransition(() => setSelection({ collectionIndex: selectedPosition.collectionIndex, jobIndex: nextIndex }), {
      fadeCompanyChrome: false,
    });
  }, [prefetchJobAtNow, runTransition, selectedCollection, selectedPosition, setSelection]);

  const handleFooterSelect = useCallback(
    async (jobIndex: number) => {
      if (!selectedPosition) return;
      if (selectedPosition.jobIndex === jobIndex) return;
      prefetchJobAtNow(selectedPosition.collectionIndex, jobIndex);
      await runTransition(() => setSelection({ collectionIndex: selectedPosition.collectionIndex, jobIndex }), { fadeCompanyChrome: false });
    },
    [prefetchJobAtNow, runTransition, selectedPosition, setSelection]
  );

  const canGoPreviousGroup = Boolean(selectedPosition && selectedPosition.collectionIndex > 0);
  const canGoNextGroup = Boolean(
    selectedPosition &&
    (selectedPosition.collectionIndex < displayedCollections.length - 1 || visibleRowCount < accumulatedRows.length || status === "CanLoadMore" || revealLoading || isLoading)
  );

  const handleOutsidePrevious = useCallback(async () => {
    if (!selectedPosition || !selectedCollection || !selectedJob || selectedPosition.collectionIndex === 0) return;
    const previousCollectionIndex = selectedPosition.collectionIndex - 1;
    const previousCollection = displayedCollections[previousCollectionIndex];
    const targetJobIndex = jobBoardRememberedJobIndex(previousCollection, previousCollectionIndex, jobIndexByCollection);
    const targetJob = previousCollection.jobs[targetJobIndex];
    const fadeCompanyChrome = jobBoardFadeCompanyChromeBetweenJobs(selectedCollection, selectedJob, previousCollection, targetJob);
    prefetchJobAtNow(previousCollectionIndex, targetJobIndex);
    await runTransition(() => setSelection({ collectionIndex: previousCollectionIndex, jobIndex: targetJobIndex }), {
      fadeCompanyChrome,
    });
  }, [displayedCollections, jobIndexByCollection, prefetchJobAtNow, runTransition, selectedCollection, selectedJob, selectedPosition, setSelection]);

  const handleOutsideNext = useCallback(async () => {
    if (!selectedPosition || !selectedCollection || !selectedJob) return;
    const nextCollectionIndex = selectedPosition.collectionIndex + 1;
    if (nextCollectionIndex < displayedCollections.length) {
      const nextCollection = displayedCollections[nextCollectionIndex];
      const targetJobIndex = jobBoardRememberedJobIndex(nextCollection, nextCollectionIndex, jobIndexByCollection);
      const targetJob = nextCollection.jobs[targetJobIndex];
      const fadeCompanyChrome = jobBoardFadeCompanyChromeBetweenJobs(selectedCollection, selectedJob, nextCollection, targetJob);
      prefetchJobAtNow(nextCollectionIndex, targetJobIndex);
      await runTransition(() => setSelection({ collectionIndex: nextCollectionIndex, jobIndex: targetJobIndex }), {
        fadeCompanyChrome,
      });
      return;
    }
    if (visibleRowCount < accumulatedRows.length || status === "CanLoadMore") {
      setPendingGroupAdvance(true);
      requestMoreForNavigation();
    }
  }, [
    accumulatedRows.length,
    displayedCollections,
    jobIndexByCollection,
    prefetchJobAtNow,
    requestMoreForNavigation,
    runTransition,
    selectedCollection,
    selectedJob,
    selectedPosition,
    setSelection,
    status,
    visibleRowCount,
  ]);

  const handleMobilePrevious = useCallback(async () => {
    if (selectedFlatIndex <= 0 || selectedFlatIndex === -1) return;
    const current = flattenedPositions[selectedFlatIndex];
    const previous = flattenedPositions[selectedFlatIndex - 1];
    const fadeCompanyChrome = jobBoardFadeCompanyChromeBetweenFlatNeighbors(displayedCollections, current, previous);
    prefetchJobAtNow(previous.collectionIndex, previous.jobIndex);
    await runTransition(() => setSelection({ collectionIndex: previous.collectionIndex, jobIndex: previous.jobIndex }), {
      fadeCompanyChrome,
    });
  }, [displayedCollections, flattenedPositions, prefetchJobAtNow, runTransition, selectedFlatIndex, setSelection]);

  const handleMobileNext = useCallback(async () => {
    if (selectedFlatIndex === -1) return;
    if (selectedFlatIndex < flattenedPositions.length - 1) {
      const current = flattenedPositions[selectedFlatIndex];
      const next = flattenedPositions[selectedFlatIndex + 1];
      const fadeCompanyChrome = jobBoardFadeCompanyChromeBetweenFlatNeighbors(displayedCollections, current, next);
      prefetchJobAtNow(next.collectionIndex, next.jobIndex);
      await runTransition(() => setSelection({ collectionIndex: next.collectionIndex, jobIndex: next.jobIndex }), {
        fadeCompanyChrome,
      });
      return;
    }
    if (visibleRowCount < accumulatedRows.length || status === "CanLoadMore") {
      setPendingJobAdvance(true);
      requestMoreForNavigation();
    }
  }, [
    accumulatedRows.length,
    displayedCollections,
    flattenedPositions,
    prefetchJobAtNow,
    requestMoreForNavigation,
    runTransition,
    selectedFlatIndex,
    setSelection,
    status,
    visibleRowCount,
  ]);

  const canGoPreviousMobile = selectedFlatIndex > 0;
  const canGoNextMobile =
    selectedFlatIndex !== -1 &&
    (selectedFlatIndex < flattenedPositions.length - 1 || visibleRowCount < accumulatedRows.length || status === "CanLoadMore" || revealLoading || isLoading);

  useEffect(() => {
    if (!pendingGroupAdvance || !selectedPosition) return;
    if (selectedPosition.collectionIndex < displayedCollections.length - 1) {
      setPendingGroupAdvance(false);
      void handleOutsideNext();
      return;
    }
    if (!revealLoading && !isLoading && visibleRowCount >= accumulatedRows.length && status !== "CanLoadMore") {
      setPendingGroupAdvance(false);
    }
  }, [accumulatedRows.length, displayedCollections.length, handleOutsideNext, isLoading, pendingGroupAdvance, revealLoading, selectedPosition, status, visibleRowCount]);

  useEffect(() => {
    if (!pendingJobAdvance || selectedFlatIndex === -1) return;
    if (selectedFlatIndex < flattenedPositions.length - 1) {
      setPendingJobAdvance(false);
      void handleMobileNext();
      return;
    }
    if (!revealLoading && !isLoading && visibleRowCount >= accumulatedRows.length && status !== "CanLoadMore") {
      setPendingJobAdvance(false);
    }
  }, [accumulatedRows.length, flattenedPositions.length, handleMobileNext, isLoading, pendingJobAdvance, revealLoading, selectedFlatIndex, status, visibleRowCount]);

  // Column count follows the measured container width (`@container` on the list
  // wrapper), not the viewport, so the layout re-flows when the available width
  // changes (e.g. sidebar open/close, window resize). The grid stretches each
  // card to its row height, which keeps every footer aligned to the card
  // bottom; masonry splits the same collections into independent columns.
  const gridClassName =
    "grid scroll-mt-14 grid-cols-1 items-stretch gap-4 @min-[640px]:grid-cols-2 @min-[640px]:gap-6 @min-[1024px]:grid-cols-3 @min-[1400px]:grid-cols-4 @min-[1800px]:grid-cols-5";
  const columnGapClassName = "gap-4 @min-[640px]:gap-6";
  const columnRowClassName = `flex scroll-mt-14 items-start ${columnGapClassName}`;
  const columnClassName = `flex min-w-0 flex-1 flex-col ${columnGapClassName}`;
  const listClassName = "flex flex-col gap-3";

  const skeletonCount = Math.max(initialCount, 8);
  const skeletonsPerColumn = Math.max(1, Math.ceil(skeletonCount / columns));

  /** One card per company collection, shared by the masonry and grid layouts. */
  const renderCollectionCard = (collection: (typeof displayedCollections)[number], collectionIndex: number) => {
    const key = getJobBoardCollectionKey(collection, collectionIndex);
    return (
      <Suspense key={key} fallback={<JobBoardCardSkeleton />}>
        <JobBoardCard
          collectionIndex={collectionIndex}
          currentJobIndex={jobIndexByCollection[key] ?? 0}
          jobCollection={collection}
          onJobIndexChange={updateCollectionJobIndex}
          onOpenJob={openJobDetails}
          onCardClick={handleCardSelectionClick}
          isSelectionMode={jobBoardSelectionMode}
          isSelected={selectedJobIds.has(collection.jobs[jobIndexByCollection[key] ?? 0]?.externalId ?? "")}
        />
      </Suspense>
    );
  };

  if (status === "LoadingFirstPage" || (accumulatedJobs.length === 0 && (status === "CanLoadMore" || isLoading))) {
    return (
      <div ref={containerRef} className="@container space-y-6">
        {effectiveLayout === "masonry" ? (
          <div className={columnRowClassName}>
            {Array.from({ length: columns }).map((_, columnIndex) => (
              <div className={columnClassName} key={`skeleton-column-${columnIndex}`}>
                {Array.from({ length: skeletonsPerColumn }).map((_, skeletonIndex) => (
                  <JobBoardCardSkeleton key={`skeleton-${columnIndex}-${skeletonIndex}`} />
                ))}
              </div>
            ))}
          </div>
        ) : effectiveLayout === "grid" ? (
          <div className={gridClassName}>
            {Array.from({ length: skeletonCount }).map((_, skeletonIndex) => (
              <JobBoardCardSkeleton key={`skeleton-${skeletonIndex}`} />
            ))}
          </div>
        ) : (
          <div className={listClassName}>
            {Array.from({ length: 8 }).map((_, skeletonIndex) => (
              <JobBoardListRowSkeleton key={`skeleton-${skeletonIndex}`} />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (!accumulatedJobs.length) {
    const searched = Boolean(debouncedQuery.trim());
    if (searched) {
      return (
        <div className="col-span-full py-16 text-center text-text">
          No jobs match <span className="font-medium text-primary">&quot;{debouncedQuery.trim()}&quot;</span>
          Try different keywords or clear the search bar.
        </div>
      );
    }
    if (typeof jobCount === "number" && jobCount > 0) {
      return <div className="col-span-full py-16 text-center text-text">No jobs match the current filters. Clear or loosen filters to see results.</div>;
    }
    return (
      <div className="col-span-full py-16 text-center text-text">
        No jobs found in Convex. Run the scraper: <code className="text-sm">python scraper/scrape_to_convex.py</code>.
      </div>
    );
  }

  if (unreadView && !boardRows.length) {
    return <div className="col-span-full py-16 text-center text-text">You&#39;re all caught up — no new (unread) jobs match the current search or filters.</div>;
  }

  return (
    <>
      <div ref={containerRef} className="@container space-y-6">
        {effectiveLayout === "masonry" ? (
          <div className={columnRowClassName}>
            {collectionsByColumn.map((columnCollections, columnIndex) => (
              <div className={columnClassName} key={`job-column-${columnIndex}`}>
                {columnCollections.map(({ collection, collectionIndex }) => renderCollectionCard(collection, collectionIndex))}
                {(revealLoading || isLoading) && Array.from({ length: 2 }).map((_, skeletonIndex) => <JobBoardCardSkeleton key={`more-${columnIndex}-${skeletonIndex}`} />)}
              </div>
            ))}
          </div>
        ) : effectiveLayout === "grid" ? (
          <div className={gridClassName}>
            {displayedCollections.map(renderCollectionCard)}
            {(revealLoading || isLoading) && Array.from({ length: columns }).map((_, skeletonIndex) => <JobBoardCardSkeleton key={`more-${skeletonIndex}`} />)}
          </div>
        ) : (
          <div className={listClassName}>
            {displayedCollections.map((collection, collectionIndex) => {
              const key = getJobBoardCollectionKey(collection, collectionIndex);
              const currentJobIndex = jobBoardRememberedJobIndex(collection, collectionIndex, jobIndexByCollection);
              const currentJob = collection.jobs[currentJobIndex] ?? collection.jobs[0];
              const isSelected =
                collection.jobs.some((j) => selectedJobIds.has(j.externalId)) ||
                (selectedPosition?.collectionIndex === collectionIndex && selectedPosition?.jobIndex === currentJobIndex);

              return (
                <JobBoardListRow
                  key={key}
                  collection={collection}
                  collectionIndex={collectionIndex}
                  currentJobIndex={currentJobIndex}
                  job={currentJob}
                  company={collection.company}
                  onJobIndexChange={updateCollectionJobIndex}
                  onOpenJob={openJobDetails}
                  isSelected={isSelected}
                  selectionMode={jobBoardSelectionMode}
                  onClick={(event) => handleCardSelectionClick(event, currentJob.externalId)}
                />
              );
            })}
            {(revealLoading || isLoading) && Array.from({ length: 3 }).map((_, skeletonIndex) => <JobBoardListRowSkeleton key={`more-${skeletonIndex}`} />)}
          </div>
        )}
      </div>

      <ActionBar
        open={jobBoardSelectionMode}
        onOpenChange={(open) => (!open ? clearSelectionMode() : setJobBoardSelectionMode(open))}
        className="border border-border/60 bg-background shadow-xl dark:border-border"
      >
        <ActionBarSelection>
          Selection mode
          <ActionBarSeparator />
          {selectedJobIds.size} selected
        </ActionBarSelection>
        <ActionBarGroup>
          <ActionBarItem disabled={selectedJobIds.size === 0} onSelect={(e) => e.preventDefault()} onClick={handleBulkSave}>
            Save
          </ActionBarItem>
          <ActionBarItem disabled={selectedJobIds.size === 0} onSelect={(e) => e.preventDefault()} onClick={handleBulkApply}>
            <CheckCheck className="size-4" />
            Mark Applied
          </ActionBarItem>
          <ActionBarItem disabled={selectedJobIds.size === 0} onSelect={(e) => e.preventDefault()} onClick={handleBulkShare}>
            <Share2 className="size-4" />
            Share
          </ActionBarItem>
          <ActionBarItem disabled={selectedJobIds.size === 0} onSelect={(e) => e.preventDefault()} onClick={handleBulkHide}>
            <EyeOff className="size-4" />
            Hide
          </ActionBarItem>
          <ActionBarItem onSelect={(e) => e.preventDefault()} onClick={clearSelectionMode}>
            <X className="size-4" />
            Exit
          </ActionBarItem>
        </ActionBarGroup>
      </ActionBar>

      <JobPreviewOverlay
        job={selectedJob}
        company={selectedCompany}
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
        onDetailsResolved={prefetchNeighborsForSelected}
        onPrevious={handleMobilePrevious}
        onNext={handleMobileNext}
        canGoPrevious={canGoPreviousMobile}
        canGoNext={canGoNextMobile}
        footerNavigation={
          selectedCollection && selectedCollection.jobs.length > 1 && selectedPosition
            ? {
                currentJobIndex: selectedPosition.jobIndex,
                totalJobs: selectedCollection.jobs.length,
                onPrevious: handleFooterPrevious,
                onNext: handleFooterNext,
                onJobSelect: handleFooterSelect,
                onJobHover: undefined,
                onPreviousHover: undefined,
                onNextHover: undefined,
              }
            : undefined
        }
        outsideCanGoPrevious={canGoPreviousGroup}
        outsideCanGoNext={canGoNextGroup}
        onOutsidePrevious={handleOutsidePrevious}
        onOutsideNext={handleOutsideNext}
      />
    </>
  );
};

export default JobBoard;
