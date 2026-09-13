"use client";

import { CategoryToggle, KanbanBoard, ListView, SearchBar, ViewToggle } from "@/components/tracker";
import { useApp } from "@/contexts/AppContext";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useTrackedJobs } from "@/hooks/useTrackedJobs";
import { BookmarkIcon, EyeOffIcon, PhoneOutgoingIcon, SendIcon, XIcon } from "lucide-react";
import { useMemo, useState } from "react";
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
    hidden: true,
  });
  const [kanbanSelectionMode, setKanbanSelectionMode] = useState(false);

  const isLargeScreen = useMediaQuery("(min-width: 1024px)");

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

  const handleCategoryToggle = (category: JobCategory) => {
    setVisibleCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const getEffectiveViewMode = () => {
    return isLargeScreen ? viewMode : "list";
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4.5rem)] bg-background-body">
        <div className="mx-auto max-w-full p-4 transition-[padding] duration-500 ease-in-out lg:p-8">
          <div className="text-center py-16">
            <h1 className="mb-4 text-3xl font-bold text-foreground">Loading...</h1>
          </div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-[calc(100vh-4.5rem)] bg-background-body">
        <div className="mx-auto max-w-full p-4 transition-[padding] duration-500 ease-in-out lg:p-8">
          <div className="py-16 text-center">
            <h1 className="mb-4 text-3xl font-bold text-foreground">Job Tracker</h1>
            <p className="text-muted-foreground">{loadError}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-background-body">
      <div className="mx-auto max-w-full p-4 pb-0 transition-[padding] duration-500 ease-in-out lg:p-8">
        <div className="mb-3">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <h1 className="text-3xl font-bold text-foreground">
              Job Tracker
              <p className="text-sm font-normal text-muted-foreground">
                Click on a card to view more details or {getEffectiveViewMode() === "list" ? " use the dropdown" : " drag and drop"} to move between stages.
              </p>
            </h1>
            {isLargeScreen && (
              <div className="flex items-center gap-2 lg:pt-1">
                <button
                  className={`h-9 rounded-md border px-3 text-sm ${kanbanSelectionMode ? "bg-primary text-primary-foreground" : "bg-background"}`}
                  onClick={() => setKanbanSelectionMode((prev) => !prev)}
                >
                  Select jobs
                </button>
                <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />
              </div>
            )}
          </div>

          <div className="space-y-4 flex lg:flex-row flex-col gap-2">
            <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

            <div className="flex gap-2">
              <CategoryToggle category="saved" isActive={visibleCategories.saved} onToggle={handleCategoryToggle} icon={<BookmarkIcon className="size-4" />} />
              <CategoryToggle category="applied" isActive={visibleCategories.applied} onToggle={handleCategoryToggle} icon={<SendIcon className="size-4" />} />
              <CategoryToggle category="interviewing" isActive={visibleCategories.interviewing} onToggle={handleCategoryToggle} icon={<PhoneOutgoingIcon className="size-4" />} />
              <CategoryToggle category="rejected" isActive={visibleCategories.rejected} onToggle={handleCategoryToggle} icon={<XIcon className="size-4" />} />
              <CategoryToggle category="hidden" isActive={visibleCategories.hidden} onToggle={handleCategoryToggle} icon={<EyeOffIcon className="size-4" />} />
            </div>
          </div>
        </div>

        <div className="h-[calc(100vh-250px)]">
          {getEffectiveViewMode() === "board" ? (
            <KanbanBoard jobs={filteredJobs} visibleCategories={visibleCategories} selectionMode={kanbanSelectionMode} onSelectionModeChange={setKanbanSelectionMode} />
          ) : (
            <ListView jobs={filteredJobs} visibleCategories={visibleCategories} getJobStatus={getJobStatus} onMoveJob={handleMoveJob} />
          )}
        </div>
      </div>
    </div>
  );
}
