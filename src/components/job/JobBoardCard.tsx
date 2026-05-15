"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  SpeedDial,
  SpeedDialAction,
  SpeedDialContent,
  SpeedDialItem,
  SpeedDialTrigger,
} from "@/components/ui/speed-dial";
import { useApp } from "@/contexts/AppContext";
import { useResponsiveBreakpoint } from "@/hooks/useMediaQuery";
import { useJobDetailsPrefetch } from "@/hooks/useJobDetailsPrefetch";
import { JOB_FADE_DURATION_MS } from "@/lib/jobs/fadeTransition";
import { getDetailsLookupId } from "@/lib/jobs/getDetailsLookupId";
import type { CompanyDTO, JobDTO } from "@/types/convexJobs";
import dynamic from "next/dynamic";
import { memo, useCallback, useMemo, useState } from "react";
import CardContextMenuProvider from "./card/CardContextMenuProvider";
import CardNavigation from "./card/CardNavigation";
import CardStats from "./card/CardStats";
import CardSwipeIndicator from "./card/CardSwipeIndicator";
import ScrapeTime from "./util/ScrapeTime";
import { toast } from "sonner";
import UniversalTooltip from "@/components/util/UniversalTooltip";
import { CheckCheck, EyeOff, MessageSquareWarning, MoreVertical, Share2 } from "lucide-react";

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
  onApplyToggle: (e: React.MouseEvent) => void;
  onShare: (e: React.MouseEvent) => void;
  onHide: (e: React.MouseEvent) => void;
  onReport: (e: React.MouseEvent) => void;
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
    onApplyToggle,
    onShare,
    onHide,
    onReport,
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
          className="group relative h-full cursor-pointer border border-border bg-background shadow-sm transition-all duration-300 ease-in hover:border-primary/30 hover:shadow-lg dark:hover:border-primary/50 dark:hover:bg-accent/50"
          key={cardKey}
          onClick={handleCardClick}
          data-job-card="true"
        >
          <div className="absolute top-2 right-2 z-20">
            <SpeedDial activationMode="hover" radius={36} rotationOffset={-135} side="circular">
              <SpeedDialTrigger
                aria-label="Job actions"
                className="size-9 rounded-md bg-transparent shadow-none hover:bg-transparent active:bg-transparent"
                onClick={(e) => e.stopPropagation()}
                variant="ghost"
              >
                <MoreVertical className="size-4" />
              </SpeedDialTrigger>
              <SpeedDialContent className="z-30" forceMount={false}>
                <SpeedDialItem>
                  <UniversalTooltip content={isApplied ? "Unmark applied" : "Mark applied"} side="top" removeOnMobile={true}>
                    <SpeedDialAction
                      aria-label={isApplied ? "Unmark applied" : "Mark applied"}
                      className="!bg-background shadow-none transition-all duration-150 ease-out hover:-translate-y-0.5 hover:scale-[1.05] hover:!bg-muted active:translate-y-0 active:scale-[0.97]"
                      onClick={onApplyToggle}
                    >
                      <CheckCheck className="size-4" />
                    </SpeedDialAction>
                  </UniversalTooltip>
                </SpeedDialItem>
                <SpeedDialItem>
                  <UniversalTooltip content="Share" side="top" removeOnMobile={true}>
                    <SpeedDialAction
                      aria-label="Share job"
                      className="!bg-background shadow-none transition-all duration-150 ease-out hover:-translate-y-0.5 hover:scale-[1.05] hover:!bg-muted active:translate-y-0 active:scale-[0.97]"
                      onClick={onShare}
                    >
                      <Share2 className="size-4" />
                    </SpeedDialAction>
                  </UniversalTooltip>
                </SpeedDialItem>
                <SpeedDialItem>
                  <UniversalTooltip content="Report" side="bottom" removeOnMobile={true}>
                    <SpeedDialAction
                      aria-label="Report job"
                      className="border-destructive/30 !bg-background shadow-none transition-all duration-150 ease-out hover:-translate-y-0.5 hover:scale-[1.05] hover:!bg-destructive/20 active:translate-y-0 active:scale-[0.97]"
                      onClick={onReport}
                    >
                      <MessageSquareWarning className="size-4 text-destructive!" />
                    </SpeedDialAction>
                  </UniversalTooltip>
                </SpeedDialItem>
                <SpeedDialItem>
                  <UniversalTooltip content="Hide" side="bottom" removeOnMobile={true}>
                    <SpeedDialAction
                      aria-label="Hide job"
                      className="border-destructive/30 !bg-background shadow-none transition-all duration-150 ease-out hover:-translate-y-0.5 hover:scale-[1.05] hover:!bg-destructive/20 active:translate-y-0 active:scale-[0.97]"
                      onClick={onHide}
                    >
                      <EyeOff className="size-4 text-destructive!" />
                    </SpeedDialAction>
                  </UniversalTooltip>
                </SpeedDialItem>
              </SpeedDialContent>
            </SpeedDial>
          </div>
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
    }, JOB_FADE_DURATION_MS);
  }, [isTransitioning, jobCollection.jobs.length, safeIndex, setIndex]);

  const handlePreviousJob = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setIndex((safeIndex - 1 + jobCollection.jobs.length) % jobCollection.jobs.length);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, JOB_FADE_DURATION_MS);
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
      e.stopPropagation();
      handleBookmarkToggle();
    },
    [handleBookmarkToggle]
  );

  const handleApplyClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      handleApplyToggle();
    },
    [handleApplyToggle]
  );

  const handleShareClick = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      const url = currentJob.applyUrl ?? "";
      if (!url) {
        toast.error("No application link available to share.");
        return;
      }
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Application link copied to clipboard.");
      } catch {
        toast.error("Unable to copy link right now.");
      }
    },
    [currentJob.applyUrl]
  );

  const handleHideClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const jobId = currentJob.externalId;

      if (user.hidden.includes(jobId)) {
        toast.info("Job is already hidden.");
        return;
      }

      if (user.saved.includes(jobId)) removeJob(jobId, "saved");
      if (user.applied.includes(jobId)) removeJob(jobId, "applied");
      if (user.interviewing.includes(jobId)) removeJob(jobId, "interviewing");
      if (user.rejected.includes(jobId)) removeJob(jobId, "rejected");

      addJob(jobId, "hidden");
      toast.success("Job hidden.");
    },
    [addJob, currentJob.externalId, removeJob, user.applied, user.hidden, user.interviewing, user.rejected, user.saved]
  );

  const handleReportClick = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      const reportPayload = [
        `Job: ${currentJob.title}`,
        `External ID: ${currentJob.externalId}`,
        `Apply URL: ${currentJob.applyUrl ?? "(none)"}`,
        "",
        "Report: (describe the issue here)",
      ].join("\n");

      try {
        await navigator.clipboard.writeText(reportPayload);
        toast.success("Report template copied to clipboard.");
      } catch {
        toast.error("Unable to copy report template right now.");
      }
    },
    [currentJob.applyUrl, currentJob.externalId, currentJob.title]
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
      onApplyToggle={handleApplyClick}
      onShare={handleShareClick}
      onHide={handleHideClick}
      onReport={handleReportClick}
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
          onShareClick={handleShareClick}
          onHideClick={handleHideClick}
          onReportClick={handleReportClick}
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
