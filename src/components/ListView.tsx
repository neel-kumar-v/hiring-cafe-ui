'use client';

import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCleanJobTitle } from "@/lib/job-info";
import type { Job } from "@/types/job";
import { memo } from "react";
import CompanyLogo from "./job/util/CompanyLogo";

type JobCategory = "saved" | "applied" | "interviewing" | "rejected" | "hidden";

interface ListViewProps {
  jobs: Job[];
  visibleCategories?: Record<JobCategory, boolean>;
  getJobStatus: (jobId: string) => JobCategory;
  onMoveJob?: (jobId: string, fromStatus: JobCategory, toStatus: JobCategory) => void;
}

const stages = [
  { id: "saved", label: "Saved" },
  { id: "applied", label: "Applied" },
  { id: "interviewing", label: "Interviewing" },
  { id: "rejected", label: "Rejected" },
  { id: "hidden", label: "Hidden" },
];

const ListViewJobCard = ({ 
  job, 
  currentStage, 
  onMoveJob 
}: { 
  job: Job; 
  currentStage: JobCategory;
  onMoveJob?: (jobId: string, fromStatus: JobCategory, toStatus: JobCategory) => void;
}) => {
  const locations = job.v5_processed_job_data.workplace_cities.length > 0
    ? job.v5_processed_job_data.workplace_cities.join(", ")
    : job.v5_processed_job_data.workplace_states.length > 0
    ? job.v5_processed_job_data.workplace_states.join(", ")
    : job.v5_processed_job_data.workplace_countries.length > 0
    ? job.v5_processed_job_data.workplace_countries.join(", ")
    : "Remote";

  const handleStageChange = (stageId: string) => {
    if (onMoveJob && stageId !== currentStage) {
      onMoveJob(job.id, currentStage, stageId as JobCategory);
    }
  };

  return (
    <Card className="p-4 mb-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-row max-[400px]:flex-col items-center justify-between">
        <div className="flex items-center space-x-4 flex-1 max-[400px]:w-full max-[400px]:mb-2">
          <CompanyLogo
            companyData={job.v5_processed_company_data}
            size="sm"
            variant="default"
            useMorphing={false}
          />
          
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 line-clamp-1 mb-1">
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

        <div className="flex items-center max-[400px]:w-full">
          <Select value={currentStage} onValueChange={handleStageChange}>
            <SelectTrigger className="w-32 max-[400px]:w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {stages.map((stage) => (
                <SelectItem key={stage.id} value={stage.id}>
                  {stage.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
};

const ListView = memo(({ jobs, visibleCategories, getJobStatus, onMoveJob }: ListViewProps) => {
  const filteredJobs = jobs.filter(job => {
    const status = getJobStatus(job.id);
    return visibleCategories?.[status] ?? true;
  });

  return (
    <div className="h-full overflow-y-auto">
      {filteredJobs.map((job) => (
        <ListViewJobCard 
          key={job.id} 
          job={job} 
          currentStage={getJobStatus(job.id)}
          onMoveJob={onMoveJob}
        />
      ))}
    </div>
  );
});

ListView.displayName = "ListView";

export default ListView; 