import assert from "node:assert/strict";
import test from "node:test";
import {
  formatCompactRelativeTime,
  formatRelativeTime,
  getJobTimeDisplay,
  getTimeSinceFromPublish,
  normalizeEpochMillis,
  parsePublishTimeMillis,
  parseRelativeDateString,
  resolvePublishTime,
} from "../../src/lib/relative-time";

test("normalizeEpochMillis handles seconds, milliseconds, and microseconds", () => {
  // Epoch 0 or negative
  assert.equal(normalizeEpochMillis(0), 0);
  assert.equal(normalizeEpochMillis(-100), 0);

  // Epoch in seconds (e.g. 1700000000 = Nov 2023)
  assert.equal(normalizeEpochMillis(1_700_000_000), 1_700_000_000_000);

  // Epoch in milliseconds (1.7e12)
  assert.equal(normalizeEpochMillis(1_700_000_000_000), 1_700_000_000_000);

  // Epoch in microseconds (1.7e15)
  assert.equal(normalizeEpochMillis(1_700_000_000_000_000), 1_700_000_000_000);
});

test("parseRelativeDateString correctly resolves natural language time offsets", () => {
  const now = 1_739_550_000_000;

  assert.equal(parseRelativeDateString("just now", now), now);
  assert.equal(parseRelativeDateString("today", now), now);
  assert.equal(parseRelativeDateString("yesterday", now), now - 86_400_000);

  // Relative units
  assert.equal(parseRelativeDateString("10min ago", now), now - 10 * 60_000);
  assert.equal(parseRelativeDateString("10mn ago", now), now - 10 * 60_000);
  assert.equal(parseRelativeDateString("5m", now), now - 5 * 60_000);
  assert.equal(parseRelativeDateString("3h ago", now), now - 3 * 3_600_000);
  assert.equal(parseRelativeDateString("2d ago", now), now - 2 * 86_400_000);
  assert.equal(parseRelativeDateString("Scraped 2 days ago", now), now - 2 * 86_400_000);
  assert.equal(parseRelativeDateString("1w ago", now), now - 7 * 86_400_000);
  assert.equal(parseRelativeDateString("2mo ago", now), Math.round(now - 2 * 30.44 * 86_400_000));
  assert.equal(parseRelativeDateString("1y", now), Math.round(now - 365.25 * 86_400_000));

  // Plus notation and prefixes
  assert.equal(parseRelativeDateString("30+ days ago", now), now - 30 * 86_400_000);
  assert.equal(parseRelativeDateString("30+d", now), now - 30 * 86_400_000);
  assert.equal(parseRelativeDateString("30d+", now), now - 30 * 86_400_000);
  assert.equal(parseRelativeDateString("> 30 days ago", now), now - 30 * 86_400_000);
  assert.equal(parseRelativeDateString("about 2 hours ago", now), now - 2 * 3_600_000);
  assert.equal(parseRelativeDateString("over 1 month ago", now), Math.round(now - 1 * 30.44 * 86_400_000));
  assert.equal(parseRelativeDateString("active 3 days ago", now), now - 3 * 86_400_000);
  assert.equal(parseRelativeDateString("posted 5 days ago", now), now - 5 * 86_400_000);
});

test("parsePublishTimeMillis avoids Date.now() mishandling and epoch confusion", () => {
  const now = 1_739_550_000_000;
  const twoDaysAgo = now - 2 * 86_400_000;
  const thirtyDaysAgo = now - 30 * 86_400_000;
  const sixtyDaysAgo = now - 60 * 86_400_000;

  // Relative string parsed when millis is missing
  assert.equal(parsePublishTimeMillis("2d ago", null, now), twoDaysAgo);

  // Real publication date from dateString takes precedence over recent ingestion Date.now()
  assert.equal(parsePublishTimeMillis("2d ago", now, now), twoDaysAgo);

  // 30+ days ago resolves to 30 days ago, never Date.now()
  assert.equal(parsePublishTimeMillis("30+ days ago", now, now), thirtyDaysAgo);

  // Historical reference base: if job was scraped 30 days ago with "30d ago", it resolves relative to reference base
  assert.equal(parsePublishTimeMillis("30d ago", null, now, thirtyDaysAgo), sixtyDaysAgo);

  // When dateString is "0s" or "just now" from an old card, falls back to historical reference base (not now)
  assert.equal(parsePublishTimeMillis("0s", null, now, thirtyDaysAgo), thirtyDaysAgo);

  // When numericMillis is write-time ~now but historical reference base exists, avoid write-time ~now
  assert.equal(parsePublishTimeMillis(null, now, now, thirtyDaysAgo), thirtyDaysAgo);

  // ISO date string parsed
  const iso = "2025-01-15T00:00:00.000Z";
  const isoMillis = Date.parse(iso);
  assert.equal(parsePublishTimeMillis(iso, null, now), isoMillis);

  // Epoch 0 is ignored
  assert.equal(parsePublishTimeMillis(iso, 0, now), isoMillis);

  // Numeric string epoch
  assert.equal(parsePublishTimeMillis(String(twoDaysAgo), null, now), twoDaysAgo);

  // Fallback to valid millis when string is absent
  assert.equal(parsePublishTimeMillis(null, twoDaysAgo, now), twoDaysAgo);

  // "0s" string falls back to valid numeric millis
  assert.equal(parsePublishTimeMillis("0s", twoDaysAgo, now), twoDaysAgo);
});

test("formatRelativeTime formats using human units min / Nh / Nd / Nw / Nm / Ny and never raw seconds or mn", () => {
  const now = 1_739_550_000_000;

  // Sub-minute (0 to 59 seconds) -> 0min (uses min, never mn or 0s)
  assert.deepEqual(formatRelativeTime(now, now), {
    abbreviated: "0min",
    full: "less than a minute",
  });
  assert.deepEqual(formatRelativeTime(now - 30_000, now), {
    abbreviated: "0min",
    full: "less than a minute",
  });

  // Future / clock drift (e.g. 10s into future) -> 0min (never clamps to 0s)
  assert.deepEqual(formatRelativeTime(now + 10_000, now), {
    abbreviated: "0min",
    full: "less than a minute",
  });

  // Minutes -> Nmin (using min not mn)
  assert.deepEqual(formatRelativeTime(now - 60_000, now), {
    abbreviated: "1min",
    full: "1 minute",
  });
  assert.deepEqual(formatRelativeTime(now - 5 * 60_000, now), {
    abbreviated: "5min",
    full: "5 minutes",
  });

  // Hours -> Nh
  assert.deepEqual(formatRelativeTime(now - 3_600_000, now), {
    abbreviated: "1h",
    full: "1 hour",
  });
  assert.deepEqual(formatRelativeTime(now - 4 * 3_600_000, now), {
    abbreviated: "4h",
    full: "4 hours",
  });

  // Days -> Nd
  assert.deepEqual(formatRelativeTime(now - 86_400_000, now), {
    abbreviated: "1d",
    full: "1 day",
  });
  assert.deepEqual(formatRelativeTime(now - 3 * 86_400_000, now), {
    abbreviated: "3d",
    full: "3 days",
  });

  // Weeks -> Nw
  assert.deepEqual(formatRelativeTime(now - 7 * 86_400_000, now), {
    abbreviated: "1w",
    full: "1 week",
  });
  assert.deepEqual(formatRelativeTime(now - 2 * 7 * 86_400_000, now), {
    abbreviated: "2w",
    full: "2 weeks",
  });

  // Months -> Nm
  assert.deepEqual(formatRelativeTime(now - Math.round(31 * 86_400_000), now), {
    abbreviated: "1m",
    full: "1 month",
  });
  assert.deepEqual(formatRelativeTime(now - Math.round(62 * 86_400_000), now), {
    abbreviated: "2m",
    full: "2 months",
  });

  // Years -> Ny
  assert.deepEqual(formatRelativeTime(now - Math.round(366 * 86_400_000), now), {
    abbreviated: "1y",
    full: "1 year",
  });
  assert.deepEqual(formatRelativeTime(now - Math.round(2 * 366 * 86_400_000), now), {
    abbreviated: "2y",
    full: "2 years",
  });
});

test("old jobs must show days/weeks/months/years, never all 0min", () => {
  const now = 1_739_550_000_000;
  const threeMonthsAgo = now - 90 * 86_400_000;
  const oneYearAgo = now - 365 * 86_400_000;

  // Old job with "30+ days ago" string and write-time millis
  const res30Plus = getTimeSinceFromPublish("30+ days ago", now, now);
  assert.equal(res30Plus.abbreviated, "1m");
  assert.equal(res30Plus.full, "1 month");

  // Old job scraped 3 months ago with "0s" string and write-time updatedAt
  const resOldScrape = getTimeSinceFromPublish("0s", now, now, threeMonthsAgo);
  assert.equal(resOldScrape.abbreviated, "3m");
  assert.equal(resOldScrape.full, "3 months");

  // Old job scraped 1 year ago with no string and write-time updatedAt
  const resOneYear = getTimeSinceFromPublish("", now, now, oneYearAgo);
  assert.equal(resOneYear.abbreviated, "1y");
  assert.equal(resOneYear.full, "1 year");

  // Old job with "2w ago"
  const resTwoWeeks = getTimeSinceFromPublish("2w ago", null, now);
  assert.equal(resTwoWeeks.abbreviated, "2w");
  assert.equal(resTwoWeeks.full, "2 weeks");

  // Old job with "2mo ago"
  const resTwoMonths = getTimeSinceFromPublish("2mo ago", null, now);
  assert.equal(resTwoMonths.abbreviated, "2m");
  assert.equal(resTwoMonths.full, "2 months");
});

test("getTimeSinceFromPublish end-to-end integration", () => {
  const now = 1_739_550_000_000;

  // Real scrape string "3d ago"
  assert.deepEqual(getTimeSinceFromPublish("3d ago", null, now), {
    abbreviated: "3d",
    full: "3 days",
  });

  // Recent job truly <1 minute
  assert.deepEqual(getTimeSinceFromPublish("just now", null, now), {
    abbreviated: "0min",
    full: "less than a minute",
  });

  // Recent job 5 minutes ago
  assert.deepEqual(getTimeSinceFromPublish("5min ago", null, now), {
    abbreviated: "5min",
    full: "5 minutes",
  });

  // Both missing
  assert.deepEqual(getTimeSinceFromPublish("", null, now), {
    abbreviated: "",
    full: "",
  });
});

test("resolvePublishTime reports whether a timestamp is a publish date or the scrape time", () => {
  const now = 1_739_550_000_000;
  const threeDaysAgo = now - 3 * 86_400_000;
  const iso = "2025-01-15T00:00:00.000Z";

  // Relative publish text is a publish date
  assert.deepEqual(resolvePublishTime("2d ago", null, now, null), {
    millis: now - 2 * 86_400_000,
    source: "publish",
  });

  // ISO publish date is a publish date
  assert.deepEqual(resolvePublishTime(iso, null, now, null), {
    millis: Date.parse(iso),
    source: "publish",
  });

  // Publish millis are a publish date
  assert.deepEqual(resolvePublishTime(null, threeDaysAgo, now, null), {
    millis: threeDaysAgo,
    source: "publish",
  });

  // Only the ingestion reference (card createdAt) is known -> scrape time
  assert.deepEqual(resolvePublishTime("", null, now, threeDaysAgo), {
    millis: threeDaysAgo,
    source: "scrape",
  });

  // "0s" recorded at scrape time resolves to the scrape time, not to a publish date
  assert.deepEqual(resolvePublishTime("0s", null, now, threeDaysAgo), {
    millis: threeDaysAgo,
    source: "scrape",
  });

  // Nothing known at all
  assert.deepEqual(resolvePublishTime("", null, now, null), {
    millis: null,
    source: "none",
  });
});

test("getJobTimeDisplay never renders a useless 0min on a card", () => {
  const now = 1_739_550_000_000;
  const threeDaysAgo = now - 3 * 86_400_000;
  const twoDaysAhead = now + 2 * 86_400_000;

  // A real publish date is preferred and described as the age of the job
  assert.deepEqual(getJobTimeDisplay("3d ago", null, now, null), {
    abbreviated: "3d",
    full: "3 days",
    millis: threeDaysAgo,
    source: "publish",
  });

  // A publish estimate in the future is broken data: the job cannot be older than now
  assert.deepEqual(getJobTimeDisplay(new Date(twoDaysAhead).toISOString(), twoDaysAhead, now, threeDaysAgo), {
    abbreviated: "now",
    full: "just now",
    millis: now,
    source: "publish",
    isPublishEstimateUnreliable: true,
  });

  // A publish date of a few seconds ago reads as "now", never as "0min"
  assert.deepEqual(getJobTimeDisplay("just now", null, now, null), {
    abbreviated: "now",
    full: "just now",
    millis: now,
    source: "publish",
  });

  // Small clock skew on the publish date is still a publish date
  assert.deepEqual(getJobTimeDisplay(new Date(now + 30_000).toISOString(), null, now, threeDaysAgo), {
    abbreviated: "now",
    full: "just now",
    millis: now + 30_000,
    source: "publish",
  });

  // Without a publish date the scrape time is used and labelled as such
  assert.deepEqual(getJobTimeDisplay("", null, now, threeDaysAgo), {
    abbreviated: "3d",
    full: "3 days",
    millis: threeDaysAgo,
    source: "scrape",
  });

  // A scrape time of a few seconds ago carries no information -> the chip is dropped
  assert.deepEqual(getJobTimeDisplay("", null, now, now), {
    abbreviated: "",
    full: "just now",
    millis: now,
    source: "scrape",
  });

  // No timestamp at all -> nothing to show
  assert.deepEqual(getJobTimeDisplay("", null, now, null), {
    abbreviated: "",
    full: "",
    millis: null,
    source: "none",
  });
});

test("formatCompactRelativeTime formats relative dates consistently into compact format", () => {
  const now = 1_739_550_000_000;

  // Natural relative strings as in annotations and inbox
  assert.equal(formatCompactRelativeTime("1 week ago", now), "1w");
  assert.equal(formatCompactRelativeTime("4 days ago", now), "4d");
  assert.equal(formatCompactRelativeTime("2 days ago", now), "2d");
  assert.equal(formatCompactRelativeTime("2 weeks ago", now), "2w");
  assert.equal(formatCompactRelativeTime("3 weeks ago", now), "3w");
  assert.equal(formatCompactRelativeTime("1 month ago", now), "1m");
  assert.equal(formatCompactRelativeTime("2 months ago", now), "2m");
  assert.equal(formatCompactRelativeTime("1 year ago", now), "1y");
  assert.equal(formatCompactRelativeTime("3 hours ago", now), "3h");
  assert.equal(formatCompactRelativeTime("15 minutes ago", now), "15min");

  // Already compact format
  assert.equal(formatCompactRelativeTime("1w", now), "1w");
  assert.equal(formatCompactRelativeTime("4d", now), "4d");
  assert.equal(formatCompactRelativeTime("2d", now), "2d");
  assert.equal(formatCompactRelativeTime("2h", now), "2h");
  assert.equal(formatCompactRelativeTime("15min", now), "15min");
  assert.equal(formatCompactRelativeTime("1m", now), "1m");
  assert.equal(formatCompactRelativeTime("1y", now), "1y");

  // Special relative words
  assert.equal(formatCompactRelativeTime("yesterday", now), "1d");
  assert.equal(formatCompactRelativeTime("today", now), "now");
  assert.equal(formatCompactRelativeTime("just now", now), "now");

  // Numeric epoch milliseconds
  assert.equal(formatCompactRelativeTime(now - 7 * 86_400_000, now), "1w");
  assert.equal(formatCompactRelativeTime(now - 4 * 86_400_000, now), "4d");

  // Strings with/without ago, prefixes, and timestamp headers
  assert.equal(formatCompactRelativeTime("2 days", now), "2d");
  assert.equal(formatCompactRelativeTime("1 week", now), "1w");
  assert.equal(formatCompactRelativeTime("2d ago", now), "2d");
  assert.equal(formatCompactRelativeTime("1w ago", now), "1w");
  assert.equal(formatCompactRelativeTime("posted 2 days ago", now), "2d");
  assert.equal(formatCompactRelativeTime("Yesterday, 3:30 PM", now), "1d");
  assert.equal(formatCompactRelativeTime("Today, 10:15 AM", now), "now");

  // Empty / null / undefined
  assert.equal(formatCompactRelativeTime(""), "");
  assert.equal(formatCompactRelativeTime(null), "");
  assert.equal(formatCompactRelativeTime(undefined), "");
});
