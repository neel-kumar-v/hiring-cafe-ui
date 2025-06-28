"use client";

import JobBoardCards from "@/components/JobBoardCard";
import SortPopover from "@/components/SortPopover";
import DateRangePopover from "@/components/DateRangePopover";
import ApplyFormSelect from "@/components/ApplyFormSelect";
import Header from "@/components/Header";
import Filters from "@/components/Filters";
import { useState } from "react";

export default function Page() {
  const [jobCount, setJobCount] = useState(2057770);
  const [companyCount, setCompanyCount] = useState(72936);
  const [location, setLocation] = useState("United States");

  const formatNumber = (number: number, round: number = 3) => {
    return (Math.round(number / 10 ** round) * 10 ** round).toLocaleString();
  };

  return (
    <div>
      <div className="min-h-screen transition-all duration-300">
        <div className="bg-white dark:bg-gray-900 min-h-screen">
          {/* Header */}
          <Header />

          {/* Filter Tags */}
          {/* <Filters /> */}

          <div className="overflow-scroll overflow-x-hidden h-full">
            {/* <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap items-center space-x-4">
                  <SortPopover />
                  <DateRangePopover />
                  <ApplyFormSelect />
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                About {formatNumber(jobCount, 3)} jobs from {formatNumber(companyCount, 3)} companies in {location}
              </div>
            </div> */}
            <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6 py-8">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 md:gap-6 gap-4">
                <JobBoardCards />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
