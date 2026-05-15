import type { CompanyDTO, JobDTO } from "@/types/convexJobs";

/** Stable id for "same employer" comparisons (dialog transitions, etc.). */
export function stableCompanyKey(company: CompanyDTO | null | undefined, job?: JobDTO | null): string {
  const fromCompany = company?.companyId ?? company?._id;
  if (fromCompany) return String(fromCompany);
  const fromJob = job?.companyId;
  if (fromJob) return String(fromJob);
  return "";
}
