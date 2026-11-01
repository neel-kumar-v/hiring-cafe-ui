"use client";

import { useApp } from "@/contexts/AppContext";
import type { AvailabilityPreferences, OncallPreferences, ShiftPreferences, ShiftPreferencesOptions } from "@/types/search";
import FilterContainer from "../util/FilterContainer";
import { SentenceBlankMultiSelect, SentenceBlankSelect, SentenceText } from "../util/sentence-query";

const SHIFT_TYPES = ["Required", "Optional", "Not Indicated"] as const satisfies readonly ShiftPreferences[];
const AVAILABILITY_TYPES = ["Required", "Not Indicated", "None"] as const satisfies readonly AvailabilityPreferences[];
const ONCALL_TYPES = ["Regular", "Occasional", "None"] as const satisfies readonly OncallPreferences[];

const SHIFT_BLANK_OPTIONS = SHIFT_TYPES.map((value) => ({
  value,
  label: value,
  phrase: value.toLowerCase(),
}));

const AVAILABILITY_BLANK_OPTIONS = AVAILABILITY_TYPES.map((value) => ({
  value,
  label: value === "None" ? "No" : value,
  phrase: value === "None" ? "no" : value.toLowerCase(),
}));

const ONCALL_BLANK_OPTIONS = ONCALL_TYPES.map((value) => ({
  value,
  label: value === "None" ? "No" : value,
  phrase: value === "None" ? "no" : value.toLowerCase(),
}));

type DayShiftKey = "morning" | "afternoon" | "night";

function getDayShiftValues(prefs: ShiftPreferencesOptions, key: DayShiftKey): ShiftPreferences[] {
  const current = prefs[key];
  return Array.isArray(current) ? current : [...SHIFT_TYPES];
}

function toDayShiftValue(next: ShiftPreferences[]): ShiftPreferences[] | null {
  if (next.length === 0 || next.length === SHIFT_TYPES.length) return null;
  return next;
}

function getOncallValues(prefs: ShiftPreferencesOptions): OncallPreferences[] {
  const current = prefs.oncall;
  return Array.isArray(current) ? current : [...ONCALL_TYPES];
}

function toOncallValue(next: OncallPreferences[]): OncallPreferences[] | "All" {
  if (next.length === 0 || next.length === ONCALL_TYPES.length) return "All";
  return next;
}

function updateShiftPreferences(
  current: ShiftPreferencesOptions,
  updateSearchOptions: (updates: { shift_preferences: ShiftPreferencesOptions }) => void,
  patch: Partial<ShiftPreferencesOptions>
) {
  updateSearchOptions({
    shift_preferences: {
      ...current,
      ...patch,
    },
  });
}

export default function Shifts() {
  const { searchOptions, updateSearchOptions } = useApp();
  const prefs = searchOptions.shift_preferences;

  const morningValues = getDayShiftValues(prefs, "morning");
  const afternoonValues = getDayShiftValues(prefs, "afternoon");
  const nightValues = getDayShiftValues(prefs, "night");
  const oncallValues = getOncallValues(prefs);

  const morningIsAll = !Array.isArray(prefs.morning);
  const afternoonIsAll = !Array.isArray(prefs.afternoon);
  const nightIsAll = !Array.isArray(prefs.night);
  const oncallIsAll = prefs.oncall === "All" || oncallValues.length === ONCALL_TYPES.length;

  return (
    <FilterContainer categoryId="shifts" chrome="stream">
      <div className="flex flex-col gap-2">
        <SentenceText>
          The job can have
          <SentenceBlankMultiSelect
            ariaLabel="Morning shift preferences"
            options={SHIFT_BLANK_OPTIONS}
            values={morningIsAll ? [] : morningValues}
            onChange={(next) => updateShiftPreferences(prefs, updateSearchOptions, { morning: toDayShiftValue(next) })}
            placeholder="any"
            formatOptions={{
              conjunction: "or",
              noneText: "any",
              allText: "any",
              total: SHIFT_TYPES.length,
            }}
          />
          morning / day shifts
        </SentenceText>

        <SentenceText>
          The job can have
          <SentenceBlankMultiSelect
            ariaLabel="Afternoon shift preferences"
            options={SHIFT_BLANK_OPTIONS}
            values={afternoonIsAll ? [] : afternoonValues}
            onChange={(next) => updateShiftPreferences(prefs, updateSearchOptions, { afternoon: toDayShiftValue(next) })}
            placeholder="any"
            formatOptions={{
              conjunction: "or",
              noneText: "any",
              allText: "any",
              total: SHIFT_TYPES.length,
            }}
          />
          afternoon / evening shifts
        </SentenceText>

        <SentenceText>
          The job can have
          <SentenceBlankMultiSelect
            ariaLabel="Night shift preferences"
            options={SHIFT_BLANK_OPTIONS}
            values={nightIsAll ? [] : nightValues}
            onChange={(next) => updateShiftPreferences(prefs, updateSearchOptions, { night: toDayShiftValue(next) })}
            placeholder="any"
            formatOptions={{
              conjunction: "or",
              noneText: "any",
              allText: "any",
              total: SHIFT_TYPES.length,
            }}
          />
          overnight / graveyard shifts
        </SentenceText>

        <SentenceText>
          The job can have
          <SentenceBlankSelect
            ariaLabel="Weekend preference"
            options={AVAILABILITY_BLANK_OPTIONS}
            value={prefs.weekend}
            onChange={(weekend) => updateShiftPreferences(prefs, updateSearchOptions, { weekend })}
          />
          weekend work
        </SentenceText>

        <SentenceText>
          The job can have
          <SentenceBlankSelect
            ariaLabel="Holiday preference"
            options={AVAILABILITY_BLANK_OPTIONS}
            value={prefs.holiday}
            onChange={(holiday) => updateShiftPreferences(prefs, updateSearchOptions, { holiday })}
          />
          holiday work
        </SentenceText>

        <SentenceText>
          The job can have
          <SentenceBlankSelect
            ariaLabel="Overtime preference"
            options={AVAILABILITY_BLANK_OPTIONS}
            value={prefs.overtime}
            onChange={(overtime) => updateShiftPreferences(prefs, updateSearchOptions, { overtime })}
          />
          overtime
        </SentenceText>

        <SentenceText>
          The job can have
          <SentenceBlankMultiSelect
            ariaLabel="On-call preferences"
            options={ONCALL_BLANK_OPTIONS}
            values={oncallIsAll ? [] : oncallValues}
            onChange={(next) => updateShiftPreferences(prefs, updateSearchOptions, { oncall: toOncallValue(next) })}
            placeholder="any"
            formatOptions={{
              conjunction: "or",
              noneText: "any",
              allText: "any",
              total: ONCALL_TYPES.length,
            }}
          />
          on-call
        </SentenceText>
      </div>
    </FilterContainer>
  );
}
