import type { JobStatusEvents } from "./tracker";

export interface User {
  name: string;
  email: string;
  skills: string[];
  saved: string[];
  applied: string[];
  interviewing: string[];
  rejected: string[];
  hidden: string[];
  /** Full status history per job id; absent on profiles saved before it existed. */
  jobEvents?: JobStatusEvents;
}

export type JobStatus = "saved" | "applied" | "interviewing" | "rejected" | "hidden";
