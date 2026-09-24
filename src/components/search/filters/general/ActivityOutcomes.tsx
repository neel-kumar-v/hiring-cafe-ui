"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { useApp } from "@/contexts/AppContext";
import type { ActivityMetric } from "@/types/search";
import FilterContainer from "../util/FilterContainer";
import LabelInputContainer from "../util/LabelInputContainer";
import LabelRadio from "../util/LabelRadio";

function MetricChoices({
  label,
  name,
  thresholds,
  value,
  onChange,
}: {
  label: string;
  name: string;
  thresholds: { few: string; many: string };
  value: ActivityMetric;
  onChange: (value: ActivityMetric) => void;
}) {
  return (
    <LabelInputContainer title={label} midColCount={2} lgColCount={3}>
      <LabelRadio
        name={name}
        label="Few"
        hint={thresholds.few}
        checked={value === "Few"}
        onChange={(checked) => onChange(checked ? "Few" : "All")}
      />
      <LabelRadio
        name={name}
        label="Lots"
        hint={thresholds.many}
        checked={value === "Many"}
        onChange={(checked) => onChange(checked ? "Many" : "All")}
      />
    </LabelInputContainer>
  );
}

export default function ActivityOutcomes() {
  const { searchOptions, updateSearchOptions } = useApp();
  const options = searchOptions.activity_outcomes;

  const update = (patch: Partial<typeof options>) => {
    updateSearchOptions({ activity_outcomes: { ...options, ...patch } });
  };

  return (
    <FilterContainer categoryId="activity-outcomes" title="Activity & Outcomes">
      <MetricChoices
        label="Views"
        name="activity-views"
        thresholds={{ few: "under 5", many: "10+" }}
        value={options.views}
        onChange={(views) => update({ views })}
      />
      <MetricChoices
        label="Applications"
        name="activity-applications"
        thresholds={{ few: "under 2", many: "6+" }}
        value={options.applications}
        onChange={(applications) => update({ applications })}
      />
      <MetricChoices
        label="Saves"
        name="activity-saves"
        thresholds={{ few: "under 3", many: "8+" }}
        value={options.saves}
        onChange={(saves) => update({ saves })}
      />

      <LabelInputContainer title="Reported outcomes" midColCount={2} lgColCount={3}>
        {(
          [
            ["interviews", "Interviews reported"],
            ["offers", "Offers reported"],
            ["ghostProne", "Leave out ghost-prone"],
            ["highRejection", "Leave out high-rejection"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="flex items-center gap-3 text-sm text-foreground">
            <Checkbox checked={options.reportedOutcomes[key]} onCheckedChange={(checked) => update({ reportedOutcomes: { ...options.reportedOutcomes, [key]: checked === true } })} />
            {label}
          </label>
        ))}
      </LabelInputContainer>
    </FilterContainer>
  );
}
