"use client";

import { useState } from "react";
import JobBoardCards from "@/components/job-board-card";
import { Moon, Search, Sun } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";
import SortPopover from "@/components/SortPopover";
import DateRangePopover from "@/components/DateRangePopover";
import ApplyFormSelect from "@/components/ApplyFormSelect";

const filterTags = [
  "Departments",
  "Salary",
  "Commitment",
  "Experience",
  "Job Titles & Keywords",
  "Education",
  "Licenses & Certifications",
  "Security Clearance",
  "Languages",
  "Shifts & Schedules",
  "Travel Requirement",
  "Benefits & Perks",
  "Encouraged to Apply",
];

const companyTags = [
  "Company",
  "Industry",
  "Stage & Funding",
  "Size",
  "Founding Year",
];

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
          <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6">
              <div className="flex items-center justify-between h-16">
                {/* Logo */}
                <div className="flex items-center space-x-3">
                  <div className="w-fit text-white bg-pink-500 rounded-full p-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      aria-hidden="true"
                      data-slot="icon"
                      className="h-5 w-5 flex-none"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"
                      ></path>
                    </svg>
                  </div>
                </div>

                {/* Search Bars */}
                <div className="flex-1 mx-8">
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search"
                        className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Side */}
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="border-gray-200 dark:border-gray-600"
                  >
                    {isDarkMode ? (
                      <Sun className="w-4 h-4 stroke-[1.5px] text-gray-600 dark:text-gray-300" />
                    ) : (
                      <Moon className="w-4 h-4 stroke-[1.5px] text-gray-600 dark:text-gray-300" />
                    )}
                  </Button>
                  <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Filter Tags */}
          <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6 py-4">
              <div className="flex flex-wrap gap-2">
                {filterTags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-300 cursor-pointer"
                  >
                    {tag}
                  </Badge>
                ))}
                <span className="text-gray-500/25 dark:text-gray-400/25 -translate-y-0.5">
                  •
                </span>
                {companyTags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-orange-100 dark:bg-orange-900 border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-800 transition-all duration-300 cursor-pointer"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

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
