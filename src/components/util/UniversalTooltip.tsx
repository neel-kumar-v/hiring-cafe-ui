import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	Tooltip as TooltipAnimated,
	TooltipContent as TooltipAnimatedContent,
	TooltipTrigger as TooltipAnimatedTrigger,
} from "@/components/ui/tooltip-animated";
import { useReducedMotion } from "@/contexts/ReducedMotionContext";
import type { ReactElement } from "react";

interface UniversalTooltipProps {
	content: string;
	children: ReactElement;
	side?: 'top' | 'bottom' | 'left' | 'right';
	sideOffset?: number;
	align?: 'start' | 'center' | 'end';
	alignOffset?: number;
	arrow?: boolean;
	blur?: boolean;
}

export default function UniversalTooltip({
	content,
	children,
	side = 'top',
	sideOffset = 14,
	align = 'center',
	alignOffset = 0,
	arrow = false,
	blur = true,
}: UniversalTooltipProps) {
	const { prefersReducedMotion } = useReducedMotion();

	if (prefersReducedMotion) {
		return (
			<Tooltip>
				<TooltipTrigger asChild>{children}</TooltipTrigger>
				<TooltipContent sideOffset={sideOffset} alignOffset={alignOffset} blur={blur}>
					<p>{content}</p>
				</TooltipContent>
			</Tooltip>
		);
	}

	return (
		<TooltipAnimated
			side={side}
			sideOffset={sideOffset}
			align={align}
			alignOffset={alignOffset}
		>
			<TooltipAnimatedTrigger>{children}</TooltipAnimatedTrigger>
			<TooltipAnimatedContent arrow={arrow} blur={blur}>
				<p>{content}</p>
			</TooltipAnimatedContent>
		</TooltipAnimated>
	);
}
