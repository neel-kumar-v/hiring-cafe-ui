import React from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const StatIcon = ({
  icon: Icon,
  count,
  tooltipText,
  iconClassName="w-3 h-3",
  textClassName="text-sm",
}: {
  icon: React.ComponentType<{ className?: string }>;
  count: number;
  tooltipText: string;
  iconClassName?: string;
  textClassName?: string;
}) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="flex items-center space-x-1">
          <Icon className={cn("inline text-gray-500 dark:text-gray-400", iconClassName)} />
          <span className={textClassName}>{count}</span>
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltipText}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default StatIcon; 