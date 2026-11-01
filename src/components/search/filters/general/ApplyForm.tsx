"use client";

import { useApp } from "@/contexts/AppContext";
import { getApplyFormMap, getApplyFormValueMap } from "@/lib/search";
import type { ApplyForm as ApplyFormType } from "@/types/search";
import FilterContainer from "../util/FilterContainer";
import { SentenceBlankMultiSelect, SentenceText } from "../util/sentence-query";

const APPLY_FORM_OPTIONS = [
  { value: "simple", label: "Simple forms", phrase: "simple forms" },
  { value: "time-consuming", label: "Time-consuming forms", phrase: "time-consuming forms" },
] as const;

type ApplyFormBlankValue = (typeof APPLY_FORM_OPTIONS)[number]["value"];

const APPLY_FORM_BLANK_COUNT = APPLY_FORM_OPTIONS.length;
const ANY_FORMS_TEXT = "any forms";

function toBlankValues(applyForm: ApplyFormType): ApplyFormBlankValue[] {
  if (applyForm === "All") return [];
  const mapped = getApplyFormValueMap()[applyForm];
  if (mapped === "simple" || mapped === "time-consuming") return [mapped];
  return [];
}

function fromBlankValues(values: readonly ApplyFormBlankValue[]): ApplyFormType {
  if (values.length === 0 || values.length >= APPLY_FORM_BLANK_COUNT) return "All";
  const applyFormMap = getApplyFormMap();
  return applyFormMap[values[0]] ?? "All";
}

export function getApplyFormPhrase(value?: string): string {
  switch (value?.toLowerCase()) {
    case "fast":
    case "simple":
      return "simple forms";
    case "slow":
    case "time-consuming":
    case "time consuming":
      return "time-consuming forms";
    case "all":
    default:
      return ANY_FORMS_TEXT;
  }
}

export function getApplyFormTitle(value?: string): string {
  return `Show jobs with ${getApplyFormPhrase(value)}`;
}

export default function ApplyForm() {
  const { searchOptions, updateSearchOptions } = useApp();
  const selectedValues = toBlankValues(searchOptions.apply_form);

  const title = (
    <SentenceText>
      Show jobs with
      <SentenceBlankMultiSelect
        ariaLabel="Apply form"
        options={[...APPLY_FORM_OPTIONS]}
        values={selectedValues}
        onChange={(next) => {
          updateSearchOptions({ apply_form: fromBlankValues(next) });
        }}
        placeholder={ANY_FORMS_TEXT}
        formatOptions={{
          conjunction: "or",
          total: APPLY_FORM_BLANK_COUNT,
          noneText: ANY_FORMS_TEXT,
          allText: ANY_FORMS_TEXT,
        }}
      />
    </SentenceText>
  );

  return <FilterContainer categoryId="apply-form" title={title} chrome="stream" />;
}
