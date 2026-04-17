'use client';

import { getCleanJobTitle } from "@/lib/job-info";
import { getCompanyName, toCardCompanyData } from "@/lib/job-company";
import type { Job } from "@/types/job";
import { memo } from "react";
import CompanyLogo from "../util/CompanyLogo";

interface KanbanJobCardProps {
  job: Job;
  className?: string;
}

const KanbanJobCardContents = memo(({ job, className, }: KanbanJobCardProps) => {
  const processed = job.processed_job_data;
  const companyData = toCardCompanyData(job);
  const cities = processed.workplace_cities ?? [];
  const states = processed.workplace_states ?? [];
  const countries = processed.workplace_countries ?? [];

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
        companyData={companyData}
        size="sm"
        variant="default"
        className="self-center select-none"
      />
      
      <div className="min-w-0 flex-1">
        <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 line-clamp-2 mb-1 select-none">
          {getCleanJobTitle(job.job_information.title, getCompanyName(job), locations, processed.technical_tools ?? [])}
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 select-none">
          {getCompanyName(job)}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 line-clamp-1 select-none ">
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