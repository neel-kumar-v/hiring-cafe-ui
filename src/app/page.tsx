"use client";

import Header from "@/components/Header";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { Suspense, lazy, useState } from "react";

const JobBoard = lazy(() => import("@/components/JobBoard"));
const ApplyFormSelect = lazy(() => import("@/components/search/legacy/ApplyFormSelect"));
const DateRangePopover = lazy(() => import("@/components/search/legacy/DateRangePopover"));
const Filters = lazy(() => import("@/components/search/legacy/Filters"));
const SortPopover = lazy(() => import("@/components/search/legacy/SortPopover"));
const SearchDialog = lazy(() => import("@/components/SearchDialog"));

const LoadingFallback = () => (
  // console.log("LoadingFallback"),
  <div className="col-span-full text-center py-16 text-text">
    Loading jobs...
  </div>
);

export default function Page() {
  const { isDarkMode } = useDarkMode();
  const [jobCount] = useState(2_057_770);
  const [companyCount] = useState(72_936);
  const [location] = useState("United States");
  const [showLegacyFilters, setShowLegacyFilters] = useState(false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [searchDialogFrom, setSearchDialogFrom] = useState<string>("");

  const formatNumber = (number: number, round = 3) => {
    return (Math.round(number / 10 ** round) * 10 ** round).toLocaleString();
  };

  const handleSearchIconClick = (category: string) => {
    setSearchDialogFrom(category);
    setSearchDialogOpen(true);
  };

  return (
    <div>
      <div className="min-h-screen transition-colors duration-300">
        <div className="min-h-screen bg-white dark:bg-neutral-900">
          <Header
            onToggleLegacyFilters={() =>
              setShowLegacyFilters(!showLegacyFilters)
            }
            showLegacyFilters={showLegacyFilters}
            onIconClick={handleSearchIconClick}
          />

          <Suspense fallback={null}>
            <SearchDialog
              from={searchDialogFrom}
              onOpenChange={setSearchDialogOpen}
              open={searchDialogOpen}
              isDarkMode={isDarkMode}
            />
          </Suspense>

          <div className={showLegacyFilters ? "" : "hidden"}>
            <Suspense fallback={null}>
              <Filters onIconClick={handleSearchIconClick} />
            </Suspense>
          </div>

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
            <div className="mx-auto max-w-full p-2 transition-[padding] duration-500 ease-in-out sm:p-4 lg:p-8">
              <Suspense fallback={<LoadingFallback />}>
                <JobBoard />
              </Suspense>
            </div> 
          </div>
        </div>
      </div>
    </div>
  );
}
