/**
 * Utilities for parsing and formatting publish / scrape relative timestamps.
 * Display units follow standard human abbreviations:
 * - Nmin: minutes (e.g. 5min, 0min for sub-minute)
 * - Nh:   hours (e.g. 2h)
 * - Nd:   days (e.g. 3d)
 * - Nw:   weeks (e.g. 1w)
 * - Nm:   months (e.g. 2m)
 * - Ny:   years (e.g. 1y)
 * Raw seconds (e.g. 0s, 30s) are not used in human card displays.
 *
 * Card displays use `getJobTimeDisplay`, which never renders the internal "0min"
 * placeholder: it either shows a real relative time, "now", or nothing at all.
 */

/** Normalize epoch values that may be stored as seconds or microseconds instead of milliseconds. */
export function normalizeEpochMillis(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  // Epoch seconds (e.g. 1.7e9 is Nov 2023; < 1e11 corresponds to year 1973 in ms or 5138 in s)
  if (value < 1e11) return Math.round(value * 1000);
  // Epoch microseconds (e.g. 1.7e15)
  if (value >= 1e14) return Math.round(value / 1000);
  return Math.round(value);
}

/**
 * Parse relative natural language strings into epoch milliseconds.
 * Supports strings like "2d ago", "3h", "1w ago", "10min", "10mn", "yesterday",
 * "scraped 2 days ago", "posted 30+ days ago", "30+d ago", "30d+", "about 2 hours ago", etc.
 */
export function parseRelativeDateString(str: string, nowMillis: number = Date.now()): number | null {
  const clean = str.trim().toLowerCase();
  if (!clean) return null;

  if (clean === "just now" || clean === "right now" || clean === "moments ago" || clean === "today") {
    return nowMillis;
  }
  if (clean === "yesterday") {
    return nowMillis - 86_400_000;
  }

  // Strip common conversational prefixes like "scraped", "posted", "added", "active", "updated", "about", "over", ">", "+", "~"
  const stripped = clean.replace(/^(?:scraped|posted|added|active|updated|published|listed|about|over|approx(?:imately)?|more than|[>~+])\s*/i, "").trim();

  // Matches e.g. "2 days ago", "30+ days ago", "30+d", "30d+", "3 hours ago", "2d ago", "5h", "10min", "10mn", "3w ago", "2mo ago", "1y"
  const match = stripped.match(
    /^(\d+(?:\.\d+)?)\+?\s*(s|sec|secs|second|seconds|mn|min|mins|minute|minutes|h|hr|hrs|hour|hours|d|day|days|w|wk|wks|week|weeks|mo|mon|mons|month|months|mth|mths|m|y|yr|yrs|year|years)\+?\s*(?:ago)?$/i
  );
  if (!match) return null;

  const value = parseFloat(match[1]);
  if (!Number.isFinite(value) || value < 0) return null;

  const unit = match[2].toLowerCase();
  let msFactor = 0;

  if (unit === "s" || unit.startsWith("sec")) {
    msFactor = 1000;
  } else if (unit === "mn" || unit.startsWith("min")) {
    msFactor = 60_000;
  } else if (unit === "h" || unit.startsWith("hr") || unit.startsWith("hour")) {
    msFactor = 3_600_000;
  } else if (unit === "d" || unit.startsWith("day")) {
    msFactor = 86_400_000;
  } else if (unit === "w" || unit.startsWith("wk") || unit.startsWith("week")) {
    msFactor = 7 * 86_400_000;
  } else if (unit === "mo" || unit.startsWith("mon") || unit.startsWith("month") || unit.startsWith("mth")) {
    msFactor = 30.44 * 86_400_000;
  } else if (unit === "y" || unit.startsWith("yr") || unit.startsWith("year")) {
    msFactor = 365.25 * 86_400_000;
  } else if (unit === "m") {
    // "m" alone in relative strings (e.g. "5m ago", "10m") represents minutes.
    msFactor = 60_000;
  }

  if (msFactor === 0) return null;
  return Math.round(nowMillis - value * msFactor);
}

/**
 * Which kind of timestamp a resolved time represents.
 * - "publish": a (estimated) publish date for the job.
 * - "scrape":  the moment HiringCafe ingested / scraped the job.
 * - "none":    no usable timestamp at all.
 */
export type PublishTimeSource = "publish" | "scrape" | "none";

export interface ResolvedPublishTime {
  /** Resolved timestamp in epoch milliseconds, or null when nothing usable was found. */
  millis: number | null;
  /** Which kind of timestamp `millis` represents. */
  source: PublishTimeSource;
}

/**
 * Robustly resolve the real scrape/publish timestamp in milliseconds from either a date
 * string (ISO, epoch string, or relative text) or numeric epoch milliseconds.
 *
 * Avoids Date.now() mishandling (where DB updatedAt or ingestion timestamp overrides the real
 * scraped date) and epoch confusion (e.g. 0 / 1970 or seconds treated as milliseconds).
 *
 * When referenceBaseMillis is provided (e.g. job card createdAt), relative expressions
 * (like "2d ago" or "0s" recorded at scrape time) resolve relative to that reference base.
 */
export function parsePublishTimeMillis(dateString?: string | null, millis?: number | null, nowMillis: number = Date.now(), referenceBaseMillis?: number | null): number | null {
  return resolvePublishTime(dateString, millis, nowMillis, referenceBaseMillis).millis;
}

/**
 * Same resolution rules as `parsePublishTimeMillis`, but it also reports what the resolved
 * timestamp actually is, so callers can label it correctly:
 * - "publish" when it came from a publish date (string or publish millis),
 * - "scrape"  when it came from the ingestion reference (card createdAt),
 * - "none"    when no usable timestamp exists.
 */
export function resolvePublishTime(dateString?: string | null, millis?: number | null, nowMillis: number = Date.now(), referenceBaseMillis?: number | null): ResolvedPublishTime {
  const base =
    typeof referenceBaseMillis === "number" && Number.isFinite(referenceBaseMillis) && referenceBaseMillis > 946_684_800_000 ? normalizeEpochMillis(referenceBaseMillis) : null;

  // 1. Resolve numeric millis if valid
  let numericMillis: number | null = null;
  if (typeof millis === "number" && Number.isFinite(millis) && millis > 0) {
    const normalized = normalizeEpochMillis(millis);
    // Ignore epoch 0 or pre-2000 numbers that indicate empty/corrupt timestamps
    if (normalized > 946_684_800_000) {
      numericMillis = normalized;
    }
  }

  // 2. Resolve stringMillis from dateString
  let stringMillis: number | null = null;
  let stringSource: PublishTimeSource = "none";
  if (typeof dateString === "string") {
    const trimmed = dateString.trim();
    if (trimmed) {
      // If dateString is "0s" or "0", check if we have a historical base timestamp
      if (trimmed === "0" || trimmed === "0s") {
        if (base !== null && nowMillis - base > 60_000) {
          stringMillis = base;
          stringSource = "scrape";
        } else if (numericMillis !== null && nowMillis - numericMillis > 60_000) {
          stringMillis = numericMillis;
          stringSource = "publish";
        }
      } else {
        // Check if it's a numeric epoch string (e.g. "1712345678" or "1712345678000")
        if (/^\d+(\.\d+)?$/.test(trimmed)) {
          const parsedNum = Number(trimmed);
          if (Number.isFinite(parsedNum) && parsedNum > 0) {
            const norm = normalizeEpochMillis(parsedNum);
            if (norm > 946_684_800_000) {
              stringMillis = norm;
              stringSource = "publish";
            }
          }
        }

        // Check standard ISO / RFC date parsing
        if (stringMillis === null) {
          const fromDateParse = Date.parse(trimmed);
          if (!Number.isNaN(fromDateParse) && fromDateParse > 946_684_800_000) {
            stringMillis = fromDateParse;
            stringSource = "publish";
          }
        }

        // Check relative natural text parsing (e.g. "2d ago", "3 hours ago", "yesterday", "30+ days ago")
        // Relative text was recorded at base time (createdAt) if available, otherwise nowMillis
        if (stringMillis === null) {
          const relativeMillis = parseRelativeDateString(trimmed, base ?? nowMillis);
          if (relativeMillis !== null) {
            stringMillis = relativeMillis;
            stringSource = "publish";
          }
        }
      }
    }
  }

  // 3. Reconcile sources
  if (stringMillis === null && numericMillis === null) {
    return base !== null ? { millis: base, source: "scrape" } : { millis: null, source: "none" };
  }
  if (stringMillis !== null && numericMillis === null) {
    return { millis: stringMillis, source: stringSource };
  }
  if (stringMillis === null && numericMillis !== null) {
    // If numericMillis is ingestion write-time (~now) but we have an older base (card createdAt), prefer base
    if (base !== null && nowMillis - base > 120_000 && Math.abs(nowMillis - numericMillis) < 120_000) {
      return { millis: base, source: "scrape" };
    }
    return { millis: numericMillis, source: "publish" };
  }

  // Both stringMillis and numericMillis are present:
  if (stringMillis !== null && numericMillis !== null) {
    const numericAgeMs = nowMillis - numericMillis;
    const stringAgeMs = nowMillis - stringMillis;

    // If numericMillis is recent write-time (e.g. within 2 hours of now) but stringMillis represents an older
    // publication date from scraped text, always prefer stringMillis.
    if (numericAgeMs < 2 * 3_600_000 && stringAgeMs > numericAgeMs + 60_000) {
      return { millis: stringMillis, source: stringSource };
    }

    // If numericMillis is in the future (> 1 day) but stringMillis is past/valid:
    if (numericMillis > nowMillis + 86_400_000 && stringMillis <= nowMillis + 60_000) {
      return { millis: stringMillis, source: stringSource };
    }

    // Default to earlier/real historical timestamp
    return stringMillis < numericMillis ? { millis: stringMillis, source: stringSource } : { millis: numericMillis, source: "publish" };
  }

  return { millis: stringMillis ?? numericMillis ?? base, source: stringSource };
}

const MINUTE_MS = 60_000;
const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;
const WEEK_MS = 7 * DAY_MS;
const MONTH_MS = 30.44 * DAY_MS;
const YEAR_MS = 365.25 * DAY_MS;

/**
 * Format relative time using human units: Nmin / Nh / Nd / Nw / Nm / Ny.
 * Raw seconds (0s) are never displayed. Sub-minute is formatted as "0min" / "less than a minute".
 */
export function formatRelativeTime(
  fromMillis: number,
  nowMillis: number = Date.now()
): {
  abbreviated: string;
  full: string;
} {
  if (!Number.isFinite(fromMillis) || fromMillis <= 0) {
    return { abbreviated: "", full: "" };
  }

  const normalizedFrom = normalizeEpochMillis(fromMillis);
  const diffMs = nowMillis - normalizedFrom;

  // Handle future dates (clock drift or scheduled jobs) without clamping everything to 0s
  if (diffMs < 0) {
    if (diffMs > -300_000) {
      // Small clock skew (up to 5 min into future)
      return {
        abbreviated: "0min",
        full: "less than a minute",
      };
    }
    return {
      abbreviated: "0min",
      full: "just now",
    };
  }

  if (diffMs < MINUTE_MS) {
    return {
      abbreviated: "0min",
      full: "less than a minute",
    };
  }

  if (diffMs < HOUR_MS) {
    const minutes = Math.max(1, Math.round(diffMs / MINUTE_MS));
    return {
      abbreviated: `${minutes}min`,
      full: `${minutes} minute${minutes !== 1 ? "s" : ""}`,
    };
  }

  if (diffMs < DAY_MS) {
    const hours = Math.max(1, Math.round(diffMs / HOUR_MS));
    return {
      abbreviated: `${hours}h`,
      full: `${hours} hour${hours !== 1 ? "s" : ""}`,
    };
  }

  if (diffMs < 7 * DAY_MS) {
    const days = Math.max(1, Math.round(diffMs / DAY_MS));
    return {
      abbreviated: `${days}d`,
      full: `${days} day${days !== 1 ? "s" : ""}`,
    };
  }

  if (diffMs < 28 * DAY_MS) {
    const weeks = Math.max(1, Math.round(diffMs / WEEK_MS));
    return {
      abbreviated: `${weeks}w`,
      full: `${weeks} week${weeks !== 1 ? "s" : ""}`,
    };
  }

  if (diffMs < 345 * DAY_MS) {
    const months = Math.max(1, Math.round(diffMs / MONTH_MS));
    return {
      abbreviated: `${months}m`,
      full: `${months} month${months !== 1 ? "s" : ""}`,
    };
  }

  const years = Math.max(1, Math.round(diffMs / YEAR_MS));
  return {
    abbreviated: `${years}y`,
    full: `${years} year${years !== 1 ? "s" : ""}`,
  };
}

export function getTimeSinceFromPublish(
  dateString?: string | null,
  millis?: number | null,
  nowMillis: number = Date.now(),
  referenceBaseMillis?: number | null
): {
  abbreviated: string;
  full: string;
} {
  const fromMillis = parsePublishTimeMillis(dateString, millis, nowMillis, referenceBaseMillis);
  if (fromMillis === null) return { abbreviated: "", full: "" };
  return formatRelativeTime(fromMillis, nowMillis);
}

/** A publish estimate further ahead than this is a broken estimate, not a real publish date. */
const MAX_FUTURE_PUBLISH_SKEW_MS = 5 * 60_000;

export interface JobTimeDisplay {
  /** Short label for a job card chip, e.g. "3d". Empty when there is nothing meaningful to show. */
  abbreviated: string;
  /** Human readable relative time, e.g. "3 days". */
  full: string;
  /** Resolved timestamp in epoch milliseconds, or null when unknown. */
  millis: number | null;
  /** Whether the timestamp is a publish date or the scrape/ingest time. */
  source: PublishTimeSource;
  /** True when the publish estimate was unusable (it lies in the future) and the job is shown as brand new. */
  isPublishEstimateUnreliable?: boolean;
}

/**
 * Relative time for a job card, together with the kind of timestamp it is based on.
 *
 * Rules:
 * - A usable publish date wins; the chip then describes the age of the job.
 * - A publish estimate that lies in the future is broken data (some feeds compute the
 *   publish date against the wrong base). Such a job cannot be older than now, so it is
 *   clamped to now and flagged, instead of rendering the meaningless "0min" the raw
 *   formatter produces for every future timestamp.
 * - When there is no publish date at all, the scrape/ingest timestamp is used instead and
 *   the caller labels it as a scrape time.
 * - A sub-minute age is never rendered as "0min": a publish date that recent reads as
 *   "now", while a scrape timestamp that recent carries no information at all and is
 *   dropped (empty `abbreviated`) so the card shows no chip.
 */
export function getJobTimeDisplay(dateString?: string | null, millis?: number | null, nowMillis: number = Date.now(), referenceBaseMillis?: number | null): JobTimeDisplay {
  const resolved = resolvePublishTime(dateString, millis, nowMillis, referenceBaseMillis);

  if (resolved.millis === null) {
    return { abbreviated: "", full: "", millis: null, source: "none" };
  }

  if (resolved.source === "publish" && resolved.millis - nowMillis > MAX_FUTURE_PUBLISH_SKEW_MS) {
    // The publish estimate cannot be right (it is in the future): the job is at most as
    // old as now, so show it as brand new instead of a bogus "0min".
    return { abbreviated: "now", full: "just now", millis: nowMillis, source: "publish", isPublishEstimateUnreliable: true };
  }

  const formatted = formatRelativeTime(resolved.millis, nowMillis);
  if (!formatted.abbreviated) {
    return { abbreviated: "", full: "", millis: resolved.millis, source: resolved.source };
  }

  if (formatted.abbreviated === "0min") {
    // Sub-minute: "0min" is meaningless on a card.
    if (resolved.source === "publish") {
      return { abbreviated: "now", full: "just now", millis: resolved.millis, source: "publish" };
    }
    return { abbreviated: "", full: "just now", millis: resolved.millis, source: "scrape" };
  }

  return { abbreviated: formatted.abbreviated, full: formatted.full, millis: resolved.millis, source: resolved.source };
}

/**
 * Format relative timestamps into a consistent compact display format:
 * "1w", "4d", "2h", "15min", "1m", "1y", or "now".
 *
 * Supports already-compact inputs ("1w", "4d"), natural language strings
 * ("1 week ago", "4 days ago", "yesterday", "just now"), ISO strings,
 * and numeric epoch timestamps.
 */
export function formatCompactRelativeTime(date?: string | number | null, nowMillis: number = Date.now()): string {
  if (date === null || date === undefined || date === "") {
    return "";
  }

  if (typeof date === "number") {
    const formatted = formatRelativeTime(date, nowMillis);
    if (!formatted.abbreviated || formatted.abbreviated === "0min") return "now";
    return formatted.abbreviated;
  }

  const trimmed = date.trim();
  if (!trimmed) return "";

  // Already compact format: e.g. "1w", "4d", "2h", "15min", "1m", "1y"
  if (/^\d+\s*(?:min|[smhdwy])$/i.test(trimmed)) {
    return trimmed.replace(/\s+/g, "").toLowerCase();
  }

  const clean = trimmed.toLowerCase();
  if (
    clean === "today" ||
    clean === "just now" ||
    clean === "right now" ||
    clean === "moments ago" ||
    clean.startsWith("today,") ||
    clean.startsWith("today at ")
  ) {
    return "now";
  }
  if (clean === "yesterday" || clean.startsWith("yesterday,") || clean.startsWith("yesterday at ")) {
    return "1d";
  }

  // Direct regex pattern for natural relative strings like "1 week ago", "4 days ago", "2 months ago", "3w ago"
  const directMatch = clean
    .replace(/^(?:scraped|posted|added|active|updated|published|listed|about|over|approx(?:imately)?|more than|[>~+])\s*/i, "")
    .trim()
    .match(
      /^(\d+(?:\.\d+)?)\+?\s*(s|sec|secs|second|seconds|mn|min|mins|minute|minutes|h|hr|hrs|hour|hours|d|day|days|w|wk|wks|week|weeks|mo|mon|mons|month|months|mth|mths|m|y|yr|yrs|year|years)\+?\s*(?:ago)?$/i
    );

  if (directMatch) {
    const num = Math.round(parseFloat(directMatch[1]));
    const unit = directMatch[2].toLowerCase();

    if (unit.startsWith("w")) return `${num}w`;
    if (unit.startsWith("d")) return `${num}d`;
    if (unit.startsWith("h")) return `${num}h`;
    if (unit.startsWith("y")) return `${num}y`;
    if (unit === "mo" || unit.startsWith("mon") || unit.startsWith("month") || unit.startsWith("mth") || unit === "m") {
      return `${num}m`;
    }
    if (unit.startsWith("min") || unit === "mn") return `${num}min`;
    if (unit.startsWith("s")) return "now";
  }

  // Fallback through full parser (handles ISO dates, numeric strings, etc.)
  const { abbreviated } = getTimeSinceFromPublish(trimmed, null, nowMillis);
  if (abbreviated) {
    return abbreviated === "0min" ? "now" : abbreviated;
  }

  // Ensure any leftover "ago" is never rendered in compact displays
  return trimmed.replace(/\s+ago$/i, "");
}
