import assert from "node:assert/strict";
import test from "node:test";
import {
  filterCategoriesBySearchQuery,
  filterMatchesQuery,
  firstMatchingFilterId,
  getFilterSearchText,
} from "../../src/lib/search/filter-search-text";

const sampleGroups = [
  {
    type: "compensation",
    name: "Compensation & Levels",
    categories: [
      { id: "salary", name: "Salary" },
      { id: "commitment", name: "Commitment" },
      { id: "experience", name: "Experience" },
      { id: "benefits", name: "Benefits & Perks" },
    ],
  },
  {
    type: "qualifications",
    name: "Requirements",
    categories: [
      { id: "education", name: "Education" },
      { id: "security", name: "Security Clearance" },
    ],
  },
] as const;

test("empty query returns the full tree", () => {
  const result = filterCategoriesBySearchQuery(sampleGroups, "   ");
  assert.equal(result.length, sampleGroups.length);
  assert.equal(result[0].categories.length, 4);
  assert.equal(result[1].categories.length, 2);
});

test("matches sentence blank text inside experience (individual contributor)", () => {
  assert.ok(getFilterSearchText("experience").includes("individual contributor"));
  assert.equal(filterMatchesQuery("experience", "Experience", "individual contributor"), true);
  assert.equal(filterMatchesQuery("salary", "Salary", "individual contributor"), false);

  const result = filterCategoriesBySearchQuery(sampleGroups, "individual contributor");
  assert.equal(result.length, 1);
  assert.equal(result[0].type, "compensation");
  assert.deepEqual(
    result[0].categories.map((item) => item.id),
    ["experience"]
  );
  assert.equal(firstMatchingFilterId(result, "individual contributor"), "experience");
});

test("matches option labels that are not the filter name (full time → commitment)", () => {
  assert.equal(filterMatchesQuery("commitment", "Commitment", "full time"), true);

  const result = filterCategoriesBySearchQuery(sampleGroups, "full time");
  assert.deepEqual(
    result[0].categories.map((item) => item.id),
    ["commitment"]
  );
});

test("group name match keeps the whole group", () => {
  const result = filterCategoriesBySearchQuery(sampleGroups, "compensation");
  assert.equal(result.length, 1);
  assert.equal(result[0].categories.length, 4);
});

test("filter display name still matches", () => {
  const result = filterCategoriesBySearchQuery(sampleGroups, "security");
  assert.equal(result.length, 1);
  assert.deepEqual(
    result[0].categories.map((item) => item.id),
    ["security"]
  );
});

test("education degree phrases are searchable", () => {
  assert.equal(filterMatchesQuery("education", "Education", "bachelor's"), true);
  assert.equal(filterMatchesQuery("education", "Education", "be preferred"), true);
});
