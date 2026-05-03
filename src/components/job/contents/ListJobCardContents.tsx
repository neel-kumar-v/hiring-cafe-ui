'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCleanJobTitle } from "@/lib/job-info";
import { decodeLocationForDisplay } from "@/lib/utils";
import type { CompanyDTO, JobDTO } from "@/types/convexJobs";
import { memo } from "react";
import CompanyLogo from "../util/CompanyLogo";

type JobCategory = "saved" | "applied" | "interviewing" | "rejected" | "hidden";

interface ListJobCardContentsProps {
  job: JobDTO;
  company: CompanyDTO | null;
  currentStage: JobCategory;
  onMoveJob?: (jobId: string, fromStatus: JobCategory, toStatus: JobCategory) => void;
}

const ListJobCardContents = memo(({ 
  job, 
  company,
  currentStage, 
  onMoveJob 
}: ListJobCardContentsProps) => {
  const cities = job.workplaceCities ?? [];
  const states = job.workplaceStates ?? [];
  const countries = job.workplaceCountries ?? [];

  const locations =
    cities.length > 0
      ? cities.map(decodeLocationForDisplay).join(", ")
      : states.length > 0
      ? states.map(decodeLocationForDisplay).join(", ")
      : countries.length > 0
      ? countries.map(decodeLocationForDisplay).join(", ")
      : "Remote";

  const handleStageChange = (stageId: string) => {
    if (onMoveJob && stageId !== currentStage) {
      onMoveJob(job.externalId, currentStage, stageId as JobCategory);
    }
  };

  return (
    <div className="flex flex-row max-[400px]:flex-col items-center justify-between">
      <div className="flex items-center space-x-4 flex-1 max-[400px]:w-full max-[400px]:mb-2">
        <CompanyLogo
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
          size="sm"
          variant="default"
        />
        
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-sm text-foreground line-clamp-1 mb-1">
            {getCleanJobTitle(job.title, company?.name ?? "", locations, job.skills ?? [])}
          </h3>
          <p className="text-xs text-muted-foreground mb-1">
            {company?.name ?? ""}
          </p>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {locations}
          </p>
        </div>
      </div>

      <div className="flex items-center max-[400px]:w-full">
        <Select 
          value={currentStage} 
          onValueChange={(e) => handleStageChange(e)}
        >
          <SelectTrigger className="w-32 max-[400px]:w-full px-3 py-2 border  rounded-md  text-sm">
            <SelectValue placeholder="Select Stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="saved">Saved</SelectItem>
            <SelectItem value="applied">Applied</SelectItem>
            <SelectItem value="interviewing">Interviewing</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="hidden">Hidden</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
});

ListJobCardContents.displayName = "ListJobCardContents";

export default ListJobCardContents; 
