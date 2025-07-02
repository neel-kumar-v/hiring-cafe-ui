import { useEffect, useState } from "react";
import jobsData from "@/data/jobs_data.json" with { type: "json" };
import type { Job, JobCollection } from "@/types/jobs";
import JobBoardCard from "./job/JobBoardCard";
import JobBoardCardSkeleton from "./job/JobBoardCardSkeleton";

const JobBoard = () => {
	const [jobCollections, setJobCollections] = useState<JobCollection[]>([]);

	useEffect(() => {
		const collections: JobCollection[] = [];

		for (const job of jobsData.results) {
			if (
				!collections.find(
					(collection) =>
						collection.source_and_board_token === job.source_and_board_token
				)
			) {
				collections.push({
					source_and_board_token: job.source_and_board_token,
					source: job.source,
					board_token: job.board_token,
					jobs: [],
				});
			}
			collections
				.find(
					(collection) =>
						collection.source_and_board_token === job.source_and_board_token
				)
				?.jobs.push({
					...job,
					currentJobIndex: 0,
				} as Job);
		}
		setJobCollections(collections);
	}, [setJobCollections]);

	if (jobCollections.length === 0) {
		return (
			<>
				{Array.from({ length: 12 }).map((_, index) => (
					<JobBoardCardSkeleton key={index} />
				))}
			</>
		);
	}

	return (
		<>
			{jobCollections.map((collection) => (
				<JobBoardCard jobCollection={collection} key={collection.board_token} />
			))}
		</>
	);
};

export default JobBoard;
