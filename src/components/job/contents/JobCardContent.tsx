import { toCardCompanyData } from "@/lib/job-company";
import type { Job } from "@/types/job";
import { memo, useMemo } from "react";
import CardCompanyInfo from "../card/CardCompanyInfo";
import CardHeader from "../card/CardHeader";
import CardJobDescription from "../card/CardJobDescription";

interface JobCardContentProps {
  currentJob: Job;
  isTransitioning: boolean;
}

const JobCardContent = memo(({
  currentJob,
  isTransitioning,
}: JobCardContentProps) => {
  const processed = currentJob.processed_job_data;
  const companyData = useMemo(() => toCardCompanyData(currentJob), [currentJob]);

  const compensation = useMemo(() => ({
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
  }), [processed]);

  const requirementsSummary = useMemo(() => processed.requirements_summary, [processed.requirements_summary]);

  const technicalTools = useMemo(() => processed.technical_tools ?? [], [processed.technical_tools]);

  const minIndustryAndRoleYoe = useMemo(() => processed.min_industry_and_role_yoe, [processed.min_industry_and_role_yoe]);

  const minManagementAndLeadershipYoe = useMemo(
    () => processed.min_management_and_leadership_yoe,
    [processed.min_management_and_leadership_yoe]
  );

  const tagline = useMemo(
    () => processed.company_tagline || companyData.tagline || "",
    [processed.company_tagline, companyData.tagline]
  );

  const workplaceCities = processed.workplace_cities ?? [];
  const commitments = processed.commitment ?? [];
  const workType = processed.workplace_type ?? "";

  return (
    <div className="flex h-full flex-col">
      <div
        className={`transition-opacity duration-300 ease-in-out ${
          isTransitioning ? "opacity-0" : "opacity-100"
        }`}
      >
        <CardHeader
          tools={technicalTools}
          commitments={commitments}
          companyName={companyData.name}
          compensation={compensation}
          jobTitle={currentJob.job_information.title}
          workplaceCities={workplaceCities}
          workType={workType}
        />

        <CardCompanyInfo companyData={companyData} tagline={tagline} />

        <CardJobDescription
          requirementsSummary={requirementsSummary}
          technicalTools={technicalTools}
          minIndustryAndRoleYoe={minIndustryAndRoleYoe}
          minManagementAndLeadershipYoe={minManagementAndLeadershipYoe}
        />
      </div>
    </div>
  );
});

JobCardContent.displayName = "JobCardContent";

export default JobCardContent;
