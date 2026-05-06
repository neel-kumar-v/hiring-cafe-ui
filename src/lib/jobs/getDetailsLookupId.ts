import type { JobDTO } from "@/types/convexJobs";

/**
 * Always use the row's own id when fetching details.
 * For `jobCards`, this preserves fallback behavior in `jobs.getDetails`
 * when the canonical `jobs` document is stale or missing.
 */
export function getDetailsLookupId(job: JobDTO): string {
  return job._id;
}
