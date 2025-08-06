"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useApp } from "@/contexts/AppContext";
import { useResponsiveBreakpoint } from "@/hooks/useMediaQuery";
import type { Job, JobCollection } from "@/types/job";
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
  jobCollection: JobCollection;
  currentJob: Job;
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
          <JobCardContent
            currentJob={currentJob}
            isTransitioning={isTransitioning}
          />
          <div className="mt-auto grid grid-cols-3 items-center">
            <CardStats
              appliedFromUsers={currentJob.job_information.appliedFromUsers}
              isApplied={isApplied}
              isBookmarked={isBookmarked}
              isInterviewing={isInterviewing}
              onBookmarkToggle={onBookmarkToggle}
              savedFromUsers={currentJob.job_information.savedFromUsers}
              viewedByUsers={currentJob.job_information.viewedByUsers}
              applyUrl={currentJob.apply_url}
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
            {/* <CardSkillMatch technicalTools={currentJob.v5_processed_job_data.technical_tools} /> */}
            <ScrapeTime
              postedAt={currentJob.v5_processed_job_data.estimated_publish_date}
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
  jobCollection: JobCollection;
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
    const companyName = jobCollection.jobs[0]?.v5_processed_company_data?.name || 
                       jobCollection.jobs[0]?.v5_processed_job_data.company_name || 
                       jobCollection.source_and_board_token;
    return companyName;
  }, [jobCollection.jobs, jobCollection.source_and_board_token]);

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
    user.saved.includes(currentJob.id) || 
    user.applied.includes(currentJob.id) || 
    user.interviewing.includes(currentJob.id),
    [user.saved, user.applied, user.interviewing, currentJob.id]
  );

  const isApplied = useMemo(() => 
    user.applied.includes(currentJob.id) || 
    user.interviewing.includes(currentJob.id),
    [user.applied, user.interviewing, currentJob.id]
  );

  const isInterviewing = useMemo(() => 
    user.interviewing.includes(currentJob.id),
    [user.interviewing, currentJob.id]
  );

  const handleBookmarkToggle = useCallback(() => {
    if (isBookmarked) {
      // Remove from all bookmark-related states
      if (user.saved.includes(currentJob.id)) removeJob(currentJob.id, "saved");
      if (user.applied.includes(currentJob.id)) removeJob(currentJob.id, "applied");
      if (user.interviewing.includes(currentJob.id)) removeJob(currentJob.id, "interviewing");
    } else {
      // Add to saved (default bookmark state)
      addJob(currentJob.id, "saved");
    }
  }, [isBookmarked, user.saved, user.applied, user.interviewing, currentJob.id, removeJob, addJob]);

  const handleApplyToggle = useCallback(() => {
    if (isApplied) {
      // Remove from all apply-related states
      if (user.applied.includes(currentJob.id)) removeJob(currentJob.id, "applied");
      if (user.interviewing.includes(currentJob.id)) removeJob(currentJob.id, "interviewing");
    } else {
      // Add to applied (default apply state)
      addJob(currentJob.id, "applied");
    }
  }, [isApplied, user.applied, user.interviewing, currentJob.id, removeJob, addJob]);

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
        isApplied={isApplied}
        isBookmarked={isBookmarked}
        onApplyClick={handleApplyClick}
        onBookmarkClick={handleBookmarkClick}
        applyUrl={currentJob.apply_url}
      >
          <JobDialogContent
            currentJob={currentJob}
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

