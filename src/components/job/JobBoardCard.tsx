"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useApp } from "@/contexts/AppContext";
import { useResponsiveBreakpoint } from "@/hooks/useMediaQuery";
import { useJobDetailsPrefetch } from "@/hooks/useJobDetailsPrefetch";
import type { CompanyDTO, JobDTO } from "@/types/convexJobs";
import dynamic from "next/dynamic";
import { memo, useCallback, useMemo, useState } from "react";
import CardContextMenuProvider from "./card/CardContextMenuProvider";
import CardNavigation from "./card/CardNavigation";
import CardStats from "./card/CardStats";
import CardSwipeIndicator from "./card/CardSwipeIndicator";
import ScrapeTime from "./util/ScrapeTime";

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
  jobCollection: { company: CompanyDTO | null; jobs: JobDTO[] };
  currentJob: JobDTO;
  currentJobIndex: number;
  isTransitioning: boolean;
  isBookmarked: boolean;
  isApplied: boolean;
  isInterviewing: boolean;
  onBookmarkToggle: (e: React.MouseEvent) => void;
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
  isInterviewing,
  onBookmarkToggle,
  onPrevious,
  onNext,
  onJobSelect,
  onClick,
}: JobCardProps) => {
  const { prefetch, cancel } = useJobDetailsPrefetch({ delayMs: 200, maxInflight: 2 });

  const cardKey = useMemo(() => 
    `${jobCollection.company?._id ?? "unknown"}-${currentJobIndex}`, 
    [jobCollection.company?._id, currentJobIndex]
  );

  const onHoverStart = useCallback(() => {
    prefetch(currentJob._id);
  }, [prefetch, currentJob._id]);

  const onHoverEnd = useCallback(() => {
    cancel(currentJob._id);
  }, [cancel, currentJob._id]);

  return (
    <CardSwipeIndicator
      onNext={onNext}
      onPrevious={onPrevious}
      totalJobs={jobCollection.jobs.length}
    >
      <Card
        className="group h-full cursor-pointer border border-border bg-background shadow-sm transition-all duration-300 ease-in hover:border-primary/30 hover:shadow-lg dark:hover:border-primary/50 dark:hover:bg-accent/50"
        key={cardKey}
        onClick={onClick}
        onMouseEnter={onHoverStart}
        onMouseLeave={onHoverEnd}
        data-job-card="true"
      >
        <CardContent className="flex h-full flex-col p-4 py-3">
          <JobCardContent
            currentJob={currentJob}
            company={jobCollection.company}
            isTransitioning={isTransitioning}
          />
          <div className="mt-auto grid grid-cols-3 items-center">
            <CardStats
              appliedCount={currentJob.applies}
              isApplied={isApplied}
              isBookmarked={isBookmarked}
              isInterviewing={isInterviewing}
              onBookmarkToggle={onBookmarkToggle}
              savedCount={currentJob.saves}
              viewedCount={currentJob.views}
              applyUrl={currentJob.applyUrl ?? ""}
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
            {/* <CardSkillMatch technicalTools={currentJob.skills} /> */}
            <ScrapeTime
              postedAt={currentJob.estimatedPublishDate ?? ""}
              iconClassName="w-3 h-3"
              textClassName="text-xs"
            />
          </div>
        </CardContent>
      </Card>
    </CardSwipeIndicator>
  );
});

JobCard.displayName = "JobCard";

interface JobBoardCardProps {
  jobCollection: { company: CompanyDTO | null; jobs: JobDTO[] };
}

const JobBoardCard = memo(({ jobCollection }: JobBoardCardProps) => {
  const [currentJobIndex, setCurrentJobIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { isDesktop } = useResponsiveBreakpoint();
  const { addJob, removeJob, user } = useApp();
    
  const currentJob = useMemo(() => 
    jobCollection.jobs[currentJobIndex], 
    [jobCollection.jobs, currentJobIndex]
  );

  const stableKey = useMemo(() => {
    return jobCollection.company?.companyId ?? jobCollection.company?._id ?? "unknown-company";
  }, [jobCollection.company]);

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

  const isBookmarked = useMemo(() => 
    user.saved.includes(currentJob.externalId) || 
    user.applied.includes(currentJob.externalId) || 
    user.interviewing.includes(currentJob.externalId),
    [user.saved, user.applied, user.interviewing, currentJob.externalId]
  );

  const isApplied = useMemo(() => 
    user.applied.includes(currentJob.externalId) || 
    user.interviewing.includes(currentJob.externalId),
    [user.applied, user.interviewing, currentJob.externalId]
  );

  const isInterviewing = useMemo(() => 
    user.interviewing.includes(currentJob.externalId),
    [user.interviewing, currentJob.externalId]
  );

  const handleBookmarkToggle = useCallback(() => {
    if (isBookmarked) {
      // Remove from all bookmark-related states
      if (user.saved.includes(currentJob.externalId)) removeJob(currentJob.externalId, "saved");
      if (user.applied.includes(currentJob.externalId)) removeJob(currentJob.externalId, "applied");
      if (user.interviewing.includes(currentJob.externalId)) removeJob(currentJob.externalId, "interviewing");
    } else {
      // Add to saved (default bookmark state)
      addJob(currentJob.externalId, "saved");
    }
  }, [isBookmarked, user.saved, user.applied, user.interviewing, currentJob.externalId, removeJob, addJob]);

  const handleApplyToggle = useCallback(() => {
    if (isApplied) {
      // Remove from all apply-related states
      if (user.applied.includes(currentJob.externalId)) removeJob(currentJob.externalId, "applied");
      if (user.interviewing.includes(currentJob.externalId)) removeJob(currentJob.externalId, "interviewing");
    } else {
      // Add to applied (default apply state)
      addJob(currentJob.externalId, "applied");
    }
  }, [isApplied, user.applied, user.interviewing, currentJob.externalId, removeJob, addJob]);

  const handleBookmarkClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleBookmarkToggle();
  }, [handleBookmarkToggle]);

  const handleApplyClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleApplyToggle();
  }, [handleApplyToggle]);

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
          isInterviewing={isInterviewing}
          isTransitioning={isTransitioning}
          jobCollection={jobCollection}
          onBookmarkToggle={handleBookmarkToggle}
          onClick={handleDrawerOpen}
          onJobSelect={handleJobIndexChange}
          onNext={handleNextJob}
          onPrevious={handlePreviousJob}
        />
          <JobDrawerContent
            currentJob={currentJob}
            company={jobCollection.company}
            isApplied={isApplied}
            isBookmarked={isBookmarked}
            onApplyToggle={handleApplyToggle}
            onBookmarkToggle={handleBookmarkToggle}
            onClose={handleDrawerClose}
            open={drawerOpen}
          />
      </div>
    );
  }

  return (
    <div key={`desktop-${stableKey}`}>
      <CardContextMenuProvider
        currentJob={currentJob}
        company={jobCollection.company}
        isApplied={isApplied}
        isBookmarked={isBookmarked}
        onApplyClick={handleApplyClick}
        onBookmarkClick={handleBookmarkClick}
        applyUrl={currentJob.applyUrl ?? ""}
      >
          <JobDialogContent
            currentJob={currentJob}
            company={jobCollection.company}
            isApplied={isApplied}
            isBookmarked={isBookmarked}
            isInterviewing={isInterviewing}
            onApplyToggle={handleApplyToggle}
            onBookmarkToggle={handleBookmarkToggle}
          >
            <JobCard
              currentJob={currentJob}
              currentJobIndex={currentJobIndex}
              isApplied={isApplied}
              isBookmarked={isBookmarked}
              isInterviewing={isInterviewing}
              isTransitioning={isTransitioning}
              jobCollection={jobCollection}
              onBookmarkToggle={handleBookmarkClick}
              onClick={handleDrawerOpen}
              onJobSelect={handleJobIndexChange}
              onNext={handleNextJob}
              onPrevious={handlePreviousJob}
            />
          </JobDialogContent>
      </CardContextMenuProvider>
    </div>
  );
});

JobBoardCard.displayName = "JobBoardCard";

export default JobBoardCard;

