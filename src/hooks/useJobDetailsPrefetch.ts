import { api } from "../../convex/_generated/api";
import { useConvex } from "convex/react";
import { useCallback, useEffect, useMemo, useRef } from "react";

type Options = {
  /** Debounce window for hover intent. */
  delayMs?: number;
  /** Maximum number of concurrent prefetches. */
  maxInflight?: number;
};

/**
 * Debounced, deduped, concurrency-limited prefetch for job details.
 * This prevents Convex from being spammed by incidental hover events.
 */
export function useJobDetailsPrefetch(options?: Options) {
  const convex = useConvex();
  const delayMs = options?.delayMs ?? 180;
  const maxInflight = options?.maxInflight ?? 2;

  const timerByIdRef = useRef(new Map<string, number>());
  const inflightRef = useRef(0);
  const queuedRef = useRef<string[]>([]);
  const seenRef = useRef(new Set<string>());

  const drain = useCallback(() => {
    while (inflightRef.current < maxInflight && queuedRef.current.length) {
      const jobId = queuedRef.current.shift()!;
      if (seenRef.current.has(jobId)) continue;
      seenRef.current.add(jobId);
      inflightRef.current += 1;
      void convex
        .query(api.jobs.getDetails, { jobId: jobId as any })
        .catch(() => {
          // best-effort
        })
        .finally(() => {
          inflightRef.current -= 1;
          drain();
        });
    }
  }, [convex, maxInflight]);

  const schedule = useCallback(
    (jobId: string) => {
      if (!jobId || seenRef.current.has(jobId)) return;

      const existing = timerByIdRef.current.get(jobId);
      if (existing) window.clearTimeout(existing);

      const t = window.setTimeout(() => {
        timerByIdRef.current.delete(jobId);
        queuedRef.current.push(jobId);
        drain();
      }, delayMs);

      timerByIdRef.current.set(jobId, t);
    },
    [delayMs, drain]
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
      cancel,
      cancelAll,
    }),
    [schedule, cancel, cancelAll]
  );
}

