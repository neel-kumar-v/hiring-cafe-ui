"use client";

import KanbanJobCardContents from "@/components/job/contents/KanbanJobCardContents";
import { KanbanBoard as KanbanBoardUI, KanbanCardWithDragHandle, KanbanCards, KanbanHeader, KanbanProvider } from "@/components/ui/kanban";
import { useApp } from "@/contexts/AppContext";
import { useResponsiveBreakpoint } from "@/hooks/useMediaQuery";
import type { JobStatus } from "@/types/app";
import type { Job } from "@/types/job";
import { Copy } from "lucide-react";
import dynamic from "next/dynamic";
import { memo, useCallback, useMemo, useState } from "react";

const JobDialogContent = dynamic(() => import("../job/contents/JobDialogContent"), {
  loading: () => null,
  ssr: false,
});

const JobDrawerContent = dynamic(() => import("../job/contents/JobDrawerContent"), {
  loading: () => null,
  ssr: false,
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

const KanbanBoard = memo(({ jobs, className, visibleCategories }: KanbanBoardProps) => {
  const { user, moveJob } = useApp();
  const { isDesktop } = useResponsiveBreakpoint();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const kanbanData = useMemo(() => {
    const allJobIds = new Set([...user.saved, ...user.applied, ...user.interviewing, ...user.rejected, ...user.hidden]);

    // Show jobs that are in the user's arrays, plus some additional jobs for testing
    const userJobs = jobs.filter((job) => allJobIds.has(job.id));
    const additionalJobs = jobs.slice(0, 5).filter((job) => !allJobIds.has(job.id));
    const jobsToShow = [...userJobs, ...additionalJobs];

    return jobsToShow.map((job) => {
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
    const allJobIds = new Set([...user.saved, ...user.applied, ...user.interviewing, ...user.rejected, ...user.hidden]);

    const userJobs = jobs.filter((job) => allJobIds.has(job.id));
    const additionalJobs = jobs.slice(0, 5).filter((job) => !allJobIds.has(job.id));
    const jobsToShow = [...userJobs, ...additionalJobs];

    return new Map(jobsToShow.map((job) => [job.id, job]));
  }, [jobs, user]);

  const columns: KanbanColumn[] = useMemo(() => {
    // For testing, calculate counts based on the actual jobs being shown
    const savedCount = kanbanData.filter((item) => item.column === "saved").length;
    const appliedCount = kanbanData.filter((item) => item.column === "applied").length;
    const interviewingCount = kanbanData.filter((item) => item.column === "interviewing").length;
    const rejectedCount = kanbanData.filter((item) => item.column === "rejected").length;
    const hiddenCount = kanbanData.filter((item) => item.column === "hidden").length;

    const allColumns = [
      { id: "saved", name: "Saved", count: savedCount },
      { id: "applied", name: "Applied", count: appliedCount },
      { id: "interviewing", name: "Interviewing", count: interviewingCount },
      { id: "rejected", name: "Rejected", count: rejectedCount },
      { id: "hidden", name: "Hidden", count: hiddenCount },
    ];

    // Filter columns based on visibleCategories if provided
    if (visibleCategories) {
      return allColumns.filter((column) => visibleCategories[column.id as JobCategory]);
    }

    return allColumns;
  }, [kanbanData, visibleCategories]);

  const handleDataChange = (newData: { id: string; name: string; column: string }[]) => {
    console.log("🔍 KanbanBoard - handleDataChange called:", {
      newData: newData.map((item) => ({ id: item.id, column: item.column })),
    });

    newData.forEach((item) => {
      const currentStatus = getCurrentStatus(item.id);
      if (currentStatus !== item.column) {
        console.log("🔍 KanbanBoard - Moving job:", {
          jobId: item.id,
          fromStatus: currentStatus,
          toStatus: item.column,
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

  const handleJobClick = useCallback(
    (e: React.MouseEvent) => {
      const jobId = e.currentTarget.getAttribute("data-job-id");
      const job = jobMap.get(jobId!);

      if (!job) return;

      console.log("🔍 KanbanBoard - handleJobClick called:", {
        jobId: job.id,
        jobTitle: job.job_information.title,
        isDesktop,
        selectedJob: selectedJob?.id,
      });

      setSelectedJob(job);
      if (!isDesktop) {
        console.log("🔍 KanbanBoard - Opening drawer for mobile");
        setDrawerOpen(true);
      } else {
        console.log("🔍 KanbanBoard - Desktop mode - dialog should open via JobDialogContent");
      }
    },
    [isDesktop, selectedJob, jobMap]
  );

  const handleDrawerClose = useCallback(() => {
    setDrawerOpen(false);
    setSelectedJob(null);
  }, []);

  const isBookmarked = useMemo(
    () => (selectedJob ? user.saved.includes(selectedJob.id) || user.applied.includes(selectedJob.id) || user.interviewing.includes(selectedJob.id) : false),
    [user.saved, user.applied, user.interviewing, selectedJob]
  );

  const isApplied = useMemo(
    () => (selectedJob ? user.applied.includes(selectedJob.id) || user.interviewing.includes(selectedJob.id) : false),
    [user.applied, user.interviewing, selectedJob]
  );

  const handleBookmarkToggle = useCallback(() => {
    if (!selectedJob) return;

    if (isBookmarked) {
      // Remove from all bookmark-related states
      if (user.saved.includes(selectedJob.id)) moveJob(selectedJob.id, "saved", "hidden");
      if (user.applied.includes(selectedJob.id)) moveJob(selectedJob.id, "applied", "hidden");
      if (user.interviewing.includes(selectedJob.id)) moveJob(selectedJob.id, "interviewing", "hidden");
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

  const downloadApplicationLinks = useCallback(
    (columnId: string) => {
      // Get all jobs in this column
      const columnJobs = kanbanData
        .filter((item) => item.column === columnId)
        .map((item) => jobMap.get(item.id))
        .filter(Boolean) as Job[];

      // Extract application links
      const applicationLinks = columnJobs.map((job) => job.apply_url).filter(Boolean);

      if (applicationLinks.length === 0) {
        alert("No application links found in this column.");
        return;
      }

      // Create text content
      const textContent = applicationLinks.join("\n");

      // Create and download file
      const blob = new Blob([textContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${columnId}-application-links.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    [kanbanData, jobMap]
  );

  return (
    <div className={`h-full w-full ${className}`}>
      <KanbanProvider columns={columns} data={kanbanData} onDataChange={handleDataChange} className="h-full">
        {(column) => (
          <KanbanBoardUI key={column.id} id={column.id} className="h-full">
            <KanbanHeader className="group flex items-center justify-between">
              <span className="font-semibold">{column.name}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadApplicationLinks(column.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                  title="Copy list of application links"
                >
                  <Copy className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </button>
                <span className="text-xs text-gray-500 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">{column.count}</span>
              </div>
            </KanbanHeader>
            <KanbanCards id={column.id} key={column.id} className="flex-1">
              {(item) => {
                const job = jobMap.get(item.id);
                if (!job) return null;

                const isBookmarked = user.saved.includes(job.id) || user.applied.includes(job.id) || user.interviewing.includes(job.id);
                const isApplied = user.applied.includes(job.id) || user.interviewing.includes(job.id);
                const isInterviewing = user.interviewing.includes(job.id);

                const handleBookmarkToggle = () => {
                  const jobId = job.id;
                  const currentStatus = getCurrentStatus(jobId);
                  const isCurrentlyBookmarked = user.saved.includes(jobId) || user.applied.includes(jobId) || user.interviewing.includes(jobId);

                  if (isCurrentlyBookmarked) {
                    // Remove from all bookmark-related states
                    if (user.saved.includes(jobId)) moveJob(jobId, "saved", "hidden");
                    if (user.applied.includes(jobId)) moveJob(jobId, "applied", "hidden");
                    if (user.interviewing.includes(jobId)) moveJob(jobId, "interviewing", "hidden");
                  } else {
                    moveJob(jobId, currentStatus as JobStatus, "saved");
                  }
                };

                const handleApplyToggle = () => {
                  const jobId = job.id;
                  const currentStatus = getCurrentStatus(jobId);
                  const isCurrentlyApplied = user.applied.includes(jobId) || user.interviewing.includes(jobId);

                  if (isCurrentlyApplied) {
                    if (user.applied.includes(jobId)) moveJob(jobId, "applied", "saved");
                    if (user.interviewing.includes(jobId)) moveJob(jobId, "interviewing", "saved");
                  } else {
                    moveJob(jobId, currentStatus as JobStatus, "applied");
                  }
                };

                return (
                  <KanbanCardWithDragHandle
                    key={item.id}
                    id={item.id}
                    name={item.name}
                    column={item.column}
                    className="mb-2 hover:shadow-md transition-shadow duration-200"
                    onJobClick={handleJobClick}
                    dragHandleOnly={true}
                  >
                    {isDesktop ? (
                      <JobDialogContent
                        currentJob={job}
                        isApplied={isApplied}
                        isBookmarked={isBookmarked}
                        isInterviewing={isInterviewing}
                        onApplyToggle={handleApplyToggle}
                        onBookmarkToggle={handleBookmarkToggle}
                      >
                        <div data-job-id={job.id}>
                          <KanbanJobCardContents job={job} />
                        </div>
                      </JobDialogContent>
                    ) : (
                      <div data-job-id={job.id}>
                        <KanbanJobCardContents job={job} />
                      </div>
                    )}
                  </KanbanCardWithDragHandle>
                );
              }}
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
