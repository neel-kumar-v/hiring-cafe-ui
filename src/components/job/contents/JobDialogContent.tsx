import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toCardCompanyData } from "@/lib/job-company";
import type { Job } from "@/types/job";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useQuery } from "convex/react";
import { X } from "lucide-react";
import React from "react";
import { api } from "../../../../convex/_generated/api";
import { DialogBadges, DialogFooter, DialogJobDescription, DialogJobTitle, DialogRequirements, DialogSkills, DialogStats } from "../dialog";
import DialogCompanyLogoCard from "../dialog/DialogCompanyLogoCard";
import DialogResponsibilities from "../dialog/DialogResponsibilities";

interface JobDialogContentProps {
  currentJob: Job;
  isBookmarked: boolean;
  isApplied: boolean;
  isInterviewing: boolean;
  onBookmarkToggle: () => void;
  onApplyToggle: () => void;
  children: React.ReactNode; // This will be the trigger element
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
}

const JobDialogContent = ({ currentJob, isBookmarked, isApplied, isInterviewing, onBookmarkToggle, onApplyToggle, children, scrollContainerRef }: JobDialogContentProps) => {
  const [open, setOpen] = React.useState(false);
  const detailsEnabled = open;

  const fullJob = useQuery(api.jobs.getRaw, detailsEnabled ? { externalId: currentJob.id } : "skip");
  const job = (fullJob ?? currentJob) as Job;

  const companyData = toCardCompanyData(job);
  const processed = job.processed_job_data;

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onBookmarkToggle();
  };

  const dialogContent = (
    <div className="relative p-8 pt-16">
      <DialogStats
        appliedFromUsers={job.job_information.appliedFromUsers}
        isApplied={isApplied}
        isBookmarked={isBookmarked}
        isInterviewing={isInterviewing}
        onBookmarkClick={handleBookmarkClick}
        publishDate={processed.estimated_publish_date}
        savedFromUsers={job.job_information.savedFromUsers}
        viewedByUsers={job.job_information.viewedByUsers}
        applyUrl={job.apply_url}
      />

      <DialogJobTitle
        companyName={companyData.name}
        jobTitle={job.job_information.title}
        workplaceCities={processed.workplace_cities ?? []}
        tools={processed.technical_tools ?? []}
      />

      <DialogBadges
        commitments={processed.commitment ?? []}
        compensation={{
          yearly_min_compensation: processed.yearly_min_compensation,
          yearly_max_compensation: processed.yearly_max_compensation,
          monthly_min_compensation: processed.monthly_min_compensation,
          monthly_max_compensation: processed.monthly_max_compensation,
          weekly_min_compensation: processed.weekly_min_compensation,
          weekly_max_compensation: processed.weekly_max_compensation,
          hourly_min_compensation: processed.hourly_min_compensation,
          hourly_max_compensation: processed.hourly_max_compensation,
          "bi-weekly_min_compensation": processed["bi-weekly_min_compensation"],
          "bi-weekly_max_compensation": processed["bi-weekly_max_compensation"],
          daily_min_compensation: processed.daily_min_compensation,
          daily_max_compensation: processed.daily_max_compensation,
        }}
        workplaceCities={processed.workplace_cities ?? []}
        workType={processed.workplace_type ?? ""}
      />

      <DialogCompanyLogoCard companyData={companyData} />

      <DialogResponsibilities roleActivities={processed.role_activities ?? []} />

      <DialogRequirements
        requirementsSummary={processed.requirements_summary}
        minIndustryAndRoleYoe={processed.min_industry_and_role_yoe}
        minManagementAndLeadershipYoe={processed.min_management_and_leadership_yoe}
      />

      <DialogSkills technicalTools={processed.technical_tools ?? []} />

      <DialogJobDescription description={job.job_information.description} />

      <DialogFooter
        isApplied={isApplied}
        isBookmarked={isBookmarked}
        onApplyToggle={onApplyToggle}
        onBookmarkToggle={onBookmarkToggle}
        applyUrl={job.apply_url}
        companyWebsite={companyData.website}
      />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent showCloseButton={false} className="h-[90vh] w-[800px] min-w-[60vw] max-w-[90vw] border border-neutral-100 bg-white p-0 dark:border-neutral-700 dark:bg-neutral-800">
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
};

export default JobDialogContent;
