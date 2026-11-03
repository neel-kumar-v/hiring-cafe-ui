import assert from "node:assert/strict";
import test from "node:test";
import { buildPipelineSankeyData } from "../../src/components/tracker/TrackerFlowDiagram";
import type { JobTransition } from "../../src/types/app";
import type { JobCategory } from "../../src/types/tracker";

test("buildPipelineSankeyData falls back to direct source links when no transitions exist", () => {
  const counts: Record<JobCategory, number> = {
    saved: 3,
    applied: 2,
    interviewing: 1,
    rejected: 0,
    hidden: 0,
  };

  const data = buildPipelineSankeyData(counts, []);
  assert.equal(data.nodes.length, 4); // source, saved, applied, interviewing
  assert.equal(data.nodes[0].name, "Tracked jobs");

  // Every link comes from source (index 0)
  for (const link of data.links) {
    assert.equal(link.source, 0);
  }
  assert.equal(data.links.length, 3);
});

test("buildPipelineSankeyData reflects Saved -> Applied -> Interviewing transitions", () => {
  // Scenario: 3 jobs originally saved.
  // Job 1 stays in saved.
  // Job 2 moves saved -> applied.
  // Job 3 moves saved -> applied -> interviewing.
  const counts: Record<JobCategory, number> = {
    saved: 1,
    applied: 1,
    interviewing: 1,
    rejected: 0,
    hidden: 0,
  };

  const transitions: JobTransition[] = [
    { jobId: "job1", to: "saved", at: 100 },
    { jobId: "job2", to: "saved", at: 110 },
    { jobId: "job2", from: "saved", to: "applied", at: 200 },
    { jobId: "job3", to: "saved", at: 120 },
    { jobId: "job3", from: "saved", to: "applied", at: 210 },
    { jobId: "job3", from: "applied", to: "interviewing", at: 300 },
  ];

  const data = buildPipelineSankeyData(counts, transitions);

  const nodeNames = data.nodes.map((n) => n.name);
  assert.deepEqual(nodeNames, ["Tracked jobs", "Saved", "Applied", "Interviewing"]);

  const sourceIdx = data.nodes.findIndex((n) => n.name === "Tracked jobs");
  const savedIdx = data.nodes.findIndex((n) => n.name === "Saved");
  const appliedIdx = data.nodes.findIndex((n) => n.name === "Applied");
  const interviewingIdx = data.nodes.findIndex((n) => n.name === "Interviewing");

  // Tracked jobs -> Saved should have value 3
  const sourceToSaved = data.links.find((l) => l.source === sourceIdx && l.target === savedIdx);
  assert.ok(sourceToSaved, "should have Tracked jobs -> Saved link");
  assert.equal(sourceToSaved.value, 3);

  // Saved -> Applied should have value 2
  const savedToApplied = data.links.find((l) => l.source === savedIdx && l.target === appliedIdx);
  assert.ok(savedToApplied, "should have Saved -> Applied link");
  assert.equal(savedToApplied.value, 2);

  // Applied -> Interviewing should have value 1
  const appliedToInterviewing = data.links.find((l) => l.source === appliedIdx && l.target === interviewingIdx);
  assert.ok(appliedToInterviewing, "should have Applied -> Interviewing link");
  assert.equal(appliedToInterviewing.value, 1);
});

test("buildPipelineSankeyData supports Saved -> Interviewing bypass path", () => {
  const counts: Record<JobCategory, number> = {
    saved: 1,
    applied: 0,
    interviewing: 1,
    rejected: 0,
    hidden: 0,
  };

  const transitions: JobTransition[] = [
    { jobId: "job1", to: "saved", at: 100 },
    { jobId: "job2", to: "saved", at: 110 },
    { jobId: "job2", from: "saved", to: "interviewing", at: 200 },
  ];

  const data = buildPipelineSankeyData(counts, transitions);

  const savedIdx = data.nodes.findIndex((n) => n.name === "Saved");
  const interviewingIdx = data.nodes.findIndex((n) => n.name === "Interviewing");

  const savedToInterviewing = data.links.find((l) => l.source === savedIdx && l.target === interviewingIdx);
  assert.ok(savedToInterviewing, "should have direct Saved -> Interviewing link");
  assert.equal(savedToInterviewing.value, 1);
});

test("buildPipelineSankeyData prevents cycles and preserves acyclic graph", () => {
  const counts: Record<JobCategory, number> = {
    saved: 1,
    applied: 1,
    interviewing: 0,
    rejected: 0,
    hidden: 0,
  };

  // Suppose job moved saved -> applied, then user moved applied -> saved
  const transitions: JobTransition[] = [
    { jobId: "job1", from: "saved", to: "applied", at: 100 },
    { jobId: "job1", from: "applied", to: "saved", at: 200 },
  ];

  const data = buildPipelineSankeyData(counts, transitions);

  // Verify no circular links exist (source < target for all links)
  for (const link of data.links) {
    assert.notEqual(link.source, link.target, "link cannot be self-referencing");
  }
  // The forward edge is kept, the cycle-creating reverse edge is omitted
  const savedIdx = data.nodes.findIndex((n) => n.name === "Saved");
  const appliedIdx = data.nodes.findIndex((n) => n.name === "Applied");

  const appliedToSaved = data.links.find((l) => l.source === appliedIdx && l.target === savedIdx);
  assert.equal(appliedToSaved, undefined, "reverse edge creating cycle should not be present");
});
