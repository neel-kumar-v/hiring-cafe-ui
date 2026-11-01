import { useApp } from "@/contexts/AppContext";
import { formatCountedList } from "@/lib/search/sentence-query";
import type { Exclusion as ExclusionType, ExclusionOptions } from "@/types/search";
import FilterContainer from "../util/FilterContainer";
import { SentenceBlankMultiSelect, SentenceText } from "../util/sentence-query";

const EXCLUSION_VERBS: Record<ExclusionType, string> = {
  Applied: "applied to",
  Viewed: "viewed",
  Saved: "saved",
  Hidden: "hidden",
};

const EXCLUSION_CHOICES: ExclusionType[] = ["Applied", "Viewed", "Saved", "Hidden"];

/** The full verb list used for both the untouched and "all selected" sentence text. */
const allExclusionVerbsList = formatCountedList(
  EXCLUSION_CHOICES.map((choice) => EXCLUSION_VERBS[choice]),
  { conjunction: "or" }
);

const EXCLUSION_BLANK_OPTIONS = EXCLUSION_CHOICES.map((choice) => ({
  value: choice,
  label: choice,
  phrase: EXCLUSION_VERBS[choice],
}));

export function getExclusionTitle(exclusion?: ExclusionOptions): string {
  const verbs = (exclusion ?? []).map((choice) => EXCLUSION_VERBS[choice] ?? choice.toLowerCase());
  return `Exclude jobs you have ${formatCountedList(verbs, {
    conjunction: "or",
    total: EXCLUSION_CHOICES.length,
    noneText: allExclusionVerbsList,
    allText: allExclusionVerbsList,
  })}`;
}

export default function Exclusion() {
  const { searchOptions, updateSearchOptions } = useApp();

  const title = (
    <SentenceText>
      Exclude jobs you have
      <SentenceBlankMultiSelect
        ariaLabel="Excluded job interactions"
        options={EXCLUSION_BLANK_OPTIONS}
        values={searchOptions.exclusion}
        onChange={(nextValues) => updateSearchOptions({ exclusion: nextValues })}
        placeholder={allExclusionVerbsList}
        formatOptions={{
          conjunction: "or",
          total: EXCLUSION_CHOICES.length,
          noneText: allExclusionVerbsList,
          allText: allExclusionVerbsList,
        }}
      />
    </SentenceText>
  );

  return <FilterContainer categoryId="exclusion" title={title} chrome="stream" />;
}
