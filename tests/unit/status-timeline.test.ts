import assert from "node:assert/strict";
import test from "node:test";
import { FUNNEL_STAGES, appendStatusEvent, logicalStatusPath, recordJobStatusEvent } from "../../src/lib/tracker/statusTimeline";
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
  assert.deepEqual(logicalStatusPath(undefined, "applied"), ["applied"]);
  assert.deepEqual(logicalStatusPath([], undefined), []);
  // A legacy profile with no log reports only the stage it is actually in.
  assert.deepEqual(logicalStatusPath(undefined, "rejected"), ["rejected"]);
});
