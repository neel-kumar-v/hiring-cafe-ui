import { Job, JobCollection } from "@/types/jobs";
import jobsData from "@/data/jobs_data.json";
import { useState, useEffect } from "react";
import JobBoardCard from "./job/JobBoardCard";

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
    return <div>Loading...</div>;
  }

  return (
    <>
      {jobCollections.map((collection) => (
        <JobBoardCard key={collection.board_token} jobCollection={collection} />
      ))}
    </>
  );
};

export default JobBoard;
