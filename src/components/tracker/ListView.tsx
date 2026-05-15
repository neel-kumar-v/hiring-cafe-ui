"use client";

import { Card } from "@/components/ui/card";
import { useApp } from "@/contexts/AppContext";
import { useResponsiveBreakpoint } from "@/hooks/useMediaQuery";
import { useJobDetailsPrefetch } from "@/hooks/useJobDetailsPrefetch";
import { JOB_FADE_DURATION_MS } from "@/lib/jobs/fadeTransition";
import { getDetailsLookupId } from "@/lib/jobs/getDetailsLookupId";
import { stableCompanyKey } from "@/lib/jobs/stableCompanyKey";
import type { JobCardResultDTO } from "@/types/convexJobs";
import dynamic from "next/dynamic";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ListJobCardContents } from "../job/contents";

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

interface ListViewProps {
  jobs: JobCardResultDTO[];
  visibleCategories?: Record<JobCategory, boolean>;
  getJobStatus: (jobId: string) => JobCategory;
  onMoveJob?: (jobId: string, fromStatus: JobCategory, toStatus: JobCategory) => void;
}

const ListViewJobCard = ({
  row,
  currentStage,
  onMoveJob,
  onJobClick,
}: {
  row: JobCardResultDTO;
  currentStage: JobCategory;
  onMoveJob?: (jobId: string, fromStatus: JobCategory, toStatus: JobCategory) => void;
  onJobClick: () => void;
}) => {
  return (
    <Card
      className="mb-3 cursor-pointer border border-input p-4 shadow-none transition-all duration-300 ease-in-out hover:border-input/75"
      onClick={onJobClick}
    >
      <ListJobCardContents job={row.job} company={row.company} currentStage={currentStage} onMoveJob={onMoveJob} />
    </Card>
  );
};

const ListView = memo(({ jobs, visibleCategories, getJobStatus, onMoveJob }: ListViewProps) => {
  const { isDesktop } = useResponsiveBreakpoint();
  const { user } = useApp();
  const { prefetch, prefetchNow } = useJobDetailsPrefetch({ delayMs: 160, maxInflight: 2 });
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [fadeCompanyChromeNav, setFadeCompanyChromeNav] = useState(false);
  const transitionInFlightRef = useRef(false);

  const filteredJobs = useMemo(
    () =>
      jobs.filter(({ job }) => {
        const status = getJobStatus(job.externalId);
        return visibleCategories?.[status] ?? true;
      }),
    [getJobStatus, jobs, visibleCategories]
  );

  useEffect(() => {
    if (!filteredJobs.length) {
      setSelectedIndex(null);
      setDialogOpen(false);
      setDrawerOpen(false);
      return;
    }
    if (selectedIndex === null) return;
    if (selectedIndex >= filteredJobs.length) {
      setSelectedIndex(filteredJobs.length - 1);
    }
  }, [filteredJobs, selectedIndex]);

  useEffect(() => {
    if (isDesktop) {
      setDrawerOpen(false);
      return;
    }
    setDialogOpen(false);
  }, [isDesktop]);

  const selectedRow = selectedIndex === null ? null : (filteredJobs[selectedIndex] ?? null);

  const prefetchNeighborsForSelected = useCallback(() => {
    if (selectedIndex === null) return;
    if (filteredJobs.length < 2) return;
    const previousIndex = (selectedIndex - 1 + filteredJobs.length) % filteredJobs.length;
    const nextIndex = (selectedIndex + 1) % filteredJobs.length;
    prefetch(getDetailsLookupId(filteredJobs[previousIndex].job));
    if (nextIndex !== previousIndex) prefetch(getDetailsLookupId(filteredJobs[nextIndex].job));
  }, [filteredJobs, prefetch, selectedIndex]);

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

  const navigateToIndex = useCallback(
    (nextIndex: number) => {
      if (!filteredJobs.length) return;
      const wrappedIndex = (nextIndex + filteredJobs.length) % filteredJobs.length;
      setSelectedIndex(wrappedIndex);
    },
    [filteredJobs.length]
  );

  const handleJobClick = useCallback(
    (index: number) => {
      setSelectedIndex(index);
      if (isDesktop) setDialogOpen(true);
      else setDrawerOpen(true);
    },
    [isDesktop]
  );

  const handlePrevious = useCallback(async () => {
    if (!filteredJobs.length || selectedIndex === null) return;
    const previousIndex = (selectedIndex - 1 + filteredJobs.length) % filteredJobs.length;
    const currentRow = filteredJobs[selectedIndex];
    const previousRow = filteredJobs[previousIndex];
    const fadeCompanyChrome =
      stableCompanyKey(currentRow.company, currentRow.job) !== stableCompanyKey(previousRow.company, previousRow.job);
    prefetchNow(getDetailsLookupId(filteredJobs[previousIndex].job));
    await runNavigationTransition(() => navigateToIndex(selectedIndex - 1), { fadeCompanyChrome });
  }, [filteredJobs, navigateToIndex, prefetchNow, runNavigationTransition, selectedIndex]);

  const handleNext = useCallback(async () => {
    if (!filteredJobs.length || selectedIndex === null) return;
    const nextIndex = (selectedIndex + 1) % filteredJobs.length;
    const currentRow = filteredJobs[selectedIndex];
    const nextRow = filteredJobs[nextIndex];
    const fadeCompanyChrome =
      stableCompanyKey(currentRow.company, currentRow.job) !== stableCompanyKey(nextRow.company, nextRow.job);
    prefetchNow(getDetailsLookupId(filteredJobs[nextIndex].job));
    await runNavigationTransition(() => navigateToIndex(selectedIndex + 1), { fadeCompanyChrome });
  }, [filteredJobs, navigateToIndex, prefetchNow, runNavigationTransition, selectedIndex]);

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
    if (isBookmarked) {
      if (user.saved.includes(jobId)) onMoveJob?.(jobId, "saved", "hidden");
      if (user.applied.includes(jobId)) onMoveJob?.(jobId, "applied", "hidden");
      if (user.interviewing.includes(jobId)) onMoveJob?.(jobId, "interviewing", "hidden");
      return;
    }
    onMoveJob?.(jobId, getJobStatus(jobId), "saved");
  }, [getJobStatus, isBookmarked, onMoveJob, selectedRow, user.applied, user.interviewing, user.saved]);

  const handleApplyToggle = useCallback(() => {
    if (!selectedRow) return;
    const jobId = selectedRow.job.externalId;
    if (isApplied) {
      if (user.applied.includes(jobId)) onMoveJob?.(jobId, "applied", "saved");
      if (user.interviewing.includes(jobId)) onMoveJob?.(jobId, "interviewing", "saved");
      return;
    }
    onMoveJob?.(jobId, getJobStatus(jobId), "applied");
  }, [getJobStatus, isApplied, onMoveJob, selectedRow, user.applied, user.interviewing]);

  return (
    <div className="h-full overflow-y-auto">
      {filteredJobs.map((row, index) => (
        <ListViewJobCard
          key={row.job.externalId}
          row={row}
          currentStage={getJobStatus(row.job.externalId)}
          onJobClick={() => handleJobClick(index)}
          onMoveJob={onMoveJob}
        />
      ))}

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
            onPreviousHover: undefined,
            onNextHover: undefined,
            canGoPrevious: filteredJobs.length > 1,
            canGoNext: filteredJobs.length > 1,
            previousAriaLabel: "Previous list job",
            nextAriaLabel: "Next list job",
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
            canGoPrevious: filteredJobs.length > 1,
            canGoNext: filteredJobs.length > 1,
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

ListView.displayName = "ListView";

export default ListView;
