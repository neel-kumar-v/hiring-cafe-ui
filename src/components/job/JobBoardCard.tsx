"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContent,
  MorphingDialogContainer,
  MorphingDialogClose,
} from "@/components/ui/morphing-dialog";
import { JobCollection, Job } from "@/types/jobs";
import CardStats from "./card/CardStats";
import CardNavigation from "./card/CardNavigation";
import CardContextMenuProvider from "./card/CardContextMenuProvider";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { JobDrawerContent, JobDialogContent, JobCardContent } from "./contents";

// Extracted JobCard component
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
      key={jobCollection.source_and_board_token}
      className="bg-white h-full dark:bg-gray-800 border dark:border-pink-700/20 shadow-sm hover:shadow-lg dark:hover:bg-gray-700/50 dark:hover:border-pink-700/50 transition-colors duration-300 ease-in cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-4 py-3 flex flex-col h-full">
        <JobCardContent
          currentJob={currentJob}
          isTransitioning={isTransitioning}
        />
        <div className="grid grid-cols-3 items-center mt-auto">
          <CardStats
            viewedByUsers={currentJob.job_information.viewedByUsers}
            savedFromUsers={currentJob.job_information.savedFromUsers}
            appliedFromUsers={currentJob.job_information.appliedFromUsers}
            isBookmarked={isBookmarked}
            isApplied={isApplied}
            onBookmarkToggle={onBookmarkToggle}
            onApplyToggle={onApplyToggle}
          />
          <CardNavigation
            currentJobIndex={currentJobIndex}
            totalJobs={jobCollection.jobs.length}
            onPrevious={onPrevious}
            onNext={onNext}
            onJobSelect={onJobSelect}
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

  // Reset scroll position when dialog content mounts
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [currentJobIndex]); // Reset when job changes

  // Reset scroll position when dialog opens
  useEffect(() => {
    const resetScroll = () => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    };

    // Use MutationObserver to detect when dialog content is added to DOM
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
                // Dialog backdrop detected, reset scroll after a short delay
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
    // Render card as a trigger for the drawer
    return (
      <>
        <JobCard
          onClick={() => setDrawerOpen(true)}
          jobCollection={jobCollection}
          currentJob={currentJob}
          currentJobIndex={currentJobIndex}
          isTransitioning={isTransitioning}
          isBookmarked={isBookmarked}
          isApplied={isApplied}
          onBookmarkToggle={(e) => {
            e.stopPropagation();
            setIsBookmarked(!isBookmarked);
          }}
          onApplyToggle={(e) => {
            e.stopPropagation();
            setIsApplied(!isApplied);
          }}
          onPrevious={() =>
            setCurrentJobIndex(
              (prev) =>
                (prev - 1 + jobCollection.jobs.length) %
                jobCollection.jobs.length
            )
          }
          onNext={() =>
            setCurrentJobIndex(
              (prev) => (prev + 1) % jobCollection.jobs.length
            )
          }
          onJobSelect={(index) => setCurrentJobIndex(index)}
        />
        <JobDrawerContent
          currentJob={currentJob}
          isBookmarked={isBookmarked}
          isApplied={isApplied}
          onBookmarkToggle={() => setIsBookmarked(!isBookmarked)}
          onApplyToggle={() => setIsApplied(!isApplied)}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        />
      </>
    );
  }

  return (
    <MorphingDialog
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 34,
      }}
    >
      <CardContextMenuProvider
        currentJob={currentJob}
        isBookmarked={isBookmarked}
        isApplied={isApplied}
        onBookmarkClick={handleBookmarkClick}
        onApplyClick={handleApplyClick}
      >
        <MorphingDialogTrigger
          style={{
            borderRadius: "8px",
          }}
          className="w-full text-left h-full"
        >
          <JobCard
            onClick={() => {}}
            jobCollection={jobCollection}
            currentJob={currentJob}
            currentJobIndex={currentJobIndex}
            isTransitioning={isTransitioning}
            isBookmarked={isBookmarked}
            isApplied={isApplied}
            onBookmarkToggle={handleBookmarkClick}
            onApplyToggle={handleApplyClick}
            onPrevious={handlePreviousJob}
            onNext={handleNextJob}
            onJobSelect={handleJobSelect}
          />
        </MorphingDialogTrigger>
      </CardContextMenuProvider>

      <MorphingDialogContainer>
        <MorphingDialogContent
          style={{
            borderRadius: "12px",
          }}
          className="relative h-auto w-[800px] max-w-[90vw] min-w-[60vw] translate-y-8 border border-gray-100 bg-white dark:bg-gray-800 dark:border-gray-700"
        >
          <div
            ref={scrollContainerRef}
            className="h-[calc(90vh)] overflow-y-auto"
          >
            <JobDialogContent
              currentJob={currentJob}
              isBookmarked={isBookmarked}
              isApplied={isApplied}
              onBookmarkToggle={handleBookmarkToggle}
              onApplyToggle={handleApplyToggle}
            />
          </div>
          <MorphingDialogClose className="text-zinc-500 dark:text-zinc-400" />
        </MorphingDialogContent>
      </MorphingDialogContainer>
    </MorphingDialog>
  );
};

export default JobBoardCard;
