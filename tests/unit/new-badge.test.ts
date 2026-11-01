import assert from "node:assert/strict";
import test from "node:test";
import { isJobNew, shouldShowNewBadge } from "../../src/components/job/card/NewBadge";

test("isJobNew calculates stable new status from job identity", () => {
  // Same externalId always produces same result
  const jobA = { externalId: "job-12345" };
  const res1 = isJobNew(jobA);
  const res2 = isJobNew(jobA);
  assert.equal(res1, res2);

  // Missing identifier returns false
  assert.equal(isJobNew({}), false);
});

test("isJobNew returns false when job has already been seen", () => {
  const sampleJob = { externalId: "job-stable-id" };
  const originallyNew = isJobNew(sampleJob);

  // Even if originally new or not, passing it in seenIds must yield false
  assert.equal(isJobNew(sampleJob, new Set(["job-stable-id"])), false);
  assert.equal(isJobNew(sampleJob, ["job-stable-id"]), false);

  // If a different job was seen, the status of sampleJob is unaffected
  assert.equal(isJobNew(sampleJob, new Set(["other-job"])), originallyNew);
});

test("shouldShowNewBadge enforces visibility rules", () => {
  // Rule 1: Never show in unread view
  assert.equal(
    shouldShowNewBadge({
      isNew: true,
      unreadView: true,
      isSelected: false,
      isSeen: false,
    }),
    false,
    "New badge should not appear in unread view"
  );

  // Rule 2: Never show if item is selected
  assert.equal(
    shouldShowNewBadge({
      isNew: true,
      unreadView: false,
      isSelected: true,
      isSeen: false,
    }),
    false,
    "New badge should not appear for selected items"
  );

  // Rule 3: Never show if item is already seen
  assert.equal(
    shouldShowNewBadge({
      isNew: true,
      unreadView: false,
      isSelected: false,
      isSeen: true,
    }),
    false,
    "New badge should not appear for already-seen items"
  );

  // Rule 4: Show when job is new, not seen, not selected, and not in unread view
  assert.equal(
    shouldShowNewBadge({
      isNew: true,
      unreadView: false,
      isSelected: false,
      isSeen: false,
    }),
    true,
    "New badge should appear for fresh unseen unselected items outside unread view"
  );

  // Rule 5: Don't show if job is not new
  assert.equal(
    shouldShowNewBadge({
      isNew: false,
      unreadView: false,
      isSelected: false,
      isSeen: false,
    }),
    false,
    "New badge should not appear for non-new jobs"
  );
});
