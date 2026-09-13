"use client";

import { getAuthEmail } from "@/lib/local-auth";
import type { JobCardResultDTO } from "@/types/convexJobs";
import { api } from "../../convex/_generated/api";
import { useQueries } from "convex/react";
import { useMemo } from "react";

const CHUNK_SIZE = 400;

function chunkIds(ids: string[], size: number): string[][] {
  if (ids.length === 0) return [];
  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += size) {
    chunks.push(ids.slice(i, i + size));
  }
  return chunks;
}

export function useTrackedJobs(externalIds: string[]) {
  const viewerEmail = getAuthEmail() ?? undefined;
  const chunks = useMemo(() => chunkIds(externalIds, CHUNK_SIZE), [externalIds]);

  const queryMap = useMemo(() => {
    const map: Record<string, { query: typeof api.jobs.byExternalIds; args: { ids: string[]; viewerEmail?: string } }> = {};
    chunks.forEach((ids, index) => {
      map[`chunk-${index}`] = {
        query: api.jobs.byExternalIds,
        args: { ids, viewerEmail },
      };
    });
    return map;
  }, [chunks, viewerEmail]);

  const results = useQueries(queryMap);

  const loading = chunks.length > 0 && Object.values(results).some((value) => value === undefined);
  const loadError = useMemo(() => {
    for (const value of Object.values(results)) {
      if (value instanceof Error) return value.message || "Couldn't load tracked jobs.";
    }
    return null;
  }, [results]);

  const jobs = useMemo(() => {
    if (chunks.length === 0) return [] as JobCardResultDTO[];
    if (loading || loadError) return [] as JobCardResultDTO[];
    const merged: JobCardResultDTO[] = [];
    for (let i = 0; i < chunks.length; i++) {
      const row = results[`chunk-${i}`];
      if (!row || row instanceof Error) continue;
      for (const item of row as unknown as JobCardResultDTO[]) merged.push(item);
    }
    return merged;
  }, [chunks.length, loadError, loading, results]);

  return { jobs, loading, loadError };
}
