"use client";

import { Card } from "@/components/ui/card";
import { useApp } from "@/contexts/AppContext";
import { JobPreviewOverlay, useJobPreviewSequence } from "@/hooks/useJobPreview";
import type { JobCardResultDTO } from "@/types/convexJobs";
import type { JobCategory } from "@/types/tracker";
import { memo, useCallback, useMemo, useState } from "react";
import { ListJobCardContents } from "../job/contents";

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
  onJobClick: () => void;
}) => {
  return (
    <Card className="mb-3 cursor-pointer border border-input p-4 shadow-none transition-all duration-300 ease-in-out hover:border-input/75" onClick={onJobClick}>
      <ListJobCardContents job={row.job} company={row.company} currentStage={currentStage} onMoveJob={onMoveJob} />
    </Card>
  );
};

const ListView = memo(({ jobs, visibleCategories, getJobStatus, onMoveJob }: ListViewProps) => {
  const { user } = useApp();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filteredJobs = useMemo(
    () =>
      jobs.filter(({ job }) => {
        const status = getJobStatus(job.externalId);
        return visibleCategories?.[status] ?? true;
      }),
    [getJobStatus, jobs, visibleCategories]
  );

  const {
    isDesktop,
    dialogOpen,
    setDialogOpen,
    drawerOpen,
    setDrawerOpen,
    isTransitioning,
    fadeCompanyChrome,
    selectedRow,
    canNavigate,
    openJob,
    prefetchNeighbors,
    handlePrevious,
    handleNext,
    previousAriaLabel,
    nextAriaLabel,
  } = useJobPreviewSequence({
    sequence: filteredJobs,
    selectedId,
    onSelectId: setSelectedId,
    prefetchOptions: { delayMs: 160, maxInflight: 2 },
    previousAriaLabel: "Previous list job",
    nextAriaLabel: "Next list job",
  });

  const isBookmarked = useMemo(
    () =>
      selectedRow
        ? user.saved.includes(selectedRow.job.externalId) || user.applied.includes(selectedRow.job.externalId) || user.interviewing.includes(selectedRow.job.externalId)
        : false,
    [selectedRow, user.applied, user.interviewing, user.saved]
  );

  const isApplied = useMemo(
    () => (selectedRow ? user.applied.includes(selectedRow.job.externalId) || user.interviewing.includes(selectedRow.job.externalId) : false),
    [selectedRow, user.applied, user.interviewing]
  );

  const isInterviewing = useMemo(() => (selectedRow ? user.interviewing.includes(selectedRow.job.externalId) : false), [selectedRow, user.interviewing]);

  const handleBookmarkToggle = useCallback(() => {
    if (!selectedRow) return;
    const jobId = selectedRow.job.externalId;
    if (isBookmarked) {
      if (user.saved.includes(jobId)) onMoveJob?.(jobId, "saved", "hidden");
      if (user.applied.includes(jobId)) onMoveJob?.(jobId, "applied", "hidden");
      if (user.interviewing.includes(jobId)) onMoveJob?.(jobId, "interviewing", "hidden");
      return;
    }
    onMoveJob?.(jobId, getJobStatus(jobId), "saved");
  }, [getJobStatus, isBookmarked, onMoveJob, selectedRow, user.applied, user.interviewing, user.saved]);

  const handleApplyToggle = useCallback(() => {
    if (!selectedRow) return;
    const jobId = selectedRow.job.externalId;
    if (isApplied) {
      if (user.applied.includes(jobId)) onMoveJob?.(jobId, "applied", "saved");
      if (user.interviewing.includes(jobId)) onMoveJob?.(jobId, "interviewing", "saved");
      return;
    }
    onMoveJob?.(jobId, getJobStatus(jobId), "applied");
  }, [getJobStatus, isApplied, onMoveJob, selectedRow, user.applied, user.interviewing]);

  return (
    <div className="h-full overflow-y-auto">
      {filteredJobs.map((row) => (
        <ListViewJobCard
          key={row.job.externalId}
          row={row}
          currentStage={getJobStatus(row.job.externalId)}
          onJobClick={() => openJob(row.job.externalId)}
          onMoveJob={onMoveJob}
        />
      ))}

      <JobPreviewOverlay
        job={selectedRow?.job ?? null}
        company={selectedRow?.company ?? null}
        isDesktop={isDesktop}
        dialogOpen={dialogOpen}
        drawerOpen={drawerOpen}
        onDialogOpenChange={setDialogOpen}
        onDrawerClose={() => setDrawerOpen(false)}
        isApplied={isApplied}
        isBookmarked={isBookmarked}
        isInterviewing={isInterviewing}
        fadeCompanyChrome={fadeCompanyChrome}
        isTransitioning={isTransitioning}
        onApplyToggle={handleApplyToggle}
        onBookmarkToggle={handleBookmarkToggle}
        onDetailsResolved={prefetchNeighbors}
        onPrevious={handlePrevious}
        onNext={handleNext}
        canGoPrevious={canNavigate}
        canGoNext={canNavigate}
        previousAriaLabel={previousAriaLabel}
        nextAriaLabel={nextAriaLabel}
      />
    </div>
  );
});

ListView.displayName = "ListView";

export default ListView;
