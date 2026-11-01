"use client";

import { useApp } from "@/contexts/AppContext";
import type { Environment, Intensity, Mobility, SearchState, Select, WorkplaceActivityOptions } from "@/types/search";
import FilterContainer from "../util/FilterContainer";
import { SentenceBlankMultiSelect, SentenceText } from "../util/sentence-query";

const MOBILITY_OPTIONS = ["Sitting", "Active"] as const satisfies readonly Mobility[];
const ENVIRONMENT_OPTIONS = ["Office", "Outdoor", "Vehicle", "Industrial"] as const satisfies readonly Environment[];
const INTENSITY_OPTIONS = ["Low", "Medium", "High"] as const satisfies readonly Intensity[];

const MOBILITY_BLANK_OPTIONS = [
  { value: "Sitting" as const, label: "Sitting / Desk Jobs", phrase: "desk" },
  { value: "Active" as const, label: "Active", phrase: "active" },
];

const ENVIRONMENT_BLANK_OPTIONS = ENVIRONMENT_OPTIONS.map((value) => ({
  value,
  label: value,
  phrase: value.toLowerCase(),
}));

const INTENSITY_BLANK_OPTIONS = INTENSITY_OPTIONS.map((value) => ({
  value,
  label: value,
  phrase: value.toLowerCase(),
}));

function isSelectAll<T extends string>(value: Select<T> | undefined, all: readonly T[]): boolean {
  if (!value || value === "All") return true;
  if (!Array.isArray(value)) return true;
  return value.length === 0 || value.length === all.length;
}

function selectedValues<T extends string>(value: Select<T> | undefined, all: readonly T[]): T[] {
  if (!Array.isArray(value) || isSelectAll(value, all)) return [];
  return all.filter((item) => value.includes(item));
}

function toSelectValue<T extends string>(next: T[], all: readonly T[]): Select<T> {
  return next.length === 0 || next.length === all.length ? "All" : next;
}

function patchWorkplaceActivity(
  location: SearchState["location"],
  activity: WorkplaceActivityOptions,
  updateSearchOptions: (updates: Partial<SearchState>) => void,
  patch: Partial<WorkplaceActivityOptions>
) {
  updateSearchOptions({
    location: {
      ...location,
      workplace_activity: {
        ...activity,
        ...patch,
      },
    },
  });
}

export default function WorkplaceActivity() {
  const { searchOptions, updateSearchOptions } = useApp();
  const { location } = searchOptions;
  const activity = location.workplace_activity;

  const mobilitySelected = selectedValues(activity.mobility, MOBILITY_OPTIONS);
  const environmentSelected = selectedValues(activity.environment, ENVIRONMENT_OPTIONS);
  const physicalSelected = selectedValues(activity.physical_intensity, INTENSITY_OPTIONS);
  const cognitiveSelected = selectedValues(activity.cognitive_intensity, INTENSITY_OPTIONS);
  const computerSelected = selectedValues(activity.computer_usage, INTENSITY_OPTIONS);
  const oralSelected = selectedValues(activity.oral_communication, INTENSITY_OPTIONS);

  const patch = (next: Partial<WorkplaceActivityOptions>) => patchWorkplaceActivity(location, activity, updateSearchOptions, next);

  const intensityFormat = {
    conjunction: "or" as const,
    noneText: "any",
    allText: "any",
    total: INTENSITY_OPTIONS.length,
  };

  return (
    <FilterContainer categoryId="workplace-activity" title="Workplace Activity">
      <div className="flex flex-col gap-2">
        <SentenceText>
          Show
          <SentenceBlankMultiSelect
            ariaLabel="Physical position"
            options={MOBILITY_BLANK_OPTIONS}
            values={mobilitySelected}
            onChange={(next) => patch({ mobility: toSelectValue(next, MOBILITY_OPTIONS) })}
            placeholder="desk & active"
            formatOptions={{
              conjunction: "and",
              noneText: "desk & active",
              allText: "desk & active",
              total: MOBILITY_OPTIONS.length,
              n1: 2,
            }}
          />
          jobs
        </SentenceText>

        <SentenceText>
          Show jobs in
          <SentenceBlankMultiSelect
            ariaLabel="Work environments"
            options={ENVIRONMENT_BLANK_OPTIONS}
            values={environmentSelected}
            onChange={(next) => patch({ environment: toSelectValue(next, ENVIRONMENT_OPTIONS) })}
            placeholder="all"
            formatOptions={{
              conjunction: "or",
              noneText: "all",
              allText: "all",
              total: ENVIRONMENT_OPTIONS.length,
              n1: 4,
            }}
          />
          environments
        </SentenceText>

        <SentenceText>
          Show jobs with
          <SentenceBlankMultiSelect
            ariaLabel="Physical intensity"
            options={INTENSITY_BLANK_OPTIONS}
            values={physicalSelected}
            onChange={(next) => patch({ physical_intensity: toSelectValue(next, INTENSITY_OPTIONS) })}
            placeholder="any"
            formatOptions={intensityFormat}
          />
          physical intensity
        </SentenceText>

        <SentenceText>
          Show jobs with
          <SentenceBlankMultiSelect
            ariaLabel="Cognitive intensity"
            options={INTENSITY_BLANK_OPTIONS}
            values={cognitiveSelected}
            onChange={(next) => patch({ cognitive_intensity: toSelectValue(next, INTENSITY_OPTIONS) })}
            placeholder="any"
            formatOptions={intensityFormat}
          />
          cognitive intensity
        </SentenceText>

        <SentenceText>
          Show jobs with
          <SentenceBlankMultiSelect
            ariaLabel="Computer usage"
            options={INTENSITY_BLANK_OPTIONS}
            values={computerSelected}
            onChange={(next) => patch({ computer_usage: toSelectValue(next, INTENSITY_OPTIONS) })}
            placeholder="any"
            formatOptions={intensityFormat}
          />
          computer usage
        </SentenceText>

        <SentenceText>
          Show jobs with
          <SentenceBlankMultiSelect
            ariaLabel="Oral communication"
            options={INTENSITY_BLANK_OPTIONS}
            values={oralSelected}
            onChange={(next) => patch({ oral_communication: toSelectValue(next, INTENSITY_OPTIONS) })}
            placeholder="any"
            formatOptions={intensityFormat}
          />
          oral communication
        </SentenceText>
      </div>
    </FilterContainer>
  );
}
