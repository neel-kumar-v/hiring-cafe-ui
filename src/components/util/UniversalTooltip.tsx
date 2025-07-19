import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ReactElement } from "react";

interface UniversalTooltipProps {
	content: string;
	children: ReactElement;
	side?: 'top' | 'bottom' | 'left' | 'right';
	sideOffset?: number;
	align?: 'start' | 'center' | 'end';
	alignOffset?: number;
	arrow?: boolean;
}

export default function UniversalTooltip({
	content,
	children,
	side = 'top',
	sideOffset = 14,
	align = 'center',
	alignOffset = 0,
	arrow = true,
}: UniversalTooltipProps) {
	return (
		<Tooltip
			side={side}
			sideOffset={sideOffset}
			align={align}
			alignOffset={alignOffset}
		>
			<TooltipTrigger>{children}</TooltipTrigger>
			<TooltipContent arrow={arrow}>
				<p>{content}</p>
			</TooltipContent>
		</Tooltip>
	);
}
