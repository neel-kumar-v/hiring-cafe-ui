"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { Job, JobCollection } from "@/types/jobs";
import { useEffect, useRef, useState } from "react";
import CardContextMenuProvider from "./card/CardContextMenuProvider";
import CardNavigation from "./card/CardNavigation";
import CardStats from "./card/CardStats";
import { JobCardContent, JobDialogContent, JobDrawerContent } from "./contents";

const JobCard = ({
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
}: {
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
}) => {
  return (
    <Card
      className="h-full cursor-pointer border bg-white shadow-sm transition-shadow duration-300 ease-in hover:shadow-lg dark:border-pink-700/20 dark:bg-gray-800 dark:transition-colors dark:hover:border-pink-700/50 dark:hover:bg-gray-700/50"
      key={jobCollection.source_and_board_token}
      onClick={onClick}
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
            onApplyToggle={onApplyToggle}
            onBookmarkToggle={onBookmarkToggle}
            savedFromUsers={currentJob.job_information.savedFromUsers}
            viewedByUsers={currentJob.job_information.viewedByUsers}
          />
          <CardNavigation
            currentJobIndex={currentJobIndex}
            onJobSelect={onJobSelect}
            onNext={onNext}
            onPrevious={onPrevious}
            totalJobs={jobCollection.jobs.length}
          />
        </div>
      </CardContent>
    </Card>
  );
};

const JobBoardCard = ({ jobCollection }: { jobCollection: JobCollection }) => {
  const [currentJobIndex, setCurrentJobIndex] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isDesktop = useMediaQuery("(min-width: 640px)");
  const currentJob = jobCollection.jobs[currentJobIndex];

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [currentJobIndex]);

  useEffect(() => {
    const resetScroll = () => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    };

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (
                element.classList.contains("fixed") &&
                element.classList.contains("inset-0")
              ) {
                setTimeout(resetScroll, 100);
              }
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleNextJob = () => {
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
  };

  const handlePreviousJob = () => {
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
  };

  const handleJobSelect = (index: number) => {
    if (isTransitioning || index === currentJobIndex) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentJobIndex(index);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 300);
  };

  const handleBookmarkToggle = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleApplyToggle = () => {
    setIsApplied(!isApplied);
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleBookmarkToggle();
  };

  const handleApplyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleApplyToggle();
  };

  if (!isDesktop) {
    return (
      <>
        <JobCard
          currentJob={currentJob}
          currentJobIndex={currentJobIndex}
          isApplied={isApplied}
          isBookmarked={isBookmarked}
          isTransitioning={isTransitioning}
          jobCollection={jobCollection}
          onApplyToggle={(e) => {
            e.stopPropagation();
            setIsApplied(!isApplied);
          }}
          onBookmarkToggle={(e) => {
            e.stopPropagation();
            setIsBookmarked(!isBookmarked);
          }}
          onClick={() => setDrawerOpen(true)}
          onJobSelect={(index) => setCurrentJobIndex(index)}
          onNext={() =>
            setCurrentJobIndex((prev) => (prev + 1) % jobCollection.jobs.length)
          }
          onPrevious={() =>
            setCurrentJobIndex(
              (prev) =>
                (prev - 1 + jobCollection.jobs.length) %
                jobCollection.jobs.length
            )
          }
        />
        <JobDrawerContent
          currentJob={currentJob}
          isApplied={isApplied}
          isBookmarked={isBookmarked}
          onApplyToggle={() => setIsApplied(!isApplied)}
          onBookmarkToggle={() => setIsBookmarked(!isBookmarked)}
          onClose={() => setDrawerOpen(false)}
          open={drawerOpen}
        />
      </>
    );
  }

  return (
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
        onApplyToggle={handleApplyToggle}
        onBookmarkToggle={handleBookmarkToggle}
        scrollContainerRef={scrollContainerRef}
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
          onClick={() => {}}
          onJobSelect={handleJobSelect}
          onNext={handleNextJob}
          onPrevious={handlePreviousJob}
        />
      </JobDialogContent>
    </CardContextMenuProvider>
  );
};

export default JobBoardCard;
