import type React from "react";
import { getTimeSince } from "@/lib/utils";
import { MorphingJobStats, MorphingTime } from "../../ui/morphing-dialog";
import ScrapeTime from "../util/ScrapeTime";
import StatGroup from "../util/StatGroup";

const DialogStats = ({
	publishDate,
	viewedByUsers,
	savedFromUsers,
	appliedFromUsers,
	isBookmarked,
	isApplied,
	onBookmarkClick,
	onApplyClick,
}: {
	publishDate: string;
	viewedByUsers?: string[];
	savedFromUsers?: string[];
	appliedFromUsers?: string[];
	isBookmarked: boolean;
	isApplied: boolean;
	onBookmarkClick: (e: React.MouseEvent) => void;
	onApplyClick: (e: React.MouseEvent) => void;
}) => {
	const timeSince = getTimeSince(publishDate);
	if (!timeSince) return null;

	return (
		<div className="absolute top-8 left-8 flex items-center gap-3">
			<MorphingTime className="flex items-center gap-1 text-gray-500 text-sm dark:text-gray-400">
				<ScrapeTime
					iconClassName="w-4 h-4"
					postedAt={publishDate}
					textClassName="text-md"
				/>
			</MorphingTime>

			<MorphingJobStats className="flex items-center space-x-3 text-gray-500 text-xs dark:text-gray-400">
				<StatGroup
					appliedCount={appliedFromUsers?.length || 0}
					handleApplyClick={onApplyClick}
					handleBookmarkClick={onBookmarkClick}
					iconClassName="w-4 h-4"
					isApplied={isApplied}
					isBookmarked={isBookmarked}
					savedCount={savedFromUsers?.length || 0}
					textClassName="text-md"
					viewedCount={(viewedByUsers?.length || 0) + 1}
				/>
			</MorphingJobStats>
		</div>
	);
};

export default DialogStats;
