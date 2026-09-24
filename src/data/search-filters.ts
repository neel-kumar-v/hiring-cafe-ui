import { CategoryType, SettingsCategory } from "@/types/search";

const filterGroupOrder: Array<{ name: string; type: CategoryType }> = [
  { name: "General", type: "general" },
  { name: "Compensation & Levels", type: "compensation" },
  { name: "Location", type: "location" },
  { name: "Role & Department", type: "role-department" },
  { name: "Qualifications", type: "qualifications" },
  { name: "Availability", type: "availability" },
  { name: "Company", type: "company" },
];

const ribbonExcludedIds = new Set([
  "filters",
  "saved",
  "date-range",
  "sorting",
  "apply-form",
  "location",
  "workplace-activity",
]);

const locationTags = ["Location", "Workplace Type", "Options"];

const compensationLevelsTags = ["Salary", "Commitment", "Experience", "Benefits & Perks"];

const roleDepartmentTags = ["Departments", "Job Titles & Keywords"];

const qualificationsTags = ["Education", "Licenses & Certifications", "Security Clearance", "Languages"];

const availabilityTags = ["Shifts & Schedules", "Travel Requirement"];

const miscellaneousTags = ["Encouraged to Apply"];

const companyTags = ["Company", "Industry", "Stage & Funding", "Size", "Founding Year"];

const filters: SettingsCategory[] = [
  // General categories
  { id: "filters", name: "Current Filters", type: "general" },
  { id: "saved", name: "Saved Searches", type: "general" },
  { id: "date-range", name: "Date Range", type: "general" },
  { id: "sorting", name: "Sorting", type: "general" },
  { id: "apply-form", name: "Apply Form Type", type: "general" },
  { id: "exclusion", name: "Exclusion", type: "general" },
  { id: "activity-outcomes", name: "Activity & Outcomes", type: "general" },
  { id: "encouraged", name: "Encouraged to Apply", type: "general" },

  // Compensation Levels
  { id: "salary", name: "Salary", type: "compensation" },
  { id: "commitment", name: "Commitment", type: "compensation" },
  { id: "experience", name: "Experience", type: "compensation" },
  { id: "benefits", name: "Benefits & Perks", type: "compensation" },

  // Role & Department
  { id: "departments", name: "Departments", type: "role-department" },
  { id: "job-titles", name: "Job Titles & Keywords", type: "role-department" },

  // Qualifications
  { id: "education", name: "Education", type: "qualifications" },
  { id: "licenses", name: "Licenses & Certifications", type: "qualifications" },
  { id: "security", name: "Security Clearance", type: "qualifications" },
  { id: "languages", name: "Languages", type: "qualifications" },

  // Availability
  { id: "shifts", name: "Shifts & Schedules", type: "availability" },
  { id: "travel", name: "Travel Requirement", type: "availability" },

  // Location
  { id: "location", name: "Location", type: "location" },
  { id: "workplace-activity", name: "Workplace Activity", type: "location" },

  // Company
  { id: "company", name: "Company", type: "company" },
  { id: "industry", name: "Industry", type: "company" },
  { id: "stage", name: "Stage & Funding", type: "company" },
  { id: "size", name: "Size", type: "company" },
  { id: "founding", name: "Founding Year", type: "company" },
];

const orderedFilterIds = filterGroupOrder.flatMap(({ type }) => filters.filter((filter) => filter.type === type).map((filter) => filter.id));

const ribbonFilters: SettingsCategory[] = [];
for (const id of orderedFilterIds) {
  if (ribbonExcludedIds.has(id)) continue;
  const filter = filters.find((item) => item.id === id);
  if (filter) ribbonFilters.push(filter);
}

const legacyFilterTags = ribbonFilters.filter((filter) => filter.type !== "company").map((filter) => filter.name);

export {
  availabilityTags,
  companyTags,
  compensationLevelsTags,
  filterGroupOrder,
  filters,
  legacyFilterTags,
  locationTags,
  miscellaneousTags,
  orderedFilterIds,
  qualificationsTags,
  roleDepartmentTags,
};
