"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { Job, JobCollection } from "@/types/jobs";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  const cardRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(
    null
  );

  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(
    null
  );
  const [swipeProgress, setSwipeProgress] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (jobCollection.jobs.length === 1) return;
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setSwipeDirection(null);
    setSwipeProgress(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart || jobCollection.jobs.length === 1) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;

    // Only show indicator for horizontal swipes
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 20) {
      const direction = deltaX > 0 ? "right" : "left";
      setSwipeDirection(direction);
      // Calculate progress as percentage of 50px threshold
      setSwipeProgress(Math.min(Math.abs(deltaX) / 50, 1));
    } else {
      setSwipeDirection(null);
      setSwipeProgress(0);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || jobCollection.jobs.length === 1) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;

    // Only trigger if horizontal swipe is more significant than vertical
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        onNext();
      } else {
        onPrevious();
      }
    }

    setTouchStart(null);
    setSwipeDirection(null);
    setSwipeProgress(0);
  };

  return (
    <Card
      ref={cardRef}
      className="h-full cursor-pointer border bg-white shadow-sm transition-shadow duration-300 ease-in hover:shadow-lg dark:border-pink-700/20 dark:bg-neutral-800 dark:transition-colors dark:hover:border-pink-700/50 dark:hover:bg-neutral-700/50 group select-none relative overflow-hidden"
      key={jobCollection.source_and_board_token}
      onClick={onClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Swipe Indicator Overlay */}
      {swipeDirection && (
        <div
          className={`absolute inset-0 flex items-center pointer-events-none z-10 transition-opacity duration-200 ${
            swipeProgress > 0.3 ? "opacity-100" : "opacity-0"
          } ${swipeDirection === "left" ? "justify-start" : "justify-end"}`}
        >
          <div
            className="flex items-center justify-center size-12 rounded-full bg-pink-400/10 backdrop-blur-sm border border-pink-400/20 transition-all duration-200 mx-4"
            style={{
              transform: `scale(${0.8 + swipeProgress * 0.2})`,
            }}
          >
            {swipeDirection === "left" ? (
              <ChevronLeft className="size-6 text-pink-600 dark:text-pink-400 transition-transform duration-200" />
            ) : (
              <ChevronRight className="size-6 text-pink-600 dark:text-pink-400 transition-transform duration-200" />
            )}
          </div>
        </div>
      )}

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
          <div className="col-span-1 flex justify-end">
            <span className="text-sm text-pink-600 dark:text-pink-400 hover:scale-120 dark:hover:text-pink-200 transition-all duration-300 ease-in-out opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 cursor-pointer">
              View All
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const JobBoardCard = ({ jobCollection }: { jobCollection: JobCollection }) => {
  const [currentJobIndex, setCurrentJobIndex] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isApplied] = useState(false);
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
    // setIsApplied(!isApplied);
    window.open(currentJob.apply_url, "_blank");
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
          onApplyToggle={handleApplyToggle}
          onBookmarkToggle={handleBookmarkToggle}
          onClick={() => setDrawerOpen(true)}
          onJobSelect={(index) => setCurrentJobIndex(index)}
          onNext={handleNextJob}
          onPrevious={handlePreviousJob}
        />
        <JobDrawerContent
          currentJob={currentJob}
          isApplied={isApplied}
          isBookmarked={isBookmarked}
          onApplyToggle={handleApplyToggle}
          onBookmarkToggle={handleBookmarkToggle}
          onClose={() => setDrawerOpen(false)}
          open={drawerOpen}
        />
      </>
    );
  }

  return (
    <JobDialogContent
      currentJob={currentJob}
      isApplied={isApplied}
      isBookmarked={isBookmarked}
      onApplyToggle={handleApplyToggle}
      onBookmarkToggle={handleBookmarkToggle}
      scrollContainerRef={scrollContainerRef}
    >
      <CardContextMenuProvider
        currentJob={currentJob}
        isApplied={isApplied}
        isBookmarked={isBookmarked}
        onApplyClick={handleApplyClick}
        onBookmarkClick={handleBookmarkClick}
        applyUrl={currentJob.apply_url}
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
      </CardContextMenuProvider>
    </JobDialogContent>
  );
};

export default JobBoardCard;
