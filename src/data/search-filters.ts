import { CategoryType, SettingsCategory } from "@/types/search";

const filterGroupOrder: Array<{ name: string; type: CategoryType }> = [
  { name: "General", type: "general" },
  { name: "Compensation & Levels", type: "compensation" },
  { name: "Requirements", type: "qualifications" },
  { name: "Location", type: "location" },
  { name: "Role & Department", type: "role-department" },
  { name: "Availability", type: "availability" },
  { name: "Company", type: "company" },
];

/** Live elsewhere (Current Filters / Saved) — omitted from General content + nav. */
const generalContentExcludedIds = new Set(["filters", "saved"]);

/**
 * Single-control General filters stacked inline under the General stream.
 * Shown in content; hidden as separate sidebar nav entries.
 */
const generalStreamIds = new Set(["date-range", "sorting", "apply-form", "exclusion"]);

/** Multi-control General subsections that keep their own section chrome + sidebar entry. */
const generalSectionIds = new Set(["activity-outcomes"]);

/**
 * Nested under a parent subsection in content (Salary→benefits, Experience→commitment,
 * Size→stage/founding). Hidden as separate left-rail rows; parent row still scrolls to them.
 */
const sidebarNavExcludedIds = new Set(["benefits", "commitment", "stage", "founding", "industry"]);

/**
 * Requirements sentence rows (Licenses, Security, Languages, Encouraged) stream directly under the
 * Requirements header — only Education keeps a subheading, so only it gets a left-rail row.
 */
const qualificationsStreamIds = new Set(["licenses", "security", "languages", "encouraged"]);

/**
 * Group → first row in *content* order, used when the header click has no section-named filter and
 * every earlier row is streamed/nested (Requirements opens with its sentence rows, not Education).
 */
const groupAnchorFilterIds: Partial<Record<CategoryType, string>> = { qualifications: "licenses" };

const ribbonExcludedIds = new Set(["filters", "saved", "date-range", "sorting", "apply-form", "location", "workplace-activity"]);

const locationTags = ["Location", "Workplace Type", "Options"];

const compensationLevelsTags = ["Salary", "Commitment", "Experience", "Benefits & Perks"];

const roleDepartmentTags = ["Departments", "Job Titles & Keywords"];

const qualificationsTags = ["Education", "Licenses & Certifications", "Security Clearance", "Languages", "Encouraged to Apply"];

const availabilityTags = ["Shifts & Schedules", "Travel Requirement"];

const miscellaneousTags: string[] = [];

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

  // Compensation Levels
  { id: "salary", name: "Salary", type: "compensation" },
  { id: "commitment", name: "Commitment", type: "compensation" },
  { id: "experience", name: "Experience", type: "compensation" },
  { id: "benefits", name: "Benefits & Perks", type: "compensation" },

  // Role & Department
  { id: "departments", name: "Departments", type: "role-department" },
  { id: "job-titles", name: "Job Titles & Keywords", type: "role-department" },

  // Requirements (type stays `qualifications` so existing deep links keep working)
  { id: "education", name: "Education", type: "qualifications" },
  { id: "licenses", name: "Licenses & Certifications", type: "qualifications" },
  { id: "security", name: "Security Clearance", type: "qualifications" },
  { id: "languages", name: "Languages", type: "qualifications" },
  { id: "encouraged", name: "Encouraged to Apply", type: "qualifications" },

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
  generalContentExcludedIds,
  generalSectionIds,
  generalStreamIds,
  groupAnchorFilterIds,
  legacyFilterTags,
  locationTags,
  miscellaneousTags,
  orderedFilterIds,
  qualificationsStreamIds,
  qualificationsTags,
  roleDepartmentTags,
  sidebarNavExcludedIds,
};
