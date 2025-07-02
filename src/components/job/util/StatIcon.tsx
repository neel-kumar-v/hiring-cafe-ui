import type React from "react";
import { cn } from "@/lib/utils";
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
		<UniversalTooltip content={tooltipText}>
			<span className="flex items-center space-x-1">
				<Icon
					className={cn(
						"inline text-gray-500 dark:text-gray-400",
						iconClassName
					)}
				/>
				<span className={textClassName}>{count}</span>
			</span>
		</UniversalTooltip>
	);
};

export default StatIcon;
