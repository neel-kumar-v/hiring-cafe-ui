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

test("formatCountedList compacts above N1 showing N2 shortest then + {remaining} more", () => {
  const items = ["A", "B", "C", "D", "E"];

  // Equal lengths → stable by selection order (same as former “first N2”)
  assert.equal(formatCountedList(items), "A, B, C + 2 more");
  assert.equal(formatCountedList(items, { n1: 2, n2: 1 }), "A + 4 more");
  assert.equal(formatCountedList(items, { n1: 4, n2: 2 }), "A, B + 3 more");
  assert.equal(formatCountedList(items, { shortListLimit: 4, compactListLimit: 2 }), "A, B + 3 more");
});

test("formatCountedList prefers shortest labels when compacting", () => {
  const items = ["private equity", "corporate round", "debt financing", "seed", "angel", "ipo", "grant", "debt", "safe"];

  // N1=3, N2=3 → nine items; show three shortest in original order: seed, ipo, debt
  assert.equal(formatCountedList(items), "seed, ipo, debt + 6 more");

  // n2=2 → seed + ipo (ipo before debt by length tie? seed=4, ipo=3, debt=4, safe=4 — shortest are ipo(3), then seed/debt/safe/angel/grant by index)
  assert.equal(formatCountedList(items, { n1: 3, n2: 2 }), "seed, ipo + 7 more");
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

// ---------------------------------------------------------------------------
// 8. Split sentence queries (Industry & Stage)
// ---------------------------------------------------------------------------

test("getIndustryTitle splits activity sentence and industry sentence", async () => {
  const { getIndustryTitle } = await import("../../src/components/search/filters/company/Industry");
  const defaultTitle = getIndustryTitle();
  assert.equal(defaultTitle, "Company can have any profit type. Active in any activity excluding none. In any industry excluding none. OK to include jobs from USAJobs.gov");

  const customTitle = getIndustryTitle({
    profit: ["For-Profit"],
    activities: { include: ["Fintech"], exclude: "None" },
    industry: { include: ["Banking"], exclude: "None" },
    usa_jobs: "Only",
  });
  assert.equal(customTitle, "Company can have for-profit profit type. Active in Fintech excluding none. In Banking excluding none. Include only jobs from USAJobs.gov");
});

test("getStageTitle splits round, round amount, round type, and investor sentences", async () => {
  const { getStageTitle } = await import("../../src/components/search/filters/company/Stage");
  const defaultTitle = getStageTitle();
  assert.equal(
    defaultTitle,
    "Company stage is any. Latest round any year. Latest round amount any amount. Latest round type any round type excluding none. Backed by any investor excluding none."
  );

  const customTitle = getStageTitle({
    current: ["Private"],
    latest_round: { min: 2020, max: 2024 },
    latest_round_amount: { min: 1000000, max: 5000000 },
    latest_round_type: { include: ["Series A"], exclude: "None" },
    investors: { include: ["Sequoia"], exclude: "None" },
  });
  assert.equal(
    customTitle,
    "Company stage is private. Latest round between 2020 – 2024. Latest round amount between 1m – 5m. Latest round type Series A excluding none. Backed by Sequoia excluding none."
  );
});

test("getActivityOutcomesTitle splits views, applications, saves, and outcomes sentences", async () => {
  const { getActivityOutcomesTitle } = await import("../../src/components/search/filters/general/ActivityOutcomes");
  const defaultTitle = getActivityOutcomesTitle();
  assert.equal(
    defaultTitle,
    "Show jobs with any amount of views. Show jobs with any amount of applications. Show jobs with any amount of saves. Show jobs with any reported outcomes"
  );

  const customTitle = getActivityOutcomesTitle({
    views: ["Few"],
    applications: ["Few", "Many"],
    saves: ["Many"],
    reportedOutcomes: {
      interviews: true,
      offers: false,
      ghostProne: false,
      highRejection: false,
    },
  });
  assert.equal(
    customTitle,
    "Show jobs with few views. Show jobs with few applications or lots of applications. Show jobs with lots of saves. Show jobs with interviews reported"
  );
});

test("getTravelTitle splits air travel and land travel sentences", async () => {
  const { getTravelTitle } = await import("../../src/components/search/filters/availability/Travel");
  const defaultTitle = getTravelTitle();
  assert.equal(
    defaultTitle,
    "Show jobs with any amount of air travel. Show jobs with any amount of land travel"
  );

  const customTitle = getTravelTitle({
    air: ["None"],
    land: ["Moderate", "Extensive"],
  });
  assert.equal(
    customTitle,
    "Show jobs with None air travel. Show jobs with Moderate or Extensive land travel"
  );
});

test("getExclusionTitle treats empty selection as don't exclude any", async () => {
  const { getExclusionTitle } = await import("../../src/components/search/filters/general/Exclusion");
  assert.equal(getExclusionTitle(), "Don't exclude any jobs");
  assert.equal(getExclusionTitle([]), "Don't exclude any jobs");
  assert.equal(
    getExclusionTitle(["Applied", "Viewed", "Saved", "Hidden"]),
    "Exclude jobs you have applied to, viewed, saved, or hidden"
  );
  assert.equal(
    getExclusionTitle(["Applied", "Viewed", "Saved"]),
    "Exclude jobs you have applied to, viewed, or saved"
  );
  assert.equal(
    getExclusionTitle(["Applied", "Saved"]),
    "Exclude jobs you have applied to or saved"
  );
});

// ---------------------------------------------------------------------------
// 9. Currency symbols and options
// ---------------------------------------------------------------------------

test("getCurrencySymbol normalizes uppercase and lowercase currency codes", async () => {
  const { getCurrencySymbol } = await import("../../src/components/search/filters/compensation/Salary");
  assert.equal(getCurrencySymbol("usd"), "$");
  assert.equal(getCurrencySymbol("USD"), "$");
  assert.equal(getCurrencySymbol("eur"), "€");
  assert.equal(getCurrencySymbol("EUR"), "€");
  assert.equal(getCurrencySymbol("gbp"), "£");
  assert.equal(getCurrencySymbol("cad"), "C$");
  assert.equal(getCurrencySymbol("jpy"), "¥");
  assert.equal(getCurrencySymbol("chf"), "CHF");
  assert.equal(getCurrencySymbol("xyz"), "XYZ");
});

test("CURRENCY_BLANK_OPTIONS contains expanded, deduplicated uppercase options", async () => {
  const { CURRENCY_BLANK_OPTIONS, toCurrencyOption } = await import("../../src/components/search/filters/compensation/Salary");
  assert.ok(CURRENCY_BLANK_OPTIONS.length >= 20, "Should have expanded list of currencies");

  const values = CURRENCY_BLANK_OPTIONS.map((o) => o.value);
  const labels = CURRENCY_BLANK_OPTIONS.map((o) => o.label);

  // All uppercase
  assert.ok(values.every((v) => /^[A-Z]{3}$/.test(v)));
  assert.ok(labels.every((l) => /^[A-Z]{3}$/.test(l)));

  // Deduplicated
  const uniqueValues = new Set(values);
  assert.equal(uniqueValues.size, values.length, "Currency options should have no duplicates");

  // Single USD option
  assert.equal(values.filter((v) => v === "USD").length, 1);

  // toCurrencyOption formats uppercase code and phrase
  const opt = toCurrencyOption("eur");
  assert.deepEqual(opt, { value: "EUR", label: "EUR", phrase: "€ EUR" });
});


