import type { CompanyDTO, JobCardResultDTO, JobDTO } from "@/types/convexJobs";

import { JOB_FADE_DURATION_MS } from "./fadeTransition";
import { stableCompanyKey } from "./stableCompanyKey";

/** Paginated search page size — smaller payloads reduce Convex read warnings. */
export const JOB_BOARD_PAGE_LIMIT = 24;

export const JOBS_PER_CARD = 6;

export const JOB_BOARD_NAV_FADE_OUT_MS = JOB_FADE_DURATION_MS;

export const JOB_BOARD_NAV_SETTLE_MS = 50;

export const JOB_BOARD_PREFILL_VIEWPORT_MARGIN_PX = 480;

export type JobBoardCollection = { company: CompanyDTO | null; jobs: JobDTO[] };

export type JobBoardSelectedPosition = { collectionIndex: number; jobIndex: number };

export type JobBoardFlattenedPosition = JobBoardSelectedPosition & { job: JobDTO };

export function formatJobBoardRoundedNumber(value: number, round = 3): string {
  return (Math.round(value / 10 ** round) * 10 ** round).toLocaleString();
}

export function getJobBoardCollectionKey(collection: JobBoardCollection, index: number): string {
  const companyKey = collection.company?.companyId ?? collection.company?._id ?? collection.jobs[0]?.companyId ?? "unknown";
  const firstJobKey = collection.jobs[0]?.externalId ?? index;
  return `${companyKey}-${firstJobKey}`;
}

/**
 * Groups visible search rows by company, then chunks each company's jobs into card-sized slices.
 */
export function buildJobBoardDisplayedCollections(
  accumulatedRows: JobCardResultDTO[],
  visibleRowCount: number,
  jobsPerCard: number = JOBS_PER_CARD
): JobBoardCollection[] {
  const visibleRows = accumulatedRows.slice(0, visibleRowCount);
  if (!visibleRows.length) return [];

  const collectionsMap = new Map<string, JobBoardCollection>();
  for (const item of visibleRows) {
    const companyKey = item.company?.companyId ?? item.company?._id ?? item.job.companyId ?? item.job.externalId;
    const existing = collectionsMap.get(companyKey);
    if (existing) {
      existing.jobs.push(item.job);
    } else {
      collectionsMap.set(companyKey, { company: item.company, jobs: [item.job] });
    }
  }

  const chunkedCollections: JobBoardCollection[] = [];
  for (const collection of collectionsMap.values()) {
    for (let i = 0; i < collection.jobs.length; i += jobsPerCard) {
      chunkedCollections.push({
        company: collection.company,
        jobs: collection.jobs.slice(i, i + jobsPerCard),
      });
    }
  }

  return chunkedCollections;
}

export function flattenJobBoardPositions(displayedCollections: JobBoardCollection[]): JobBoardFlattenedPosition[] {
  const rows: JobBoardFlattenedPosition[] = [];
  for (let collectionIndex = 0; collectionIndex < displayedCollections.length; collectionIndex += 1) {
    const collection = displayedCollections[collectionIndex];
    for (let jobIndex = 0; jobIndex < collection.jobs.length; jobIndex += 1) {
      rows.push({ collectionIndex, jobIndex, job: collection.jobs[jobIndex] });
    }
  }
  return rows;
}

export function jobBoardFlatIndexForSelection(
  flattened: JobBoardFlattenedPosition[],
  selected: JobBoardSelectedPosition | null
): number {
  if (!selected) return -1;
  return flattened.findIndex((item) => item.collectionIndex === selected.collectionIndex && item.jobIndex === selected.jobIndex);
}

/** Clamped job index remembered per collection key (outside navigation). */
export function jobBoardRememberedJobIndex(
  collection: JobBoardCollection,
  collectionIndex: number,
  jobIndexByCollection: Record<string, number>
): number {
  const key = getJobBoardCollectionKey(collection, collectionIndex);
  return Math.max(0, Math.min(jobIndexByCollection[key] ?? 0, collection.jobs.length - 1));
}

export function jobBoardFadeCompanyChromeBetweenJobs(
  fromCollection: JobBoardCollection,
  fromJob: JobDTO,
  toCollection: JobBoardCollection,
  toJob: JobDTO
): boolean {
  return stableCompanyKey(fromCollection.company, fromJob) !== stableCompanyKey(toCollection.company, toJob);
}

export function jobBoardFadeCompanyChromeBetweenFlatNeighbors(
  displayedCollections: JobBoardCollection[],
  from: JobBoardFlattenedPosition,
  to: JobBoardFlattenedPosition
): boolean {
  const fromCollection = displayedCollections[from.collectionIndex];
  const toCollection = displayedCollections[to.collectionIndex];
  if (!fromCollection || !toCollection) return true;
  return jobBoardFadeCompanyChromeBetweenJobs(fromCollection, from.job, toCollection, to.job);
}
