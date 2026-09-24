import assert from "node:assert/strict";
import test from "node:test";
import { applyPostFilters, normalizeStringList } from "../../convex/jobSearch";
import { selectRangeIds, buildSharePayload } from "../../src/lib/jobs/selection";
import { POPULAR_JOB_SEARCHES } from "../../src/lib/search/popular-job-searches";

test("normalizes search lists without changing their order", () => {
  assert.deepEqual(normalizeStringList([" Remote ", "remote", "", "Hybrid"]), ["remote", "hybrid"]);
});

test("post-filters preserve rows with unspecified compensation", () => {
  const rows = [
    {
      _id: "card-1",
      companyId: "company-1",
      workplaceType: "Remote",
      yearlyMaxComp: undefined,
      yearlyMinComp: undefined,
      commitment: ["Full Time"],
      workplaceCountries: ["United States"],
      workplaceStates: ["PA"],
      workplaceCities: ["Philadelphia"],
      hidden: [],
    },
    {
      _id: "card-2",
      companyId: "company-2",
      workplaceType: "Onsite",
      yearlyMaxComp: 50_000,
      yearlyMinComp: 45_000,
      commitment: ["Full Time"],
      workplaceCountries: ["United States"],
      workplaceStates: ["PA"],
      workplaceCities: ["Philadelphia"],
      hidden: [],
    },
  ] as never[];

  const result = applyPostFilters(rows, { workplaceTypes: ["remote"], minYearlyComp: 100_000, locationStates: ["pa"] }, null, new Set());

  assert.deepEqual(
    result.map((row) => row._id),
    ["card-1"]
  );
});

test("selection range and share payload stay deterministic", () => {
  const ordered = ["a", "b", "c", "d"].map((id) => ({ id }));
  assert.deepEqual(selectRangeIds(ordered, "d", "b"), ["b", "c", "d"]);
  assert.equal(buildSharePayload([" https://example.test/a ", null, "https://example.test/a", "https://example.test/b"]), "https://example.test/a\nhttps://example.test/b");
});

test("popular suggestions stay a small client-side asset", () => {
  assert.equal(POPULAR_JOB_SEARCHES.length, 20);
  assert.ok(POPULAR_JOB_SEARCHES.every((value) => value.trim().length > 0));
});
