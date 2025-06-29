"use client";

import { useState, useEffect } from "react";
import {
  Bookmark,
  Send,
  ExternalLink,
  Share2,
  EyeOff,
  Flag,
  Link2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import jobsData from "@/data/jobs_data.json";
import { Job, JobCollection } from "@/types/jobs";
import JobHeader from "./job_card/JobHeader";
import CompanyInfo from "./job_card/CompanyInfo";
import JobDescriptionSummary from "./job_card/JobDescriptionSummary";
import JobStats from "./job_card/JobStats";
import JobNavigation from "./job_card/JobNavigation";

const JobContent = ({
  currentJob,
  isTransitioning,
  isBookmarked,
  isApplied,
  currentJobIndex,
  totalJobs,
  onBookmarkClick,
  onApplyClick,
  onPreviousJob,
  onNextJob,
  onJobSelect,
}: {
  currentJob: Job;
  isTransitioning: boolean;
  isBookmarked: boolean;
  isApplied: boolean;
  currentJobIndex: number;
  totalJobs: number;
  onBookmarkClick: (e: React.MouseEvent) => void;
  onApplyClick: (e: React.MouseEvent) => void;
  onPreviousJob: () => void;
  onNextJob: () => void;
  onJobSelect: (index: number) => void;
}) => {
  return (
    <div className="flex flex-col h-full">
      <div
        className={`transition-opacity duration-300 ease-in-out ${
          isTransitioning ? "opacity-0" : "opacity-100"
        }`}
      >
        <JobHeader
          jobTitle={currentJob.job_information.title}
          companyName={currentJob.v5_processed_company_data.name}
          location={
            currentJob.v5_processed_job_data.formatted_workplace_location
          }
          publishDate={currentJob.v5_processed_job_data.estimated_publish_date}
          compensation={{
            yearly_min_compensation:
              currentJob.v5_processed_job_data.yearly_min_compensation,
            yearly_max_compensation:
              currentJob.v5_processed_job_data.yearly_max_compensation,
            monthly_min_compensation:
              currentJob.v5_processed_job_data.monthly_min_compensation,
            monthly_max_compensation:
              currentJob.v5_processed_job_data.monthly_max_compensation,
            weekly_min_compensation:
              currentJob.v5_processed_job_data.weekly_min_compensation,
            weekly_max_compensation:
              currentJob.v5_processed_job_data.weekly_max_compensation,
            hourly_min_compensation:
              currentJob.v5_processed_job_data.hourly_min_compensation,
            hourly_max_compensation:
              currentJob.v5_processed_job_data.hourly_max_compensation,
            "bi-weekly_min_compensation":
              currentJob.v5_processed_job_data["bi-weekly_min_compensation"],
            "bi-weekly_max_compensation":
              currentJob.v5_processed_job_data["bi-weekly_max_compensation"],
            daily_min_compensation:
              currentJob.v5_processed_job_data.daily_min_compensation,
            daily_max_compensation:
              currentJob.v5_processed_job_data.daily_max_compensation,
          }}
        />

        <CompanyInfo companyData={currentJob.v5_processed_company_data} />

        <JobDescriptionSummary
          requirementsSummary={
            currentJob.v5_processed_job_data.requirements_summary
          }
          technicalTools={currentJob.v5_processed_job_data.technical_tools}
        />
      </div>

      <div className="grid grid-cols-3 items-center mt-auto">
        <JobStats
          viewedByUsers={currentJob.job_information.viewedByUsers}
          savedFromUsers={currentJob.job_information.savedFromUsers}
          appliedFromUsers={currentJob.job_information.appliedFromUsers}
          isBookmarked={isBookmarked}
          isApplied={isApplied}
          onBookmarkToggle={onBookmarkClick}
          onApplyToggle={onApplyClick}
        />
        <JobNavigation
          currentJobIndex={currentJobIndex}
          totalJobs={totalJobs}
          onPrevious={onPreviousJob}
          onNext={onNextJob}
          onJobSelect={onJobSelect}
        />
      </div>
    </div>
  );
};

export function JobBoardCard({
  jobCollection,
}: {
  jobCollection: JobCollection;
}) {
  const [currentJobIndex, setCurrentJobIndex] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const currentJob = jobCollection.jobs[currentJobIndex];

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

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Card
          key={jobCollection.source_and_board_token}
          className="bg-white h-full dark:bg-gray-800 border dark:border-pink-700/20 shadow-sm hover:shadow-lg dark:hover:bg-gray-700/50 dark:hover:border-pink-700/50 transition-all duration-300 ease-in cursor-pointer"
        >
          <CardContent className="p-4 flex flex-col h-full">
            <JobContent
              currentJob={currentJob}
              isTransitioning={isTransitioning}
              isBookmarked={isBookmarked}
              isApplied={isApplied}
              currentJobIndex={currentJobIndex}
              totalJobs={jobCollection.jobs.length}
              onBookmarkClick={handleBookmarkClick}
              onApplyClick={handleApplyClick}
              onPreviousJob={handlePreviousJob}
              onNextJob={handleNextJob}
              onJobSelect={handleJobSelect}
            />
          </CardContent>
        </Card>
      </ContextMenuTrigger>
      <ContextMenuContent className="min-w-64">
        <ContextMenuItem onClick={handleBookmarkClick}>
          {isBookmarked ? (
            <Bookmark className="mr-2 h-4 w-4 fill-current text-pink-500 dark:text-pink-400" />
          ) : (
            <Bookmark className="mr-2 h-4 w-4" />
          )}
          {isBookmarked ? "Unsave Job" : "Save Job"}
        </ContextMenuItem>
        <ContextMenuItem onClick={handleApplyClick}>
          {isApplied ? (
            <Send className="mr-2 h-4 w-4 text-pink-500 dark:text-pink-400 fill-pink-500 dark:fill-pink-400" />
          ) : (
            <Send className="mr-2 h-4 w-4" />
          )}
          {isApplied ? "Unmark Applied" : "Apply Directly"}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>
          <ExternalLink className="mr-2 h-4 w-4" />
          View all Jobs from {currentJob.v5_processed_company_data.name}
        </ContextMenuItem>
        <ContextMenuItem>
          <Link2 className="mr-2 h-4 w-4" />
          Go to Company Website
        </ContextMenuItem>
        <ContextMenuItem>
          <Share2 className="mr-2 h-4 w-4" />
          Share Job
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>
          <EyeOff className="mr-2 h-4 w-4" />
          Hide Job
        </ContextMenuItem>
        <ContextMenuItem>
          <Flag className="mr-2 h-4 w-4" />
          Report Job
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export default function JobBoardCards() {
  const [jobCollections, setJobCollections] = useState<JobCollection[]>([]);

  useEffect(() => {
    const collections: JobCollection[] = [];

    for (const job of jobsData.results) {
      if (
        !collections.find(
          (collection) =>
            collection.source_and_board_token === job.source_and_board_token
        )
      ) {
        collections.push({
          source_and_board_token: job.source_and_board_token,
          source: job.source,
          board_token: job.board_token,
          jobs: [],
        });
      }
      collections
        .find(
          (collection) =>
            collection.source_and_board_token === job.source_and_board_token
        )
        ?.jobs.push({
          ...job,
          currentJobIndex: 0,
        } as Job);
    }
    setJobCollections(collections);
  }, [setJobCollections]);

  if (jobCollections.length === 0) {
    console.dir(jobCollections);
    console.log(jobCollections.length);
    return <div>Loading...</div>;
  }

  return (
    <>
      {jobCollections.map((collection) => (
        <JobBoardCard key={collection.board_token} jobCollection={collection} />
      ))}
    </>
  );
}
