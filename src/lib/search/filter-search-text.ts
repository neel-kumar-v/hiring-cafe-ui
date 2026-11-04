/**
 * Static Ctrl+F index for the search-dialog filter tree.
 *
 * Each filter id maps to lowercase searchable text: sentence stems + blank option
 * labels/phrases that appear in the sentence-query UI (even when the filter's
 * sidebar name would not match, e.g. "individual contributor" → experience).
 */

type SearchableFilter = {
  id: string;
  /** Extra stems / labels beyond the filter's display name. */
  terms: readonly string[];
};

function joinTerms(...parts: Array<string | readonly string[] | undefined>): string {
  return parts
    .flatMap((part) => (part == null ? [] : Array.isArray(part) ? [...part] : [part]))
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean)
    .join(" ");
}

const FILTER_SEARCH_ENTRIES: readonly SearchableFilter[] = [
  // General
  {
    id: "date-range",
    terms: [
      "show jobs from the past",
      "all time",
      "past 24 hours",
      "3 days",
      "1 week",
      "2 weeks",
      "3 weeks",
      "1 month",
      "2 months",
      "3 months",
      "4 months",
      "5 months",
      "6 months",
      "1 year",
      "2 years",
      "3 years",
    ],
  },
  {
    id: "sorting",
    terms: [
      "sort jobs by",
      "relevance",
      "most recent",
      "oldest",
      "highest salary",
      "lowest salary",
      "most experience",
      "least experience",
    ],
  },
  {
    id: "apply-form",
    terms: ["show jobs with", "any forms", "simple forms", "time-consuming forms", "fast", "slow"],
  },
  {
    id: "exclusion",
    terms: [
      "don't exclude any jobs",
      "exclude jobs you have",
      "applied to",
      "viewed",
      "saved",
      "hidden",
      "applied",
    ],
  },
  {
    id: "activity-outcomes",
    terms: [
      "show jobs with",
      "views",
      "applications",
      "saves",
      "few views",
      "lots of views",
      "few applications",
      "lots of applications",
      "few saves",
      "lots of saves",
      "interviews reported",
      "offers reported",
      "leave out ghost-prone",
      "no ghosting",
      "leave out high-rejection",
      "no high rejection",
      "any reported outcomes",
    ],
  },

  // Compensation
  {
    id: "salary",
    terms: [
      "must pay",
      "any salary",
      "between",
      "at least",
      "up to",
      "yearly",
      "monthly",
      "hourly",
      "weekly",
      "bi-weekly",
      "daily",
      "undisclosed salaries",
      "hide jobs with undisclosed",
      "show jobs with undisclosed",
      "currency",
      "usd",
    ],
  },
  {
    id: "commitment",
    terms: [
      "show jobs with any commitment level",
      "only show",
      "commitment level",
      "full time",
      "part time",
      "contract",
      "internship",
      "temporary",
      "volunteer",
      "seasonal",
    ],
  },
  {
    id: "experience",
    terms: [
      "show jobs requiring any seniority",
      "show jobs requiring",
      "show jobs for any role type",
      "show jobs for",
      "must have",
      "years of individual contributor experience",
      "years of people manager experience",
      "individual contributor",
      "people manager",
      "no experience required",
      "entry level",
      "mid level",
      "senior level",
      "seniority",
      "role type",
      "ic",
      "pm",
    ],
  },
  {
    id: "benefits",
    terms: [
      "show jobs with any benefits",
      "only show jobs offering",
      "benefits",
      "perks",
      "pto",
      "4 days",
      "401k",
      "parental leave",
      "retirement",
      "tuition",
      "visa",
      "relocation",
    ],
  },

  // Role & department
  {
    id: "departments",
    terms: ["departments", "search departments"],
  },
  {
    id: "job-titles",
    terms: [
      "title keywords",
      "technical keywords",
      "description keywords",
      "requirements keywords",
      "boolean search",
      "job titles",
    ],
  },

  // Requirements / qualifications
  {
    id: "education",
    terms: [
      "degree in",
      "should",
      "associate's",
      "bachelor's",
      "master's",
      "doctorate",
      "be required",
      "be preferred",
      "not be mentioned",
      "required",
      "preferred",
      "not mentioned",
      "field of study",
    ],
  },
  {
    id: "licenses",
    terms: ["jobs mentioning", "licenses", "certifications", "excluding", "hide required", "none"],
  },
  {
    id: "security",
    terms: [
      "jobs requiring",
      "security clearance",
      "confidential",
      "secret",
      "top secret",
      "top secret/sci",
      "public trust",
      "interim clearances",
      "other",
      "no",
    ],
  },
  {
    id: "languages",
    terms: ["jobs requiring fluency in", "excluding", "languages", "fluency", "none"],
  },
  {
    id: "encouraged",
    terms: [
      "jobs that welcome applicants from",
      "military veterans",
      "fair chance",
      "veteran",
      "encouraged to apply",
    ],
  },

  // Availability
  {
    id: "shifts",
    terms: [
      "the job can have",
      "morning / day shifts",
      "afternoon / evening shifts",
      "overnight / graveyard shifts",
      "weekend work",
      "holiday work",
      "overtime",
      "on-call",
      "required",
      "optional",
      "not indicated",
      "regular",
      "occasional",
      "morning",
      "afternoon",
      "night",
      "weekend",
      "holiday",
      "graveyard",
    ],
  },
  {
    id: "travel",
    terms: [
      "show jobs with",
      "air travel",
      "land travel",
      "any amount of",
      "none",
      "minimum",
      "moderate",
      "extensive",
      "travel requirement",
    ],
  },

  // Location
  {
    id: "location",
    terms: ["location", "remote", "hybrid", "on-site", "onsite", "radius", "workplace type", "include remote"],
  },
  {
    id: "workplace-activity",
    terms: [
      "show jobs",
      "desk & active",
      "sitting / desk jobs",
      "desk",
      "active",
      "environments",
      "office",
      "outdoor",
      "vehicle",
      "industrial",
      "physical intensity",
      "cognitive intensity",
      "computer usage",
      "oral communication",
      "low",
      "medium",
      "high",
    ],
  },

  // Company
  {
    id: "company",
    terms: ["jobs at", "any company", "excluding", "none"],
  },
  {
    id: "industry",
    terms: [
      "company can have",
      "profit type",
      "for-profit",
      "non-profit",
      "active in",
      "any activity",
      "any industry",
      "usajobs",
      "usa jobs",
      "ok to include",
      "include only",
      "do not include",
      "jobs from usajobs.gov",
    ],
  },
  {
    id: "stage",
    terms: [
      "company stage is",
      "public",
      "private",
      "latest round",
      "latest round amount",
      "latest round type",
      "any round type",
      "backed by",
      "any investor",
      "stage & funding",
      "funding",
      "investors",
    ],
  },
  {
    id: "size",
    terms: [
      "company has any number of employees",
      "company has",
      "employees",
      "between",
      "at least",
      "up to",
      "company size",
    ],
  },
  {
    id: "founding",
    terms: ["founding year", "founded", "founded between", "founded after", "founded before", "founded in"],
  },
];

/** Pre-built lowercase blob per filter id (terms only; name is matched separately). */
const FILTER_SEARCH_TEXT: Readonly<Record<string, string>> = Object.fromEntries(
  FILTER_SEARCH_ENTRIES.map((entry) => [entry.id, joinTerms(...entry.terms)])
);

export function getFilterSearchText(filterId: string): string {
  return FILTER_SEARCH_TEXT[filterId] ?? "";
}

/** True when `query` (already trimmed + lowercased) hits the filter name or sentence/option index. */
export function filterMatchesQuery(filterId: string, filterName: string, query: string): boolean {
  if (!query) return true;
  if (filterName.toLowerCase().includes(query)) return true;
  return getFilterSearchText(filterId).includes(query);
}

export type FilterSearchGroup = {
  type: string;
  name: string;
  categories: ReadonlyArray<{ id: string; name: string }>;
};

/**
 * Filter the category tree like Ctrl+F over names + sentence titles.
 * Empty query → unchanged tree. Group-name match → keep the whole group.
 * Nested sentence matches keep their filter id so parent Options sections stay visible.
 */
export function filterCategoriesBySearchQuery<T extends FilterSearchGroup>(groups: readonly T[], rawQuery: string): T[] {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return [...groups];

  return groups
    .map((group) => {
      if (group.name.toLowerCase().includes(query)) return group;

      const matching = group.categories.filter((item) => filterMatchesQuery(item.id, item.name, query));
      if (!matching.length) return null;
      return { ...group, categories: matching };
    })
    .filter((group): group is T => group !== null);
}

/** First matching filter id in display order, or null when the query is empty / no hits. */
export function firstMatchingFilterId(groups: readonly FilterSearchGroup[], rawQuery: string): string | null {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return null;

  for (const group of groups) {
    for (const item of group.categories) {
      if (filterMatchesQuery(item.id, item.name, query) || group.name.toLowerCase().includes(query)) {
        return item.id;
      }
    }
  }
  return null;
}
