import assert from "node:assert/strict";
import test from "node:test";
import {
  describeRange,
  formatCompactNumber,
  formatCountedList,
  formatCountMoreSuffix,
  formatExperienceYearSentence,
  formatFoundingYearsSentence,
  formatMoneySuffix,
  formatRangeParts,
  formatSalarySentence,
  makeRangePhrases,
} from "../../src/lib/search/sentence-query";

// ---------------------------------------------------------------------------
// 1. Multi-select list formatting (N1/N2 thresholds, join with ', ', allText/noneText)
// ---------------------------------------------------------------------------

test("formatCountedList returns empty string or noneText when empty", () => {
  assert.equal(formatCountedList([]), "");
  assert.equal(formatCountedList([], { noneText: "any selection" }), "any selection");
  assert.equal(formatCountedList(["", ""], { noneText: "nothing" }), "nothing");
});

test("formatCountedList formats single item directly", () => {
  assert.equal(formatCountedList(["Remote"]), "Remote");
  assert.equal(formatCountedList(["Remote"], { conjunction: "and" }), "Remote");
});

test("formatCountedList joins below N1 with comma when no conjunction", () => {
  assert.equal(formatCountedList(["Full Time", "Contract"]), "Full Time, Contract");
  assert.equal(formatCountedList(["Full Time", "Part Time", "Contract"]), "Full Time, Part Time, Contract");
});

test("formatCountedList formats below N1 with conjunction and oxford comma", () => {
  assert.equal(formatCountedList(["Full Time", "Contract"], { conjunction: "and" }), "Full Time and Contract");
  assert.equal(formatCountedList(["Full Time", "Part Time", "Contract"], { conjunction: "and" }), "Full Time, Part Time, and Contract");
  assert.equal(formatCountedList(["Full Time", "Part Time", "Contract"], { conjunction: "and", oxford: false }), "Full Time, Part Time and Contract");
  assert.equal(formatCountedList(["Applied", "Viewed", "Saved"], { conjunction: "or" }), "Applied, Viewed, or Saved");
});

test("formatCountedList compacts above N1 showing first N2 then + {remaining} more", () => {
  const items = ["A", "B", "C", "D", "E"];

  // Default N1=3, N2=3 -> 5 items > 3, shows first 3 + 2 more
  assert.equal(formatCountedList(items), "A, B, C + 2 more");

  // Custom N1=2, N2=1 -> 5 items > 2, shows first 1 + 4 more
  assert.equal(formatCountedList(items, { n1: 2, n2: 1 }), "A + 4 more");

  // Custom N1=4, N2=2 -> 5 items > 4, shows first 2 + 3 more
  assert.equal(formatCountedList(items, { n1: 4, n2: 2 }), "A, B + 3 more");

  // Works with shortListLimit/compactListLimit aliases
  assert.equal(formatCountedList(items, { shortListLimit: 4, compactListLimit: 2 }), "A, B + 3 more");
});

test("formatCountedList supports custom moreText formatter", () => {
  const items = ["One", "Two", "Three", "Four"];
  assert.equal(
    formatCountedList(items, {
      n1: 2,
      n2: 2,
      moreText: (rem) => `${rem} others`,
    }),
    "One, Two + 2 others"
  );
});

test("formatCountedList honors allText when all items selected or allSelected is true", () => {
  const items = ["Applied", "Viewed", "Saved", "Hidden"];

  // Total provided and reached
  assert.equal(formatCountedList(items, { total: 4, allText: "all interactions" }), "all interactions");

  // Total not reached
  assert.equal(formatCountedList(["Applied", "Viewed"], { total: 4, allText: "all interactions" }), "Applied, Viewed");

  // Explicit allSelected flag
  assert.equal(formatCountedList(["Applied"], { allSelected: true, allText: "all interactions" }), "all interactions");
});

// ---------------------------------------------------------------------------
// 2. Compact numbers
// ---------------------------------------------------------------------------

test("formatCompactNumber formats numbers into compact string", () => {
  assert.equal(formatCompactNumber(0), "0");
  assert.equal(formatCompactNumber(-50), "0");
  assert.equal(formatCompactNumber(Number.NaN), "0");
  assert.equal(formatCompactNumber(500), "500");
  assert.equal(formatCompactNumber(1000), "1k");
  assert.equal(formatCompactNumber(70000), "70k");
  assert.equal(formatCompactNumber(1200000), "1.2m");
  assert.equal(formatCompactNumber(25000000), "25m");
});

// ---------------------------------------------------------------------------
// 3. Money suffix
// ---------------------------------------------------------------------------

test("formatMoneySuffix formats currency and frequency correctly", () => {
  assert.equal(formatMoneySuffix("USD", "Yearly"), "USD yearly");
  assert.equal(formatMoneySuffix("eur", "hourly"), "EUR hourly");
  assert.equal(formatMoneySuffix("USD", "Any"), "USD");
  assert.equal(formatMoneySuffix("", "Monthly"), "monthly");
  assert.equal(formatMoneySuffix(undefined, undefined), "");
});

// ---------------------------------------------------------------------------
// 4. Ranges (describeRange, makeRangePhrases, formatRangeParts)
// ---------------------------------------------------------------------------

test("describeRange classifies range bounds correctly", () => {
  assert.deepEqual(describeRange(0, 0), { kind: "none", low: 0, high: 0 });
  assert.deepEqual(describeRange(5, 5), { kind: "exact", low: 5, high: 5 });
  assert.deepEqual(describeRange(2, 8), { kind: "between", low: 2, high: 8 });
  assert.deepEqual(describeRange(8, 2), { kind: "between", low: 2, high: 8 });
  assert.deepEqual(describeRange(5, 0), { kind: "atLeast", low: 5, high: 0 });
  assert.deepEqual(describeRange(0, 10), { kind: "upTo", low: 0, high: 10 });
});

test("describeRange supports zeroIsUnset false", () => {
  assert.deepEqual(describeRange(0, 5, { zeroIsUnset: false }), { kind: "between", low: 0, high: 5 });
});

test("makeRangePhrases formats bounds with custom units and separators", () => {
  const phrases = makeRangePhrases({
    unit: "years",
    singularUnit: "year",
    betweenPhrase: (low, high) => `from ${low} to ${high} years`,
  });

  assert.equal(formatRangeParts({ kind: "exact", low: 1, high: 1 }, phrases), "1 year");
  assert.equal(formatRangeParts({ kind: "exact", low: 3, high: 3 }, phrases), "3 years");
  assert.equal(formatRangeParts({ kind: "between", low: 2, high: 5 }, phrases), "from 2 to 5 years");
  assert.equal(formatRangeParts({ kind: "atLeast", low: 3, high: 0 }, phrases), "at least 3 years");
  assert.equal(formatRangeParts({ kind: "upTo", low: 0, high: 4 }, phrases), "up to 4 years");
  assert.equal(formatRangeParts({ kind: "none", low: 0, high: 0 }, phrases), null);
});

// ---------------------------------------------------------------------------
// 5. Salary sentence formatter
// ---------------------------------------------------------------------------

test("formatSalarySentence handles range bounds with currency and frequency", () => {
  assert.equal(formatSalarySentence({ min: 70000, max: 120000, currency: "USD", unit: "Yearly" }), "Must pay between 70k - 120k USD yearly");
  assert.equal(formatSalarySentence({ min: 80000, max: 0, currency: "USD", unit: "Yearly" }), "Must pay at least 80k USD yearly");
  assert.equal(formatSalarySentence({ min: 0, max: 150000, currency: "EUR", unit: "Hourly" }), "Must pay up to 150k EUR hourly");
  assert.equal(formatSalarySentence({ min: 100000, max: 100000, currency: "USD", unit: "Yearly" }), "Must pay 100k USD yearly");
  assert.equal(formatSalarySentence({ min: 50000, max: 80000 }), "Must pay between 50k - 80k");
});

test("formatSalarySentence handles unset bounds and undisclosed toggle", () => {
  assert.equal(formatSalarySentence({ min: 0, max: 0, undisclosed: false }), "Show jobs with any salary");
  assert.equal(formatSalarySentence({ min: 0, max: 0, undisclosed: true }), "Hide jobs with undisclosed salaries");
});

// ---------------------------------------------------------------------------
// 6. Founding-year sentence formatter
// ---------------------------------------------------------------------------

test("formatFoundingYearsSentence formats founding year ranges", () => {
  assert.equal(formatFoundingYearsSentence(2000, 2010), "Founded between 2000 – 2010");
  assert.equal(formatFoundingYearsSentence(2010, 0), "Founded after 2010");
  assert.equal(formatFoundingYearsSentence(0, 2020), "Founded before 2020");
  assert.equal(formatFoundingYearsSentence(2015, 2015), "Founded in 2015");
  assert.equal(formatFoundingYearsSentence(0, 0), null);
});

// ---------------------------------------------------------------------------
// 7. Experience-years sentence formatter
// ---------------------------------------------------------------------------

test("formatExperienceYearSentence formats role experience years", () => {
  assert.equal(formatExperienceYearSentence(1, 0, "individual contributor"), "Must have at least 1 year of individual contributor experience");
  assert.equal(formatExperienceYearSentence(0, 1, "people manager"), "Must have up to 1 year of people manager experience");
  assert.equal(formatExperienceYearSentence(1, 1, "individual contributor"), "Must have 1 year of individual contributor experience");
  assert.equal(formatExperienceYearSentence(2, 5, "individual contributor"), "Must have between 2 – 5 years of individual contributor experience");
  assert.equal(formatExperienceYearSentence(3, 0, "people manager"), "Must have at least 3 years of people manager experience");
  assert.equal(formatExperienceYearSentence(0, 4, "people manager"), "Must have up to 4 years of people manager experience");
  assert.equal(formatExperienceYearSentence(3, 3, "people manager"), "Must have 3 years of people manager experience");
  assert.equal(formatExperienceYearSentence(0, 0, "individual contributor"), null);
});
