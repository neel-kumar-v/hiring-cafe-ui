import type { ReactNode } from "react";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";

interface UniversalTooltipProps {
	content: string;
	children: ReactNode;
}

export default function UniversalTooltip({
	content,
	children,
}: UniversalTooltipProps) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>{children}</TooltipTrigger>
			<TooltipContent>
				<p>{content}</p>
			</TooltipContent>
		</Tooltip>
	);
}
