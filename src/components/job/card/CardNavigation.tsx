import { ChevronLeft, ChevronRight } from "lucide-react";
import type React from "react";
import { Hitbox } from "@/components/ui/hitbox";

const CardNavigation = ({
  currentJobIndex,
  totalJobs,
  onPrevious,
  onNext,
  onJobSelect,
  onPreviousHover,
  onNextHover,
  onJobHover,
}: {
  currentJobIndex: number;
  totalJobs: number;
  onPrevious: () => void;
  onNext: () => void;
  onJobSelect: (index: number) => void;
  onPreviousHover?: () => void;
  onNextHover?: () => void;
  onJobHover?: (index: number) => void;
}) => {
  const handleGeneralClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const container = e.currentTarget;
    const dots = Array.from(container.querySelectorAll("[data-dot-index]")) as HTMLElement[];
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
        const dist = Math.hypot(rect.left + rect.width / 2 - clickX, rect.top + rect.height / 2 - clickY);
        return dist < min.dist ? { target, dist } : min;
      },
      { target: null as Target | null, dist: Number.POSITIVE_INFINITY }
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
    <div className="flex cursor-pointer items-center justify-center space-x-1 px-2">
      <Hitbox size="12px" radius="full">
        <div
          className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full p-0 text-muted-foreground transition-all duration-200 ease-in-out hover:bg-secondary hover:text-foreground"
          data-nav="left"
          onClick={handleLeftClick}
          onMouseEnter={onPreviousHover}
        >
          <ChevronLeft className="size-3" />
        </div>
      </Hitbox>

      <Hitbox size="14px" position="vertical">
        <div className="flex h-6 items-center space-x-1" onClick={handleGeneralClick}>
          {Array.from({ length: totalJobs }).map((_, jobIndex) => (
            <Hitbox key={jobIndex} size="10px" radius="full">
              <div
                className={`h-1.5 w-1.5 cursor-pointer rounded-full transition-all duration-400 ease-out ${jobIndex === currentJobIndex ? "bg-primary" : "bg-border"}`}
                data-dot-index={jobIndex}
                onMouseEnter={() => onJobHover?.(jobIndex)}
              />
            </Hitbox>
          ))}
        </div>
      </Hitbox>

      <Hitbox size="12px" radius="full">
        <div
          className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full p-0 text-muted-foreground transition-all duration-200 ease-in-out hover:bg-secondary hover:text-foreground"
          data-nav="right"
          onClick={handleRightClick}
          onMouseEnter={onNextHover}
        >
          <ChevronRight className="size-3" />
        </div>
      </Hitbox>
    </div>
  );
};

export default CardNavigation;
