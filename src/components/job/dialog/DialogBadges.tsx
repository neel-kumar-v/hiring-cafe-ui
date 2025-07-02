import { DollarSign, MapPin } from "lucide-react";
import React from "react";
import {
	MorphingCommitments,
	MorphingLocation,
	MorphingSalary,
	MorphingWorkType,
} from "@/components/ui/morphing-dialog";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { getCompensation, getLocations } from "@/lib/utils";
import type { CompensationRange } from "@/types/jobs";

const DialogBadges = ({
	workplaceCities,
	workType,
	commitments,
	compensation,
	compact = false,
}: {
	workplaceCities: string[];
	workType: string;
	commitments: string[];
	compensation: CompensationRange;
	compact?: boolean;
}) => {
	const isDesktop = useMediaQuery("(min-width: 640px)");
	return (
		<div className={compact ? "" : "mb-6"}>
			<div className={`flex flex-wrap ${compact ? "gap-1" : "gap-3"}`}>
				{isDesktop ? (
					<MorphingLocation className="flex flex-row flex-wrap items-center gap-2">
						{getLocations(workplaceCities).map((loc, index) => (
							<span
								className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300"
								key={index}
							>
								<MapPin className="h-4 w-4" />
								{loc}
							</span>
						))}
					</MorphingLocation>
				) : (
					getLocations(workplaceCities).map((loc, index) => (
						<span
							className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300"
							key={index}
						>
							<MapPin className="h-4 w-4" />
							{loc}
						</span>
					))
				)}
				{isDesktop ? (
					<MorphingCommitments className="flex flex-row flex-wrap items-center gap-2">
						{commitments.map((commitment, index) => (
							<span
								className="rounded-lg bg-gray-100 px-3 py-2 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300"
								key={index}
							>
								{commitment}
							</span>
						))}
					</MorphingCommitments>
				) : (
					commitments.map((commitment, index) => (
						<span
							className="rounded-lg bg-gray-100 px-3 py-2 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300"
							key={index}
						>
							{commitment}
						</span>
					))
				)}
				{isDesktop ? (
					<MorphingWorkType className="rounded-lg bg-gray-100 px-3 py-2 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300">
						{workType}
					</MorphingWorkType>
				) : (
					<span className="rounded-lg bg-gray-100 px-3 py-2 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300">
						{workType}
					</span>
				)}
				{getCompensation(compensation) &&
					(isDesktop ? (
						<MorphingSalary>
							<span className="flex items-center gap-2 rounded-lg bg-pink-400/75 px-3 py-2 text-black dark:bg-gray-700/75 dark:text-pink-500/85">
								<DollarSign className="h-4 w-4" />
								{getCompensation(compensation)}
							</span>
						</MorphingSalary>
					) : (
						<span className="flex items-center gap-2 rounded-lg bg-pink-400/75 px-3 py-2 text-black dark:bg-gray-700/75 dark:text-pink-500/85">
							<DollarSign className="h-4 w-4" />
							{getCompensation(compensation)}
						</span>
					))}
			</div>
		</div>
	);
};

export default DialogBadges;
