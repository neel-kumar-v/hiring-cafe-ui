export interface SettingsCategory {
  id: string;
  name: string;
  type: "other" | "filter" | "company";
}

export const settingsCategories: SettingsCategory[] = [
  { id: "filters", name: "Current Filters", type: "other" },
  { id: "apply-form", name: "Apply Form Type", type: "other" },
  { id: "date-range", name: "Date Range", type: "other" },
  { id: "sorting", name: "Sorting", type: "other" },
  { id: "saved", name: "Saved Searches", type: "other" },
  // Job Filters
  { id: "departments", name: "Departments", type: "filter" },
  { id: "salary", name: "Salary", type: "filter" },
  { id: "commitment", name: "Commitment", type: "filter" },
  { id: "experience", name: "Experience", type: "filter" },
  { id: "job-titles", name: "Job Titles & Keywords", type: "filter" },
  { id: "education", name: "Education", type: "filter" },
  { id: "licenses", name: "Licenses & Certifications", type: "filter" },
  { id: "security", name: "Security Clearance", type: "filter" },
  { id: "languages", name: "Languages", type: "filter" },
  { id: "shifts", name: "Shifts & Schedules", type: "filter" },
  { id: "travel", name: "Travel Requirement", type: "filter" },
  { id: "benefits", name: "Benefits & Perks", type: "filter" },
  { id: "encouraged", name: "Encouraged to Apply", type: "filter" },
  { id: "location", name: "Location", type: "filter" },

  // Company Filters
  { id: "company", name: "Company", type: "company" },
  { id: "industry", name: "Industry", type: "company" },
  { id: "stage", name: "Stage & Funding", type: "company" },
  { id: "size", name: "Size", type: "company" },
  { id: "founding", name: "Founding Year", type: "company" },
];
