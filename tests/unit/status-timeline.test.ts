import assert from "node:assert/strict";
import test from "node:test";
import {
  FUNNEL_STAGES,
  appendStatusEvent,
  currentTrackedStatus,
  hasStatusHistory,
  logicalStatusPath,
  recordJobStatusEvent,
  seedMissingJobEvents,
  statusHistoryFor,
} from "../../src/lib/tracker/statusTimeline";
import type { JobStatus } from "../../src/types/app";
import type { JobStatusEvent } from "../../src/types/tracker";

function events(...statuses: JobStatus[]): JobStatusEvent[] {
  return statuses.map((status, index) => ({ status, at: 1_700_000_000_000 + index * 1000, from: statuses[index - 1] ?? null }));
}

function stageIndexes(path: JobStatus[]): number[] {
  return path.map((stage) => (FUNNEL_STAGES as readonly JobStatus[]).indexOf(stage));
}

test("appendStatusEvent records timestamps and skips repeated statuses", () => {
  const first = appendStatusEvent(undefined, "saved", 1_700_000_000_000);
  assert.deepEqual(first, [{ status: "saved", at: 1_700_000_000_000, from: null }]);

  const repeat = appendStatusEvent(first, "saved", 1_700_000_005_000);
  assert.equal(repeat, first, "repeated status returns the same array");

  const moved = appendStatusEvent(first, "applied", 1_700_000_009_000, "saved");
  assert.equal(moved.length, 2);
  assert.deepEqual(moved[1], { status: "applied", at: 1_700_000_009_000, from: "saved" });
});

test("recordJobStatusEvent keeps one log per job", () => {
  let logs = recordJobStatusEvent(undefined, "job-a", "saved", 1);
  logs = recordJobStatusEvent(logs, "job-b", "applied", 2);
  logs = recordJobStatusEvent(logs, "job-a", "applied", 3, "saved");

  assert.deepEqual(
    logs["job-a"]?.map((event) => event.status),
    ["saved", "applied"]
  );
  assert.deepEqual(
    logs["job-b"]?.map((event) => event.status),
    ["applied"]
  );
});

test("logicalStatusPath appends forward moves", () => {
  assert.deepEqual(logicalStatusPath(events("saved")), ["saved"]);
  assert.deepEqual(logicalStatusPath(events("saved", "applied")), ["saved", "applied"]);
  assert.deepEqual(logicalStatusPath(events("saved", "applied", "interviewing")), ["saved", "applied", "interviewing"]);
  assert.deepEqual(logicalStatusPath(events("saved", "applied", "interviewing", "rejected")), ["saved", "applied", "interviewing", "rejected"]);
});

test("logicalStatusPath resets on backward moves", () => {
  assert.deepEqual(logicalStatusPath(events("saved", "applied", "saved")), ["saved"]);
  assert.deepEqual(logicalStatusPath(events("saved", "applied", "interviewing", "applied")), ["saved", "applied"]);
  assert.deepEqual(logicalStatusPath(events("saved", "applied", "interviewing", "rejected", "saved")), ["saved"]);
  // Reset then move forward again only replays the stages reached afterwards.
  assert.deepEqual(logicalStatusPath(events("saved", "applied", "saved", "applied")), ["saved", "applied"]);
});

test("logicalStatusPath never produces reverse stages on zig-zag histories", () => {
  const zigZag = events("saved", "applied", "saved", "applied", "interviewing", "rejected", "interviewing", "applied");
  const indexes = stageIndexes(logicalStatusPath(zigZag));

  for (let index = 1; index < indexes.length; index += 1) {
    assert.ok(indexes[index] > indexes[index - 1], `stage ${index} should move forward, got ${indexes.join(",")}`);
  }
});

test("logicalStatusPath handles hidden and current status", () => {
  assert.deepEqual(logicalStatusPath(undefined, "hidden"), ["hidden"]);
  assert.deepEqual(logicalStatusPath(events("saved", "hidden"), "hidden"), ["saved", "hidden"]);
  // Mid-funnel current status still enters through Saved.
  assert.deepEqual(logicalStatusPath(undefined, "applied"), ["saved", "applied"]);
  assert.deepEqual(logicalStatusPath([], undefined), []);
  assert.deepEqual(logicalStatusPath(undefined, "rejected"), ["saved", "rejected"]);
});

test("logicalStatusPath never skips Saved as the funnel entry", () => {
  assert.deepEqual(logicalStatusPath(events("applied", "interviewing")), ["saved", "applied", "interviewing"]);
  assert.deepEqual(logicalStatusPath(events("interviewing"), "interviewing"), ["saved", "interviewing"]);
  assert.deepEqual(logicalStatusPath(events("saved", "applied", "interviewing")), ["saved", "applied", "interviewing"]);
});

test("currentTrackedStatus prefers applied over other columns", () => {
  const lists = {
    saved: ["job-a", "job-b"],
    applied: ["job-a"],
    interviewing: [] as string[],
    rejected: [] as string[],
    hidden: ["job-c"],
  };
  assert.equal(currentTrackedStatus(lists, "job-a"), "applied");
  assert.equal(currentTrackedStatus(lists, "job-b"), "saved");
  assert.equal(currentTrackedStatus(lists, "job-c"), "hidden");
  assert.equal(currentTrackedStatus(lists, "missing"), null);
});

test("seedMissingJobEvents backfills only jobs with empty history", () => {
  const lists = {
    saved: ["legacy-saved"],
    applied: ["legacy-applied", "logged"],
    interviewing: [] as string[],
    rejected: [] as string[],
    hidden: [] as string[],
  };
  const existing = {
    logged: events("saved", "applied"),
  };

  const seeded = seedMissingJobEvents(existing, lists, 1_700_000_100_000);

  assert.deepEqual(statusHistoryFor(seeded, "legacy-applied"), [
    { status: "saved", at: 1_700_000_100_000, from: null },
    { status: "applied", at: 1_700_000_100_000, from: "saved" },
  ]);
  assert.deepEqual(statusHistoryFor(seeded, "legacy-saved"), [{ status: "saved", at: 1_700_000_100_000, from: null }]);
  assert.equal(seeded.logged, existing.logged, "existing logs keep the same array reference");
  assert.equal(hasStatusHistory(seeded, "legacy-applied"), true);
  assert.equal(hasStatusHistory(seeded, "unknown"), false);

  const again = seedMissingJobEvents(seeded, lists, 1_700_000_200_000);
  assert.equal(again, seeded, "second seed is a no-op");
});
