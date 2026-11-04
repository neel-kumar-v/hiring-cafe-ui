import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { defaultSearchOptions } from "../../src/contexts/SearchContext";
import { CATEGORY_CHIPS, getCategoryActiveCount, getCategoryCounts } from "../../src/components/search/FilterPillBar";
import type { SearchState } from "../../src/types/search";

test("FilterPillBar chips deep-link into search dialog via handleSearchIconClick(fromId)", () => {
  const sourcePath = join(dirname(fileURLToPath(import.meta.url)), "../../src/components/search/FilterPillBar.tsx");
  const source = readFileSync(sourcePath, "utf8");
  assert.match(source, /useSearchUI/);
  assert.match(source, /handleSearchIconClick/);
  assert.match(source, /handleSearchIconClick\(fromId\)/);
  assert.equal(source.includes("InlineFilterPanel"), false);
  assert.equal(source.includes("toggleOpenCategory"), false);
  assert.equal(source.includes("ChevronDown"), false);
  assert.equal(source.includes("openCategory"), false);
});

test("CATEGORY_CHIPS fromIds match dialog deep-link categories", () => {
  const expected = ["compensation", "qualifications", "location", "role-department", "availability", "company"];
  assert.deepEqual(
    CATEGORY_CHIPS.map((chip) => chip.fromId),
    expected
  );
});

test("getCategoryCounts returns 0 for all category chips by default", () => {
  const counts = getCategoryCounts(defaultSearchOptions);
  for (const chip of CATEGORY_CHIPS) {
    assert.equal(counts[chip.categoryType] ?? 0, 0);
    assert.equal(getCategoryActiveCount(chip.categoryType, defaultSearchOptions), 0);
  }
});

test("getCategoryCounts returns active setting counts when filters are customized", () => {
  const customState: SearchState = {
    ...defaultSearchOptions,
    department: ["Engineering", "Design"],
    shift_preferences: {
      ...defaultSearchOptions.shift_preferences,
      morning: ["Required"],
      afternoon: ["Required"],
    },
    commitment: ["Full Time"],
  };

  const counts = getCategoryCounts(customState);
  assert.equal(counts["role-department"], 2);
  assert.equal(getCategoryActiveCount("role-department", customState), 2);

  assert.equal(counts["availability"], 2);
  assert.equal(getCategoryActiveCount("availability", customState), 2);

  assert.equal(counts["compensation"], 1);
  assert.equal(getCategoryActiveCount("compensation", customState), 1);

  assert.equal(counts["location"] ?? 0, 0);
  assert.equal(getCategoryActiveCount("location", customState), 0);

  assert.equal(counts["company"] ?? 0, 0);
  assert.equal(getCategoryActiveCount("company", customState), 0);

  assert.equal(counts["qualifications"] ?? 0, 0);
  assert.equal(getCategoryActiveCount("qualifications", customState), 0);
});
