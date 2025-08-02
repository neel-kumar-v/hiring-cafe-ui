'use client';

import KanbanJobCardContents from "@/components/job/contents/KanbanJobCardContents";
import {
  KanbanBoard as KanbanBoardUI,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider,
} from "@/components/ui/kanban";
import { useApp } from "@/contexts/AppContext";
import type { JobStatus } from "@/types/app";
import type { Job } from "@/types/job";
import { memo, useMemo } from "react";

type JobCategory = "saved" | "applied" | "interviewing" | "rejected" | "hidden";

interface KanbanBoardProps {
  jobs: Job[];
  className?: string;
  visibleCategories?: Record<JobCategory, boolean>;
}

type KanbanJobItem = {
  id: string;
  name: string;
  column: string;
  job: Job;
};

type KanbanColumn = {
  id: string;
  name: string;
  count: number;
};

const KanbanBoard = memo(({ jobs, className, visibleCategories }: KanbanBoardProps) => {
  const { user, moveJob } = useApp();

  const kanbanData: KanbanJobItem[] = useMemo(() => {
    const allJobIds = new Set([
      ...user.saved,
      ...user.applied,
      ...user.interviewing,
      ...user.rejected,
      ...user.hidden,
    ]);

    // Show jobs that are in the user's arrays, plus some additional jobs for testing
    const userJobs = jobs.filter(job => allJobIds.has(job.id));
    const additionalJobs = jobs.slice(0, 5).filter(job => !allJobIds.has(job.id));
    const jobsToShow = [...userJobs, ...additionalJobs];

    return jobsToShow.map(job => {
      let column = "saved";
      if (user.applied.includes(job.id)) column = "applied";
      else if (user.interviewing.includes(job.id)) column = "interviewing";
      else if (user.rejected.includes(job.id)) column = "rejected";
      else if (user.hidden.includes(job.id)) column = "hidden";

      return {
        id: job.id,
        name: job.job_information.title,
        column,
        job,
      };
    });
  }, [jobs, user]);

  const columns: KanbanColumn[] = useMemo(() => {
    // For testing, calculate counts based on the actual jobs being shown
    const savedCount = kanbanData.filter(item => item.column === "saved").length;
    const appliedCount = kanbanData.filter(item => item.column === "applied").length;
    const interviewingCount = kanbanData.filter(item => item.column === "interviewing").length;
    const rejectedCount = kanbanData.filter(item => item.column === "rejected").length;
    const hiddenCount = kanbanData.filter(item => item.column === "hidden").length;

    const allColumns = [
      { id: "saved", name: "Saved", count: savedCount },
      { id: "applied", name: "Applied", count: appliedCount },
      { id: "interviewing", name: "Interviewing", count: interviewingCount },
      { id: "rejected", name: "Rejected", count: rejectedCount },
      { id: "hidden", name: "Hidden", count: hiddenCount },
    ];

    // Filter columns based on visibleCategories if provided
    if (visibleCategories) {
      return allColumns.filter(column => visibleCategories[column.id as JobCategory]);
    }

    return allColumns;
  }, [kanbanData, visibleCategories]);

  const handleDataChange = (newData: KanbanJobItem[]) => {
    newData.forEach(item => {
      const currentStatus = getCurrentStatus(item.id);
      if (currentStatus !== item.column) {
        moveJob(item.id, currentStatus as JobStatus, item.column as JobStatus);
      }
    });
  };

  const getCurrentStatus = (jobId: string): string => {
    if (user.applied.includes(jobId)) return "applied";
    if (user.interviewing.includes(jobId)) return "interviewing";
    if (user.rejected.includes(jobId)) return "rejected";
    if (user.hidden.includes(jobId)) return "hidden";
    return "saved";
  };

  return (
    <div className={`h-full w-full ${className}`}>
      <KanbanProvider
        columns={columns}
        data={kanbanData}
        onDataChange={handleDataChange}
        className="h-full"
      >
        {(column) => (
          <KanbanBoardUI key={column.id} id={column.id} className="h-full">
            <KanbanHeader className="flex items-center justify-between">
              <span className="font-semibold">{column.name}</span>
              <span className="text-xs text-gray-500 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">
                {column.count}
              </span>
            </KanbanHeader>
            <KanbanCards id={column.id} className="flex-1">
              {(item) => (
                <KanbanCard
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  column={item.column}
                  className="mb-2"
                >
                  <KanbanJobCardContents job={item.job as Job} useCard={false} />
                </KanbanCard>
              )}
            </KanbanCards>
          </KanbanBoardUI>
        )}
      </KanbanProvider>
    </div>
  );
});

KanbanBoard.displayName = "KanbanBoard";

export default KanbanBoard; 