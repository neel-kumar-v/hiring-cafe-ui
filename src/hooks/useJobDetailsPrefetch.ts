import { api } from "../../convex/_generated/api";
import { useConvex } from "convex/react";
import { useCallback, useEffect, useMemo, useRef } from "react";

type Options = {
  /** Debounce window for hover intent. */
  delayMs?: number;
  /** Maximum number of concurrent prefetches. */
  maxInflight?: number;
  /** Max unique jobs to remember as already-prefetched. */
  maxSeen?: number;
  /** If true, allow prefetching an id again after errors. */
  retryOnError?: boolean;
};

/**
 * Debounced, deduped, concurrency-limited prefetch for job details.
 * This prevents Convex from being spammed by incidental hover events.
 */
export function useJobDetailsPrefetch(options?: Options) {
  const convex = useConvex();
  const delayMs = options?.delayMs ?? 180;
  const maxInflight = options?.maxInflight ?? 2;
  const maxSeen = options?.maxSeen ?? 300;
  const retryOnError = options?.retryOnError ?? false;

  const timerByIdRef = useRef(new Map<string, number>());
  const inflightRef = useRef(0);
  const queuedRef = useRef<string[]>([]);
  // LRU-ish: keep a bounded set of ids we've already prefetched recently.
  const seenSetRef = useRef(new Set<string>());
  const seenQueueRef = useRef<string[]>([]);
  const seenFailedRef = useRef(new Set<string>());

  const enqueue = useCallback((jobId: string) => {
    if (!jobId) return;
    if (seenSetRef.current.has(jobId)) return;
    if (!retryOnError && seenFailedRef.current.has(jobId)) return;
    if (!queuedRef.current.includes(jobId)) {
      queuedRef.current.push(jobId);
    }
  }, [retryOnError]);

  const markSeen = useCallback(
    (jobId: string) => {
      if (seenSetRef.current.has(jobId)) return;
      seenSetRef.current.add(jobId);
      seenQueueRef.current.push(jobId);
      if (seenQueueRef.current.length > maxSeen) {
        const evicted = seenQueueRef.current.shift();
        if (evicted) seenSetRef.current.delete(evicted);
      }
    },
    [maxSeen]
  );

  const drain = useCallback(() => {
    while (inflightRef.current < maxInflight && queuedRef.current.length) {
      const jobId = queuedRef.current.shift()!;
      if (seenSetRef.current.has(jobId)) continue;
      markSeen(jobId);
      inflightRef.current += 1;
      void convex
        .query(api.jobs.getDetailsLite, { jobId: jobId as any })
        .catch(() => {
          seenFailedRef.current.add(jobId);
          // best-effort
        })
        .finally(() => {
          inflightRef.current -= 1;
          drain();
        });
    }
  }, [convex, markSeen, maxInflight, seenSetRef]);

  const schedule = useCallback(
    (jobId: string) => {
      if (!jobId || seenSetRef.current.has(jobId)) return;

      const existing = timerByIdRef.current.get(jobId);
      if (existing) window.clearTimeout(existing);

      const t = window.setTimeout(() => {
        timerByIdRef.current.delete(jobId);
        enqueue(jobId);
        drain();
      }, delayMs);

      timerByIdRef.current.set(jobId, t);
    },
    [delayMs, drain, enqueue]
  );

  const scheduleNow = useCallback(
    (jobId: string) => {
      if (!jobId || seenSetRef.current.has(jobId)) return;
      const existing = timerByIdRef.current.get(jobId);
      if (existing) {
        window.clearTimeout(existing);
        timerByIdRef.current.delete(jobId);
      }
      enqueue(jobId);
      drain();
    },
    [drain, enqueue]
  );

  const cancel = useCallback((jobId: string) => {
    const t = timerByIdRef.current.get(jobId);
    if (t) {
      window.clearTimeout(t);
      timerByIdRef.current.delete(jobId);
    }
  }, []);

  const cancelAll = useCallback(() => {
    for (const t of timerByIdRef.current.values()) window.clearTimeout(t);
    timerByIdRef.current.clear();
    queuedRef.current = [];
  }, []);

  useEffect(() => cancelAll, [cancelAll]);

  return useMemo(
    () => ({
      prefetch: schedule,
      prefetchNow: scheduleNow,
      cancel,
      cancelAll,
    }),
    [schedule, scheduleNow, cancel, cancelAll]
  );
}
