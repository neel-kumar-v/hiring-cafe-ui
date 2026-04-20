"use client";

import { Card } from "@/components/ui/card";
import { useApp } from "@/contexts/AppContext";
import { useResponsiveBreakpoint } from "@/hooks/useMediaQuery";
import type { JobCardResultDTO } from "@/types/convexJobs";
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
  jobs: JobCardResultDTO[];
  visibleCategories?: Record<JobCategory, boolean>;
  getJobStatus: (jobId: string) => JobCategory;
  onMoveJob?: (jobId: string, fromStatus: JobCategory, toStatus: JobCategory) => void;
}

const ListViewJobCard = ({
  row,
  currentStage,
  onMoveJob,
  onJobClick,
}: {
  row: JobCardResultDTO;
  currentStage: JobCategory;
  onMoveJob?: (jobId: string, fromStatus: JobCategory, toStatus: JobCategory) => void;
  onJobClick: (row: JobCardResultDTO) => void;
}) => {
  const { isDesktop } = useResponsiveBreakpoint();
  const { user } = useApp();
  const job = row.job;

  const isBookmarked = user.saved.includes(job.externalId) || user.applied.includes(job.externalId) || user.interviewing.includes(job.externalId);
  const isApplied = user.applied.includes(job.externalId) || user.interviewing.includes(job.externalId);
  const isInterviewing = user.interviewing.includes(job.externalId);

  const handleBookmarkToggle = useCallback(() => {
    if (isBookmarked) {
      // Remove from all bookmark-related states
      if (user.saved.includes(job.externalId)) onMoveJob?.(job.externalId, "saved", "hidden");
      if (user.applied.includes(job.externalId)) onMoveJob?.(job.externalId, "applied", "hidden");
      if (user.interviewing.includes(job.externalId)) onMoveJob?.(job.externalId, "interviewing", "hidden");
    } else {
      onMoveJob?.(job.externalId, currentStage, "saved");
    }
  }, [isBookmarked, user.saved, user.applied, user.interviewing, job.externalId, onMoveJob, currentStage]);

  const handleApplyToggle = useCallback(() => {
    if (isApplied) {
      if (user.applied.includes(job.externalId)) onMoveJob?.(job.externalId, "applied", "saved");
      if (user.interviewing.includes(job.externalId)) onMoveJob?.(job.externalId, "interviewing", "saved");
    } else {
      onMoveJob?.(job.externalId, currentStage, "applied");
    }
  }, [isApplied, user.applied, user.interviewing, job.externalId, onMoveJob, currentStage]);

  return (
    <Card className="p-4 mb-3 border border-input hover:border-input/75 transition-all duration-300 ease-in-out shadow-none cursor-pointer">
      {isDesktop ? (
        <JobDialogContent
          currentJob={job}
          company={row.company}
          isApplied={isApplied}
          isBookmarked={isBookmarked}
          isInterviewing={isInterviewing}
          onApplyToggle={handleApplyToggle}
          onBookmarkToggle={handleBookmarkToggle}
        >
          <div onClick={() => onJobClick(row)}>
            <ListJobCardContents job={job} company={row.company} currentStage={currentStage} onMoveJob={onMoveJob} />
          </div>
        </JobDialogContent>
      ) : (
        <div onClick={() => onJobClick(row)}>
          <ListJobCardContents job={job} company={row.company} currentStage={currentStage} onMoveJob={onMoveJob} />
        </div>
      )}
    </Card>
  );
};

const ListView = memo(({ jobs, visibleCategories, getJobStatus, onMoveJob }: ListViewProps) => {
  const { isDesktop } = useResponsiveBreakpoint();
  const [selectedJob, setSelectedJob] = useState<JobCardResultDTO | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user } = useApp();

  const filteredJobs = jobs.filter(({ job }) => {
    const status = getJobStatus(job.externalId);
    return visibleCategories?.[status] ?? true;
  });

  const handleJobClick = useCallback(
    (row: JobCardResultDTO) => {
      setSelectedJob(row);
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
    () => (selectedJob ? user.saved.includes(selectedJob.job.externalId) || user.applied.includes(selectedJob.job.externalId) || user.interviewing.includes(selectedJob.job.externalId) : false),
    [user.saved, user.applied, user.interviewing, selectedJob]
  );

  const isApplied = useMemo(
    () => (selectedJob ? user.applied.includes(selectedJob.job.externalId) || user.interviewing.includes(selectedJob.job.externalId) : false),
    [user.applied, user.interviewing, selectedJob]
  );

  const handleBookmarkToggle = useCallback(() => {
    if (!selectedJob) return;

    if (isBookmarked) {
      // Remove from all bookmark-related states
      if (user.saved.includes(selectedJob.job.externalId)) onMoveJob?.(selectedJob.job.externalId, "saved", "hidden");
      if (user.applied.includes(selectedJob.job.externalId)) onMoveJob?.(selectedJob.job.externalId, "applied", "hidden");
      if (user.interviewing.includes(selectedJob.job.externalId)) onMoveJob?.(selectedJob.job.externalId, "interviewing", "hidden");
    } else {
      onMoveJob?.(selectedJob.job.externalId, getJobStatus(selectedJob.job.externalId), "saved");
    }
  }, [isBookmarked, user.saved, user.applied, user.interviewing, selectedJob, onMoveJob, getJobStatus]);

  const handleApplyToggle = useCallback(() => {
    if (!selectedJob) return;

    if (isApplied) {
      if (user.applied.includes(selectedJob.job.externalId)) onMoveJob?.(selectedJob.job.externalId, "applied", "saved");
      if (user.interviewing.includes(selectedJob.job.externalId)) onMoveJob?.(selectedJob.job.externalId, "interviewing", "saved");
    } else {
      onMoveJob?.(selectedJob.job.externalId, getJobStatus(selectedJob.job.externalId), "applied");
    }
  }, [isApplied, user.applied, user.interviewing, selectedJob, onMoveJob, getJobStatus]);

  return (
    <div className="h-full overflow-y-auto">
      {filteredJobs.map((row) => (
        <ListViewJobCard key={row.job.externalId} row={row} currentStage={getJobStatus(row.job.externalId)} onMoveJob={onMoveJob} onJobClick={handleJobClick} />
      ))}

      {selectedJob && !isDesktop && (
        <JobDrawerContent
          currentJob={selectedJob.job}
          company={selectedJob.company}
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
