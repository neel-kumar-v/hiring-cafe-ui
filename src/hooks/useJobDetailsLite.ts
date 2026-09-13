import { getDetailsLookupId } from "@/lib/jobs/getDetailsLookupId";
import type { JobDTO, JobDetailsResultDTO } from "@/types/convexJobs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useJobDetailsLite(job: JobDTO, enabled: boolean): JobDetailsResultDTO | null | undefined {
  const lookupId = getDetailsLookupId(job);
  const result = useQuery(api.jobs.getDetailsLite, enabled ? { jobId: lookupId } : "skip");
  return result as JobDetailsResultDTO | null | undefined;
}
