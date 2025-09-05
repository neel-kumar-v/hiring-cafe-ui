"use client";

import { CategoryToggle, KanbanBoard, ListView, SearchBar, ViewToggle } from "@/components/tracker";
import { useApp } from "@/contexts/AppContext";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { Job } from "@/types/job";
import { BookmarkIcon, EyeOffIcon, PhoneOutgoingIcon, SendIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";

type JobCategory = "saved" | "applied" | "interviewing" | "rejected" | "hidden";
type ViewMode = "board" | "list";

export default function TrackerPage() {
  const { user, moveJob } = useApp();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("board");
  const [visibleCategories, setVisibleCategories] = useState<Record<JobCategory, boolean>>({
    saved: true,
    applied: true,
    interviewing: true,
    rejected: true,
    hidden: true,
  });

  const isLargeScreen = useMediaQuery("(min-width: 1024px)");

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const response = await fetch("/api/jobs");
        if (response.ok) {
          const data = await response.json();
          const jobsData = data.jobs || [];
          setJobs(jobsData);
        } else {
          console.error("Failed to load jobs");
        }
      } catch (error) {
        console.error("Error loading jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

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

  // First, filter to only include jobs that are in the user's arrays
  const userJobs = jobs.filter((job) => {
    const allJobIds = new Set([...user.saved, ...user.applied, ...user.interviewing, ...user.rejected, ...user.hidden]);
    return allJobIds.has(job.id);
  });

  // Then apply search filter to user jobs only
  const filteredJobs = userJobs.filter((job) => {
    if (!searchQuery.trim()) return true;

    const searchLower = searchQuery.toLowerCase();
    const titleMatch = job.job_information.title.toLowerCase().includes(searchLower);
    const companyMatch = job.v5_processed_company_data.name?.toLowerCase().includes(searchLower);
    const locationMatch = job.v5_processed_job_data.workplace_cities.some((city) => city.toLowerCase().includes(searchLower));

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
      <div className="min-h-[calc(100vh-4.5rem)] bg-white dark:bg-neutral-900">
        <div className="mx-auto max-w-full p-4 transition-[padding] duration-500 ease-in-out lg:p-8">
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">Loading...</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-white dark:bg-neutral-900">
      <div className="mx-auto max-w-full p-4 pb-0 transition-[padding] duration-500 ease-in-out lg:p-8">
        <div className="mb-3">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
            Job Tracker
            <p className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">
              Click on a card to view more details or {getEffectiveViewMode() === "list" ? " use the dropdown" : " drag and drop"} to move between stages.
            </p>
          </h1>

          <div className="space-y-4 flex lg:flex-row flex-col gap-2">
            <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

            <div className="flex gap-2">
              <CategoryToggle category="saved" isActive={visibleCategories.saved} onToggle={handleCategoryToggle} icon={<BookmarkIcon className="size-4" />} />
              <CategoryToggle category="applied" isActive={visibleCategories.applied} onToggle={handleCategoryToggle} icon={<SendIcon className="size-4" />} />
              <CategoryToggle category="interviewing" isActive={visibleCategories.interviewing} onToggle={handleCategoryToggle} icon={<PhoneOutgoingIcon className="size-4" />} />
              <CategoryToggle category="rejected" isActive={visibleCategories.rejected} onToggle={handleCategoryToggle} icon={<XIcon className="size-4" />} />
              <CategoryToggle category="hidden" isActive={visibleCategories.hidden} onToggle={handleCategoryToggle} icon={<EyeOffIcon className="size-4" />} />
            </div>

            {isLargeScreen && (
              <div className="ml-auto">
                <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />
              </div>
            )}
          </div>
        </div>

        <div className="h-[calc(100vh-250px)]">
          {getEffectiveViewMode() === "board" ? (
            <KanbanBoard jobs={filteredJobs} visibleCategories={visibleCategories} />
          ) : (
            <ListView jobs={filteredJobs} visibleCategories={visibleCategories} getJobStatus={getJobStatus} onMoveJob={handleMoveJob} />
          )}
        </div>
      </div>
    </div>
  );
}
