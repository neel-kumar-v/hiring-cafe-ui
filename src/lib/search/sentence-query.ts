/**
 * Sentence-query primitives for search-dialog filter titles.
 *
 * Filter sections render as natural-language sentences (e.g. "Show jobs from the past
 * 3 months") where each value in the sentence is an interactive blank (a dropdown
 * trigger or an inline number input). This module holds the pure string formatters
 * shared by every sentence title; the interactive blank components live in
 * `src/components/search/filters/util/sentence-query.tsx`, and the per-filter
 * consumers live under `src/components/search/filters/**`.
 */

// ---------------------------------------------------------------------------
// Multi-select lists
// ---------------------------------------------------------------------------

export type CountedListConjunction = "and" | "or";

export interface CountedListOptions {
  /**
   * `N1` threshold: a selection with **more than** this many items is compacted to
   * the "first N2 + remainder" form. Selections with `<= N1` items render as a
   * natural sentence list. Default: 3.
   */
  n1?: number;
  shortListLimit?: number;
  /**
   * `N2` threshold: when a selection is compacted, this many **shortest** labels
   * are shown (ties keep earlier selection order) before `+ {remaining} more`,
   * where `remaining = count - N2`. Default: 3.
   */
  n2?: number;
  compactListLimit?: number;
  /** Conjunction placed before the final item of a natural list. If omitted or null, joins with ", ". */
  conjunction?: CountedListConjunction | null;
  /** Include a serial (Oxford) comma before the final conjunction. Default true. */
  oxford?: boolean;
  /** Rendered when no items are selected. Default "" (empty string). */
  noneText?: string;
  /** Rendered when every option is selected (see `total` / `allSelected`). */
  allText?: string;
  /** Total selectable option count; `items.length >= total` counts as "all". */
  total?: number;
  /** Set explicitly when the caller already knows everything is selected. */
  allSelected?: boolean;
  /**
   * Renders the remainder count for compacted lists. Default renders
   * `"{remaining} more"`; the summary chip itself is appended as `+ {text}`.
   */
  moreText?: (remaining: number) => string;
}

const DEFAULT_N1_LIMIT = 3;
const DEFAULT_N2_LIMIT = 3;

function formatNaturalList(items: readonly string[], conjunction: CountedListConjunction | null | undefined, oxford: boolean): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];

  if (!conjunction) {
    return items.join(", ");
  }

  const head = items.slice(0, -1);
  const tail = items[items.length - 1];
  const headText = head.join(", ");
  const joinSeparator = head.length > 1 && oxford ? ", " : " ";
  return `${headText}${joinSeparator}${conjunction} ${tail}`;
}

/**
 * Joins selected option labels into the display text for a multi-select sentence blank.
 *
 * Below or equal to N1 threshold (`n1` / `shortListLimit`, default 3):
 * - If `conjunction` is provided ("and" | "or"): formats as natural English list with serial comma
 * - If `conjunction` is omitted: joins with ", "
 *
 * Above N1 threshold:
 * - Picks the N2 (`n2` / `compactListLimit`, default 3) shortest labels (stable on
 *   ties), renders those in original selection order joined with ", ", then
 *   `+ {remaining} more` (or custom `moreText`).
 *
 * Special cases:
 * - Empty selection returns `noneText` (default "").
 * - Full selection (`allSelected` or `items.length >= total`) returns `allText` if provided.
 */
export function formatCountedList(items: readonly string[], options: CountedListOptions = {}): string {
  const { n1, shortListLimit, n2, compactListLimit, conjunction, oxford = true, noneText = "", allText, total, allSelected, moreText = formatCountMoreSuffix } = options;

  const effectiveN1 = n1 ?? shortListLimit ?? DEFAULT_N1_LIMIT;
  const effectiveN2 = n2 ?? compactListLimit ?? DEFAULT_N2_LIMIT;

  const selected = items.filter((item) => item.length > 0);

  if (selected.length === 0) return noneText;

  const isAllSelected = allSelected ?? (total != null && selected.length >= total);
  if (allText != null && isAllSelected) return allText;

  if (selected.length <= effectiveN1) {
    return formatNaturalList(selected, conjunction, oxford);
  }

  const shownCount = Math.max(1, Math.min(effectiveN2, selected.length));
  // Prefer the shortest labels so the compact chip packs more meaning before "+ N more".
  const shown = selected
    .map((item, index) => ({ item, index, len: item.length }))
    .sort((a, b) => a.len - b.len || a.index - b.index)
    .slice(0, shownCount)
    .sort((a, b) => a.index - b.index)
    .map((entry) => entry.item);
  const joined = shown.join(", ");
  const remaining = selected.length - shownCount;
  if (remaining <= 0) return joined;
  return `${joined} + ${moreText(remaining)}`;
}

/** Default `moreText` renderer: the bare remainder phrase appended after "+ ". */
export function formatCountMoreSuffix(remaining: number): string {
  return `${remaining} more`;
}

// ---------------------------------------------------------------------------
// Compact numbers (money-style amounts)
// ---------------------------------------------------------------------------

/** Compact, lowercase amount formatting: 70000 → "70k", 1200000 → "1.2m". */
export function formatCompactNumber(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "0";
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value).toLowerCase();
}

/** Builds a `"USD yearly"`-style suffix from currency code + frequency. */
export function formatMoneySuffix(currency: string | undefined, frequency: string | undefined): string {
  const currencyText = (currency ?? "").trim().toUpperCase();
  const frequencyText = frequency && frequency !== "Any" ? frequency.toLowerCase() : "";
  return [currencyText, frequencyText].filter(Boolean).join(" ");
}

// ---------------------------------------------------------------------------
// Ranges
// ---------------------------------------------------------------------------

export type RangeKind = "none" | "exact" | "between" | "atLeast" | "upTo";

export interface RangeBounds {
  kind: RangeKind;
  low: number;
  high: number;
}

export interface DescribeRangeOptions {
  /** Treat 0 as "unset" (hiring.cafe ranges use 0 for "no value"). Default true. */
  zeroIsUnset?: boolean;
}

/** Normalizes a min/max pair into the sentence-query range kinds. */
export function describeRange(min: number, max: number, options: DescribeRangeOptions = {}): RangeBounds {
  const zeroIsUnset = options.zeroIsUnset ?? true;
  const minSet = zeroIsUnset ? min > 0 : Number.isFinite(min);
  const maxSet = zeroIsUnset ? max > 0 : Number.isFinite(max);

  if (!minSet && !maxSet) return { kind: "none", low: 0, high: 0 };

  if (minSet && maxSet) {
    if (min === max) return { kind: "exact", low: min, high: max };
    return { kind: "between", low: Math.min(min, max), high: Math.max(min, max) };
  }

  return minSet ? { kind: "atLeast", low: min, high: 0 } : { kind: "upTo", low: 0, high: max };
}

export interface RangePhrases {
  exact: (value: number) => string;
  between: (low: number, high: number) => string;
  atLeast: (value: number) => string;
  upTo: (value: number) => string;
}

export interface MakeRangePhrasesOptions {
  /** Formats raw numbers before embedding (e.g. `formatCompactNumber`). Default `String(value)`. */
  format?: (value: number) => string;
  /** Unit appended to single-value phrases: `1 → singularUnit`, otherwise `unit`. */
  unit?: string;
  /** Unit used for exactly 1 when it differs from `unit`. Default `unit`. */
  singularUnit?: string;
  /** Text between low/high in the default between phrase. Default `" – "` (spaced en dash). */
  separator?: string;
  /** Overrides replace the default phrasing for a kind; they receive pre-formatted text (no unit). */
  exactPhrase?: (value: string) => string;
  betweenPhrase?: (low: string, high: string) => string;
  atLeastPhrase?: (value: string) => string;
  upToPhrase?: (value: string) => string;
}

/** Default separator used by range phrases: a spaced en dash ("2000 – 2010"). */
export const DEFAULT_RANGE_SEPARATOR = " – ";

/**
 * Builds a `RangePhrases` set. Single-value kinds (exact/atLeast/upTo) append the
 * unit by default; the between phrase is caller-shaped (unit placement varies per
 * sentence) unless left default, in which case it renders `"{low} – {high}"`.
 */
export function makeRangePhrases(options: MakeRangePhrasesOptions = {}): RangePhrases {
  const { format = String, unit, singularUnit, separator = DEFAULT_RANGE_SEPARATOR } = options;

  const formatPlainText = (value: number): string => format(value);
  const formatWithUnit = (value: number): string => {
    const text = formatPlainText(value);
    if (!unit) return text;
    return `${text} ${value === 1 ? (singularUnit ?? unit) : unit}`;
  };

  return {
    exact: options.exactPhrase ? (value) => options.exactPhrase!(formatPlainText(value)) : formatWithUnit,
    between: options.betweenPhrase
      ? (low, high) => options.betweenPhrase!(formatPlainText(low), formatPlainText(high))
      : (low, high) => `${formatPlainText(low)}${separator}${formatPlainText(high)}`,
    atLeast: options.atLeastPhrase ? (value) => options.atLeastPhrase!(formatPlainText(value)) : (value) => `at least ${formatWithUnit(value)}`,
    upTo: options.upToPhrase ? (value) => options.upToPhrase!(formatPlainText(value)) : (value) => `up to ${formatWithUnit(value)}`,
  };
}

/** Applies range phrases to normalized bounds; returns null when the range is unset. */
export function formatRangeParts(bounds: RangeBounds, phrases: RangePhrases): string | null {
  switch (bounds.kind) {
    case "exact":
      return phrases.exact(bounds.low);
    case "between":
      return phrases.between(bounds.low, bounds.high);
    case "atLeast":
      return phrases.atLeast(bounds.low);
    case "upTo":
      return phrases.upTo(bounds.high);
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Salary sentence
// ---------------------------------------------------------------------------

export interface SalarySentenceInput {
  /** Already-extracted lower bound for the requested pay (0 = no lower bound). */
  min: number;
  /** Already-extracted upper bound for the requested pay (0 = no upper bound). */
  max: number;
  /** Currency code, e.g. "USD". Empty/missing omits it from the suffix. */
  currency?: string;
  /** Pay frequency, e.g. "Yearly"; "Any" (or empty) omits it from the suffix. */
  unit?: string;
  /** When no bounds are set, renders the "hide undisclosed" sentence instead. */
  undisclosed?: boolean;
}

const SALARY_RANGE_PHRASES = makeRangePhrases({
  format: formatCompactNumber,
  betweenPhrase: (low, high) => `between ${low} - ${high}`,
});

/**
 * Salary sentence: `Must pay between {amount} - {amount} {currency} {frequency}`
 * (amounts are compact, e.g. "70k"). Unset bounds fall back to the "any salary"
 * sentence, or the "hide undisclosed" sentence when only that toggle is set.
 */
export function formatSalarySentence(input: SalarySentenceInput): string {
  const { min, max, currency, unit, undisclosed } = input;
  const bounds = describeRange(min, max);
  const phrase = formatRangeParts(bounds, SALARY_RANGE_PHRASES);
  if (!phrase) {
    return undisclosed ? "Hide jobs with undisclosed salaries" : "Show jobs with any salary";
  }

  const suffix = formatMoneySuffix(currency, unit);
  return suffix ? `Must pay ${phrase} ${suffix}` : `Must pay ${phrase}`;
}

// ---------------------------------------------------------------------------
// Company-size sentence
// ---------------------------------------------------------------------------

const COMPANY_SIZE_PHRASES = makeRangePhrases({
  unit: "employees",
  singularUnit: "employee",
  betweenPhrase: (low, high) => `between ${low} and ${high} employees`,
  atLeastPhrase: (value) => `at least ${value} employees`,
  upToPhrase: (value) => `up to ${value} employees`,
});

/**
 * Company-size sentence: "Company has between 1 and 10 employees",
 * "Company has at least 100 employees", "Company has up to 50 employees",
 * "Company has 25 employees". Returns null when no bounds are set so callers can
 * keep their neutral placeholder title.
 */
export function formatCompanySizeSentence(min: number, max: number): string | null {
  const phrase = formatRangeParts(describeRange(min, max), COMPANY_SIZE_PHRASES);
  return phrase ? `Company has ${phrase}` : null;
}

// ---------------------------------------------------------------------------
// Founding-year sentence
// ---------------------------------------------------------------------------

const FOUNDING_YEAR_PHRASES = makeRangePhrases({
  exactPhrase: (value) => `in ${value}`,
  betweenPhrase: (low, high) => `between ${low} – ${high}`,
  atLeastPhrase: (value) => `after ${value}`,
  upToPhrase: (value) => `before ${value}`,
});

/**
 * Founding-year sentence: "Founded between 2000 – 2010", "Founded after 2010",
 * "Founded before 2020", "Founded in 2015". Returns null when no bounds are set so
 * callers can keep their neutral placeholder title.
 */
export function formatFoundingYearsSentence(min: number, max: number): string | null {
  const phrase = formatRangeParts(describeRange(min, max), FOUNDING_YEAR_PHRASES);
  return phrase ? `Founded ${phrase}` : null;
}

// ---------------------------------------------------------------------------
// Experience-years sentence
// ---------------------------------------------------------------------------

export const EXPERIENCE_YEAR_PHRASES = makeRangePhrases({
  unit: "years",
  singularUnit: "year",
  betweenPhrase: (low, high) => `between ${low} – ${high} years`,
});

export function formatExperienceYearSentence(minVal: number, maxVal: number, roleLabel: "individual contributor" | "people manager"): string | null {
  const phrase = formatRangeParts(describeRange(minVal, maxVal), EXPERIENCE_YEAR_PHRASES);
  if (!phrase) return null;

  return `Must have ${phrase} of ${roleLabel} experience`;
}
