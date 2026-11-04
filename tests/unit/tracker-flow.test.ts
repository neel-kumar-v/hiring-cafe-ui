import assert from "node:assert/strict";
import test from "node:test";
import { buildFlowData } from "../../src/components/tracker/TrackerFlowDiagram";
import { logicalStatusPath } from "../../src/lib/tracker/statusTimeline";
import type { JobStatus } from "../../src/types/app";
import type { JobCategory, JobStatusEvent } from "../../src/types/tracker";

function events(...statuses: JobStatus[]): JobStatusEvent[] {
  return statuses.map((status, index) => ({ status, at: 1_700_000_000_000 + index * 1000, from: statuses[index - 1] ?? null }));
}

/** Index of a stage node, or -1 when that stage never appears in the flow. */
function nodeIndex(data: ReturnType<typeof buildFlowData>, label: string): number {
  return data.nodes.findIndex((node) => node.name === label);
}

/** Link total between two stages (0 when the edge does not exist at all). */
function linkValue(data: ReturnType<typeof buildFlowData>, from: string, to: string): number {
  const source = from === "Tracked jobs" ? 0 : nodeIndex(data, from);
  const target = nodeIndex(data, to);
  if (source === -1 || target === -1) return 0;
  return data.links.find((link) => link.source === source && link.target === target)?.value ?? 0;
}

test("buildFlowData links tracked jobs into their first stage and forward stages only", () => {
  const paths: JobCategory[][] = [logicalStatusPath(events("saved")), logicalStatusPath(events("saved", "applied")), logicalStatusPath(events("saved", "applied", "interviewing"))];
  const data = buildFlowData(paths);

  assert.equal(linkValue(data, "Tracked jobs", "Saved"), 3);
  assert.equal(linkValue(data, "Saved", "Applied"), 2);
  assert.equal(linkValue(data, "Applied", "Interviewing"), 1);
  // No unsolicited pass-through stages.
  assert.equal(nodeIndex(data, "Rejected"), -1);
});

test("buildFlowData never emits reverse links for backtracked history", () => {
  // applied -> saved resets the logical path to ["saved"], so no Saved->Applied
  // and no Applied->Saved edge exists for that job.
  const paths: JobCategory[][] = [logicalStatusPath(events("saved", "applied", "saved"))];
  const data = buildFlowData(paths);

  assert.equal(linkValue(data, "Tracked jobs", "Saved"), 1);
  assert.equal(linkValue(data, "Saved", "Applied"), 0);
  assert.equal(linkValue(data, "Applied", "Saved"), 0);
  assert.equal(data.links.length, 1);
});

test("buildFlowData places rejected as a terminal stage and keeps hidden out of the funnel", () => {
  const paths: JobCategory[][] = [logicalStatusPath(events("saved", "applied", "interviewing", "rejected")), logicalStatusPath(events("saved"), "hidden")];
  const data = buildFlowData(paths);

  assert.equal(linkValue(data, "Applied", "Interviewing"), 1);
  assert.equal(linkValue(data, "Interviewing", "Rejected"), 1);
  // Both jobs entered at Saved (one straight to hidden, one through the funnel).
  assert.equal(linkValue(data, "Tracked jobs", "Saved"), 2);
  assert.equal(linkValue(data, "Saved", "Hidden"), 1);
});

test("buildFlowData returns just the source node when nothing is tracked", () => {
  const data = buildFlowData([]);
  assert.equal(data.nodes.length, 1);
  assert.equal(data.links.length, 0);
});

test("buildFlowData routes mid-funnel legacy paths through Saved", () => {
  // Events that start at Applied/Interviewing (seeded current-only) must still
  // enter via Saved so Tracked jobs never skips the funnel starter.
  const paths: JobCategory[][] = [logicalStatusPath(events("applied")), logicalStatusPath(events("interviewing")), logicalStatusPath(undefined, "applied")];
  const data = buildFlowData(paths);

  assert.equal(linkValue(data, "Tracked jobs", "Saved"), 3);
  assert.equal(linkValue(data, "Tracked jobs", "Applied"), 0);
  assert.equal(linkValue(data, "Tracked jobs", "Interviewing"), 0);
  assert.equal(linkValue(data, "Saved", "Applied"), 2);
  assert.equal(linkValue(data, "Saved", "Interviewing"), 1);
});
