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
  const compensation = useMemo(() => ({
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
  }), [currentJob.v5_processed_job_data]);

  const requirementsSummary = useMemo(() => 
    currentJob.v5_processed_job_data.requirements_summary,
    [currentJob.v5_processed_job_data.requirements_summary]
  );

  const technicalTools = useMemo(() => 
    currentJob.v5_processed_job_data.technical_tools,
    [currentJob.v5_processed_job_data.technical_tools]
  );

  const minIndustryAndRoleYoe = useMemo(() => 
    currentJob.v5_processed_job_data.min_industry_and_role_yoe,
    [currentJob.v5_processed_job_data.min_industry_and_role_yoe]
  );

  const minManagementAndLeadershipYoe = useMemo(() => 
    currentJob.v5_processed_job_data.min_management_and_leadership_yoe,
    [currentJob.v5_processed_job_data.min_management_and_leadership_yoe]
  );

  const tagline = useMemo(() => 
    currentJob.v5_processed_job_data.company_tagline || "",
    [currentJob.v5_processed_job_data.company_tagline]
  );

  return (
    <div className="flex h-full flex-col">
      <div
        className={`transition-opacity duration-300 ease-in-out ${
          isTransitioning ? "opacity-0" : "opacity-100"
        }`}
      >
        <CardHeader
          tools={technicalTools}
          commitments={currentJob.v5_processed_job_data.commitment}
          companyName={currentJob.v5_processed_company_data.name}
          compensation={compensation}
          jobTitle={currentJob.job_information.title}
          workplaceCities={currentJob.v5_processed_job_data.workplace_cities}
          workType={currentJob.v5_processed_job_data.workplace_type}
        />

        <CardCompanyInfo
          companyData={currentJob.v5_processed_company_data}
          tagline={tagline}
        />

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
