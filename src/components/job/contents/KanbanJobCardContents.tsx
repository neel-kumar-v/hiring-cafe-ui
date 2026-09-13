"use client";

import { getCleanJobTitle } from "@/lib/job-info";
import { toUiCompany } from "@/lib/jobs/toUiCompany";
import { decodeLocationForDisplay } from "@/lib/utils";
import type { CompanyDTO, JobDTO } from "@/types/convexJobs";
import { memo } from "react";
import CompanyLogo from "../util/CompanyLogo";

interface KanbanJobCardProps {
  job: JobDTO;
  company: CompanyDTO | null;
  className?: string;
}

const KanbanJobCardContents = memo(({ job, company, className }: KanbanJobCardProps) => {
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

  const content = (
    <div className="flex items-start space-x-3">
      <CompanyLogo companyData={toUiCompany(company)} size="sm" variant="default" className="self-center select-none" />

      <div className="min-w-0 flex-1">
        <h3 className="font-medium text-sm text-foreground line-clamp-2 mb-1 select-none">{getCleanJobTitle(job.title, company?.name ?? "", locations, job.skills ?? [])}</h3>
        <p className="text-xs text-muted-foreground mb-1 select-none">{company?.name ?? ""}</p>
        <p className="text-xs text-muted-foreground line-clamp-1 select-none ">{locations}</p>
      </div>
    </div>
  );

  return <div className={`${className}`}>{content}</div>;
});

KanbanJobCardContents.displayName = "KanbanBoardCard";

export default KanbanJobCardContents;
