import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CardNavigation = ({
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
  const handleGeneralClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const container = e.currentTarget;
    const dots = Array.from(
      container.querySelectorAll("[data-dot-index]")
    ) as HTMLElement[];
    const clickX = e.clientX;
    const clickY = e.clientY;

    type Target = {
      el: HTMLElement;
      index?: number;
    };
    const targets: Target[] = [
      ...dots.map((dot) => ({
        el: dot,
        type: "dot" as const,
        index: Number(dot.dataset.dotIndex),
      })),
    ];

    const closest = targets.reduce(
      (min, target) => {
        const rect = target.el.getBoundingClientRect();
        const dist = Math.hypot(
          rect.left + rect.width / 2 - clickX,
          rect.top + rect.height / 2 - clickY
        );
        return dist < min.dist ? { target, dist } : min;
      },
      { target: null as Target | null, dist: Infinity }
    );

    if (!closest.target || typeof closest.target.index !== "number") return;
    onJobSelect(closest.target.index);
  };

  const handleLeftClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onPrevious();
  };

  const handleRightClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onNext();
  };

  return (
    <div className="flex items-center justify-center space-x-1 cursor-pointer px-2">
      {/* Left Chevron */}
      <div
        data-nav="left"
        className={`text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full h-6 w-6 p-0 cursor-pointer transition-all duration-200 ease-in-out
          ${totalJobs <= 1 ||
            (totalJobs === 2 && currentJobIndex === 1) ||
            (totalJobs === 2 && currentJobIndex === 2)
            ? ''
            : 'invisible'}
          ${(totalJobs === 2 && currentJobIndex === 2) ? '' : (totalJobs === 2 && currentJobIndex === 1) ? 'invisible' : ''}
        `}
        onClick={handleLeftClick}
        style={{
          visibility:
            totalJobs <= 1
              ? "hidden"
              : totalJobs === 2
                ? currentJobIndex === 2
                  ? "visible"
                  : "hidden"
                : "visible"
        }}
      >
        <ChevronLeft className="w-3 h-3" />
      </div>

      {/* Dots */}
      <div
        className="flex space-x-1 h-6 items-center"
        onClick={handleGeneralClick}
      >
        {Array.from({ length: totalJobs }).map((_, jobIndex) => (
          <div
            key={jobIndex}
            data-dot-index={jobIndex}
            className={`w-1.5 h-1.5 rounded-full cursor-pointer transition-all duration-400 ease-out ${
              jobIndex === currentJobIndex
                ? "bg-pink-500"
                : "bg-gray-300 dark:bg-gray-600"
            }`}
          />
        ))}
      </div>

      {/* Right Chevron */}
      <div
        data-nav="right"
        className={`text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full h-6 w-6 p-0 cursor-pointer transition-all duration-200 ease-in-out
          ${totalJobs <= 1 ||
            (totalJobs === 2 && currentJobIndex === 1) ||
            (totalJobs === 2 && currentJobIndex === 2)
            ? ''
            : 'invisible'}
          ${(totalJobs === 2 && currentJobIndex === 1) ? '' : (totalJobs === 2 && currentJobIndex === 2) ? 'invisible' : ''}
        `}
        onClick={handleRightClick}
        style={{
          visibility:
            totalJobs <= 1
              ? "hidden"
              : totalJobs === 2
                ? currentJobIndex === 1
                  ? "visible"
                  : "hidden"
                : "visible"
        }}
      >
        <ChevronRight className="w-3 h-3" />
      </div>
    </div>
  );
};

export default CardNavigation;
