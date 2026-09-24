export interface User {
  name: string;
  email: string;
  skills: string[];
  saved: string[];
  applied: string[];
  interviewing: string[];
  rejected: string[];
  hidden: string[];
}

export type JobStatus = "saved" | "applied" | "interviewing" | "rejected" | "hidden";
