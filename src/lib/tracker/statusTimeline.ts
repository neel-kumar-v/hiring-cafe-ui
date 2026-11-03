import type { JobStatus } from "@/types/app";
import type { JobStatusEvent, JobStatusEvents } from "@/types/tracker";

/** Funnel stages in the order a job is expected to move through them. */
export const FUNNEL_STAGES = ["saved", "applied", "interviewing", "rejected"] as const;

export type FunnelStage = (typeof FUNNEL_STAGES)[number];

function funnelIndex(status: JobStatus): number {
  return (FUNNEL_STAGES as readonly JobStatus[]).indexOf(status);
}

function foldStage(path: JobStatus[], status: JobStatus): JobStatus[] {
  const index = funnelIndex(status);
  // Hidden sits outside the funnel and never shapes the logical path.
  if (index === -1) return path;
  if (!path.length) return [status];

  const lastIndex = funnelIndex(path[path.length - 1]);
  if (index === lastIndex) return path;
  if (index > lastIndex) return [...path, status];

  // Backward move: reset the logical history to that earlier stage and drop
  // everything the job had reached past it.
  return [...path.filter((stage) => funnelIndex(stage) < index), status];
}

/**
 * Append a status event, skipping a repeat of the newest event so repeated
 * toggles and StrictMode double-updates cannot duplicate history. Returns the
 * same array reference when nothing changed.
 */
export function appendStatusEvent(events: JobStatusEvent[] | undefined, status: JobStatus, at: number, from: JobStatus | null = null): JobStatusEvent[] {
  const current = events ?? [];
  const last = current[current.length - 1];
  if (last?.status === status) return current;
  return [...current, { status, at, from }];
}

/** Append one event to the per-job log. */
export function recordJobStatusEvent(events: JobStatusEvents | undefined, jobId: string, status: JobStatus, at: number, from: JobStatus | null = null): JobStatusEvents {
  const all = events ?? {};
  const next = appendStatusEvent(all[jobId], status, at, from);
  if (next === all[jobId]) return all;
  return { ...all, [jobId]: next };
}

/**
 * The funnel path a job logically took, used for aggregates (Sankey).
 *
 * Forward moves append; a backward move (applied → saved) truncates the suffix
 * and resets the path to that earlier stage, so zig-zags never show up as
 * reverse links. Hidden is appended only while it is the job's current status.
 */
export function logicalStatusPath(events: JobStatusEvent[] | undefined, currentStatus?: JobStatus): JobStatus[] {
  let path: JobStatus[] = [];
  for (const event of events ?? []) {
    path = foldStage(path, event.status);
  }
  if (currentStatus && currentStatus !== "hidden") {
    path = foldStage(path, currentStatus);
  }
  if (currentStatus === "hidden") {
    return [...path, "hidden"];
  }
  return path;
}

/** Chronological history for a job, newest last. */
export function statusHistoryFor(events: JobStatusEvents | undefined, jobId: string): JobStatusEvent[] {
  return events?.[jobId] ?? [];
}
