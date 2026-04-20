import type { CompanyDTO, JobDTO } from "@/types/convexJobs";
import { memo, useMemo } from "react";
import CardCompanyInfo from "../card/CardCompanyInfo";
import CardHeader from "../card/CardHeader";
import CardJobDescription from "../card/CardJobDescription";

interface JobCardContentProps {
  currentJob: JobDTO;
  company: CompanyDTO | null;
  isTransitioning: boolean;
}

const JobCardContent = memo(({
  currentJob,
  company,
  isTransitioning,
}: JobCardContentProps) => {
  const compensation = useMemo(() => ({
    yearly_min_compensation: currentJob.yearlyMinComp ?? null,
    yearly_max_compensation: currentJob.yearlyMaxComp ?? null,
    monthly_min_compensation: currentJob.monthlyMinComp ?? null,
    monthly_max_compensation: currentJob.monthlyMaxComp ?? null,
    weekly_min_compensation: currentJob.weeklyMinComp ?? null,
    weekly_max_compensation: currentJob.weeklyMaxComp ?? null,
    hourly_min_compensation: currentJob.hourlyMinComp ?? null,
    hourly_max_compensation: currentJob.hourlyMaxComp ?? null,
    "bi-weekly_min_compensation": currentJob.biWeeklyMinComp ?? null,
    "bi-weekly_max_compensation": currentJob.biWeeklyMaxComp ?? null,
    daily_min_compensation: currentJob.dailyMinComp ?? null,
    daily_max_compensation: currentJob.dailyMaxComp ?? null,
  }), [currentJob]);

  const requirementsSummary = useMemo(() => currentJob.requirementsSummary ?? "", [currentJob.requirementsSummary]);

  const technicalTools = useMemo(() => currentJob.skills ?? [], [currentJob.skills]);

  const minIndustryAndRoleYoe = useMemo(() => currentJob.minIcYoe ?? null, [currentJob.minIcYoe]);

  const minManagementAndLeadershipYoe = useMemo(() => currentJob.minMgmtYoe ?? null, [currentJob.minMgmtYoe]);

  const companySubtitle = useMemo(
    () => (company?.tagline?.trim() || company?.description?.trim() || ""),
    [company?.tagline, company?.description],
  );

  const workplaceLocations = useMemo(() => {
    const cities = currentJob.workplaceCities ?? [];
    if (cities.length > 0) return cities;
    const states = currentJob.workplaceStates ?? [];
    const countries = currentJob.workplaceCountries ?? [];
    const parts = [...states, ...countries].filter((s) => typeof s === "string" && s.trim());
    if (parts.length > 0) return [parts.slice(0, 3).join(", ")];
    return [];
  }, [currentJob.workplaceCities, currentJob.workplaceStates, currentJob.workplaceCountries]);
  const commitments = currentJob.commitment ?? [];
  const workType = currentJob.workplaceType ?? "";

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
          companyName={company?.name ?? ""}
          compensation={compensation}
          jobTitle={currentJob.title}
          workplaceCities={workplaceLocations}
          workType={workType}
        />

        <CardCompanyInfo
          companyData={{
            name: company?.name ?? "",
            website: company?.homepageUri ?? "",
            image_url: company?.imageUrl ?? "",
            tagline: company?.tagline ?? "",
            subsidiaries: [],
            parent_company: "",
            linkedin_url: "",
            industries: company?.industries ?? [],
            activities: company?.activities ?? [],
            is_non_profit: false,
            is_public_company: false,
            is_dissolved: false,
            is_acquired: false,
            num_employees: company?.numEmployees ?? 0,
            year_founded: company?.yearFounded ?? 0,
            headquarters_country: company?.hqCountry ?? "",
            total_funding_amount: null,
            total_funding_currency: null,
            latest_investment_amount: null,
            latest_investment_currency: null,
            latest_investment_year: null,
            latest_investment_series: null,
            investors: [],
            stock_exchange: null,
            stock_symbol: null,
            latest_revenue: null,
            latest_revenue_currency: null,
            latest_revenue_year: null,
          }}
          tagline={companySubtitle}
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
