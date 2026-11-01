"use client";

import { useApp } from "@/contexts/AppContext";
import { normalizeActivityMetric, toActivityMetric } from "@/lib/search/general";
import { formatCountedList } from "@/lib/search/sentence-query";
import type { ActivityMetric, ActivityOutcomeOptions, SearchState } from "@/types/search";
import FilterContainer from "../util/FilterContainer";
import { SentenceBlankMultiSelect, SentenceText } from "../util/sentence-query";

type ActivityOutcomesState = SearchState["activity_outcomes"];
type MetricKey = "views" | "applications" | "saves";
type OutcomeKey = keyof ActivityOutcomeOptions["reportedOutcomes"];

const METRIC_KEYS: MetricKey[] = ["views", "applications", "saves"];

const METRIC_LABELS: Record<MetricKey, { noun: string; few: string; many: string; fewHint: string; manyHint: string }> = {
  views: { noun: "views", few: "Few views", many: "Lots of views", fewHint: "under 5", manyHint: "10+" },
  applications: { noun: "applications", few: "Few applications", many: "Lots of applications", fewHint: "under 2", manyHint: "6+" },
  saves: { noun: "saves", few: "Few saves", many: "Lots of saves", fewHint: "under 3", manyHint: "8+" },
};

function metricBlankOptions(type: MetricKey) {
  const { few, many, fewHint, manyHint } = METRIC_LABELS[type];
  return [
    { value: "Few" as const, label: `${few} (${fewHint})`, phrase: few.toLowerCase() },
    { value: "Many" as const, label: `${many} (${manyHint})`, phrase: many.toLowerCase() },
  ];
}

const OUTCOME_CHOICES: { key: OutcomeKey; label: string; phrase: string }[] = [
  { key: "interviews", label: "Interviews reported", phrase: "interviews reported" },
  { key: "offers", label: "Offers reported", phrase: "offers reported" },
  { key: "ghostProne", label: "Leave out ghost-prone", phrase: "no ghosting" },
  { key: "highRejection", label: "Leave out high-rejection", phrase: "no high rejection" },
];

const OUTCOME_BLANK_OPTIONS = OUTCOME_CHOICES.map((choice) => ({
  value: choice.key,
  label: choice.label,
  phrase: choice.phrase,
}));

function selectedOutcomeKeys(outcomes: ActivityOutcomeOptions["reportedOutcomes"]): OutcomeKey[] {
  return OUTCOME_CHOICES.filter((choice) => outcomes[choice.key]).map((choice) => choice.key);
}

function metricPhrase(type: MetricKey, value: ActivityMetric): string {
  const levels = normalizeActivityMetric(value);
  const anyText = `any amount of ${METRIC_LABELS[type].noun}`;
  if (levels.length === 0) return anyText;

  const phrases = metricBlankOptions(type)
    .filter((option) => levels.includes(option.value))
    .map((option) => option.phrase);

  return formatCountedList(phrases, {
    conjunction: "or",
    noneText: anyText,
    total: metricBlankOptions(type).length,
  });
}

function outcomePhrases(outcomes?: ActivityOutcomeOptions["reportedOutcomes"]): string[] {
  if (!outcomes) return [];
  return OUTCOME_CHOICES.filter((choice) => outcomes[choice.key]).map((choice) => choice.phrase);
}

function outcomesPhrase(outcomes?: ActivityOutcomeOptions["reportedOutcomes"]): string {
  const phrases = outcomePhrases(outcomes);
  return formatCountedList(phrases, {
    conjunction: "and",
    noneText: "any reported outcomes",
    n1: 3,
    total: OUTCOME_BLANK_OPTIONS.length,
  });
}

/** Complete sentence title for a given activity/outcomes state. */
export function getActivityOutcomesTitle(options?: ActivityOutcomesState): string {
  const value = options ?? {
    views: [],
    applications: [],
    saves: [],
    reportedOutcomes: {
      interviews: false,
      offers: false,
      ghostProne: false,
      highRejection: false,
    },
  };

  const viewsSentence = `Show jobs with ${metricPhrase("views", value.views)}`;
  const applicationsSentence = `Show jobs with ${metricPhrase("applications", value.applications)}`;
  const savesSentence = `Show jobs with ${metricPhrase("saves", value.saves)}`;
  const outcomesSentence = `Show jobs with ${outcomesPhrase(value.reportedOutcomes)}`;

  return [viewsSentence, applicationsSentence, savesSentence, outcomesSentence].join(". ");
}

function MetricBlank({ type, value, onChange }: { type: MetricKey; value: ActivityMetric; onChange: (value: ActivityMetric) => void }) {
  const options = metricBlankOptions(type);
  const selected = normalizeActivityMetric(value);
  const anyText = `any amount of ${METRIC_LABELS[type].noun}`;

  return (
    <SentenceBlankMultiSelect
      ariaLabel={`Job ${METRIC_LABELS[type].noun}`}
      options={options}
      values={selected}
      onChange={(next) => onChange(toActivityMetric(next))}
      placeholder={anyText}
      formatOptions={{
        conjunction: "or",
        noneText: anyText,
        total: options.length,
      }}
    />
  );
}

export default function ActivityOutcomes() {
  const { searchOptions, updateSearchOptions } = useApp();
  const options = searchOptions.activity_outcomes;

  const update = (patch: Partial<typeof options>) => {
    updateSearchOptions({ activity_outcomes: { ...options, ...patch } });
  };

  const selectedOutcomes = selectedOutcomeKeys(options.reportedOutcomes);

  // Parent `FilterSubsection` owns the small "Activity & Outcomes" header.
  // All four sentences are body children so FilterContainer’s column stack
  // keeps each on its own row (inline-flex siblings otherwise share a line).
  return (
    <FilterContainer categoryId="activity-outcomes" chrome="stream">
      <SentenceText>
        Show jobs with
        <MetricBlank type="views" value={options.views} onChange={(views) => update({ views })} />
      </SentenceText>
      <SentenceText>
        Show jobs with
        <MetricBlank type="applications" value={options.applications} onChange={(applications) => update({ applications })} />
      </SentenceText>
      <SentenceText>
        Show jobs with
        <MetricBlank type="saves" value={options.saves} onChange={(saves) => update({ saves })} />
      </SentenceText>
      <SentenceText>
        Show jobs with
        <SentenceBlankMultiSelect
          ariaLabel="Reported outcomes"
          options={OUTCOME_BLANK_OPTIONS}
          values={selectedOutcomes}
          onChange={(next) => {
            const nextSet = new Set(next);
            update({
              reportedOutcomes: {
                interviews: nextSet.has("interviews"),
                offers: nextSet.has("offers"),
                ghostProne: nextSet.has("ghostProne"),
                highRejection: nextSet.has("highRejection"),
              },
            });
          }}
          placeholder="any reported outcomes"
          formatOptions={{
            conjunction: "and",
            n1: 3,
            noneText: "any reported outcomes",
            total: OUTCOME_BLANK_OPTIONS.length,
          }}
        />
      </SentenceText>
    </FilterContainer>
  );
}
