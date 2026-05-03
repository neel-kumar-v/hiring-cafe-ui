import type { JobDTO } from "@/types/convexJobs";

/**
 * Board rows can come from `jobs` or `jobCards`.
 * `jobCards` rows carry `jobId` pointing to canonical `jobs` doc.
 */
export function getDetailsLookupId(job: JobDTO): string {
  return job.jobId ?? job._id;
}
