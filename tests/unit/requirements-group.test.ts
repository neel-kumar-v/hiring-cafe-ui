import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { filterGroupOrder, filters } from "../../src/data/search-filters";
import { getEducationTitle } from "../../src/components/search/filters/qualifications/Education";
import { getLicensesTitle } from "../../src/components/search/filters/qualifications/Licenses";
import { getSecurityTitle } from "../../src/components/search/filters/qualifications/Security";
import { getLanguagesTitle } from "../../src/components/search/filters/qualifications/Languages";
import { getEncouragedTitle } from "../../src/components/search/filters/qualifications/Encouraged";

const REQUIREMENTS_IDS = ["education", "licenses", "security", "languages", "encouraged"];
const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

test("Requirements sits between Compensation & Levels and Location", () => {
  const order = filterGroupOrder.map((group) => group.name);
  assert.deepEqual(order, ["General", "Compensation & Levels", "Requirements", "Location", "Role & Department", "Availability", "Company"]);
});

test("Encouraged to Apply lives in the Requirements group, not General", () => {
  const encouraged = filters.find((filter) => filter.id === "encouraged");
  assert.equal(encouraged?.type, "qualifications");

  const generalIds = filters.filter((filter) => filter.type === "general").map((filter) => filter.id);
  assert.equal(generalIds.includes("encouraged"), false);
});

test("Requirements group is never hidden by the category renderer", () => {
  const contents = readFileSync(join(root, "src/components/search/contents/index.tsx"), "utf8");
  const searchContent = readFileSync(join(root, "src/components/search/contents/SearchContent.tsx"), "utf8");

  assert.equal(contents.includes('type === "qualifications"'), false);
  assert.equal(contents.includes("isHidden"), false);
  assert.equal(searchContent.includes("isHidden"), false);

  const requirementsIds = filters.filter((filter) => filter.type === "qualifications").map((filter) => filter.id);
  assert.deepEqual(requirementsIds, REQUIREMENTS_IDS);
});

test("education sentence defaults to any fields / not be mentioned", () => {
  const title = getEducationTitle({
    associate: { preferences: null, keywords: { include: [], exclude: "None" } },
    bachelor: { preferences: null, keywords: { include: [], exclude: "None" } },
    master: { preferences: null, keywords: { include: [], exclude: "None" } },
    doctorate: { preferences: null, keywords: { include: [], exclude: "None" } },
  });
  assert.match(title, /Associate's degree in any should not be mentioned/);
  assert.match(title, /Bachelor's degree in any should not be mentioned/);
  assert.match(title, /Master's degree in any should not be mentioned/);
  assert.match(title, /Doctorate degree in any should not be mentioned/);
});

test("licenses / security / languages / encouraged sentence defaults", () => {
  assert.equal(getLicensesTitle({ hide_required: false, keywords: { include: [], exclude: "None" } }), "Jobs mentioning any licenses, excluding none");
  assert.equal(getLicensesTitle({ hide_required: true, keywords: { include: [], exclude: "None" } }), "Jobs mentioning none licenses, excluding none");
  assert.equal(getSecurityTitle("All"), "Jobs requiring any security clearance");
  assert.equal(getLanguagesTitle({ include: [], exclude: "None" }), "Jobs requiring fluency in any excluding none");
  assert.equal(getEncouragedTitle(null), "Jobs that welcome applicants from unspecified");
  assert.equal(getEncouragedTitle(["Veteran", "Fair Chance"]), "Jobs that welcome applicants from military veterans and fair chance");
});
