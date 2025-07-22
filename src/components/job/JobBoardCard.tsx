"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useResponsiveBreakpoint } from "@/hooks/useMediaQuery";
import type { Job, JobCollection } from "@/types/job";
import dynamic from "next/dynamic";
import { memo, Suspense, useCallback, useMemo, useState } from "react";
import CardCompanyJobs from "./card/CardCompanyJobs";
import CardContextMenuProvider from "./card/CardContextMenuProvider";
import CardNavigation from "./card/CardNavigation";
import CardStats from "./card/CardStats";
import CardSwipeIndicator from "./card/CardSwipeIndicator";

const JobCardContent = dynamic(() => import("./contents/JobCardContent"), {
  loading: () => null,
  ssr: false
});

const JobDialogContent = dynamic(() => import("./contents/JobDialogContent"), {
  loading: () => null,
  ssr: false
});

const JobDrawerContent = dynamic(() => import("./contents/JobDrawerContent"), {
  loading: () => null,
  ssr: false
});

interface JobCardProps {
  jobCollection: JobCollection;
  currentJob: Job;
  currentJobIndex: number;
  isTransitioning: boolean;
  isBookmarked: boolean;
  isApplied: boolean;
  onBookmarkToggle: (e: React.MouseEvent) => void;
  onApplyToggle: (e: React.MouseEvent) => void;
  onPrevious: () => void;
  onNext: () => void;
  onJobSelect: (index: number) => void;
  onClick: () => void;
}

const JobCard = memo(({
  jobCollection,
  currentJob,
  currentJobIndex,
  isTransitioning,
  isBookmarked,
  isApplied,
  onBookmarkToggle,
  onApplyToggle,
  onPrevious,
  onNext,
  onJobSelect,
  onClick,
}: JobCardProps) => {
  const cardKey = useMemo(() => 
    `${jobCollection.source_and_board_token}-${currentJobIndex}`, 
    [jobCollection.source_and_board_token, currentJobIndex]
  );

  return (
    <CardSwipeIndicator
      onNext={onNext}
      onPrevious={onPrevious}
      totalJobs={jobCollection.jobs.length}
    >
      <Card
        className="h-full cursor-pointer border bg-white shadow-sm transition-shadow duration-300 ease-in hover:shadow-lg dark:border-pink-700/20 dark:bg-neutral-800 dark:transition-colors dark:hover:border-pink-700/50 dark:hover:bg-neutral-700/50 group "
        key={cardKey}
        onClick={onClick}
        data-job-card="true"
      >
        <CardContent className="flex h-full flex-col p-4 py-3">
          <Suspense fallback={null}>
            <JobCardContent
              currentJob={currentJob}
              isTransitioning={isTransitioning}
            />
          </Suspense>
          <div className="mt-auto grid grid-cols-3 items-center">
            <CardStats
              appliedFromUsers={currentJob.job_information.appliedFromUsers}
              isApplied={isApplied}
              isBookmarked={isBookmarked}
              onApplyToggle={onApplyToggle}
              onBookmarkToggle={onBookmarkToggle}
              savedFromUsers={currentJob.job_information.savedFromUsers}
              viewedByUsers={currentJob.job_information.viewedByUsers}
            />
            {jobCollection.jobs.length > 1 ? (
              <CardNavigation
                currentJobIndex={currentJobIndex}
                onJobSelect={onJobSelect}
                onNext={onNext}
                onPrevious={onPrevious}
                totalJobs={jobCollection.jobs.length}
              />
            ) : (
              <div className="col-span-1"></div>
            )}
            <CardCompanyJobs />
          </div>
        </CardContent>
      </Card>
    </CardSwipeIndicator>
  );
});

JobCard.displayName = "JobCard";

interface JobBoardCardProps {
  jobCollection: JobCollection;
}

const JobBoardCard = memo(({ jobCollection }: JobBoardCardProps) => {
  const [currentJobIndex, setCurrentJobIndex] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { isDesktop } = useResponsiveBreakpoint();
  
  const currentJob = useMemo(() => 
    jobCollection.jobs[currentJobIndex], 
    [jobCollection.jobs, currentJobIndex]
  );

  const stableKey = useMemo(() => 
    jobCollection.source_and_board_token, 
    [jobCollection.source_and_board_token]
  );

  const handleNextJob = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentJobIndex(
        (prevIndex) => (prevIndex + 1) % jobCollection.jobs.length
      );
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 300);
  }, [isTransitioning, jobCollection.jobs.length]);

  const handlePreviousJob = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentJobIndex(
        (prevIndex) =>
          (prevIndex - 1 + jobCollection.jobs.length) %
          jobCollection.jobs.length
      );
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 300);
  }, [isTransitioning, jobCollection.jobs.length]);

  const handleBookmarkToggle = useCallback(() => {
    setIsBookmarked(!isBookmarked);
  }, [isBookmarked]);

  const handleApplyToggle = useCallback(() => {
    // window.open(currentJob.apply_url, "_blank");
    console.log("handleApplyToggle");
    setIsApplied(!isApplied);
  }, [isApplied]);

  const handleBookmarkClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleBookmarkToggle();
  }, [handleBookmarkToggle]);

  const handleApplyClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsApplied(!isApplied);
    console.log("handleApplyClick");
  }, [isApplied]);

  const handleDrawerClose = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  const handleDrawerOpen = useCallback(() => {
    setDrawerOpen(true);
  }, []);

  const handleJobIndexChange = useCallback((index: number) => {
    setCurrentJobIndex(index);
  }, []);

  if (!isDesktop) {
    return (
      <div key={`mobile-${stableKey}`}>
        <JobCard
          currentJob={currentJob}
          currentJobIndex={currentJobIndex}
          isApplied={isApplied}
          isBookmarked={isBookmarked}
          isTransitioning={isTransitioning}
          jobCollection={jobCollection}
          onApplyToggle={handleApplyToggle}
          onBookmarkToggle={handleBookmarkToggle}
          onClick={handleDrawerOpen}
          onJobSelect={handleJobIndexChange}
          onNext={handleNextJob}
          onPrevious={handlePreviousJob}
        />
        <Suspense fallback={null}>
          <JobDrawerContent
            currentJob={currentJob}
            isApplied={isApplied}
            isBookmarked={isBookmarked}
            onApplyToggle={handleApplyToggle}
            onBookmarkToggle={handleBookmarkToggle}
            onClose={handleDrawerClose}
            open={drawerOpen}
          />
        </Suspense>
      </div>
    );
  }

  return (
    <div key={`desktop-${stableKey}`}>
      <CardContextMenuProvider
        currentJob={currentJob}
        isApplied={isApplied}
        isBookmarked={isBookmarked}
        onApplyClick={handleApplyClick}
        onBookmarkClick={handleBookmarkClick}
        applyUrl={currentJob.apply_url}
      >
        <Suspense fallback={null}>
          <JobDialogContent
            currentJob={currentJob}
            isApplied={isApplied}
            isBookmarked={isBookmarked}
            onApplyToggle={handleApplyToggle}
            onBookmarkToggle={handleBookmarkToggle}
          >
            <JobCard
              currentJob={currentJob}
              currentJobIndex={currentJobIndex}
              isApplied={isApplied}
              isBookmarked={isBookmarked}
              isTransitioning={isTransitioning}
              jobCollection={jobCollection}
              onApplyToggle={handleApplyClick}
              onBookmarkToggle={handleBookmarkClick}
              onClick={handleDrawerOpen}
              onJobSelect={handleJobIndexChange}
              onNext={handleNextJob}
              onPrevious={handlePreviousJob}
            />
          </JobDialogContent>
        </Suspense>
      </CardContextMenuProvider>
    </div>
  );
});

JobBoardCard.displayName = "JobBoardCard";

export default JobBoardCard;
