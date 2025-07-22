import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  MorphingDialog,
  MorphingDialogClose,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogTrigger,
} from "@/components/ui/morphing-dialog";
import { useReducedMotion } from "@/contexts/ReducedMotionContext";
import type { Job } from "@/types/job";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { X } from "lucide-react";
import type React from "react";
import {
  DialogBadges,
  DialogFooter,
  DialogJobDescription,
  DialogJobTitle,
  DialogRequirements,
  DialogSkills,
  DialogStats,
} from "../dialog";
import DialogCompanyLogoCard from "../dialog/DialogCompanyLogoCard";

interface JobDialogContentProps {
  currentJob: Job;
  isBookmarked: boolean;
  isApplied: boolean;
  onBookmarkToggle: () => void;
  onApplyToggle: () => void;
  children: React.ReactNode; // This will be the trigger element
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
}

const JobDialogContent = ({
  currentJob,
  isBookmarked,
  isApplied,
  onBookmarkToggle,
  onApplyToggle,
  children,
  scrollContainerRef,
}: JobDialogContentProps) => {
  const { prefersReducedMotion } = useReducedMotion();

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

  const dialogContent = (
    <div className="relative p-8 pt-16">
      <DialogStats
        appliedFromUsers={currentJob.job_information.appliedFromUsers}
        isApplied={isApplied}
        isBookmarked={isBookmarked}
        onApplyClick={handleApplyClick}
        onBookmarkClick={handleBookmarkClick}
        publishDate={currentJob.v5_processed_job_data.estimated_publish_date}
        savedFromUsers={currentJob.job_information.savedFromUsers}
        viewedByUsers={currentJob.job_information.viewedByUsers}
      />

      <DialogJobTitle
        companyName={currentJob.v5_processed_company_data.name}
        jobTitle={currentJob.job_information.title}
        workplaceCities={currentJob.v5_processed_job_data.workplace_cities}
        tools={currentJob.v5_processed_job_data.technical_tools}
      />

      <DialogBadges
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
        workplaceCities={currentJob.v5_processed_job_data.workplace_cities}
        workType={currentJob.v5_processed_job_data.workplace_type}
      />

      <DialogCompanyLogoCard
        companyData={currentJob.v5_processed_company_data}
        dialog={true}
      />

      <DialogRequirements
        requirementsSummary={
          currentJob.v5_processed_job_data.requirements_summary
        }
        minIndustryAndRoleYoe={
          currentJob.v5_processed_job_data.min_industry_and_role_yoe
        }
        minManagementAndLeadershipYoe={
          currentJob.v5_processed_job_data.min_management_and_leadership_yoe
        }
      />

      <DialogSkills
        technicalTools={currentJob.v5_processed_job_data.technical_tools}
      />

      <DialogJobDescription
        description={currentJob.job_information.description}
      />

      <DialogFooter
        isApplied={isApplied}
        isBookmarked={isBookmarked}
        onApplyToggle={onApplyToggle}
        onBookmarkToggle={onBookmarkToggle}
        applyUrl={currentJob.apply_url}
      />
    </div>
  );

  if (prefersReducedMotion) {
    return (
      <Dialog>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="h-[90vh] w-[800px] min-w-[60vw] max-w-[90vw] border border-neutral-100 bg-white p-0 dark:border-neutral-700 dark:bg-neutral-800">
          <VisuallyHidden>
            <DialogTitle>Job Details</DialogTitle>
          </VisuallyHidden>
          <DialogClose className="absolute top-4 right-4 z-10 rounded-full opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="size-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
          <div className="h-full overflow-y-auto" ref={scrollContainerRef}>
            {dialogContent}
          </div>
        </DialogContent>
      </Dialog>
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
      <MorphingDialogTrigger
        className="h-full w-full text-left"
        style={{
          borderRadius: "8px",
        }}
      >
        {children}
      </MorphingDialogTrigger>

      <MorphingDialogContainer>
        <MorphingDialogContent
          className="relative h-auto w-[800px] min-w-[60vw] max-w-[90vw] translate-y-8 border border-neutral-100 bg-white dark:border-neutral-700 dark:bg-neutral-800"
          style={{
            borderRadius: "12px",
          }}
        >
          <div
            className="h-[calc(90vh)] overflow-y-auto"
            ref={scrollContainerRef}
          >
            {dialogContent}
          </div>
          <MorphingDialogClose className="text-neutral-500 dark:text-neutral-400" />
        </MorphingDialogContent>
      </MorphingDialogContainer>
    </MorphingDialog>
  );
};

export default JobDialogContent;
