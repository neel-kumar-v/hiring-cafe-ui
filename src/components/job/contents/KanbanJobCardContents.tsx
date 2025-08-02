'use client';

import { Card } from "@/components/ui/card";
import { getCleanJobTitle } from "@/lib/job-info";
import type { Job } from "@/types/job";
import { memo } from "react";
import CompanyLogo from "../util/CompanyLogo";

interface KanbanJobCardProps {
  job: Job;
  className?: string;
  useCard?: boolean;
}

const KanbanJobCardContents = memo(({ job, className, useCard = true }: KanbanJobCardProps) => {

  const locations = job.v5_processed_job_data.workplace_cities.length > 0
    ? job.v5_processed_job_data.workplace_cities.join(", ")
    : job.v5_processed_job_data.workplace_states.length > 0
    ? job.v5_processed_job_data.workplace_states.join(", ")
    : job.v5_processed_job_data.workplace_countries.length > 0
    ? job.v5_processed_job_data.workplace_countries.join(", ")
    : "Remote";

  const content = (
    <div className="flex items-start space-x-3">
      <CompanyLogo
        companyData={job.v5_processed_company_data}
        size="sm"
        variant="default"
        useMorphing={false}
      />
      
      <div className="min-w-0 flex-1">
        <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 line-clamp-2 mb-1">
          {getCleanJobTitle(job.job_information.title, job.v5_processed_company_data.name, locations, job.v5_processed_job_data.technical_tools)}
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
          {job.v5_processed_company_data.name}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 line-clamp-1">
          {locations}
        </p>
      </div>
    </div>
  );

  if (useCard) {
    return (
      <Card className={`shadow-sm hover:shadow-md transition-shadow ${className}`}>
        {content}
      </Card>
    );
  }

  return (
    <div className={`${className}`}>
      {content}
    </div>
  );
});

KanbanJobCardContents.displayName = "KanbanBoardCard";

export default KanbanJobCardContents; 