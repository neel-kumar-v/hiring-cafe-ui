import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const StatIcon = ({
  icon: Icon,
  count,
  tooltipText,
}: {
  icon: React.ComponentType<{ className?: string }>;
  count: number;
  tooltipText: string;
}) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="flex items-center space-x-1">
          <Icon className="w-3 h-3 inline text-gray-500 dark:text-gray-400" />
          <span>{count}</span>
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltipText}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default StatIcon;
