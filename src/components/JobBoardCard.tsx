"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContent,
  MorphingDialogContainer,
  MorphingDialogClose,
} from "@/components/ui/morphing-dialog";
import jobsData from "@/data/jobs_data.json";
import { Job, JobCollection } from "@/types/jobs";
import CardHeader from "./job/card/CardHeader";
import CardCompanyInfo from "./job/card/CardCompanyInfo";
import CardJobDescription from "./job/card/CardJobDescription";
import CardStats from "./job/card/CardStats";
import CardNavigation from "./job/card/CardNavigation";
import CardContextMenuProvider from "./job/card/CardContextMenuProvider";

// Dialog components
import {
  DialogJobTitle,
  // DialogCompanyHeader,
  DialogBadges,
  DialogRequirements,
  DialogSkills,
  DialogJobDescription,
  DialogTime,
  DialogFooter,
} from "./job/dialog";
import { DialogActionButtons } from "./job/dialog/DialogFooter";

import DialogCompanyLogoCard from "./job/dialog/DialogCompanyLogoCard";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Drawer, DrawerContent } from "@/components/ui/drawer";

const JobDrawerContent = ({
  currentJob,
  isBookmarked,
  isApplied,
  onBookmarkToggle,
  onApplyToggle,
  open,
  onClose,
}: {
  currentJob: Job;
  isBookmarked: boolean;
  isApplied: boolean;
  onBookmarkToggle: () => void;
  onApplyToggle: () => void;
  open: boolean;
  onClose: () => void;
}) => {
  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent className="max-w-full w-full rounded-t-xl">
        <div className="sticky top-0 z-10 p-2 ">
          <DialogActionButtons
            onBookmarkToggle={onBookmarkToggle}
            isBookmarked={isBookmarked}
            onApplyToggle={onApplyToggle}
            isApplied={isApplied}
          />
        </div>
        <div className="p-4 space-y-4 overflow-y-auto">
          <DialogJobTitle
            jobTitle={currentJob.job_information.title}
            companyName={currentJob.v5_processed_company_data.name}
            location={
              currentJob.v5_processed_job_data.formatted_workplace_location
            }
          />
          <DialogCompanyLogoCard
            companyData={currentJob.v5_processed_company_data}
          />
          <DialogBadges
            location={
              currentJob.v5_processed_job_data.formatted_workplace_location
            }
            workType={currentJob.v5_processed_job_data.workplace_type}
            commitments={currentJob.v5_processed_job_data.commitment}
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
          {/* Requirements */}
          <DialogRequirements
            requirementsSummary={
              currentJob.v5_processed_job_data.requirements_summary
            }
          />
          {/* Skills */}
          <DialogSkills
            technicalTools={currentJob.v5_processed_job_data.technical_tools}
          />
          {/* Job Description */}
          <DialogJobDescription
            description={currentJob.job_information.description}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

const JobDialogContent = ({
  currentJob,
  isBookmarked,
  isApplied,
  onBookmarkToggle,
  onApplyToggle,
}: {
  currentJob: Job;
  isBookmarked: boolean;
  isApplied: boolean;
  onBookmarkToggle: () => void;
  onApplyToggle: () => void;
}) => {
  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onBookmarkToggle();
  };

  const handleApplyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onApplyToggle();
  };

  return (
    <div className="p-8 pt-16 relative">
      <DialogTime
        publishDate={currentJob.v5_processed_job_data.estimated_publish_date}
        viewedByUsers={currentJob.job_information.viewedByUsers}
        savedFromUsers={currentJob.job_information.savedFromUsers}
        appliedFromUsers={currentJob.job_information.appliedFromUsers}
        isBookmarked={isBookmarked}
        isApplied={isApplied}
        onBookmarkClick={handleBookmarkClick}
        onApplyClick={handleApplyClick}
      />

      <DialogJobTitle
        jobTitle={currentJob.job_information.title}
        companyName={currentJob.v5_processed_company_data.name}
        location={currentJob.v5_processed_job_data.formatted_workplace_location}
      />

      <DialogBadges
        location={currentJob.v5_processed_job_data.formatted_workplace_location}
        workType={currentJob.v5_processed_job_data.workplace_type}
        commitments={currentJob.v5_processed_job_data.commitment}
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

      {/* <DialogCompanyHeader companyData={currentJob.v5_processed_company_data} /> */}

      <DialogCompanyLogoCard
        companyData={currentJob.v5_processed_company_data}
      />

      <DialogRequirements
        requirementsSummary={
          currentJob.v5_processed_job_data.requirements_summary
        }
      />

      <DialogSkills
        technicalTools={currentJob.v5_processed_job_data.technical_tools}
      />

      <DialogJobDescription
        description={currentJob.job_information.description}
      />

      <DialogFooter
        isBookmarked={isBookmarked}
        isApplied={isApplied}
        onBookmarkToggle={onBookmarkToggle}
        onApplyToggle={onApplyToggle}
      />
    </div>
  );
};

const JobCardContent = ({
  currentJob,
  isTransitioning,
}: {
  currentJob: Job;
  isTransitioning: boolean;
}) => {
  return (
    <div className="flex flex-col h-full">
      <div
        className={`transition-opacity duration-300 ease-in-out ${
          isTransitioning ? "opacity-0" : "opacity-100"
        }`}
      >
        <CardHeader
          jobTitle={currentJob.job_information.title}
          companyName={currentJob.v5_processed_company_data.name}
          location={
            currentJob.v5_processed_job_data.formatted_workplace_location
          }
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
          commitments={currentJob.v5_processed_job_data.commitment}
          workType={currentJob.v5_processed_job_data.workplace_type}
          postedAt={currentJob.v5_processed_job_data.estimated_publish_date}
        />

        <CardCompanyInfo companyData={currentJob.v5_processed_company_data} />

        <CardJobDescription
          requirementsSummary={
            currentJob.v5_processed_job_data.requirements_summary
          }
          technicalTools={currentJob.v5_processed_job_data.technical_tools}
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 640px)");
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

  if (!isDesktop) {
    // Render card as a trigger for the drawer
    return (
      <>
        <div onClick={() => setDrawerOpen(true)} className="cursor-pointer">
          <Card
            key={jobCollection.source_and_board_token}
            className="bg-white h-full dark:bg-gray-800 border dark:border-pink-700/20 shadow-sm hover:shadow-lg dark:hover:bg-gray-700/50 dark:hover:border-pink-700/50 transition-all duration-300 ease-in cursor-pointer"
          >
            <CardContent className="p-4 flex flex-col h-full">
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
                  onBookmarkToggle={(e) => {
                    e.stopPropagation();
                    setIsBookmarked(!isBookmarked);
                  }}
                  onApplyToggle={(e) => {
                    e.stopPropagation();
                    setIsApplied(!isApplied);
                  }}
                />
                <CardNavigation
                  currentJobIndex={currentJobIndex}
                  totalJobs={jobCollection.jobs.length}
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
              </div>
            </CardContent>
          </Card>
        </div>
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
          <Card
            key={jobCollection.source_and_board_token}
            className="bg-white h-full dark:bg-gray-800 border dark:border-pink-700/20 shadow-sm hover:shadow-lg dark:hover:bg-gray-700/50 dark:hover:border-pink-700/50 transition-all duration-300 ease-in cursor-pointer"
          >
            <CardContent className="p-4 flex flex-col h-full">
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
                  onBookmarkToggle={handleBookmarkClick}
                  onApplyToggle={handleApplyClick}
                />
                <CardNavigation
                  currentJobIndex={currentJobIndex}
                  totalJobs={jobCollection.jobs.length}
                  onPrevious={handlePreviousJob}
                  onNext={handleNextJob}
                  onJobSelect={handleJobSelect}
                />
              </div>
            </CardContent>
          </Card>
        </MorphingDialogTrigger>
      </CardContextMenuProvider>

      <MorphingDialogContainer>
        <MorphingDialogContent
          style={{
            borderRadius: "12px",
          }}
          className="relative h-auto w-[800px] max-w-[90vw] min-w-[60vw] translate-y-8 border border-gray-100 bg-white dark:bg-gray-800 dark:border-gray-700"
        >
          <div className="h-[calc(90vh)]  overflow-y-auto">
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
