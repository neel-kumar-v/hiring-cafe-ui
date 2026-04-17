"use client";

import HomeSearchActions from "@/components/search/HomeSearchActions";
import { useSearchUI } from "@/contexts/SearchContext";
import { Suspense, lazy, useState } from "react";

const JobBoard = lazy(() => import("@/components/JobBoard"));
const ApplyFormSelect = lazy(() => import("@/components/search/legacy/ApplyFormSelect"));
const DateRangePopover = lazy(() => import("@/components/search/legacy/DateRangePopover"));
const SortPopover = lazy(() => import("@/components/search/legacy/SortPopover"));

const LoadingFallback = () => (
  // console.log("LoadingFallback"),
  <div className="col-span-full text-center py-16 text-text">
    Loading jobs...
  </div>
);

export default function Page() {
  const { showLegacyFilters } = useSearchUI();
  const [jobCount] = useState(2_057_770);
  const [companyCount] = useState(72_936);
  const [location] = useState("United States");

  const formatNumber = (number: number, round = 3) => {
    return (Math.round(number / 10 ** round) * 10 ** round).toLocaleString();
  };

  return (
    <>
      <HomeSearchActions />

      <div className={showLegacyFilters ? "" : "hidden"}>
        <div className="mx-auto max-w-full px-2 py-4 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap items-center space-x-4">
              <Suspense fallback={null}>
                <SortPopover />
              </Suspense>
              <Suspense fallback={null}>
                <DateRangePopover />
              </Suspense>
              <Suspense fallback={null}>
                <ApplyFormSelect />
              </Suspense>
            </div>
          </div>
          <div className="mt-2 text-neutral-600 text-sm dark:text-neutral-400">
            About {formatNumber(jobCount, 3)} jobs from{" "}
            {formatNumber(companyCount, 3)} companies in {location}
          </div>
        </div>
      </div>

      <div className="h-full overflow-x-hidden">
        <div className="mx-auto max-w-full p-4 transition-[padding] duration-500 ease-in-out lg:p-8">
          <Suspense fallback={<LoadingFallback />}>
            <JobBoard />
          </Suspense>
        </div> 
      </div>
    </>
  );
}
