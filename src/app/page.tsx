"use client";

import JobBoardCardSkeleton from "@/components/job/JobBoardCardSkeleton";
import HomeCompactHeader from "@/components/search/HomeCompactHeader";
import ResultsHeaderBand from "@/components/search/ResultsMetaRow";
import SearchBar from "@/components/search/SearchBar";
import { useSearchUI } from "@/contexts/SearchContext";
import { useQuery } from "convex/react";
import { Suspense, lazy } from "react";
import { api } from "../../convex/_generated/api";

const JobBoard = lazy(() => import("@/components/JobBoard"));

const LoadingFallback = () => (
  <div className="@container space-y-6">
    <div className="grid min-h-[50vh] grid-cols-1 gap-4 @min-[640px]:grid-cols-2 @min-[640px]:gap-6 @min-[1024px]:grid-cols-3 @min-[1400px]:grid-cols-4 @min-[1800px]:grid-cols-5">
      {Array.from({ length: 10 }).map((_, i) => (
        <JobBoardCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

export default function Page() {
  const { boardSearchQuery, setBoardSearchQuery, handleSearchIconClick } = useSearchUI();
  const liveJobCount = useQuery(api.jobs.count, {});
  const liveCompanyCount = useQuery(api.companies.count, {});
  const jobCountFallback = 2_057_770;
  const companyCountFallback = 72_936;
  const jobCount = liveJobCount ?? jobCountFallback;
  const companyCount = liveCompanyCount ?? companyCountFallback;

  const handleSearch = (value: string) => {
    setBoardSearchQuery(value);
  };

  return (
    <>
      <div className="border-b border-border bg-background-header md:hidden dark:border-border dark:bg-background">
        <HomeCompactHeader />
        <div className="px-4 pb-4">
          <SearchBar value={boardSearchQuery} onSearch={handleSearch} onIconClick={handleSearchIconClick} />
        </div>
        <ResultsHeaderBand jobCount={jobCount} companyCount={companyCount} className="border-t border-border px-4 py-2" />
      </div>

      <div className="h-full overflow-x-hidden">
        <div className="mx-auto max-w-full px-4 py-4 transition-[padding] duration-500 ease-in-out lg:px-8 lg:pb-8">
          <Suspense fallback={<LoadingFallback />}>
            <JobBoard jobCount={jobCount} />
          </Suspense>
        </div>
      </div>
    </>
  );
}
