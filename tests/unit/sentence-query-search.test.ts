import assert from "node:assert/strict";
import test from "node:test";
import { SENTENCE_BLANK_SEARCH_THRESHOLD } from "../../src/components/search/filters/util/sentence-query";

test("SENTENCE_BLANK_SEARCH_THRESHOLD is within 8-10 threshold range", () => {
  assert.ok(SENTENCE_BLANK_SEARCH_THRESHOLD >= 8 && SENTENCE_BLANK_SEARCH_THRESHOLD <= 10);
});

test("filter options matching label and phrase case-insensitively", () => {
  const options = [
    { value: "tech", label: "Technology", phrase: "tech companies" },
    { value: "health", label: "Healthcare", phrase: "health sector" },
    { value: "fin", label: "Finance", phrase: "financial services" },
    { value: "edu", label: "Education" },
  ];

  const filter = (query: string) => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((opt) => {
      const labelMatch = opt.label.toLowerCase().includes(q);
      const phraseMatch = opt.phrase ? opt.phrase.toLowerCase().includes(q) : false;
      return labelMatch || phraseMatch;
    });
  };

  assert.equal(filter("tech").length, 1);
  assert.equal(filter("tech")[0].value, "tech");

  // Matches phrase
  assert.equal(filter("financial").length, 1);
  assert.equal(filter("financial")[0].value, "fin");

  // Case insensitive
  assert.equal(filter("HEALTH").length, 1);
  assert.equal(filter("HEALTH")[0].value, "health");

  // Non-matching
  assert.equal(filter("nonexistent").length, 0);

  // Empty returns all
  assert.equal(filter("").length, 4);
});
