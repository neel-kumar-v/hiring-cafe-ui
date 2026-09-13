import { jobFadeClass } from "@/lib/jobs/fadeTransition";
import { toCompensationRange } from "@/lib/jobs/toCompensationRange";
import { toUiCompany } from "@/lib/jobs/toUiCompany";
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

const JobCardContent = memo(({ currentJob, company, isTransitioning }: JobCardContentProps) => {
  const compensation = useMemo(() => toCompensationRange(currentJob), [currentJob]);

  const requirementsSummary = useMemo(() => currentJob.requirementsSummary ?? "", [currentJob.requirementsSummary]);

  const technicalTools = useMemo(() => currentJob.skills ?? [], [currentJob.skills]);

  const minIndustryAndRoleYoe = useMemo(() => currentJob.minIcYoe ?? null, [currentJob.minIcYoe]);

  const minManagementAndLeadershipYoe = useMemo(() => currentJob.minMgmtYoe ?? null, [currentJob.minMgmtYoe]);

  const companySubtitle = useMemo(() => company?.tagline?.trim() || company?.description?.trim() || "", [company?.tagline, company?.description]);

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
      <div className={jobFadeClass(isTransitioning)}>
        <CardHeader
          tools={technicalTools}
          commitments={commitments}
          companyName={company?.name ?? ""}
          compensation={compensation}
          jobTitle={currentJob.title}
          workplaceCities={workplaceLocations}
          workType={workType}
        />
      </div>

      <CardCompanyInfo companyData={toUiCompany(company)} tagline={companySubtitle} />

      <div className={jobFadeClass(isTransitioning)}>
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
