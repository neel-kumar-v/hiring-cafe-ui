'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCleanJobTitle } from "@/lib/job-info";
import { getCompanyName, toCardCompanyData } from "@/lib/job-company";
import type { Job } from "@/types/job";
import { memo } from "react";
import CompanyLogo from "../util/CompanyLogo";

type JobCategory = "saved" | "applied" | "interviewing" | "rejected" | "hidden";

interface ListJobCardContentsProps {
  job: Job;
  currentStage: JobCategory;
  onMoveJob?: (jobId: string, fromStatus: JobCategory, toStatus: JobCategory) => void;
}

const ListJobCardContents = memo(({ 
  job, 
  currentStage, 
  onMoveJob 
}: ListJobCardContentsProps) => {
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

  const handleStageChange = (stageId: string) => {
    if (onMoveJob && stageId !== currentStage) {
      onMoveJob(job.id, currentStage, stageId as JobCategory);
    }
  };

  return (
    <div className="flex flex-row max-[400px]:flex-col items-center justify-between">
      <div className="flex items-center space-x-4 flex-1 max-[400px]:w-full max-[400px]:mb-2">
        <CompanyLogo
          companyData={companyData}
          size="sm"
          variant="default"
        />
        
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 line-clamp-1 mb-1">
            {getCleanJobTitle(job.job_information.title, getCompanyName(job), locations, processed.technical_tools ?? [])}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
            {getCompanyName(job)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 line-clamp-1">
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