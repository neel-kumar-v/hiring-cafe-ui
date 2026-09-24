/**
 * Empty-query suggestions are intentionally small.
 *
 * The complete job-title seed is used by the backend autocomplete pipeline.
 * Shipping that source file to the browser just to display these first few
 * suggestions adds more than a megabyte to the client bundle.
 */
export const POPULAR_JOB_SEARCHES = [
  "Software Engineer",
  "Product Manager",
  "Data Analyst",
  "Project Manager",
  "Marketing Manager",
  "Sales Representative",
  "Customer Success Manager",
  "UX Designer",
  "Financial Analyst",
  "Operations Manager",
  "Account Executive",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Scientist",
  "Recruiter",
  "Business Analyst",
  "Nurse",
  "Teacher",
  "Administrative Assistant",
] as const;
