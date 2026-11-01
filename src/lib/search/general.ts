import { ActivityMetric, ActivityMetricLevel, ApplyForm, Exclusion, ExclusionOptions, SearchState } from "../../types/search";

const ACTIVITY_METRIC_LEVELS: ActivityMetricLevel[] = ["Few", "Many"];

/** Normalize legacy single-string metrics and `"All"` into a band list (empty = any). */
export function normalizeActivityMetric(value: ActivityMetric | ActivityMetricLevel | undefined | null): ActivityMetricLevel[] {
  if (value == null || value === "All") return [];
  if (Array.isArray(value)) {
    return ACTIVITY_METRIC_LEVELS.filter((level) => value.includes(level));
  }
  if (value === "Few" || value === "Many") return [value];
  return [];
}

/** Encode selected bands back into search state (`"All"` when none selected). */
export function toActivityMetric(values: readonly ActivityMetricLevel[]): ActivityMetric {
  const levels = ACTIVITY_METRIC_LEVELS.filter((level) => values.includes(level));
  return levels.length === 0 ? "All" : levels;
}

export function getApplyFormValueMap(): Record<ApplyForm, string> {
  return {
    All: "all",
    Fast: "simple",
    Slow: "time-consuming",
  };
}

export function getApplyFormMap(): Record<string, ApplyForm> {
  return {
    all: "All",
    simple: "Fast",
    "time-consuming": "Slow",
  };
}

export function getApplyFormDescription(value: string): string {
  switch (value) {
    case "all":
      return "Any application forms — simple or time-consuming.";
    case "simple":
      return "Application forms that don't require account creation.";
    case "time-consuming":
      return "Application forms that require account creation and/or resume formatting.";
    default:
      return "";
  }
}

export function createExclusionHandler(currentExclusion: ExclusionOptions, updateSearchOptions: (updates: Partial<SearchState>) => void) {
  // const allExclusions: Exclusion[] = ["Saved", "Applied", "Hidden", "Viewed"];
  return (exclusion: Exclusion) => {
    const newExclusion = currentExclusion.includes(exclusion) ? currentExclusion.filter((item) => item !== exclusion) : [...currentExclusion, exclusion];

    updateSearchOptions({ exclusion: newExclusion });
  };
}
