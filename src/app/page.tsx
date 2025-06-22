"use client";

import { useState } from "react";
import JobBoardCards from "@/components/JobBoardCard";
import SortPopover from "@/components/SortPopover";
import DateRangePopover from "@/components/DateRangePopover";
import ApplyFormSelect from "@/components/ApplyFormSelect";
import Header from "@/components/Header";
import Filters from "@/components/Filters";

export default function Page() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <div>
      <div
        className={`min-h-screen transition-all duration-300 ${
          isDarkMode ? "dark" : ""
        }`}
      >
        <div className="bg-white dark:bg-gray-900 min-h-screen">
          {/* Header */}
          <Header isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

          {/* Filter Tags */}
          <Filters />

          <div className="overflow-scroll overflow-x-hidden h-full">
            <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6 py-4">
              <div className="flex items-center justify-between">
                {/* Controls */}
                <div className="flex flex-wrap items-center space-x-4">
                  <SortPopover isDarkMode={isDarkMode} />
                  <DateRangePopover isDarkMode={isDarkMode} />
                  <ApplyFormSelect isDarkMode={isDarkMode} />
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                2,057,770 jobs • 72,936 companies • Latest jobs in United States
              </div>
            </div>
            <JobBoardCards />
          </div>
        </div>
      </div>
    </div>
  );
}
