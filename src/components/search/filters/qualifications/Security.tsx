"use client";

import { useApp } from "@/contexts/AppContext";
import { formatCountedList } from "@/lib/search/sentence-query";
import type { SecurityClearance, SecurityClearanceOptions } from "@/types/search";
import FilterContainer from "../util/FilterContainer";
import { SentenceBlankMultiSelect, SentenceText } from "../util/sentence-query";

export const allSecurityClearances: SecurityClearance[] = ["None", "Confidential", "Secret", "Top Secret", "Top Secret/SCI", "Public Trust", "Interim Clearances", "Other"];

const NO_CLEARANCE_TEXT = "no";
const ANY_CLEARANCE_TEXT = "any";

const SECURITY_BLANK_OPTIONS = allSecurityClearances.map((clearance) => ({
  value: clearance,
  label: clearance === "None" ? "no" : clearance,
  phrase: clearance === "None" ? NO_CLEARANCE_TEXT : clearance,
}));

function selectedClearances(value: SecurityClearanceOptions | undefined): SecurityClearance[] {
  if (!value || value === "All" || !Array.isArray(value)) return [];
  return allSecurityClearances.filter((clearance) => value.includes(clearance));
}

export function getSecurityTitle(security?: SecurityClearanceOptions): string {
  const selected = selectedClearances(security);
  const blank = formatCountedList(
    selected.map((clearance) => (clearance === "None" ? NO_CLEARANCE_TEXT : clearance)),
    {
      conjunction: "or",
      n1: 3,
      noneText: ANY_CLEARANCE_TEXT,
      allText: ANY_CLEARANCE_TEXT,
      total: allSecurityClearances.length,
    }
  );
  return `Jobs requiring ${blank} security clearance`;
}

export default function Security() {
  const { searchOptions, updateSearchOptions } = useApp();
  const selected = selectedClearances(searchOptions.security_clearance);

  return (
    <FilterContainer categoryId="security" chrome="stream">
      <SentenceText>
        Jobs requiring
        <SentenceBlankMultiSelect
          ariaLabel="Security clearance"
          options={SECURITY_BLANK_OPTIONS}
          values={selected}
          onChange={(next) => {
            const value = next.length === 0 || next.length === allSecurityClearances.length ? "All" : next;
            updateSearchOptions({ security_clearance: value });
          }}
          placeholder={ANY_CLEARANCE_TEXT}
          formatOptions={{
            conjunction: "or",
            n1: 3,
            noneText: ANY_CLEARANCE_TEXT,
            allText: ANY_CLEARANCE_TEXT,
            total: allSecurityClearances.length,
          }}
        />
        security clearance
      </SentenceText>
    </FilterContainer>
  );
}
