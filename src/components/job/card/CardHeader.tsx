import { DollarSign, MapPin } from "lucide-react";
import React from "react";
import {
	MorphingCommitments,
	MorphingJobTitle,
	MorphingLocation,
	MorphingSalary,
	MorphingTime,
	MorphingWorkType,
} from "@/components/ui/morphing-dialog";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { getCleanJobTitle, getCompensation, getLocations } from "@/lib/utils";
import type { CompensationRange } from "@/types/jobs";
import ScrapeTime from "../util/ScrapeTime";

const CardHeader = ({
	jobTitle,
	companyName,
	workplaceCities,
	commitments,
	workType,
	compensation,
	postedAt,
}: {
	jobTitle: string;
	companyName: string;
	workplaceCities: string[];
	commitments: string[];
	workType: string;
	compensation: CompensationRange;
	postedAt: string;
}) => {
	const isDesktop = useMediaQuery("(min-width: 640px)");
	// For getCleanJobTitle, we'll use the first city or an empty string
	const locationForTitle = workplaceCities.length > 0 ? workplaceCities[0] : "";

	return (
		<div className="mb-4">
			<div className="flex flex-row items-center justify-between">
				{isDesktop ? (
					<>
						<MorphingJobTitle className="mb-2 line-clamp-2 flex-1 font-semibold text-gray-900 text-lg dark:text-white">
							{getCleanJobTitle(jobTitle, companyName, locationForTitle)}
						</MorphingJobTitle>
						<MorphingTime className="-translate-y-0.5 flex items-center space-x-1">
							<ScrapeTime postedAt={postedAt} />
						</MorphingTime>
					</>
				) : (
					<>
						<div className="mb-2 line-clamp-2 font-semibold text-gray-900 text-lg dark:text-white">
							{getCleanJobTitle(jobTitle, companyName, locationForTitle)}
						</div>
						<div className="-translate-y-3 flex items-center space-x-1">
							<ScrapeTime postedAt={postedAt} />
						</div>
					</>
				)}
			</div>
			<span className="mb-2 flex flex-wrap items-center gap-1 text-gray-600 text-xs dark:text-gray-400">
				{workplaceCities.length > 0 &&
					(isDesktop ? (
						<MorphingLocation className="flex flex-row flex-wrap items-center gap-1">
							{getLocations(workplaceCities)
								.slice(0, 4)
								.map((loc, index) => (
									<span
										className="flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-gray-700 text-xs dark:bg-gray-700/50 dark:text-gray-300"
										key={index}
									>
										<MapPin className="h-3 w-3" />
										{loc}
									</span>
								))}
						</MorphingLocation>
					) : (
						getLocations(workplaceCities)
							.slice(0, 4)
							.map((loc, index) => (
								<span
									className="flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-gray-700 text-xs dark:bg-gray-700/50 dark:text-gray-300"
									key={index}
								>
									<MapPin className="h-3 w-3" />
									{loc}
								</span>
							))
					))}
				{isDesktop ? (
					<MorphingCommitments className="flex flex-row flex-wrap items-center gap-1">
						{commitments.map((commitment, index) => (
							<span
								className="rounded-md bg-gray-100 px-2 py-0.5 text-gray-700 text-xs dark:bg-gray-700/50 dark:text-gray-300"
								key={index}
							>
								{commitment}
							</span>
						))}
					</MorphingCommitments>
				) : (
					commitments.map((commitment, index) => (
						<span
							className="rounded-md bg-gray-100 px-2 py-0.5 text-gray-700 text-xs dark:bg-gray-700/50 dark:text-gray-300"
							key={index}
						>
							{commitment}
						</span>
					))
				)}
				{isDesktop ? (
					<MorphingWorkType>
						<span className="rounded-md bg-gray-100 px-2 py-0.5 text-gray-700 text-xs dark:bg-gray-700/50 dark:text-gray-300">
							{workType}
						</span>
					</MorphingWorkType>
				) : (
					<span className="rounded-md bg-gray-100 px-2 py-0.5 text-gray-700 text-xs dark:bg-gray-700/50 dark:text-gray-300">
						{workType}
					</span>
				)}
				{getCompensation(compensation) &&
					(isDesktop ? (
						<MorphingSalary>
							<span className="flex items-center gap-1 rounded-md bg-pink-400/75 px-2 py-0.5 text-black text-xs dark:bg-gray-700/75 dark:text-pink-500/85">
								<DollarSign className="h-3 w-3" />
								{getCompensation(compensation)}
							</span>
						</MorphingSalary>
					) : (
						<span className="flex items-center gap-1 rounded-md bg-pink-400/75 px-2 py-0.5 text-black text-xs dark:bg-gray-700/75 dark:text-pink-500/85">
							<DollarSign className="h-3 w-3" />
							{getCompensation(compensation)}
						</span>
					))}
			</span>
		</div>
	);
};

export default CardHeader;
