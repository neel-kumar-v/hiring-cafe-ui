import type { Job } from "@/types/job";

/**
 * Convex `jobs.raw` and scraped JSON may use legacy top-level keys. Normalize to
 * `processed_job_data` / `processed_company_data` for app code.
 */
export function normalizeJob(raw: unknown): Job {
	if (!raw || typeof raw !== "object") {
		throw new Error("normalizeJob: expected a job object");
	}

	const o = { ...(raw as Record<string, unknown>) };

	if (!("processed_job_data" in o) && "v5_processed_job_data" in o) {
		o.processed_job_data = o.v5_processed_job_data;
	}
	if ("v5_processed_job_data" in o) {
		delete o.v5_processed_job_data;
	}

	if (!("processed_company_data" in o) && "v5_processed_company_data" in o) {
		o.processed_company_data = o.v5_processed_company_data;
	}
	if ("v5_processed_company_data" in o) {
		delete o.v5_processed_company_data;
	}

	return o as unknown as Job;
}
