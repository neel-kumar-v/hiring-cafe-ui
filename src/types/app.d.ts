export interface SavedSearch {
  id: string;
  name: string;
  searchState: import("./search").SearchState;
  modifiedAt: Date;
}

export interface User {
  name: string;
  email: string;
  skills: string[];
  savedSearches: SavedSearch[];
  saved: string[];
  applied: string[];
  interviewing: string[];
  rejected: string[];
  hidden: string[];
}

export type JobStatus = "saved" | "applied" | "interviewing" | "rejected" | "hidden";