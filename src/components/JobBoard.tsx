import type { JobCardResultDTO } from "@/types/convexJobs";
import { useMutation, usePaginatedQuery } from "convex/react";
import dynamic from "next/dynamic";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActionBar, ActionBarGroup, ActionBarItem, ActionBarSelection, ActionBarSeparator } from "@/components/ui/action-bar";
import { buildSharePayload, selectRangeIds } from "@/lib/jobs/selection";
import { CheckCheck, EyeOff, Share2, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";
import { getAuthEmail } from "../lib/local-auth";
import { useApp } from "../contexts/AppContext";
import { useSearchUI } from "../contexts/SearchContext";
import { JobPreviewOverlay, useJobPreviewChrome } from "../hooks/useJobPreview";
import { useMediaQuery } from "../hooks/useMediaQuery";
import {
  buildJobBoardDisplayedCollections,
  flattenJobBoardPositions,
  formatJobBoardRoundedNumber,
  getJobBoardCollectionKey,
  jobBoardFadeCompanyChromeBetweenFlatNeighbors,
  jobBoardFadeCompanyChromeBetweenJobs,
  jobBoardFlatIndexForSelection,
  jobBoardRememberedJobIndex,
  JOB_BOARD_PAGE_LIMIT,
  JOB_BOARD_PREFILL_VIEWPORT_MARGIN_PX,
  type JobBoardSelectedPosition,
} from "../lib/jobs/jobBoard";
import { getDetailsLookupId } from "../lib/jobs/getDetailsLookupId";
import { toConvexJobSearchFilters } from "../lib/search/toConvexFilters";
import JobBoardCardSkeleton from "./job/JobBoardCardSkeleton";

const JobBoardCard = dynamic(() => import("./job/JobBoardCard"), {
  ssr: false,
});

const JobBoard = ({ companyCount, jobCount, location }: { companyCount?: number; jobCount?: number; location?: string }) => {
  const { boardSearchQuery, jobBoardSelectionMode, setJobBoardSelectionMode } = useSearchUI();
  const { searchOptions } = useApp();
  const { user, addJob, removeJob } = useApp();
  const hideForCurrentUser = useMutation(api.jobs.hideForCurrentUser);
  const {
    isDesktop,
    dialogOpen,
    setDialogOpen,
    drawerOpen,
    setDrawerOpen,
    isTransitioning,
    fadeCompanyChrome,
    prefetch,
    prefetchNow,
    openPreview,
    closePreview,
    runTransition,
  } = useJobPreviewChrome({ delayMs: 140, maxInflight: 3, maxSeen: 600 });
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedQuery(boardSearchQuery.trim()), 280);
    return () => window.clearTimeout(id);
  }, [boardSearchQuery]);

  const is3xl = useMediaQuery("(min-width: 1920px)");
  const is2xl = useMediaQuery("(min-width: 1536px)");
  const isXl = useMediaQuery("(min-width: 1280px)");
  const isMd = useMediaQuery("(min-width: 768px)");

  let columns = 1;
  if (is3xl) columns = 5;
  else if (is2xl) columns = 4;
  else if (isXl) columns = 3;
  else if (isMd) columns = 2;

  const initialCount = columns * 4;
  const [visibleRowCount, setVisibleRowCount] = useState(initialCount);
  const [revealLoading, setRevealLoading] = useState(false);
  const [jobIndexByCollection, setJobIndexByCollection] = useState<Record<string, number>>({});
  const [selectedPosition, setSelectedPosition] = useState<JobBoardSelectedPosition | null>(null);
  const [pendingGroupAdvance, setPendingGroupAdvance] = useState(false);
  const [pendingJobAdvance, setPendingJobAdvance] = useState(false);
  const [selectedJobIds, setSelectedJobIds] = useState<Set<string>>(new Set());
  const [selectionAnchorId, setSelectionAnchorId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const displayedCollections = useMemo(() => buildJobBoardDisplayedCollections(accumulatedRows, visibleRowCount), [accumulatedRows, visibleRowCount]);

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
      const didSelect = setSelection({ collectionIndex, jobIndex });
      if (!didSelect) return;
      openPreview();
    },
    [openPreview, setSelection]
  );

  const selectedCollection = selectedPosition ? displayedCollections[selectedPosition.collectionIndex] : null;
  const selectedJob = selectedCollection ? selectedCollection.jobs[selectedPosition?.jobIndex ?? 0] : null;
  const selectedCompany = selectedCollection?.company ?? null;

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

  const clearSelectionMode = useCallback(() => {
    setJobBoardSelectionMode(false);
    setSelectedJobIds(new Set());
    setSelectionAnchorId(null);
  }, [setJobBoardSelectionMode]);

  const addToSelection = useCallback((jobId: string) => {
    setSelectedJobIds((prev) => {
      const next = new Set(prev);
      next.add(jobId);
      return next;
    });
  }, []);

  const toggleSelection = useCallback((jobId: string) => {
    setSelectedJobIds((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) next.delete(jobId);
      else next.add(jobId);
      return next;
    });
  }, []);

  const handleCardSelectionClick = useCallback(
    (e: React.MouseEvent, jobId: string) => {
      const isModifier = e.shiftKey || e.ctrlKey || e.metaKey;
      if (isModifier && !jobBoardSelectionMode) {
        setJobBoardSelectionMode(true);
        setSelectedJobIds(new Set([jobId]));
        setSelectionAnchorId(jobId);
        return;
      }

      if (!jobBoardSelectionMode) {
        const item = flatSelectionOrder.find((row) => row.id === jobId);
        if (item) openJobDetails(item.collectionIndex, item.jobIndex);
        return;
      }

      if (e.shiftKey) {
        const anchor = selectionAnchorId ?? jobId;
        const rangeIds = selectRangeIds(flatSelectionOrder, anchor, jobId);
        setSelectedJobIds((prev) => {
          const next = new Set(prev);
          for (const id of rangeIds) next.add(id);
          return next;
        });
        if (!selectionAnchorId) setSelectionAnchorId(jobId);
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        toggleSelection(jobId);
        if (!selectionAnchorId) setSelectionAnchorId(jobId);
        return;
      }

      addToSelection(jobId);
      if (!selectionAnchorId) setSelectionAnchorId(jobId);
    },
    [addToSelection, flatSelectionOrder, jobBoardSelectionMode, openJobDetails, selectionAnchorId, setJobBoardSelectionMode, toggleSelection]
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && jobBoardSelectionMode) {
        clearSelectionMode();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [clearSelectionMode, jobBoardSelectionMode]);

  useEffect(() => {
    if (!jobBoardSelectionMode || selectedJobIds.size) return;
    clearSelectionMode();
  }, [clearSelectionMode, jobBoardSelectionMode, selectedJobIds.size]);

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
    const externalIds = selectedJobs.map((job) => job.externalId);
    if (!externalIds.length) return;
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

  const gridClassName = "grid scroll-mt-14 grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5";

  const skeletonCount = Math.max(initialCount, 8);

  if (status === "LoadingFirstPage") {
    return (
      <div className="space-y-6">
        {jobCount !== undefined || companyCount !== undefined || location ? (
          <div className="text-sm text-muted-foreground">
            {jobCount !== undefined ? <span>{formatJobBoardRoundedNumber(jobCount, 3)} jobs</span> : null}
            {jobCount !== undefined && companyCount !== undefined ? <span> - </span> : null}
            {companyCount !== undefined ? <span>{formatJobBoardRoundedNumber(companyCount, 3)} companies</span> : null}
            {(jobCount !== undefined || companyCount !== undefined) && location ? <span> - </span> : null}
            {location ? <span>{location}</span> : null}
          </div>
        ) : null}
        <div className={gridClassName}>
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <JobBoardCardSkeleton key={i} />
          ))}
        </div>
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
      return (
        <div className="col-span-full py-16 text-center text-text">
          No jobs match the current filters. Clear or loosen filters to see results.
        </div>
      );
    }
    return (
      <div className="col-span-full py-16 text-center text-text">
        No jobs found in Convex. Run the scraper: <code className="text-sm">python scraper/scrape_to_convex.py</code>.
      </div>
    );
  }

  return (
    <>
      {jobCount !== undefined || companyCount !== undefined || location ? (
        <div className="my-2 text-sm text-muted-foreground">
          {jobCount !== undefined ? <span>{formatJobBoardRoundedNumber(jobCount, 0)} jobs</span> : null}
          {jobCount !== undefined && companyCount !== undefined ? <span> - </span> : null}
          {companyCount !== undefined ? <span>{formatJobBoardRoundedNumber(companyCount, 0)} companies</span> : null}
          {(jobCount !== undefined || companyCount !== undefined) && location ? <span> - </span> : null}
          {location ? <span>{location}</span> : null}
        </div>
      ) : null}
      <div className="space-y-6">
        <div ref={containerRef} className={gridClassName}>
          {displayedCollections.map((collection, collectionIndex) => {
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
          })}
          {(revealLoading || isLoading) && (
            <>
              {Array.from({ length: Math.min(columns * 2, 6) }).map((_, i) => (
                <JobBoardCardSkeleton key={`more-${i}`} />
              ))}
            </>
          )}
        </div>
      </div>

      <ActionBar open={jobBoardSelectionMode} onOpenChange={(open) => (!open ? clearSelectionMode() : setJobBoardSelectionMode(open))}>
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
