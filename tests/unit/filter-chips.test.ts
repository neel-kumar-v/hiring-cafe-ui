import assert from "node:assert/strict";
import test from "node:test";
import { defaultSearchOptions } from "../../src/contexts/SearchContext";
import { applyFilterChipClear, formatQuotedSearchExpression, getFilterChips, groupFilterChips } from "../../src/lib/search/filter-chips";
import type { SearchState } from "../../src/types/search";

function withFilters(patch: Partial<SearchState>): SearchState {
  return {
    ...defaultSearchOptions,
    ...patch,
    activity_outcomes: {
      ...defaultSearchOptions.activity_outcomes,
      ...patch.activity_outcomes,
      reportedOutcomes: {
        ...defaultSearchOptions.activity_outcomes.reportedOutcomes,
        ...patch.activity_outcomes?.reportedOutcomes,
      },
    },
    salary: {
      ...defaultSearchOptions.salary,
      ...patch.salary,
    },
    education: {
      ...defaultSearchOptions.education,
      ...patch.education,
    },
    job_titles: {
      ...defaultSearchOptions.job_titles,
      ...patch.job_titles,
    },
  };
}

test("formats quoted boolean search expressions the way chips should read", () => {
  const formatted = formatQuotedSearchExpression({
    AND: [{ OR: ["react", "vue"] }, { NOT: { OR: ["django", "flask"] } }],
  });

  assert.equal(formatted, `("react" OR "vue") AND NOT ("django" OR "flask")`);
});

test("builds specific readable chips for mixed search settings", () => {
  const state = withFilters({
    date_range: { magnitude: 1, unit: "Months" },
    apply_form: "Fast",
    exclusion: ["Saved", "Applied"],
    activity_outcomes: {
      views: "Few",
      applications: "Few",
      saves: "All",
      reportedOutcomes: { interviews: false, offers: false, ghostProne: false, highRejection: false },
    },
    department: ["Engineering", "Software Development", "Information Technology", "Data and Analytics"],
    job_titles: {
      title: {},
      technical: { AND: [{ OR: ["react", "vue"] }, { NOT: { OR: ["django", "flask"] } }] },
      description: {},
      requirements: {},
    },
    salary: {
      min_range: { min: 150000, max: 150000 },
      max_range: { min: 0, max: 0 },
      unit: "Yearly",
      listedUnit: "Yearly",
      currency: "USD",
      undisclosed: false,
    },
    education: {
      associate: { preferences: ["Not Mentioned"], keywords: { include: [], exclude: "None" } },
      bachelor: { preferences: ["Required", "Preferred"], keywords: { include: [], exclude: "None" } },
      master: { preferences: ["Preferred", "Not Mentioned"], keywords: { include: [], exclude: "None" } },
      doctorate: { preferences: ["Not Mentioned"], keywords: { include: [], exclude: "None" } },
    },
  });

  const chips = getFilterChips(state);
  const labels = chips.map((chip) => chip.label);

  assert.deepEqual(
    labels.filter((label) =>
      [
        "1 month",
        "Easy apply only",
        "Exclude Saved",
        "Exclude Applied",
        "Few views",
        "Few applications",
        "Lower bound $150,000 – any",
        "Upper bound $150,000 – any",
        "Paid Yearly",
        "Engineering",
        "Software Development",
        "Information Technology",
        "Data and Analytics",
        `Tech: ("react" OR "vue") AND NOT ("django" OR "flask")`,
        "Associate's: Not Mentioned",
        "Bachelor's: Required / Preferred",
        "Master's: Preferred / Not Mentioned",
        "Doctorate: Not Mentioned",
      ].includes(label),
    ),
    [
      "1 month",
      "Easy apply only",
      "Exclude Saved",
      "Exclude Applied",
      "Few views",
      "Few applications",
      "Lower bound $150,000 – any",
      "Upper bound $150,000 – any",
      "Paid Yearly",
      "Engineering",
      "Software Development",
      "Information Technology",
      "Data and Analytics",
      `Tech: ("react" OR "vue") AND NOT ("django" OR "flask")`,
      "Associate's: Not Mentioned",
      "Bachelor's: Required / Preferred",
      "Master's: Preferred / Not Mentioned",
      "Doctorate: Not Mentioned",
    ],
  );

  const groups = groupFilterChips(chips).map((group) => group.label);
  assert.deepEqual(groups, [
    "Date Posted",
    "Apply Process",
    "Exclude Jobs",
    "Activity & Outcomes",
    "Salary",
    "Departments",
    "Job Titles & Keywords",
    "Education",
  ]);
});

test("orders chips to match the filter sidebar category sequence", () => {
  const state = withFilters({
    activity_outcomes: {
      views: "Few",
      applications: "All",
      saves: "All",
      reportedOutcomes: { interviews: false, offers: false, ghostProne: false, highRejection: false },
    },
    department: ["Engineering"],
    salary: {
      min_range: { min: 150000, max: 150000 },
      max_range: { min: 0, max: 0 },
      unit: "Yearly",
      listedUnit: "Yearly",
      currency: "USD",
      undisclosed: false,
    },
    license_certification: {
      hide_required: true,
      keywords: { include: [], exclude: "None" },
    },
  });

  assert.deepEqual(
    groupFilterChips(getFilterChips(state)).map((group) => group.label),
    ["Activity & Outcomes", "Salary", "Departments", "Licenses & Certifications"],
  );
});

test("clearing one activity chip leaves sibling activity chips in place", () => {
  const state = withFilters({
    activity_outcomes: {
      views: "Few",
      applications: "Few",
      saves: "All",
      reportedOutcomes: { interviews: false, offers: false, ghostProne: false, highRejection: false },
    },
  });

  const viewsChip = getFilterChips(state).find((chip) => chip.id === "activity-views");
  assert.ok(viewsChip);

  const next = applyFilterChipClear(state, viewsChip);
  const remaining = getFilterChips(next).map((chip) => chip.label);
  assert.deepEqual(remaining, ["Few applications"]);
});
