import test from "node:test";
import assert from "node:assert/strict";
import { getJobGridColumnsForWidth, isOneColumnBoardWidth, JOB_GRID_COLUMN_THRESHOLDS, resolveJobBoardLayout } from "../../src/hooks/useContainerWidth";
import type { JobBoardLayout } from "../../src/contexts/SearchContext";

test("getJobGridColumnsForWidth maps quantized container widths to correct column counts", () => {
  assert.equal(getJobGridColumnsForWidth(0), 1);
  assert.equal(getJobGridColumnsForWidth(320), 1);
  assert.equal(getJobGridColumnsForWidth(639), 1);
  assert.equal(getJobGridColumnsForWidth(JOB_GRID_COLUMN_THRESHOLDS[2]), 2);
  assert.equal(getJobGridColumnsForWidth(1000), 2);
  assert.equal(getJobGridColumnsForWidth(JOB_GRID_COLUMN_THRESHOLDS[3]), 3);
  assert.equal(getJobGridColumnsForWidth(JOB_GRID_COLUMN_THRESHOLDS[4]), 4);
  // Hard cap: wide containers stay at four columns (no 5-column layout).
  assert.equal(getJobGridColumnsForWidth(1800), 4);
  assert.equal(getJobGridColumnsForWidth(2560), 4);
});

test("isOneColumnBoardWidth treats a narrow container and the mobile shell as one column", () => {
  // Narrow containers are one column on any viewport.
  assert.equal(isOneColumnBoardWidth(320, false), true);
  assert.equal(isOneColumnBoardWidth(639, false), true);
  assert.equal(isOneColumnBoardWidth(JOB_GRID_COLUMN_THRESHOLDS[2], false), false);
  assert.equal(isOneColumnBoardWidth(1200, false), false);

  // The mobile shell stays one column even when the container (sidebar gone)
  // could fit two cards.
  assert.equal(isOneColumnBoardWidth(647, true), true);
  assert.equal(isOneColumnBoardWidth(1200, true), true);
});

test("effective layout transitions to list when in 1-column mode on waterfall or grid", () => {
  const getEffectiveLayout = (columns: number, containerWidth: number, boardLayout: JobBoardLayout): JobBoardLayout =>
    resolveJobBoardLayout(isOneColumnBoardWidth(containerWidth, false) || columns <= 1, boardLayout);

  // In 1-column mode, masonry (Waterfall) transitions to list
  assert.equal(getEffectiveLayout(1, 500, "masonry"), "list");
  // In 1-column mode, grid transitions to list
  assert.equal(getEffectiveLayout(1, 500, "grid"), "list");
  // In 1-column mode, list stays list
  assert.equal(getEffectiveLayout(1, 500, "list"), "list");

  // In multi-column mode (>= 2 columns), chosen layout is preserved
  assert.equal(getEffectiveLayout(2, 700, "masonry"), "masonry");
  assert.equal(getEffectiveLayout(2, 700, "grid"), "grid");
  assert.equal(getEffectiveLayout(2, 700, "list"), "list");

  // Leftover masonry/grid state never applies in the mobile shell, even though
  // the container fits two columns there.
  assert.equal(resolveJobBoardLayout(isOneColumnBoardWidth(647, true), "masonry"), "list");
  assert.equal(resolveJobBoardLayout(isOneColumnBoardWidth(647, true), "grid"), "list");
});

test("buildJobBoardDisplayedCollections groups consecutive same-company jobs into one collection", async () => {
  const { buildJobBoardDisplayedCollections } = await import("../../src/lib/jobs/jobBoard");

  const companyA = { _id: "comp-a" as any, companyId: "comp-a", name: "Lockheed Martin" };
  const companyB = { _id: "comp-b" as any, companyId: "comp-b", name: "Boeing" };

  const rows = [
    { job: { _id: "j1" as any, externalId: "j1", title: "Hardware Test Engineer", companyId: "comp-a" } as any, company: companyA as any },
    { job: { _id: "j2" as any, externalId: "j2", title: "Systems Engineer", companyId: "comp-a" } as any, company: companyA as any },
    { job: { _id: "j3" as any, externalId: "j3", title: "Aerospace Engineer", companyId: "comp-b" } as any, company: companyB as any },
    { job: { _id: "j4" as any, externalId: "j4", title: "Software Engineer", companyId: "comp-a" } as any, company: companyA as any },
  ];

  const collections = buildJobBoardDisplayedCollections(rows, rows.length);

  // j1 and j2 are consecutive from companyA -> 1 collection with 2 jobs
  // j3 is companyB -> separate collection
  // j4 is companyA but not consecutive -> separate collection
  assert.equal(collections.length, 3);
  assert.equal(collections[0].jobs.length, 2);
  assert.equal(collections[0].jobs[0].externalId, "j1");
  assert.equal(collections[0].jobs[1].externalId, "j2");

  assert.equal(collections[1].jobs.length, 1);
  assert.equal(collections[1].jobs[0].externalId, "j3");

  assert.equal(collections[2].jobs.length, 1);
  assert.equal(collections[2].jobs[0].externalId, "j4");
});
