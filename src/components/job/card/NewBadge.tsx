import { cn } from "@/lib/utils";

/** How many jobs share the "New" badge bucket: 1 job in 5 is labeled New. */
const NEW_JOB_RATIO = 5;

/**
 * FNV-1a followed by an avalanche mix.
 *
 * The result is stable for a given string (the badge never flickers between
 * renders or reloads) and spreads evenly over the modulo buckets, so the
 * ratio holds across the whole board instead of clumping.
 */
function hashString(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x85ebca6b);
  hash ^= hash >>> 13;
  hash = Math.imul(hash, 0xc2b2ae35);
  hash ^= hash >>> 16;
  return hash >>> 0;
}

/**
 * Whether a job carries the "New" badge.
 *
 * The badge is a stable pseudo-random label: the job id is hashed, so a job
 * keeps the same badge on every render and reload, and roughly 1 in 5 jobs
 * across the board are labeled New. Publish dates are accepted for
 * compatibility but no longer drive the label.
 */
export function isJobNew(
  job: {
    externalId?: string;
    _id?: string;
    jobId?: string;
    id?: string;
    title?: string;
    estimatedPublishDateMillis?: number | null;
    estimatedPublishDate?: string | null;
    createdAt?: number | null;
  },
  seenIds?: Set<string> | readonly string[]
): boolean {
  const idToHash = job.externalId || job.jobId || job._id || job.id || job.title || "";
  if (!idToHash) return false;
  if (seenIds) {
    const isSeen = seenIds instanceof Set ? seenIds.has(idToHash) : seenIds.includes(idToHash);
    if (isSeen) return false;
  }
  return hashString(idToHash) % NEW_JOB_RATIO === 0;
}

/**
 * Gate deciding whether a card should render the "New" badge.
 *
 * Rules:
 * 1. Never show if unread view is active — the user already filtered to unread/new jobs.
 * 2. Never show if the item is currently selected in selection mode.
 * 3. Never show if the item has already been seen in this session.
 * 4. Otherwise show if the job is classified as new.
 */
export function shouldShowNewBadge({
  isNew,
  isSeen = false,
  isSelected = false,
  unreadView = false,
}: {
  isNew: boolean;
  isSeen?: boolean;
  isSelected?: boolean;
  unreadView?: boolean;
}): boolean {
  if (unreadView) return false;
  if (isSelected) return false;
  if (isSeen) return false;
  return isNew;
}

/**
 * "New" pill on the card's top-left corner — sits above the border so it
 * does not cover the job title.
 */
export default function NewBadge({ visible = true }: { visible?: boolean }) {
  if (!visible) return null;
  return (
    <span
      className={cn(
        "rounded-full bg-emerald-600 px-2 py-0.5 font-bold text-white shadow-sm ring-1 ring-emerald-500/20",
        "text-[10px] tracking-wide uppercase transition-colors dark:bg-emerald-500 dark:text-zinc-950"
      )}
    >
      New
    </span>
  );
}
