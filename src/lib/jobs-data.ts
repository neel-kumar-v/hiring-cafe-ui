import { normalizeJob } from "@/lib/jobs/normalizeJob";

/** Shape of scraped / API jobs payload (not bundled; parsed from disk or fetch). */
export type JobsPayload = {
  jobs?: Array<Record<string, unknown>>;
  results?: Array<Record<string, unknown>>;
  metadata?: unknown;
};

export function extractJobTitlesFromPayload(data: JobsPayload): string[] {
  const arr = data.jobs ?? data.results ?? [];
  const titles = new Set<string>();
  for (const raw of arr) {
    try {
      const job = normalizeJob(raw);
      const title = job.processed_job_data?.core_job_title ?? job.job_information?.title;
      if (typeof title === "string" && title) titles.add(title);
    } catch {
      continue;
    }
  }
  return Array.from(titles);
}
