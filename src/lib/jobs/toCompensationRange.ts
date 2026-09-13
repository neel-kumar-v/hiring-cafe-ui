import type { CompensationRange } from "@/types/job";
import type { JobDTO } from "@/types/convexJobs";

export function toCompensationRange(job: JobDTO): CompensationRange {
  return {
    yearly_min_compensation: job.yearlyMinComp ?? null,
    yearly_max_compensation: job.yearlyMaxComp ?? null,
    monthly_min_compensation: job.monthlyMinComp ?? null,
    monthly_max_compensation: job.monthlyMaxComp ?? null,
    weekly_min_compensation: job.weeklyMinComp ?? null,
    weekly_max_compensation: job.weeklyMaxComp ?? null,
    hourly_min_compensation: job.hourlyMinComp ?? null,
    hourly_max_compensation: job.hourlyMaxComp ?? null,
    "bi-weekly_min_compensation": job.biWeeklyMinComp ?? null,
    "bi-weekly_max_compensation": job.biWeeklyMaxComp ?? null,
    daily_min_compensation: job.dailyMinComp ?? null,
    daily_max_compensation: job.dailyMaxComp ?? null,
  };
}
