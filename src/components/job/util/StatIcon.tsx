import { cn } from "@/lib/utils";
import type React from "react";
import UniversalTooltip from "../../util/UniversalTooltip";

const StatIcon = ({
  icon: Icon,
  count,
  tooltipText,
  iconClassName = "w-3 h-3",
  textClassName = "text-sm",
}: {
  icon: React.ComponentType<{ className?: string }>;
  count: number;
  tooltipText: string;
  iconClassName?: string;
  textClassName?: string;
}) => {
  return (
    <UniversalTooltip content={tooltipText} side="bottom">
      <span className="flex items-center space-x-1">
        <Icon
          className={cn(
            "inline text-muted-foreground",
            iconClassName
          )}
        />
        <span className={textClassName}>{count}</span>
      </span>
    </UniversalTooltip>
  );
};

export default StatIcon;
