import { defaultSearchOptions } from "@/contexts/SearchContext";
import type { CategoryId, SearchState } from "@/types/search";
import { filters } from "@/data/search-filters";

function isEqual(left: unknown, right: unknown) {
  return JSON.stringify(left) === JSON.stringify(right);
}

const tagToCategoryId: Record<string, CategoryId> = Object.fromEntries(filters.map((filter) => [filter.name, filter.id])) as Record<string, CategoryId>;

const categoryStateKeys: Record<string, (keyof SearchState)[]> = {
  "date-range": ["date_range"],
  sorting: ["sort"],
  "apply-form": ["apply_form"],
  exclusion: ["exclusion"],
  "activity-outcomes": ["activity_outcomes"],
  encouraged: ["encouraged"],
  salary: ["salary"],
  commitment: ["commitment"],
  experience: ["experience"],
  benefits: ["benefits"],
  departments: ["department"],
  "job-titles": ["job_titles"],
  education: ["education"],
  licenses: ["license_certification"],
  security: ["security_clearance"],
  languages: ["language"],
  shifts: ["shift_preferences"],
  travel: ["travel_requirements"],
  location: ["location"],
  "workplace-activity": ["location"],
  company: ["company"],
  industry: ["industry"],
  stage: ["stage_funding"],
  size: ["size"],
  founding: ["founding_year"],
};

export const initialSearchState = defaultSearchOptions;

export function isCategoryEdited(state: SearchState, initialState: SearchState, categoryId: string): boolean {
  const keys = categoryStateKeys[categoryId];
  if (!keys?.length) return false;

  return keys.some((key) => !isEqual(state[key], initialState[key]));
}

export function getInitialPatchForCategory(categoryId: string, initialState: SearchState = initialSearchState): Partial<SearchState> {
  const keys = categoryStateKeys[categoryId];
  if (!keys?.length) return {};

  return Object.fromEntries(keys.map((key) => [key, initialState[key]])) as Partial<SearchState>;
}

export function getEditedTags(state: SearchState, initialState: SearchState = initialSearchState): Set<string> {
  const edited = new Set<string>();

  for (const [tag, categoryId] of Object.entries(tagToCategoryId)) {
    if (isCategoryEdited(state, initialState, categoryId)) {
      edited.add(tag);
    }
  }

  return edited;
}

function countChangedValues(current: unknown, initial: unknown): number {
  if (isEqual(current, initial)) return 0;
  if (Array.isArray(current)) return Math.max(current.length, 1);
  if (Array.isArray(initial)) return Math.max(initial.length, 1);
  if (current && initial && typeof current === "object" && typeof initial === "object") {
    const keys = new Set([...Object.keys(current), ...Object.keys(initial)]);
    return Array.from(keys).reduce((count, key) => count + countChangedValues((current as Record<string, unknown>)[key], (initial as Record<string, unknown>)[key]), 0);
  }
  return 1;
}

export function getCategoryEditCount(state: SearchState, initialState: SearchState = initialSearchState, categoryId: string): number {
  const keys = categoryStateKeys[categoryId];
  if (!keys?.length) return 0;
  return keys.reduce((count, key) => count + countChangedValues(state[key], initialState[key]), 0);
}
