"use client";

import { Card } from "@/components/ui/card";
import { useApp } from "@/contexts/AppContext";
import { useResponsiveBreakpoint } from "@/hooks/useMediaQuery";
import type { Job } from "@/types/job";
import dynamic from "next/dynamic";
import { memo, useCallback, useMemo, useState } from "react";
import { ListJobCardContents } from "../job/contents";

const JobDialogContent = dynamic(() => import("../job/contents/JobDialogContent"), {
  loading: () => null,
  ssr: false,
});

const JobDrawerContent = dynamic(() => import("../job/contents/JobDrawerContent"), {
  loading: () => null,
  ssr: false,
});

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
  onMoveJob,
  onJobClick,
}: {
  job: Job;
  currentStage: JobCategory;
  onMoveJob?: (jobId: string, fromStatus: JobCategory, toStatus: JobCategory) => void;
  onJobClick: (job: Job) => void;
}) => {
  const { isDesktop } = useResponsiveBreakpoint();
  const { user } = useApp();

  const isBookmarked = user.saved.includes(job.id) || user.applied.includes(job.id) || user.interviewing.includes(job.id);
  const isApplied = user.applied.includes(job.id) || user.interviewing.includes(job.id);
  const isInterviewing = user.interviewing.includes(job.id);

  const handleBookmarkToggle = useCallback(() => {
    if (isBookmarked) {
      // Remove from all bookmark-related states
      if (user.saved.includes(job.id)) onMoveJob?.(job.id, "saved", "hidden");
      if (user.applied.includes(job.id)) onMoveJob?.(job.id, "applied", "hidden");
      if (user.interviewing.includes(job.id)) onMoveJob?.(job.id, "interviewing", "hidden");
    } else {
      onMoveJob?.(job.id, currentStage, "saved");
    }
  }, [isBookmarked, user.saved, user.applied, user.interviewing, job.id, onMoveJob, currentStage]);

  const handleApplyToggle = useCallback(() => {
    if (isApplied) {
      if (user.applied.includes(job.id)) onMoveJob?.(job.id, "applied", "saved");
      if (user.interviewing.includes(job.id)) onMoveJob?.(job.id, "interviewing", "saved");
    } else {
      onMoveJob?.(job.id, currentStage, "applied");
    }
  }, [isApplied, user.applied, user.interviewing, job.id, onMoveJob, currentStage]);

  return (
    <Card className="p-4 mb-3 border border-input hover:border-input/75 transition-all duration-300 ease-in-out shadow-none cursor-pointer">
      {isDesktop ? (
        <JobDialogContent
          currentJob={job}
          isApplied={isApplied}
          isBookmarked={isBookmarked}
          isInterviewing={isInterviewing}
          onApplyToggle={handleApplyToggle}
          onBookmarkToggle={handleBookmarkToggle}
        >
          <div onClick={() => onJobClick(job)}>
            <ListJobCardContents job={job} currentStage={currentStage} onMoveJob={onMoveJob} />
          </div>
        </JobDialogContent>
      ) : (
        <div onClick={() => onJobClick(job)}>
          <ListJobCardContents job={job} currentStage={currentStage} onMoveJob={onMoveJob} />
        </div>
      )}
    </Card>
  );
};

const ListView = memo(({ jobs, visibleCategories, getJobStatus, onMoveJob }: ListViewProps) => {
  const { isDesktop } = useResponsiveBreakpoint();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user } = useApp();

  const filteredJobs = jobs.filter((job) => {
    const status = getJobStatus(job.id);
    return visibleCategories?.[status] ?? true;
  });

  const handleJobClick = useCallback(
    (job: Job) => {
      setSelectedJob(job);
      if (!isDesktop) {
        setDrawerOpen(true);
      }
    },
    [isDesktop]
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
      if (user.saved.includes(selectedJob.id)) onMoveJob?.(selectedJob.id, "saved", "hidden");
      if (user.applied.includes(selectedJob.id)) onMoveJob?.(selectedJob.id, "applied", "hidden");
      if (user.interviewing.includes(selectedJob.id)) onMoveJob?.(selectedJob.id, "interviewing", "hidden");
    } else {
      onMoveJob?.(selectedJob.id, getJobStatus(selectedJob.id), "saved");
    }
  }, [isBookmarked, user.saved, user.applied, user.interviewing, selectedJob, onMoveJob, getJobStatus]);

  const handleApplyToggle = useCallback(() => {
    if (!selectedJob) return;

    if (isApplied) {
      if (user.applied.includes(selectedJob.id)) onMoveJob?.(selectedJob.id, "applied", "saved");
      if (user.interviewing.includes(selectedJob.id)) onMoveJob?.(selectedJob.id, "interviewing", "saved");
    } else {
      onMoveJob?.(selectedJob.id, getJobStatus(selectedJob.id), "applied");
    }
  }, [isApplied, user.applied, user.interviewing, selectedJob, onMoveJob, getJobStatus]);

  return (
    <div className="h-full overflow-y-auto">
      {filteredJobs.map((job) => (
        <ListViewJobCard key={job.id} job={job} currentStage={getJobStatus(job.id)} onMoveJob={onMoveJob} onJobClick={handleJobClick} />
      ))}

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

ListView.displayName = "ListView";

export default ListView;
