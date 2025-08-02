'use client';

import { Card } from "@/components/ui/card";
import type { Job } from "@/types/job";
import { memo } from "react";
import { ListJobCardContents } from "../job/contents";

type JobCategory = "saved" | "applied" | "interviewing" | "rejected" | "hidden";

interface ListViewProps {
  jobs: Job[];
  visibleCategories?: Record<JobCategory, boolean>;
  getJobStatus: (jobId: string) => JobCategory;
  onMoveJob?: (jobId: string, fromStatus: JobCategory, toStatus: JobCategory) => void;
}



const ListViewJobCard = ({ 
  job, 
  currentStage, 
  onMoveJob 
}: { 
  job: Job; 
  currentStage: JobCategory;
  onMoveJob?: (jobId: string, fromStatus: JobCategory, toStatus: JobCategory) => void;
}) => {
  return (
    <Card className="p-4 mb-3 border border-input hover:border-input/75 transition-all duration-300 ease-in-out shadow-none">
      <ListJobCardContents
        job={job}
        currentStage={currentStage}
        onMoveJob={onMoveJob}
      />
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