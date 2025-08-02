import { ApplyForm, Exclusion, ExclusionOptions, SearchState } from '../../types/search';

export function getApplyFormValueMap(): Record<ApplyForm, string> {
  return {
    "All": "all",
    "Fast": "simple", 
    "Slow": "time-consuming"
  };
}

export function getApplyFormMap(): Record<string, ApplyForm> {
  return {
    "all": "All",
    "simple": "Fast",
    "time-consuming": "Slow"
  };
}

export function getApplyFormDescription(value: string): string {
  switch (value) {
    case "all":
      return "All application forms - simple or time-consuming.";
    case "simple":
      return "Application forms that don't require account creation.";
    case "time-consuming":
      return "Application forms that require account creation and/or resume formatting.";
    default:
      return "";
  }
}

export function createExclusionHandler(
  currentExclusion: ExclusionOptions,
  updateSearchOptions: (updates: Partial<SearchState>) => void
) {
  // const allExclusions: Exclusion[] = ["Saved", "Applied", "Hidden", "Viewed"];
  return (exclusion: Exclusion) => {
    const newExclusion = currentExclusion.includes(exclusion)
      ? currentExclusion.filter(item => item !== exclusion)
      : [...currentExclusion, exclusion];
    
    updateSearchOptions({ exclusion: newExclusion });
  };
}
