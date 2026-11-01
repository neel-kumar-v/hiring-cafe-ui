import assert from "node:assert/strict";
import test from "node:test";
import { allCommitmentLevels, formatCommitmentList, getCommitmentTitle } from "../../src/components/search/filters/compensation/Commitment";

test("getCommitmentTitle returns sensible default for 'All', undefined, empty array, or all items", () => {
  assert.equal(getCommitmentTitle("All"), "Show jobs with any commitment level");
  assert.equal(getCommitmentTitle(undefined), "Show jobs with any commitment level");
  assert.equal(getCommitmentTitle([]), "Show jobs with any commitment level");
  assert.equal(getCommitmentTitle(allCommitmentLevels), "Show jobs with any commitment level");
});

test("getCommitmentTitle formats single selection query", () => {
  assert.equal(getCommitmentTitle(["Full Time"]), "Only show Full Time jobs");
  assert.equal(getCommitmentTitle(["Contract"]), "Only show Contract jobs");
});

test("getCommitmentTitle formats two selections query", () => {
  assert.equal(getCommitmentTitle(["Full Time", "Contract"]), "Only show Full Time and Contract jobs");
  // canonical ordering preserved
  assert.equal(getCommitmentTitle(["Contract", "Full Time"]), "Only show Full Time and Contract jobs");
});

test("getCommitmentTitle formats multiselect queries with oxford comma", () => {
  assert.equal(getCommitmentTitle(["Full Time", "Part Time", "Contract"]), "Only show Full Time, Part Time, and Contract jobs");
  assert.equal(getCommitmentTitle(["Full Time", "Contract", "Internship", "Seasonal"]), "Only show Full Time, Contract, Internship, and Seasonal jobs");
});

test("formatCommitmentList handles various item counts", () => {
  assert.equal(formatCommitmentList([]), "");
  assert.equal(formatCommitmentList(["Full Time"]), "Full Time");
  assert.equal(formatCommitmentList(["Full Time", "Contract"]), "Full Time and Contract");
  assert.equal(formatCommitmentList(["Full Time", "Part Time", "Contract"]), "Full Time, Part Time, and Contract");
});
