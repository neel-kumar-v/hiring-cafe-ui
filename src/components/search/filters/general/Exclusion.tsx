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

/** The full verb list used when every exclusion type is selected. */
const allExclusionVerbsList = formatCountedList(
  EXCLUSION_CHOICES.map((choice) => EXCLUSION_VERBS[choice]),
  { conjunction: "or", n1: EXCLUSION_CHOICES.length }
);

const EXCLUSION_BLANK_OPTIONS = EXCLUSION_CHOICES.map((choice) => ({
  value: choice,
  label: choice,
  phrase: EXCLUSION_VERBS[choice],
}));

const blankFormatOptions = {
  conjunction: "or" as const,
  n1: EXCLUSION_CHOICES.length,
  total: EXCLUSION_CHOICES.length,
  noneText: "any jobs",
  allText: allExclusionVerbsList,
};

export function getExclusionTitle(exclusion?: ExclusionOptions): string {
  const selected = exclusion ?? [];
  if (selected.length === 0) {
    return "Don't exclude any jobs";
  }

  const verbs = selected.map((choice) => EXCLUSION_VERBS[choice] ?? choice.toLowerCase());
  return `Exclude jobs you have ${formatCountedList(verbs, {
    conjunction: "or",
    n1: EXCLUSION_CHOICES.length,
    total: EXCLUSION_CHOICES.length,
    allText: allExclusionVerbsList,
  })}`;
}

export default function Exclusion() {
  const { searchOptions, updateSearchOptions } = useApp();
  const selected = searchOptions.exclusion;
  const isEmpty = selected.length === 0;

  const blank = (
    <SentenceBlankMultiSelect
      ariaLabel="Excluded job interactions"
      options={EXCLUSION_BLANK_OPTIONS}
      values={selected}
      onChange={(nextValues) => updateSearchOptions({ exclusion: nextValues })}
      placeholder="any jobs"
      formatOptions={blankFormatOptions}
    />
  );

  // Empty selection means exclude nothing — not “exclude every interaction type”.
  const title = isEmpty ? (
    <SentenceText>
      Don't exclude
      {blank}
    </SentenceText>
  ) : (
    <SentenceText>
      Exclude jobs you have
      {blank}
    </SentenceText>
  );

  return <FilterContainer categoryId="exclusion" title={title} chrome="stream" />;
}
