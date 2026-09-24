import { jobFadeClass } from "@/lib/jobs/fadeTransition";
import { cn } from "@/lib/utils";
import type React from "react";
import UniversalTooltip from "../../util/UniversalTooltip";

const StatIcon = ({
  icon: Icon,
  count,
  tooltipText,
  iconClassName = "w-3 h-3",
  textClassName = "text-sm",
  isTransitioning = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  count: number;
  tooltipText: string;
  iconClassName?: string;
  textClassName?: string;
  isTransitioning?: boolean;
}) => {
  return (
    <UniversalTooltip content={tooltipText} side="bottom">
      <span className="flex max-w-[8ch] items-center space-x-1 overflow-hidden transition-[max-width,opacity,margin] duration-300 ease-out group-hover:max-w-0 group-hover:opacity-0 group-hover:-mr-1.5">
        <Icon className={cn("inline text-muted-foreground", iconClassName)} />
        <span className={cn(textClassName, jobFadeClass(isTransitioning))}>{count}</span>
      </span>
    </UniversalTooltip>
  );
};

export default StatIcon;
