"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useApp } from "@/contexts/AppContext";
import { useResponsiveBreakpoint } from "@/hooks/useMediaQuery";
import { useJobDetailsPrefetch } from "@/hooks/useJobDetailsPrefetch";
import { getDetailsLookupId } from "@/lib/jobs/getDetailsLookupId";
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
  ssr: false,
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

const JobCard = memo(
  ({
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
    const { prefetchNow } = useJobDetailsPrefetch({ delayMs: 160, maxInflight: 4, maxSeen: 600 });

    const cardKey = useMemo(() => `${jobCollection.company?._id ?? "unknown"}-${currentJobIndex}`, [jobCollection.company?._id, currentJobIndex]);

    const handleCardClick = useCallback(() => {
      onClick();
    }, [onClick]);

    const handlePreviousClick = useCallback(() => {
      if (jobCollection.jobs.length < 2) {
        onPrevious();
        return;
      }
      const previousIndex = (currentJobIndex - 1 + jobCollection.jobs.length) % jobCollection.jobs.length;
      prefetchNow(getDetailsLookupId(jobCollection.jobs[previousIndex]));
      onPrevious();
    }, [currentJobIndex, jobCollection.jobs, onPrevious, prefetchNow]);

    const handleNextClick = useCallback(() => {
      if (jobCollection.jobs.length < 2) {
        onNext();
        return;
      }
      const nextIndex = (currentJobIndex + 1) % jobCollection.jobs.length;
      prefetchNow(getDetailsLookupId(jobCollection.jobs[nextIndex]));
      onNext();
    }, [currentJobIndex, jobCollection.jobs, onNext, prefetchNow]);

    return (
      <CardSwipeIndicator onNext={onNext} onPrevious={onPrevious} totalJobs={jobCollection.jobs.length}>
        <Card
          className="group h-full cursor-pointer border border-border bg-background shadow-sm transition-all duration-300 ease-in hover:border-primary/30 hover:shadow-lg dark:hover:border-primary/50 dark:hover:bg-accent/50"
          key={cardKey}
          onClick={handleCardClick}
          data-job-card="true"
        >
          <CardContent className="flex h-full flex-col p-4 py-3">
            <JobCardContent currentJob={currentJob} company={jobCollection.company} isTransitioning={isTransitioning} />
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
                  onNext={handleNextClick}
                  onPrevious={handlePreviousClick}
                  totalJobs={jobCollection.jobs.length}
                />
              ) : (
                <div className="col-span-1"></div>
              )}
              {/* <CardSkillMatch technicalTools={currentJob.skills} /> */}
              <ScrapeTime postedAt={currentJob.estimatedPublishDate ?? ""} iconClassName="w-3 h-3" textClassName="text-xs" />
            </div>
          </CardContent>
        </Card>
      </CardSwipeIndicator>
    );
  }
);

JobCard.displayName = "JobCard";

interface JobBoardCardProps {
  jobCollection: { company: CompanyDTO | null; jobs: JobDTO[] };
  collectionIndex: number;
  currentJobIndex: number;
  onJobIndexChange: (collectionIndex: number, nextJobIndex: number) => void;
  onOpenJob: (collectionIndex: number, jobIndex: number) => void;
}

const JobBoardCard = memo(({ jobCollection, collectionIndex, currentJobIndex, onJobIndexChange, onOpenJob }: JobBoardCardProps) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { isDesktop } = useResponsiveBreakpoint();
  const { addJob, removeJob, user } = useApp();

  const safeIndex = useMemo(() => {
    if (!jobCollection.jobs.length) return 0;
    return Math.max(0, Math.min(currentJobIndex, jobCollection.jobs.length - 1));
  }, [currentJobIndex, jobCollection.jobs.length]);

  const currentJob = useMemo(() => jobCollection.jobs[safeIndex], [jobCollection.jobs, safeIndex]);

  const stableKey = useMemo(() => {
    return jobCollection.company?.companyId ?? jobCollection.company?._id ?? "unknown-company";
  }, [jobCollection.company]);

  const setIndex = useCallback(
    (nextIndex: number) => {
      onJobIndexChange(collectionIndex, nextIndex);
    },
    [collectionIndex, onJobIndexChange]
  );

  const handleNextJob = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setIndex((safeIndex + 1) % jobCollection.jobs.length);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 300);
  }, [isTransitioning, jobCollection.jobs.length, safeIndex, setIndex]);

  const handlePreviousJob = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setIndex((safeIndex - 1 + jobCollection.jobs.length) % jobCollection.jobs.length);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 300);
  }, [isTransitioning, jobCollection.jobs.length, safeIndex, setIndex]);

  const isBookmarked = useMemo(
    () => user.saved.includes(currentJob.externalId) || user.applied.includes(currentJob.externalId) || user.interviewing.includes(currentJob.externalId),
    [user.saved, user.applied, user.interviewing, currentJob.externalId]
  );

  const isApplied = useMemo(
    () => user.applied.includes(currentJob.externalId) || user.interviewing.includes(currentJob.externalId),
    [user.applied, user.interviewing, currentJob.externalId]
  );

  const isInterviewing = useMemo(() => user.interviewing.includes(currentJob.externalId), [user.interviewing, currentJob.externalId]);

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

  const handleBookmarkClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      handleBookmarkToggle();
    },
    [handleBookmarkToggle]
  );

  const handleApplyClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      handleApplyToggle();
    },
    [handleApplyToggle]
  );

  const handleJobIndexChange = useCallback(
    (index: number) => {
      setIndex(index);
    },
    [setIndex]
  );

  const handleOpenJob = useCallback(() => {
    onOpenJob(collectionIndex, safeIndex);
  }, [collectionIndex, onOpenJob, safeIndex]);

  const card = (
    <JobCard
      currentJob={currentJob}
      currentJobIndex={safeIndex}
      isApplied={isApplied}
      isBookmarked={isBookmarked}
      isInterviewing={isInterviewing}
      isTransitioning={isTransitioning}
      jobCollection={jobCollection}
      onBookmarkToggle={handleBookmarkClick}
      onClick={handleOpenJob}
      onJobSelect={handleJobIndexChange}
      onNext={handleNextJob}
      onPrevious={handlePreviousJob}
    />
  );

  return (
    <div key={`${isDesktop ? "desktop" : "mobile"}-${stableKey}`}>
      {isDesktop ? (
        <CardContextMenuProvider
          currentJob={currentJob}
          company={jobCollection.company}
          isApplied={isApplied}
          isBookmarked={isBookmarked}
          onApplyClick={handleApplyClick}
          onBookmarkClick={handleBookmarkClick}
          applyUrl={currentJob.applyUrl ?? ""}
        >
          {card}
        </CardContextMenuProvider>
      ) : (
        card
      )}
    </div>
  );
});

JobBoardCard.displayName = "JobBoardCard";

export default JobBoardCard;
