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
import { useResponsiveBreakpoint } from "@/hooks/useMediaQuery";
import type { JobStatus } from "@/types/app";
import type { Job } from "@/types/job";
import { GripVertical } from "lucide-react";
import dynamic from "next/dynamic";
import { memo, useCallback, useMemo, useState } from "react";

const JobDialogContent = dynamic(() => import("../job/contents/JobDialogContent"), {
  loading: () => null,
  ssr: false
});

const JobDrawerContent = dynamic(() => import("../job/contents/JobDrawerContent"), {
  loading: () => null,
  ssr: false
});

type JobCategory = "saved" | "applied" | "interviewing" | "rejected" | "hidden";

interface KanbanBoardProps {
  jobs: Job[];
  className?: string;
  visibleCategories?: Record<JobCategory, boolean>;
}



type KanbanColumn = {
  id: string;
  name: string;
  count: number;
};

const KanbanCardWithDragHandle = ({ 
  item, 
  isDesktop, 
  onJobClick, 
  user, 
  getCurrentStatus, 
  moveJob,
  jobMap
}: { 
  item: { id: string; name: string; column: string }; 
  isDesktop: boolean;
  onJobClick: (job: Job) => void;
  user: { saved: string[]; applied: string[]; interviewing: string[] };
  getCurrentStatus: (jobId: string) => string;
  moveJob: (jobId: string, fromStatus: JobStatus, toStatus: JobStatus) => void;
  jobMap: Map<string, Job>;
}) => {
  const job = jobMap.get(item.id);
  
  const isBookmarked = job ? (user.saved.includes(job.id) || user.applied.includes(job.id) || user.interviewing.includes(job.id)) : false;
  const isApplied = job ? (user.applied.includes(job.id) || user.interviewing.includes(job.id)) : false;

  const handleBookmarkToggle = useCallback(() => {
    if (!job) return;
    const jobId = job.id;
    const currentStatus = getCurrentStatus(jobId);
    const isCurrentlyBookmarked = user.saved.includes(jobId) || user.applied.includes(jobId) || user.interviewing.includes(jobId);
    
    if (isCurrentlyBookmarked) {
      if (user.saved.includes(jobId)) moveJob(jobId, "saved", "saved");
      if (user.applied.includes(jobId)) moveJob(jobId, "applied", "saved");
      if (user.interviewing.includes(jobId)) moveJob(jobId, "interviewing", "saved");
    } else {
      moveJob(jobId, currentStatus as JobStatus, "saved");
    }
  }, [job, getCurrentStatus, user.saved, user.applied, user.interviewing, moveJob]);

  const handleApplyToggle = useCallback(() => {
    if (!job) return;
    const jobId = job.id;
    const currentStatus = getCurrentStatus(jobId);
    const isCurrentlyApplied = user.applied.includes(jobId) || user.interviewing.includes(jobId);
    
    if (isCurrentlyApplied) {
      if (user.applied.includes(jobId)) moveJob(jobId, "applied", "saved");
      if (user.interviewing.includes(jobId)) moveJob(jobId, "interviewing", "saved");
    } else {
      moveJob(jobId, currentStatus as JobStatus, "applied");
    }
  }, [job, getCurrentStatus, user.applied, user.interviewing, moveJob]);

  const handleJobClick = useCallback((e: React.MouseEvent) => {
    console.log('🔍 KanbanCardWithDragHandle - Job click detected:', {
      jobId: job?.id,
      jobTitle: job?.job_information.title,
      isDesktop,
      eventTarget: e.target,
      currentTarget: e.currentTarget
    });
    
    e.preventDefault();
    e.stopPropagation();
    onJobClick(job!);
  }, [job, isDesktop, onJobClick]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!job) return;
    
    console.log('🔍 KanbanCardWithDragHandle - Mouse down on content:', {
      jobId: job.id,
      target: e.target,
      currentTarget: e.currentTarget
    });
    
    // Prevent drag from starting when clicking on content
    e.stopPropagation();
  }, [job]);

  if (!job) return null;

  return (
    <KanbanCard
      key={item.id}
      id={item.id}
      name={item.name}
      column={item.column}
      className="mb-2 hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex items-start gap-2">
        <div 
          className="flex-shrink-0 mt-1 cursor-grab active:cursor-grabbing"
          onMouseDown={(e) => {
            console.log('🔍 KanbanCardWithDragHandle - Mouse down on grip handle:', {
              jobId: job.id,
              target: e.target,
              currentTarget: e.currentTarget
            });
          }}
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>
        <div 
          className="flex-1 min-w-0 cursor-pointer" 
          onClick={handleJobClick}
          onMouseDown={handleMouseDown}
        >
          {isDesktop ? (
            <JobDialogContent
              currentJob={job}
              isApplied={isApplied}
              isBookmarked={isBookmarked}
              onApplyToggle={handleApplyToggle}
              onBookmarkToggle={handleBookmarkToggle}
            >
              <div
                onClick={(e) => {
                  console.log('🔍 KanbanCardWithDragHandle - Dialog trigger clicked:', {
                    jobId: job.id,
                    target: e.target,
                    currentTarget: e.currentTarget
                  });
                }}
              >
                <KanbanJobCardContents job={job} />
              </div>
            </JobDialogContent>
          ) : (
            <KanbanJobCardContents job={job} />
          )}
        </div>
      </div>
    </KanbanCard>
  );
};

const KanbanBoard = memo(({ jobs, className, visibleCategories }: KanbanBoardProps) => {
  const { user, moveJob } = useApp();
  const { isDesktop } = useResponsiveBreakpoint();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const kanbanData = useMemo(() => {
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
      };
    });
  }, [jobs, user]);

  const jobMap = useMemo(() => {
    const allJobIds = new Set([
      ...user.saved,
      ...user.applied,
      ...user.interviewing,
      ...user.rejected,
      ...user.hidden,
    ]);

    const userJobs = jobs.filter(job => allJobIds.has(job.id));
    const additionalJobs = jobs.slice(0, 5).filter(job => !allJobIds.has(job.id));
    const jobsToShow = [...userJobs, ...additionalJobs];

    return new Map(jobsToShow.map(job => [job.id, job]));
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

  const handleDataChange = (newData: { id: string; name: string; column: string }[]) => {
    console.log('🔍 KanbanBoard - handleDataChange called:', {
      newData: newData.map(item => ({ id: item.id, column: item.column }))
    });
    
    newData.forEach(item => {
      const currentStatus = getCurrentStatus(item.id);
      if (currentStatus !== item.column) {
        console.log('🔍 KanbanBoard - Moving job:', {
          jobId: item.id,
          fromStatus: currentStatus,
          toStatus: item.column
        });
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

  const handleJobClick = useCallback((job: Job) => {
    console.log('🔍 KanbanBoard - handleJobClick called:', {
      jobId: job.id,
      jobTitle: job.job_information.title,
      isDesktop,
      selectedJob: selectedJob?.id
    });
    
    setSelectedJob(job);
    if (!isDesktop) {
      console.log('🔍 KanbanBoard - Opening drawer for mobile');
      setDrawerOpen(true);
    } else {
      console.log('🔍 KanbanBoard - Desktop mode - dialog should open via JobDialogContent');
    }
  }, [isDesktop, selectedJob]);

  const handleDrawerClose = useCallback(() => {
    setDrawerOpen(false);
    setSelectedJob(null);
  }, []);

  const isBookmarked = useMemo(() => 
    selectedJob ? (
      user.saved.includes(selectedJob.id) || 
      user.applied.includes(selectedJob.id) || 
      user.interviewing.includes(selectedJob.id)
    ) : false,
    [user.saved, user.applied, user.interviewing, selectedJob]
  );

  const isApplied = useMemo(() => 
    selectedJob ? (
      user.applied.includes(selectedJob.id) || 
      user.interviewing.includes(selectedJob.id)
    ) : false,
    [user.applied, user.interviewing, selectedJob]
  );

  const handleBookmarkToggle = useCallback(() => {
    if (!selectedJob) return;
    
    if (isBookmarked) {
      // Remove from all bookmark-related states
      if (user.saved.includes(selectedJob.id)) moveJob(selectedJob.id, "saved", "saved");
      if (user.applied.includes(selectedJob.id)) moveJob(selectedJob.id, "applied", "saved");
      if (user.interviewing.includes(selectedJob.id)) moveJob(selectedJob.id, "interviewing", "saved");
    } else {
      // Add to saved (default bookmark state)
      moveJob(selectedJob.id, getCurrentStatus(selectedJob.id) as JobStatus, "saved");
    }
  }, [isBookmarked, user.saved, user.applied, user.interviewing, selectedJob, moveJob, getCurrentStatus]);

  const handleApplyToggle = useCallback(() => {
    if (!selectedJob) return;
    
    if (isApplied) {
      // Remove from all apply-related states
      if (user.applied.includes(selectedJob.id)) moveJob(selectedJob.id, "applied", "saved");
      if (user.interviewing.includes(selectedJob.id)) moveJob(selectedJob.id, "interviewing", "saved");
    } else {
      // Add to applied (default apply state)
      moveJob(selectedJob.id, getCurrentStatus(selectedJob.id) as JobStatus, "applied");
    }
  }, [isApplied, user.applied, user.interviewing, selectedJob, moveJob, getCurrentStatus]);

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
            <KanbanCards id={column.id} key={column.id} className="flex-1">
              {(item) => (
                <KanbanCardWithDragHandle
                  item={item}
                  isDesktop={isDesktop}
                  onJobClick={handleJobClick}
                  user={user}
                  getCurrentStatus={getCurrentStatus}
                  moveJob={moveJob}
                  jobMap={jobMap}
                />
              )}
            </KanbanCards>
          </KanbanBoardUI>
        )}
      </KanbanProvider>

      {selectedJob && !isDesktop && (
        <JobDrawerContent
          currentJob={selectedJob}
          isApplied={isApplied}
          isBookmarked={isBookmarked}
          onApplyToggle={handleApplyToggle}
          onBookmarkToggle={handleBookmarkToggle}
          onClose={handleDrawerClose}
          open={drawerOpen}
        />
      )}
    </div>
  );
});

KanbanBoard.displayName = "KanbanBoard";

export default KanbanBoard; 