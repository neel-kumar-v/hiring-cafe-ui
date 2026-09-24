import assert from "node:assert/strict";
import test from "node:test";
import { legacyFilterTags } from "../../src/data/search-filters";

test("ribbon lists Exclusion immediately before Activity & Outcomes", () => {
  const exclusionIndex = legacyFilterTags.indexOf("Exclusion");
  const activityIndex = legacyFilterTags.indexOf("Activity & Outcomes");

  assert.notEqual(exclusionIndex, -1);
  assert.notEqual(activityIndex, -1);
  assert.equal(activityIndex, exclusionIndex + 1);
});
