'use client';

import { getCleanJobTitle } from "@/lib/job-info";
import type { CompanyDTO, JobDTO } from "@/types/convexJobs";
import { memo } from "react";
import CompanyLogo from "../util/CompanyLogo";

interface KanbanJobCardProps {
  job: JobDTO;
  company: CompanyDTO | null;
  className?: string;
}

const KanbanJobCardContents = memo(({ job, company, className, }: KanbanJobCardProps) => {
  const cities = job.workplaceCities ?? [];
  const states = job.workplaceStates ?? [];
  const countries = job.workplaceCountries ?? [];

  const locations = cities.length > 0
    ? cities.join(", ")
    : states.length > 0
    ? states.join(", ")
    : countries.length > 0
    ? countries.join(", ")
    : "Remote";

  const content = (
    <div className="flex items-start space-x-3">
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
        className="self-center select-none"
      />
      
      <div className="min-w-0 flex-1">
        <h3 className="font-medium text-sm text-foreground line-clamp-2 mb-1 select-none">
          {getCleanJobTitle(job.title, company?.name ?? "", locations, job.skills ?? [])}
        </h3>
        <p className="text-xs text-muted-foreground mb-1 select-none">
          {company?.name ?? ""}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-1 select-none ">
          {locations}
        </p>
      </div>
    </div>
  );

  return (
    <div className={`${className}`}>
      {content}
    </div>
  );
});

KanbanJobCardContents.displayName = "KanbanBoardCard";

export default KanbanJobCardContents; 
