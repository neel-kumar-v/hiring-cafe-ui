export type JobStatus = "saved" | "applied" | "interviewing" | "rejected" | "hidden";

export interface JobTransition {
  jobId: string;
  from?: JobStatus;
  to?: JobStatus;
  at: number;
}

export interface User {
  name: string;
  email: string;
  skills: string[];
  saved: string[];
  applied: string[];
  interviewing: string[];
  rejected: string[];
  hidden: string[];
  jobTransitions: JobTransition[];
}
