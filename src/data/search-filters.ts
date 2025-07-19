import { SettingsCategory } from "@/types/search";

const legacyFilterTags = [
  "Departments",
  "Salary",
  "Commitment",
  "Experience",
  "Job Titles & Keywords",
  "Education",
  "Licenses & Certifications",
  "Security Clearance",
  "Languages",
  "Shifts & Schedules",
  "Travel Requirement",
  "Benefits & Perks",
  "Encouraged to Apply",
];

const locationTags = ["Location", "Workplace Type", "Options"];

const compensationLevelsTags = [
  "Salary",
  "Commitment",
  "Experience",
  "Benefits & Perks",
];

const roleDepartmentTags = ["Departments", "Job Titles & Keywords"];

const qualificationsTags = [
  "Education",
  "Licenses & Certifications",
  "Security Clearance",
  "Languages",
];

const availabilityTags = ["Shifts & Schedules", "Travel Requirement"];

const miscellaneousTags = ["Encouraged to Apply"];

const companyTags = [
  "Company",
  "Industry",
  "Stage & Funding",
  "Size",
  "Founding Year",
];

const settingsCategories: SettingsCategory[] = [
  // General categories
  { id: "filters", name: "Current Filters", type: "general", },
  { id: "saved", name: "Saved Searches", type: "general", },
  { id: "date-range", name: "Date Range", type: "general", },
  { id: "sorting", name: "Sorting", type: "general", },
  { id: "apply-form", name: "Apply Form Type", type: "general", },
  { id: "exclusion", name: "Exclusion", type: "general", },
  { id: "encouraged", name: "Encouraged to Apply", type: "general", },
  
  // Compensation Levels
  { id: "salary", name: "Salary", type: "compensation", },
  { id: "commitment", name: "Commitment", type: "compensation", },
  { id: "experience", name: "Experience", type: "compensation", },
  { id: "benefits", name: "Benefits & Perks", type: "compensation", },

  // Role & Department
  { id: "departments", name: "Departments", type: "role-department", },
  { id: "job-titles", name: "Job Titles & Keywords", type: "role-department", },
  
  // Qualifications
  { id: "education", name: "Education", type: "qualifications", },
  { id: "licenses", name: "Licenses & Certifications", type: "qualifications", },
  { id: "security", name: "Security Clearance", type: "qualifications", },
  { id: "languages", name: "Languages", type: "qualifications", },
  
  // Availability
  { id: "shifts", name: "Shifts & Schedules", type: "availability", },
  { id: "travel", name: "Travel Requirement", type: "availability", },
  
  // Location
  { id: "location", name: "Location", type: "location", },
  { id: "workplace-type", name: "Workplace Type", type: "location", },
  { id: "options", name: "Options", type: "location", },

  // Company
  { id: "company", name: "Company", type: "company", },
  { id: "industry", name: "Industry", type: "company", },
  { id: "stage", name: "Stage & Funding", type: "company", },
  { id: "size", name: "Size", type: "company", },
  { id: "founding", name: "Founding Year", type: "company", },
];

export {
  availabilityTags, companyTags,
  compensationLevelsTags,
  legacyFilterTags, locationTags, miscellaneousTags,
  qualificationsTags,
  roleDepartmentTags,
  settingsCategories
};

