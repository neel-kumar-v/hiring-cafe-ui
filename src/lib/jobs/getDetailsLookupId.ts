import type { JobDTO } from "@/types/convexJobs";
import type { Id } from "../../../convex/_generated/dataModel";

export type JobDetailsLookupId = Id<"jobs"> | Id<"jobCards">;

/**
 * Always use the row's own id when fetching details.
 * For `jobCards`, this preserves fallback behavior in `jobs.getDetailsLite`
 * when the canonical `jobs` document is stale or missing.
 */
export function getDetailsLookupId(job: JobDTO): JobDetailsLookupId {
  return job._id as JobDetailsLookupId;
}
