"use client";

import { CategoryFilter, KanbanBoard, ListView, SearchBar, TrackerFlowDiagram, ViewToggle } from "@/components/tracker";
import { useApp } from "@/contexts/AppContext";
import { useQuantizedContainerWidth } from "@/hooks/useContainerWidth";
import { useTrackedJobs } from "@/hooks/useTrackedJobs";
import { useMemo, useRef, useState } from "react";
import type { JobCategory } from "@/types/tracker";

type ViewMode = "board" | "list";

export default function TrackerPage() {
  const { user, moveJob } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("board");
  const [visibleCategories, setVisibleCategories] = useState<Record<JobCategory, boolean>>({
    saved: true,
    applied: true,
    interviewing: true,
    rejected: true,
    hidden: false,
  });
  const [kanbanSelectionMode, setKanbanSelectionMode] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const containerWidth = useQuantizedContainerWidth(containerRef, [1024]);
  const isLargeScreen = containerWidth >= 1024;

  const trackedJobIds = useMemo(() => {
    const ids = [...user.saved, ...user.applied, ...user.interviewing, ...user.rejected, ...user.hidden];
    const unique = [...new Set(ids)];
    unique.sort();
    return unique;
  }, [user.saved, user.applied, user.interviewing, user.rejected, user.hidden]);

  const { jobs, loading, loadError } = useTrackedJobs(trackedJobIds);

  const getJobStatus = (jobId: string): JobCategory => {
    if (user.applied.includes(jobId)) return "applied";
    if (user.interviewing.includes(jobId)) return "interviewing";
    if (user.rejected.includes(jobId)) return "rejected";
    if (user.hidden.includes(jobId)) return "hidden";
    return "saved";
  };

  const handleMoveJob = (jobId: string, fromStatus: JobCategory, toStatus: JobCategory) => {
    moveJob(jobId, fromStatus, toStatus);
  };

  const userJobs = jobs.filter(({ job }) => {
    const allJobIds = new Set([...user.saved, ...user.applied, ...user.interviewing, ...user.rejected, ...user.hidden]);
    return allJobIds.has(job.externalId);
  });

  const filteredJobs = userJobs.filter(({ job, company }) => {
    if (!searchQuery.trim()) return true;

    const searchLower = searchQuery.toLowerCase();
    const titleMatch = job.title.toLowerCase().includes(searchLower);
    const companyMatch = (company?.name ?? "").toLowerCase().includes(searchLower);
    const cities = job.workplaceCities ?? [];
    const locationMatch = cities.some((city) => city.toLowerCase().includes(searchLower));

    return titleMatch || companyMatch || locationMatch;
  });

  const flowCounts = useMemo(() => {
    const counts: Record<JobCategory, number> = {
      saved: 0,
      applied: 0,
      interviewing: 0,
      rejected: 0,
      hidden: 0,
    };

    filteredJobs.forEach(({ job }) => {
      counts[getJobStatus(job.externalId)] += 1;
    });

    return counts;
  }, [filteredJobs, user.applied, user.hidden, user.interviewing, user.rejected]);

  const filteredJobIds = useMemo(() => new Set(filteredJobs.map(({ job }) => job.externalId)), [filteredJobs]);

  const flowTransitions = useMemo(() => {
    const transitions = user.jobTransitions || [];
    return transitions.filter((transition) => filteredJobIds.has(transition.jobId));
  }, [filteredJobIds, user.jobTransitions]);

  const getEffectiveViewMode = () => {
    return isLargeScreen ? viewMode : "list";
  };

  if (loading) {
    return (
      <div ref={containerRef} className="min-h-[calc(100vh-4.5rem)] bg-background-body @container">
        <div className="mx-auto max-w-full p-4 transition-[padding] duration-500 ease-in-out @min-[1024px]:p-8">
          <div className="text-center py-16">
            <h1 className="mb-4 font-display text-3xl font-bold tracking-tight text-foreground">Loading...</h1>
          </div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div ref={containerRef} className="min-h-[calc(100vh-4.5rem)] bg-background-body @container">
        <div className="mx-auto max-w-full p-4 transition-[padding] duration-500 ease-in-out @min-[1024px]:p-8">
          <div className="py-16 text-center">
            <h1 className="mb-4 font-display text-3xl font-bold tracking-tight text-foreground">Job Tracker</h1>
            <p className="text-muted-foreground">{loadError}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-[calc(100vh-4.5rem)] bg-background-body @container">
      <div className="mx-auto max-w-full p-4 pb-0 transition-[padding] duration-500 ease-in-out @min-[1024px]:p-8">
        <div className="mb-3">
          <div className="flex items-center gap-2">
            <SearchBar className="min-w-0 flex-1" searchQuery={searchQuery} onSearchChange={setSearchQuery} />

            <CategoryFilter visibleCategories={visibleCategories} onChange={setVisibleCategories} />

            {isLargeScreen ? (
              <div className="flex shrink-0 items-center gap-2">
                <button
                  className={`h-9 rounded-md border px-3 text-sm ${kanbanSelectionMode ? "bg-primary text-primary-foreground" : "bg-background"}`}
                  onClick={() => setKanbanSelectionMode((prev) => !prev)}
                >
                  Select jobs
                </button>
                <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />
              </div>
            ) : null}
          </div>
        </div>

        <div className="h-[calc(100vh-250px)]">
          {getEffectiveViewMode() === "board" ? (
            <KanbanBoard jobs={filteredJobs} visibleCategories={visibleCategories} selectionMode={kanbanSelectionMode} onSelectionModeChange={setKanbanSelectionMode} />
          ) : (
            <ListView jobs={filteredJobs} visibleCategories={visibleCategories} getJobStatus={getJobStatus} onMoveJob={handleMoveJob} hasSavedJobs={userJobs.length > 0} />
          )}
        </div>
        <div className="mt-6">
          <TrackerFlowDiagram counts={flowCounts} transitions={flowTransitions} />
        </div>
      </div>
    </div>
  );
}
