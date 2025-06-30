import React from "react";
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
  const handleGeneralClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const container = e.currentTarget;
    const dots = Array.from(container.querySelectorAll("[data-dot-index]")) as HTMLElement[];
    const left = container.querySelector('[data-nav="left"]') as HTMLElement | null;
    const right = container.querySelector('[data-nav="right"]') as HTMLElement | null;
    const clickX = e.clientX;
    const clickY = e.clientY;

    type Target = {
      el: HTMLElement;
      type: "dot" | "left" | "right";
      index?: number;
    };
    const targets: Target[] = [
      ...dots.map((dot) => ({
        el: dot,
        type: "dot" as const,
        index: Number(dot.dataset.dotIndex),
      })),
      ...(left ? [{ el: left, type: "left" as const }] : []),
      ...(right ? [{ el: right, type: "right" as const }] : []),
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

    if (closest.target) {
      if (closest.target.type === "dot" && typeof closest.target.index === "number") {
        onJobSelect(closest.target.index);
      } else if (closest.target.type === "left") {
        onPrevious();
      } else if (closest.target.type === "right") {
        onNext();
      }
    }
  };

  return (
    <div
      className="flex items-center justify-center space-x-1 cursor-pointer"
      onClick={handleGeneralClick}
    >
      <div
        data-nav="left"
        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full h-6 w-6 p-0 cursor-pointer transition-all duration-200 ease-in-out"
      >
        <ChevronLeft className="w-3 h-3" />
      </div>

      <div className="flex space-x-1">
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

      <div
        data-nav="right"
        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full h-6 w-6 p-0 cursor-pointer transition-all duration-200 ease-in-out"
      >
        <ChevronRight className="w-3 h-3" />
      </div>
    </div>
  );
};

export default JobNavigation;
