"use client";

import Header from "@/components/Header";
import JobBoard from "@/components/JobBoard";
import ApplyFormSelect from "@/components/search/legacy/ApplyFormSelect";
import DateRangePopover from "@/components/search/legacy/DateRangePopover";
import Filters from "@/components/search/legacy/Filters";
import SortPopover from "@/components/search/legacy/SortPopover";
import SearchDialog from "@/components/SearchDialog";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { useState } from "react";

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
          {/* Header */}
          <Header
            onToggleLegacyFilters={() =>
              setShowLegacyFilters(!showLegacyFilters)
            }
            showLegacyFilters={showLegacyFilters}
            onIconClick={handleSearchIconClick}
          />

          {/* Search Dialog */}
          <SearchDialog
            from={searchDialogFrom}
            onOpenChange={setSearchDialogOpen}
            open={searchDialogOpen}
            isDarkMode={isDarkMode}
          />

          {/* Filter Tags */}
          <div className={showLegacyFilters ? "" : "hidden"}>
            <Filters onIconClick={handleSearchIconClick} />
          </div>

          <div className={showLegacyFilters ? "" : "hidden"}>
            <div className="mx-auto max-w-full px-2 py-4 sm:px-4 lg:px-8">
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap items-center space-x-4">
                  <SortPopover />
                  <DateRangePopover />
                  <ApplyFormSelect />
                </div>
              </div>
              <div className="mt-2 text-neutral-600 text-sm dark:text-neutral-400">
                About {formatNumber(jobCount, 3)} jobs from{" "}
                {formatNumber(companyCount, 3)} companies in {location}
              </div>
            </div>
          </div>

          <div className="h-full overflow-scroll overflow-x-hidden">
            <div className="mx-auto max-w-full px-2 py-8 transition-[padding] duration-500 ease-in-out sm:px-4 lg:px-8">
              <div className="grid 3xl:grid-cols-5 grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3 2xl:grid-cols-4">
                <JobBoard />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
