import type { JobStatus } from "@/types/app";
import type { JobStatusEvent, JobStatusEvents } from "@/types/tracker";

/** Funnel stages in the order a job is expected to move through them. */
export const FUNNEL_STAGES = ["saved", "applied", "interviewing", "rejected"] as const;

/** Status list keys used to resolve a job's current tracker column. */
export const TRACKER_STATUSES = ["applied", "interviewing", "rejected", "hidden", "saved"] as const satisfies readonly JobStatus[];

export type FunnelStage = (typeof FUNNEL_STAGES)[number];

/** Per-status job-id lists from user tracker state. */
export type TrackerStatusLists = Record<JobStatus, string[]>;

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
 *
 * Saved is the funnel entry for tracked jobs: a path that would otherwise start
 * mid-funnel (legacy logs / seeded current-only status) always prepends Saved
 * so Sankey never draws Tracked jobs → Applied/Interviewing while skipping it.
 */
export function logicalStatusPath(events: JobStatusEvent[] | undefined, currentStatus?: JobStatus): JobStatus[] {
  let path: JobStatus[] = [];
  for (const event of events ?? []) {
    path = foldStage(path, event.status);
  }
  if (currentStatus && currentStatus !== "hidden") {
    path = foldStage(path, currentStatus);
  }
  if (path.length > 0 && funnelIndex(path[0]) > 0) {
    path = ["saved", ...path];
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

/** True when the job has at least one recorded status event. */
export function hasStatusHistory(events: JobStatusEvents | undefined, jobId: string): boolean {
  return statusHistoryFor(events, jobId).length > 0;
}

/**
 * Current tracker column for a job, or null when it is not on any list.
 * Priority matches the tracker page: applied → interviewing → rejected →
 * hidden → saved.
 */
export function currentTrackedStatus(lists: TrackerStatusLists, jobId: string): JobStatus | null {
  for (const status of TRACKER_STATUSES) {
    if (lists[status].includes(jobId)) return status;
  }
  return null;
}

/**
 * Funnel stages from Saved through `status` (inclusive). Hidden stays alone.
 * Used when backfilling legacy tracker rows so history doesn't start mid-funnel.
 */
function funnelPrefixThrough(status: JobStatus): JobStatus[] {
  const index = funnelIndex(status);
  if (index === -1) return [status];
  return (FUNNEL_STAGES as readonly JobStatus[]).slice(0, index + 1);
}

/**
 * Backfill status events for tracked jobs that predate `jobEvents`.
 * Seeds the Saved→…→current prefix so Sankey/timeline keep Saved as the entry.
 * Leaves existing logs untouched. Returns the same object reference when
 * nothing needed seeding.
 */
export function seedMissingJobEvents(events: JobStatusEvents | undefined, lists: TrackerStatusLists, at: number): JobStatusEvents {
  const allIds = new Set<string>();
  for (const status of TRACKER_STATUSES) {
    for (const jobId of lists[status]) allIds.add(jobId);
  }

  let result = events ?? {};
  let changed = false;
  for (const jobId of allIds) {
    if ((result[jobId]?.length ?? 0) > 0) continue;
    const status = currentTrackedStatus(lists, jobId);
    if (!status) continue;
    let next = result;
    let from: JobStatus | null = null;
    for (const stage of funnelPrefixThrough(status)) {
      const updated = recordJobStatusEvent(next, jobId, stage, at, from);
      if (updated !== next) {
        next = updated;
        changed = true;
      }
      from = stage === "hidden" ? from : stage;
    }
    result = next;
  }
  return changed ? result : (events ?? {});
}
