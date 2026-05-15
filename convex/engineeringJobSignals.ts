/**
 * Title-only filter aligned with the HiringCafe jobTitleQuery:
 *   (stack terms) AND (developer | engineer | engineering | development | …)
 *
 * Descriptions/searchText are intentionally excluded — they cause false keeps
 * ("professional development", "submit your application", "spring season", etc.).
 */

/** Common SWE titles that satisfy the filter on their own. */
const COMPOUND_PHRASES: readonly string[] = [
  "software engineer",
  "software developer",
  "software development",
  "full stack",
  "full-stack",
  "fullstack",
  "web developer",
  "application developer",
  "mobile developer",
  "front end developer",
  "front-end developer",
  "back end developer",
  "back-end developer",
  "site reliability",
  "machine learning engineer",
  "machine learning",
  "deep learning",
  "data engineer",
  "data scientist",
  "cloud engineer",
  "platform engineer",
  "security engineer",
  "network engineer",
  "systems engineer",
  "system engineer",
  "devops engineer",
  "qa engineer",
  "test engineer",
  "automation engineer",
  "database engineer",
  "infrastructure engineer",
  "solutions engineer",
  "embedded engineer",
  "firmware engineer",
  "game developer",
  "react native",
  "tech lead",
  "engineering manager",
  "engineering lead",
  "director of engineering",
  "vp engineering",
  "head of engineering",
];

/** First group in the HiringCafe title query (whole-word match). */
const STACK_WORDS: readonly string[] = [
  "software",
  "application",
  "frontend",
  "backend",
  "fullstack",
  "android",
  "ios",
  "ai",
];

/** Second group in the HiringCafe title query (whole-word match). */
const ROLE_WORDS: readonly string[] = [
  "developer",
  "engineer",
  "engineering",
  "development",
  "programmer",
  "programming",
  "devops",
];

const COMPOUND_N = dedupe(COMPOUND_PHRASES);
const STACK_N = dedupe(STACK_WORDS);
const ROLE_N = dedupe(ROLE_WORDS);

function dedupe(values: readonly string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const v of values) {
    const k = v.trim().toLowerCase();
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(k);
  }
  return out;
}

function normalizeFlat(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9+#/.\s-]+/g, " ")
    .replace(/[-_/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasWholeWord(flat: string, word: string): boolean {
  const re = new RegExp(`\\b${escapeRegExp(word)}\\b`, "i");
  return re.test(flat);
}

function hasPhrase(flat: string, phrase: string): boolean {
  return flat.includes(phrase);
}

/**
 * Returns true when the job title (and optional department) looks like a SWE /
 * IT-engineering role per the HiringCafe-style title query.
 */
export function jobTitleLooksEngineering(
  title: string,
  department?: string | null,
): boolean {
  const flat = normalizeFlat([title, department ?? ""].filter(Boolean).join(" "));
  if (!flat) return false;

  for (const phrase of COMPOUND_N) {
    if (hasPhrase(flat, phrase)) return true;
  }

  const hasStack =
    hasPhrase(flat, "full stack") ||
    STACK_N.some((w) => hasWholeWord(flat, w));

  const hasRole = ROLE_N.some((w) => hasWholeWord(flat, w));

  return hasStack && hasRole;
}
