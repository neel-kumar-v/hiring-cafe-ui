import { getDetailsLookupId } from "@/lib/jobs/getDetailsLookupId";
import type { JobDTO, JobDetailsResultDTO } from "@/types/convexJobs";
import { useConvexQuery } from "@/hooks/use-convex-query";
import { api } from "../../convex/_generated/api";

export function useJobDetailsLite(job: JobDTO, enabled: boolean): JobDetailsResultDTO | null | undefined {
  const lookupId = getDetailsLookupId(job);
  const result = useConvexQuery(api.jobs.getDetailsLite, enabled ? { jobId: lookupId } : "skip");
  return result as JobDetailsResultDTO | null | undefined;
}
