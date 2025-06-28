import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const JobNavigation = ({
  currentJobIndex,
  totalJobs,
  onPrevious,
  onNext,
  onJobSelect,
}: {
  currentJobIndex: number;
  totalJobs: number;
  onPrevious: () => void;
  onNext: () => void;
  onJobSelect: (index: number) => void;
}) => {
  return (
    <div className="flex items-center justify-center space-x-1">
      <Button
        variant="ghost"
        size="sm"
        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 h-6 w-6 p-0 cursor-pointer"
        onClick={onPrevious}
      >
        <ChevronLeft className="w-3 h-3" />
      </Button>

      <div className="flex space-x-1">
        {Array.from({ length: totalJobs }).map((_, jobIndex) => (
          <div
            key={jobIndex}
            className={`w-1.5 h-1.5 rounded-full cursor-pointer transition-all duration-400 ease-out ${
              jobIndex === currentJobIndex
                ? "bg-pink-500"
                : "bg-gray-300 dark:bg-gray-600"
            }`}
            onClick={() => onJobSelect(jobIndex)}
          />
        ))}
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 h-6 w-6 p-0 cursor-pointer"
        onClick={onNext}
      >
        <ChevronRight className="w-3 h-3" />
      </Button>
    </div>
  );
};

export default JobNavigation;
