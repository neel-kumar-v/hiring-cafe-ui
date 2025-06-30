"use client";

import JobBoard from "@/components/JobBoard";
import SortPopover from "@/components/search/legacy/SortPopover";
import DateRangePopover from "@/components/search/legacy/DateRangePopover";
import ApplyFormSelect from "@/components/search/legacy/ApplyFormSelect";
import Header from "@/components/Header";
import { useState } from "react";
import Filters from "@/components/search/legacy/Filters";

export default function Page() {
  const [jobCount] = useState(2057770);
  const [companyCount] = useState(72936);
  const [location] = useState("United States");
  const oldLook = false;

  const formatNumber = (number: number, round: number = 3) => {
    return (Math.round(number / 10 ** round) * 10 ** round).toLocaleString();
  };

  return (
    <div>
      <div className="min-h-screen transition-colors duration-300">
        <div className="bg-white dark:bg-gray-900 min-h-screen">
          {/* Header */}
          <Header />

          {/* Filter Tags */}
          {oldLook && <Filters />}

          <div className="overflow-scroll overflow-x-hidden h-full">
            {oldLook && (
              <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap items-center space-x-4">
                    <SortPopover />
                    <DateRangePopover />
                    <ApplyFormSelect />
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  About {formatNumber(jobCount, 3)} jobs from{" "}
                  {formatNumber(companyCount, 3)} companies in {location}
                </div>
              </div>
            )}
            <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6 py-8">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 md:gap-6 gap-4">
                <JobBoard />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
