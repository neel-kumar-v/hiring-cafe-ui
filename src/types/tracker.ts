export type JobCategory = "saved" | "applied" | "interviewing" | "rejected" | "hidden";

/**
 * One entry in a job's status history. `at` is an epoch-ms timestamp of the
 * move, `from` the status the job left (null for the first event).
 */
export interface JobStatusEvent {
  status: JobCategory;
  at: number;
  from: JobCategory | null;
}

/** Full status history per job external id. */
export type JobStatusEvents = Record<string, JobStatusEvent[]>;
