import type { CompanyDTO, JobCardResultDTO, JobDTO } from "@/types/convexJobs";
import { usePaginatedQuery } from "convex/react";
import dynamic from "next/dynamic";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "../../convex/_generated/api";
import { useApp } from "../contexts/AppContext";
import { useSearchUI } from "../contexts/SearchContext";
import { useJobDetailsPrefetch } from "../hooks/useJobDetailsPrefetch";
import { useMediaQuery, useResponsiveBreakpoint } from "../hooks/useMediaQuery";
import { getDetailsLookupId } from "../lib/jobs/getDetailsLookupId";
import { toConvexJobSearchFilters } from "../lib/search/toConvexFilters";
import JobBoardCardSkeleton from "./job/JobBoardCardSkeleton";

const JobBoardCard = dynamic(() => import("./job/JobBoardCard"), {
  ssr: false,
});

const JobDialogContent = dynamic(() => import("./job/contents/JobDialogContent"), {
  loading: () => null,
  ssr: false,
});

const JobDrawerContent = dynamic(() => import("./job/contents/JobDrawerContent"), {
  loading: () => null,
  ssr: false,
});

// Keeping pages smaller avoids Convex "many bytes read" warnings when job payloads are large.
const PAGE_LIMIT = 24;
const NAV_FADE_OUT_MS = 300;
const NAV_SETTLE_MS = 50;

type JobCollection = { company: CompanyDTO | null; jobs: JobDTO[] };
type SelectedPosition = { collectionIndex: number; jobIndex: number };

function formatRoundedNumber(value: number, round = 3) {
  return (Math.round(value / 10 ** round) * 10 ** round).toLocaleString();
}

function getCollectionKey(collection: JobCollection, index: number) {
  return collection.company?.companyId ?? collection.company?._id ?? `unknown-${index}`;
}

const JobBoard = ({
  companyCount,
  jobCount,
  location,
}: {
  companyCount?: number;
  jobCount?: number;
  location?: string;
}) => {
  const { boardSearchQuery } = useSearchUI();
  const { searchOptions } = useApp();
  const { user, addJob, removeJob } = useApp();
  const { isDesktop } = useResponsiveBreakpoint();
  const { prefetch } = useJobDetailsPrefetch({ delayMs: 160, maxInflight: 2 });
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
  const [selectedPosition, setSelectedPosition] = useState<SelectedPosition | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isTransitioningDialog, setIsTransitioningDialog] = useState(false);
  const [pendingGroupAdvance, setPendingGroupAdvance] = useState(false);
  const [pendingJobAdvance, setPendingJobAdvance] = useState(false);
  const transitionInFlightRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const convexFilters = useMemo(() => toConvexJobSearchFilters(searchOptions), [searchOptions]);

  const {
    results: accumulatedJobs,
    status,
    loadMore,
    isLoading,
  } = usePaginatedQuery(
    api.jobs.search,
    { q: debouncedQuery || undefined, filters: convexFilters, sort: { by: debouncedQuery ? "relevance" : "recent", order: "desc" } },
    { initialNumItems: PAGE_LIMIT }
  );

  useEffect(() => {
    setVisibleRowCount(columns * 4);
  }, [columns]);

  const allJobCollections = useMemo(() => {
    const items = accumulatedJobs as unknown as JobCardResultDTO[];
    if (!items.length) return [];
    return items.map((item) => ({ company: item.company, jobs: [item.job] as JobDTO[] }));
  }, [accumulatedJobs]);

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
      loadMore(PAGE_LIMIT);
    }
  }, [accumulatedRows.length, isLoading, loadMore, revealLoading, status, visibleRowCount]);

  const loadMoreItems = useCallback(() => {
    if (visibleRowCount >= accumulatedRows.length && status === "CanLoadMore" && !isLoading && !revealLoading) {
      loadMore(PAGE_LIMIT);
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
    setJobIndexByCollection((prev) => {
      const next: Record<string, number> = {};
      for (let i = 0; i < displayedCollections.length; i += 1) {
        const collection = displayedCollections[i];
        const key = getCollectionKey(collection, i);
        const maxIndex = Math.max(collection.jobs.length - 1, 0);
        const savedIndex = prev[key] ?? 0;
        next[key] = Math.max(0, Math.min(savedIndex, maxIndex));
      }
      return next;
    });
  }, [displayedCollections]);

  useEffect(() => {
    if (isDesktop) {
      setDrawerOpen(false);
      return;
    }
    setDialogOpen(false);
  }, [isDesktop]);

  useEffect(() => {
    if (!displayedCollections.length) {
      setSelectedPosition(null);
      setDialogOpen(false);
      setDrawerOpen(false);
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
  }, [displayedCollections, selectedPosition]);

  const updateCollectionJobIndex = useCallback(
    (collectionIndex: number, nextJobIndex: number) => {
      const collection = displayedCollections[collectionIndex];
      if (!collection || !collection.jobs.length) return;
      const clampedJobIndex = Math.max(0, Math.min(nextJobIndex, collection.jobs.length - 1));
      const key = getCollectionKey(collection, collectionIndex);
      setJobIndexByCollection((prev) => (prev[key] === clampedJobIndex ? prev : { ...prev, [key]: clampedJobIndex }));
      setSelectedPosition((prev) =>
        prev && prev.collectionIndex === collectionIndex && prev.jobIndex !== clampedJobIndex
          ? { ...prev, jobIndex: clampedJobIndex }
          : prev
      );
    },
    [displayedCollections]
  );

  const setSelection = useCallback(
    (nextSelection: SelectedPosition) => {
      const collection = displayedCollections[nextSelection.collectionIndex];
      if (!collection || !collection.jobs.length) return false;
      const clampedJobIndex = Math.max(0, Math.min(nextSelection.jobIndex, collection.jobs.length - 1));
      const finalSelection = { collectionIndex: nextSelection.collectionIndex, jobIndex: clampedJobIndex };
      setSelectedPosition(finalSelection);
      const key = getCollectionKey(collection, nextSelection.collectionIndex);
      setJobIndexByCollection((prev) => (prev[key] === clampedJobIndex ? prev : { ...prev, [key]: clampedJobIndex }));
      return true;
    },
    [displayedCollections]
  );

  const runDialogTransition = useCallback(
    async (navigate: () => boolean | Promise<boolean>) => {
      if (transitionInFlightRef.current) return false;
      transitionInFlightRef.current = true;
      setIsTransitioningDialog(true);
      try {
        await new Promise((resolve) => window.setTimeout(resolve, NAV_FADE_OUT_MS));
        const didNavigate = await navigate();
        await new Promise((resolve) => window.setTimeout(resolve, NAV_SETTLE_MS));
        return didNavigate;
      } finally {
        transitionInFlightRef.current = false;
        setIsTransitioningDialog(false);
      }
    },
    []
  );

  const openJobDetails = useCallback(
    (collectionIndex: number, jobIndex: number) => {
      const didSelect = setSelection({ collectionIndex, jobIndex });
      if (!didSelect) return;
      if (isDesktop) setDialogOpen(true);
      else setDrawerOpen(true);
    },
    [isDesktop, setSelection]
  );

  const selectedCollection = selectedPosition ? displayedCollections[selectedPosition.collectionIndex] : null;
  const selectedJob = selectedCollection ? selectedCollection.jobs[selectedPosition?.jobIndex ?? 0] : null;
  const selectedCompany = selectedCollection?.company ?? null;

  const flattenedPositions = useMemo(() => {
    const rows: Array<SelectedPosition & { job: JobDTO }> = [];
    for (let collectionIndex = 0; collectionIndex < displayedCollections.length; collectionIndex += 1) {
      const collection = displayedCollections[collectionIndex];
      for (let jobIndex = 0; jobIndex < collection.jobs.length; jobIndex += 1) {
        rows.push({ collectionIndex, jobIndex, job: collection.jobs[jobIndex] });
      }
    }
    return rows;
  }, [displayedCollections]);

  const selectedFlatIndex = useMemo(() => {
    if (!selectedPosition) return -1;
    return flattenedPositions.findIndex(
      (item) => item.collectionIndex === selectedPosition.collectionIndex && item.jobIndex === selectedPosition.jobIndex
    );
  }, [flattenedPositions, selectedPosition]);

  const isBookmarked = useMemo(
    () =>
      selectedJob
        ? user.saved.includes(selectedJob.externalId) ||
          user.applied.includes(selectedJob.externalId) ||
          user.interviewing.includes(selectedJob.externalId)
        : false,
    [selectedJob, user.applied, user.interviewing, user.saved]
  );

  const isApplied = useMemo(
    () => (selectedJob ? user.applied.includes(selectedJob.externalId) || user.interviewing.includes(selectedJob.externalId) : false),
    [selectedJob, user.applied, user.interviewing]
  );

  const isInterviewing = useMemo(
    () => (selectedJob ? user.interviewing.includes(selectedJob.externalId) : false),
    [selectedJob, user.interviewing]
  );

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

  const prefetchJobAt = useCallback(
    (collectionIndex: number, jobIndex: number) => {
      const collection = displayedCollections[collectionIndex];
      const job = collection?.jobs[jobIndex];
      if (!job) return;
      prefetch(getDetailsLookupId(job));
    },
    [displayedCollections, prefetch]
  );

  const handleFooterPreviousHover = useCallback(() => {
    if (!selectedPosition || !selectedCollection || selectedCollection.jobs.length < 2) return;
    const previousIndex = (selectedPosition.jobIndex - 1 + selectedCollection.jobs.length) % selectedCollection.jobs.length;
    prefetchJobAt(selectedPosition.collectionIndex, previousIndex);
  }, [prefetchJobAt, selectedCollection, selectedPosition]);

  const handleFooterNextHover = useCallback(() => {
    if (!selectedPosition || !selectedCollection || selectedCollection.jobs.length < 2) return;
    const nextIndex = (selectedPosition.jobIndex + 1) % selectedCollection.jobs.length;
    prefetchJobAt(selectedPosition.collectionIndex, nextIndex);
  }, [prefetchJobAt, selectedCollection, selectedPosition]);

  const handleOutsidePreviousHover = useCallback(() => {
    if (!selectedPosition) return;
    const previousCollectionIndex = selectedPosition.collectionIndex - 1;
    if (previousCollectionIndex < 0) return;
    const collection = displayedCollections[previousCollectionIndex];
    if (!collection) return;
    const key = getCollectionKey(collection, previousCollectionIndex);
    const jobIndex = Math.max(0, Math.min(jobIndexByCollection[key] ?? 0, collection.jobs.length - 1));
    prefetchJobAt(previousCollectionIndex, jobIndex);
  }, [displayedCollections, jobIndexByCollection, prefetchJobAt, selectedPosition]);

  const handleOutsideNextHover = useCallback(() => {
    if (!selectedPosition) return;
    const nextCollectionIndex = selectedPosition.collectionIndex + 1;
    if (nextCollectionIndex < displayedCollections.length) {
      const collection = displayedCollections[nextCollectionIndex];
      const key = getCollectionKey(collection, nextCollectionIndex);
      const jobIndex = Math.max(0, Math.min(jobIndexByCollection[key] ?? 0, collection.jobs.length - 1));
      prefetchJobAt(nextCollectionIndex, jobIndex);
      return;
    }
    requestMoreForNavigation();
  }, [displayedCollections, jobIndexByCollection, prefetchJobAt, requestMoreForNavigation, selectedPosition]);

  const handleFooterPrevious = useCallback(async () => {
    if (!selectedPosition || !selectedCollection || selectedCollection.jobs.length < 2) return;
    const previousIndex = (selectedPosition.jobIndex - 1 + selectedCollection.jobs.length) % selectedCollection.jobs.length;
    await runDialogTransition(() => setSelection({ collectionIndex: selectedPosition.collectionIndex, jobIndex: previousIndex }));
  }, [runDialogTransition, selectedCollection, selectedPosition, setSelection]);

  const handleFooterNext = useCallback(async () => {
    if (!selectedPosition || !selectedCollection || selectedCollection.jobs.length < 2) return;
    const nextIndex = (selectedPosition.jobIndex + 1) % selectedCollection.jobs.length;
    await runDialogTransition(() => setSelection({ collectionIndex: selectedPosition.collectionIndex, jobIndex: nextIndex }));
  }, [runDialogTransition, selectedCollection, selectedPosition, setSelection]);

  const handleFooterSelect = useCallback(
    async (jobIndex: number) => {
      if (!selectedPosition) return;
      if (selectedPosition.jobIndex === jobIndex) return;
      await runDialogTransition(() => setSelection({ collectionIndex: selectedPosition.collectionIndex, jobIndex }));
    },
    [runDialogTransition, selectedPosition, setSelection]
  );

  const canGoPreviousGroup = Boolean(selectedPosition && selectedPosition.collectionIndex > 0);
  const canGoNextGroup = Boolean(
    selectedPosition &&
      (selectedPosition.collectionIndex < displayedCollections.length - 1 ||
        visibleRowCount < accumulatedRows.length ||
        status === "CanLoadMore" ||
        revealLoading ||
        isLoading)
  );

  const handleOutsidePrevious = useCallback(async () => {
    if (!selectedPosition || selectedPosition.collectionIndex === 0) return;
    const previousCollectionIndex = selectedPosition.collectionIndex - 1;
    const previousCollection = displayedCollections[previousCollectionIndex];
    const previousKey = getCollectionKey(previousCollection, previousCollectionIndex);
    const targetJobIndex = Math.max(0, Math.min(jobIndexByCollection[previousKey] ?? 0, previousCollection.jobs.length - 1));
    await runDialogTransition(() => setSelection({ collectionIndex: previousCollectionIndex, jobIndex: targetJobIndex }));
  }, [displayedCollections, jobIndexByCollection, runDialogTransition, selectedPosition, setSelection]);

  const handleOutsideNext = useCallback(async () => {
    if (!selectedPosition) return;
    const nextCollectionIndex = selectedPosition.collectionIndex + 1;
    if (nextCollectionIndex < displayedCollections.length) {
      const nextCollection = displayedCollections[nextCollectionIndex];
      const nextKey = getCollectionKey(nextCollection, nextCollectionIndex);
      const targetJobIndex = Math.max(0, Math.min(jobIndexByCollection[nextKey] ?? 0, nextCollection.jobs.length - 1));
      await runDialogTransition(() => setSelection({ collectionIndex: nextCollectionIndex, jobIndex: targetJobIndex }));
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
    requestMoreForNavigation,
    runDialogTransition,
    selectedPosition,
    setSelection,
    status,
    visibleRowCount,
  ]);

  const handleMobilePrevious = useCallback(async () => {
    if (selectedFlatIndex <= 0 || selectedFlatIndex === -1) return;
    const previous = flattenedPositions[selectedFlatIndex - 1];
    await runDialogTransition(() => setSelection({ collectionIndex: previous.collectionIndex, jobIndex: previous.jobIndex }));
  }, [flattenedPositions, runDialogTransition, selectedFlatIndex, setSelection]);

  const handleMobileNext = useCallback(async () => {
    if (selectedFlatIndex === -1) return;
    if (selectedFlatIndex < flattenedPositions.length - 1) {
      const next = flattenedPositions[selectedFlatIndex + 1];
      await runDialogTransition(() => setSelection({ collectionIndex: next.collectionIndex, jobIndex: next.jobIndex }));
      return;
    }
    if (visibleRowCount < accumulatedRows.length || status === "CanLoadMore") {
      setPendingJobAdvance(true);
      requestMoreForNavigation();
    }
  }, [accumulatedRows.length, flattenedPositions, requestMoreForNavigation, runDialogTransition, selectedFlatIndex, setSelection, status, visibleRowCount]);

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
  }, [
    accumulatedRows.length,
    displayedCollections.length,
    handleOutsideNext,
    isLoading,
    pendingGroupAdvance,
    revealLoading,
    selectedPosition,
    status,
    visibleRowCount,
  ]);

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
  }, [
    accumulatedRows.length,
    flattenedPositions.length,
    handleMobileNext,
    isLoading,
    pendingJobAdvance,
    revealLoading,
    selectedFlatIndex,
    status,
    visibleRowCount,
  ]);

  const gridClassName =
    "grid min-h-screen scroll-mt-14 grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5";

  const skeletonCount = Math.max(initialCount, 8);

  if (status === "LoadingFirstPage") {
    return (
      <div className="space-y-6">
        {jobCount !== undefined || companyCount !== undefined || location ? (
          <div className="text-sm text-muted-foreground">
            {jobCount !== undefined ? <span>{formatRoundedNumber(jobCount, 3)} jobs</span> : null}
            {jobCount !== undefined && companyCount !== undefined ? <span> - </span> : null}
            {companyCount !== undefined ? <span>{formatRoundedNumber(companyCount, 3)} companies</span> : null}
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
          {jobCount !== undefined ? <span>{formatRoundedNumber(jobCount, 3)} jobs</span> : null}
          {jobCount !== undefined && companyCount !== undefined ? <span> - </span> : null}
          {companyCount !== undefined ? <span>{formatRoundedNumber(companyCount, 3)} companies</span> : null}
          {(jobCount !== undefined || companyCount !== undefined) && location ? <span> - </span> : null}
          {location ? <span>{location}</span> : null}
        </div>
      ) : null}
      <div className="space-y-6">
        <div ref={containerRef} className={gridClassName}>
          {displayedCollections.map((collection, collectionIndex) => {
            const key = getCollectionKey(collection, collectionIndex);
            return (
              <Suspense key={key} fallback={<JobBoardCardSkeleton />}>
                <JobBoardCard
                  collectionIndex={collectionIndex}
                  currentJobIndex={jobIndexByCollection[key] ?? 0}
                  jobCollection={collection}
                  onJobIndexChange={updateCollectionJobIndex}
                  onOpenJob={openJobDetails}
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

      {isDesktop && selectedJob ? (
        <JobDialogContent
          company={selectedCompany}
          currentJob={selectedJob}
          footerNavigation={
            selectedCollection && selectedCollection.jobs.length > 1 && selectedPosition
              ? {
                  currentJobIndex: selectedPosition.jobIndex,
                  totalJobs: selectedCollection.jobs.length,
                  onPrevious: handleFooterPrevious,
                  onNext: handleFooterNext,
                  onJobSelect: handleFooterSelect,
                  onPreviousHover: handleFooterPreviousHover,
                  onNextHover: handleFooterNextHover,
                }
              : undefined
          }
          isApplied={isApplied}
          isBookmarked={isBookmarked}
          isInterviewing={isInterviewing}
          isTransitioning={isTransitioningDialog}
          onApplyToggle={handleApplyToggle}
          onBookmarkToggle={handleBookmarkToggle}
          onOpenChange={setDialogOpen}
          open={dialogOpen}
          outsideNavigation={{
            onPrevious: handleOutsidePrevious,
            onNext: handleOutsideNext,
            onPreviousHover: handleOutsidePreviousHover,
            onNextHover: handleOutsideNextHover,
            canGoPrevious: canGoPreviousGroup,
            canGoNext: canGoNextGroup,
          }}
        />
      ) : null}

      {!isDesktop && selectedJob ? (
        <JobDrawerContent
          company={selectedCompany}
          currentJob={selectedJob}
          isApplied={isApplied}
          isBookmarked={isBookmarked}
          isTransitioning={isTransitioningDialog}
          navigation={{
            onPrevious: handleMobilePrevious,
            onNext: handleMobileNext,
            canGoPrevious: canGoPreviousMobile,
            canGoNext: canGoNextMobile,
          }}
          onApplyToggle={handleApplyToggle}
          onBookmarkToggle={handleBookmarkToggle}
          onClose={() => setDrawerOpen(false)}
          open={drawerOpen}
        />
      ) : null}
    </>
  );
};

export default JobBoard;
