import { DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { toCardCompanyData } from "@/lib/job-company";
import type { Job } from "@/types/job";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useQuery } from "convex/react";
import { DialogBadges, DialogJobDescription, DialogJobTitle, DialogRequirements, DialogSkills } from "../dialog";
import DialogCompanyLogoCard from "../dialog/DialogCompanyLogoCard";
import { DialogActionButtons } from "../dialog/DialogFooter";
import DialogResponsibilities from "../dialog/DialogResponsibilities";
import { api } from "../../../../convex/_generated/api";

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
  const fullJob = useQuery(api.jobs.getRaw, open ? { externalId: currentJob.id } : "skip");
  const job = (fullJob ?? currentJob) as Job;

  const companyData = toCardCompanyData(job);
  const processed = job.processed_job_data;

  return (
    <Drawer onOpenChange={onClose} open={open}>
      <DrawerContent className="w-full max-w-full rounded-t-xl">
        <VisuallyHidden>
          <DialogTitle>Job Details</DialogTitle>
        </VisuallyHidden>
        <div className="sticky top-0 z-10 border-neutral-200 p-2 max-sm:border-b dark:border-neutral-700">
          <DialogActionButtons
            isApplied={isApplied}
            isBookmarked={isBookmarked}
            onApplyToggle={onApplyToggle}
            onBookmarkToggle={onBookmarkToggle}
            applyUrl={job.apply_url}
            companyUrl={companyData.website}
          />
        </div>
        <div className="space-y-4 overflow-y-auto p-4">
          <DialogJobTitle
            companyName={companyData.name}
            jobTitle={job.job_information.title}
            workplaceCities={processed.workplace_cities ?? []}
            tools={processed.technical_tools ?? []}
          />
          <DialogCompanyLogoCard companyData={companyData} />
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
            compact={true}
          />
          <DialogResponsibilities roleActivities={processed.role_activities ?? []} />
          <DialogRequirements
            requirementsSummary={processed.requirements_summary}
            minIndustryAndRoleYoe={processed.min_industry_and_role_yoe}
            minManagementAndLeadershipYoe={processed.min_management_and_leadership_yoe}
          />
          <DialogSkills technicalTools={processed.technical_tools ?? []} />
          <DialogJobDescription description={job.job_information.description} />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default JobDrawerContent;
