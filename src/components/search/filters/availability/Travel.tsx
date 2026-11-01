import { useApp } from "@/contexts/AppContext";
import { formatCountedList } from "@/lib/search/sentence-query";
import type { Select, TravelRequirements, TravelRequirementsOptions } from "@/types/search";
import FilterContainer from "../util/FilterContainer";
import { SentenceBlankMultiSelect, SentenceText } from "../util/sentence-query";

export const allTravelRequirements: TravelRequirements[] = ["None", "Minimum", "Moderate", "Extensive"];

const TRAVEL_BLANK_OPTIONS = allTravelRequirements.map((requirement) => ({
  value: requirement,
  label: requirement,
}));

function isTravelSelectAll(value: Select<TravelRequirements> | undefined): boolean {
  if (!value || value === "All") return true;
  if (!Array.isArray(value)) return true;
  return value.length === 0 || value.length === allTravelRequirements.length;
}

function selectedTravelLevels(value: Select<TravelRequirements> | undefined): TravelRequirements[] {
  if (!Array.isArray(value) || isTravelSelectAll(value)) return [];
  return allTravelRequirements.filter((level) => value.includes(level));
}

function toTravelSelect(next: TravelRequirements[]): Select<TravelRequirements> {
  return next.length === 0 || next.length === allTravelRequirements.length ? "All" : next;
}

export function formatTravelList(items: string[]): string {
  return formatCountedList(items, { conjunction: "or", n1: 4 });
}

function formatTravelModePhrase(value: Select<TravelRequirements> | undefined, mode: "air" | "land"): string {
  if (isTravelSelectAll(value)) {
    return `any ${mode} travel`;
  }

  const selected = selectedTravelLevels(value);
  return `${formatTravelList(selected)} ${mode} travel`;
}

export function getTravelTitle(travel?: TravelRequirementsOptions): string {
  const air = travel?.air;
  const land = travel?.land;
  return `Show jobs with ${formatTravelModePhrase(air, "air")} and ${formatTravelModePhrase(land, "land")}`;
}

export default function Travel() {
  const { searchOptions, updateSearchOptions } = useApp();
  const { travel_requirements: travel } = searchOptions;

  const airSelected = selectedTravelLevels(travel.air);
  const landSelected = selectedTravelLevels(travel.land);

  const formatOptions = {
    conjunction: "or" as const,
    n1: 4,
    noneText: "any",
    allText: "any",
    total: allTravelRequirements.length,
  };

  const title = (
    <SentenceText>
      Show jobs with
      <SentenceBlankMultiSelect
        ariaLabel="Air travel requirements"
        options={TRAVEL_BLANK_OPTIONS}
        values={airSelected}
        onChange={(next) => {
          updateSearchOptions({
            travel_requirements: {
              ...travel,
              air: toTravelSelect(next),
            },
          });
        }}
        placeholder="any"
        formatOptions={formatOptions}
      />
      air travel and
      <SentenceBlankMultiSelect
        ariaLabel="Land travel requirements"
        options={TRAVEL_BLANK_OPTIONS}
        values={landSelected}
        onChange={(next) => {
          updateSearchOptions({
            travel_requirements: {
              ...travel,
              land: toTravelSelect(next),
            },
          });
        }}
        placeholder="any"
        formatOptions={formatOptions}
      />
      land travel
    </SentenceText>
  );

  return <FilterContainer categoryId="travel" title={title} chrome="stream" />;
}
