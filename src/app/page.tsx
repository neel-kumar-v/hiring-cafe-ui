"use client";

import JobBoardCardSkeleton from "@/components/job/JobBoardCardSkeleton";
import HomeCompactHeader from "@/components/search/HomeCompactHeader";
import HomeSearchActions from "@/components/search/HomeSearchActions";
import SearchBar from "@/components/search/SearchBar";
import { useSearchUI } from "@/contexts/SearchContext";
import { useQuery } from "convex/react";
import { Suspense, lazy } from "react";
import { api } from "../../convex/_generated/api";

const JobBoard = lazy(() => import("@/components/JobBoard"));
const LegacyFilters = lazy(() => import("@/components/search/legacy/Filters"));

const LoadingFallback = () => (
  <div className="grid min-h-[50vh] grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5">
    {Array.from({ length: 10 }).map((_, i) => (
      <JobBoardCardSkeleton key={i} />
    ))}
  </div>
);

export default function Page() {
  const { boardSearchQuery, setBoardSearchQuery, handleSearchIconClick } = useSearchUI();
  const liveJobCount = useQuery(api.jobs.count, {});
  const liveCompanyCount = useQuery(api.companies.count, {});
  const jobCountFallback = 2_057_770;
  const companyCountFallback = 72_936;
  const location = "United States";
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
      </div>

      <HomeSearchActions />

      <Suspense fallback={null}>
        <LegacyFilters />
      </Suspense>

      <div className="h-full overflow-x-hidden">
        <div className="mx-auto max-w-full !pt-0 p-4 transition-[padding] duration-500 ease-in-out lg:p-8">
          <Suspense fallback={<LoadingFallback />}>
            <JobBoard companyCount={companyCount} jobCount={jobCount} location={location} />
          </Suspense>
        </div>
      </div>
    </>
  );
}
