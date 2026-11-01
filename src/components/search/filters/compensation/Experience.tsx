"use client";

import { useApp } from "@/contexts/AppContext";
import { formatCountedList, formatExperienceYearSentence } from "@/lib/search/sentence-query";
import type { ExperienceLevel, Role, SearchState, Select } from "@/types/search";
import { useCallback, useEffect, useState } from "react";
import FilterContainer from "../util/FilterContainer";
import { SentenceBlankMultiSelect, SentenceRangeBlank, SentenceText } from "../util/sentence-query";

const ALL_SENIORITY_LEVELS: ExperienceLevel[] = ["None", "Entry Level", "Mid Level", "Senior Level"];
const ALL_ROLE_OPTIONS: Role[] = ["Individual Contributor", "People Manager"];

const SENIORITY_LABELS: Record<ExperienceLevel, string> = {
  None: "No Experience Required",
  "Entry Level": "Entry Level",
  "Mid Level": "Mid Level",
  "Senior Level": "Senior Level",
};

const SENIORITY_BLANK_OPTIONS = ALL_SENIORITY_LEVELS.map((level) => ({
  value: level,
  label: SENIORITY_LABELS[level],
  phrase: SENIORITY_LABELS[level],
}));

const ROLE_BLANK_OPTIONS = ALL_ROLE_OPTIONS.map((role) => ({
  value: role,
  label: role,
}));

function isSelectAll<T>(value: Select<T> | undefined, all: readonly T[]): boolean {
  if (!value || value === "All") return true;
  if (!Array.isArray(value)) return true;
  return value.length === 0 || value.length === all.length;
}

function selectedFromSelect<T>(value: Select<T> | undefined, all: readonly T[]): T[] {
  if (!Array.isArray(value) || isSelectAll(value, all)) return [];
  return all.filter((item) => value.includes(item));
}

function toSelectValue<T>(next: T[], all: readonly T[]): Select<T> {
  return next.length === 0 || next.length === all.length ? "All" : next;
}

function seniorityPhrases(levels: ExperienceLevel[]): string[] {
  return levels.map((level) => SENIORITY_LABELS[level]);
}

export function formatSeniorityList(items: string[]): string {
  return formatCountedList(items, { conjunction: "or", n1: 4 });
}

export function formatRoleList(items: string[]): string {
  return formatCountedList(items, { conjunction: "or", n1: 4 });
}

export function getSeniorityTitle(level?: Select<ExperienceLevel>): string {
  if (isSelectAll(level, ALL_SENIORITY_LEVELS)) {
    return "Show jobs requiring any seniority";
  }

  const selected = selectedFromSelect(level, ALL_SENIORITY_LEVELS);
  return `Show jobs requiring ${formatSeniorityList(seniorityPhrases(selected))}`;
}

export function getRoleTypeTitle(role?: Select<Role>): string {
  if (isSelectAll(role, ALL_ROLE_OPTIONS)) {
    return "Show jobs for any role type";
  }

  const selected = selectedFromSelect(role, ALL_ROLE_OPTIONS);
  return `Show jobs for ${formatRoleList(selected)}`;
}

export function getExperienceYearSentence(minVal: number, maxVal: number, roleLabel: "individual contributor" | "people manager"): string | null {
  return formatExperienceYearSentence(minVal, maxVal, roleLabel);
}

function formatShortRange(minVal: number, maxVal: number): string {
  if (minVal > 0 && maxVal > 0) {
    if (minVal === maxVal) return `${minVal} yr`;
    const low = Math.min(minVal, maxVal);
    const high = Math.max(minVal, maxVal);
    return `${low}–${high} yrs`;
  }
  if (minVal > 0) return `${minVal}+ yrs`;
  return `≤${maxVal} yrs`;
}

export function getExperienceTitle(experience: SearchState["experience"], activeIcMin = 0, activeIcMax = 0, activePmMin = 0, activePmMax = 0): string {
  const icMin = activeIcMin || experience.individualContributor?.min || 0;
  const icMax = activeIcMax || experience.individualContributor?.max || 0;
  const pmMin = activePmMin || experience.peopleManager?.min || 0;
  const pmMax = activePmMax || experience.peopleManager?.max || 0;

  const hasIc = icMin > 0 || icMax > 0;
  const hasPm = pmMin > 0 || pmMax > 0;

  if (hasIc && hasPm) {
    return `Must have ${formatShortRange(icMin, icMax)} IC & ${formatShortRange(pmMin, pmMax)} PM experience`;
  }

  if (hasIc) {
    return getExperienceYearSentence(icMin, icMax, "individual contributor")!;
  }

  if (hasPm) {
    return getExperienceYearSentence(pmMin, pmMax, "people manager")!;
  }

  if (!isSelectAll(experience.level, ALL_SENIORITY_LEVELS)) {
    return getSeniorityTitle(experience.level);
  }

  if (!isSelectAll(experience.role, ALL_ROLE_OPTIONS)) {
    return getRoleTypeTitle(experience.role);
  }

  return "Show jobs requiring any seniority";
}

export default function Experience() {
  const { searchOptions, updateSearchOptions } = useApp();
  const experience = searchOptions.experience;

  const [icMin, setIcMin] = useState("");
  const [icMax, setIcMax] = useState("");
  const [pmMin, setPmMin] = useState("");
  const [pmMax, setPmMax] = useState("");

  useEffect(() => {
    setIcMin(experience.individualContributor?.min ? String(experience.individualContributor.min) : "");
    setIcMax(experience.individualContributor?.max ? String(experience.individualContributor.max) : "");
    setPmMin(experience.peopleManager?.min ? String(experience.peopleManager.min) : "");
    setPmMax(experience.peopleManager?.max ? String(experience.peopleManager.max) : "");
  }, [experience.individualContributor?.max, experience.individualContributor?.min, experience.peopleManager?.max, experience.peopleManager?.min]);

  const toNumberOrZero = (value: string) => {
    if (!value) return 0;
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

  const commitIndividualContributor = useCallback(
    (patch?: { min?: string; max?: string }) => {
      const nextMin = patch?.min ?? icMin;
      const nextMax = patch?.max ?? icMax;

      if (patch?.min !== undefined) setIcMin(patch.min);
      if (patch?.max !== undefined) setIcMax(patch.max);

      const rawMin = toNumberOrZero(nextMin);
      const rawMax = toNumberOrZero(nextMax);
      const min = clamp(rawMin, 0, 20);
      const max = clamp(rawMax, 0, 20);

      const next = nextMin === "" && nextMax === "" ? null : min > 0 && max > 0 && min > max ? { min: max, max: min } : { min, max: nextMax === "" ? 20 : max };

      updateSearchOptions({
        experience: {
          ...searchOptions.experience,
          individualContributor: next,
        },
      });
    },
    [icMax, icMin, searchOptions.experience, updateSearchOptions]
  );

  const commitPeopleManager = useCallback(
    (patch?: { min?: string; max?: string }) => {
      const nextMin = patch?.min ?? pmMin;
      const nextMax = patch?.max ?? pmMax;

      if (patch?.min !== undefined) setPmMin(patch.min);
      if (patch?.max !== undefined) setPmMax(patch.max);

      const rawMin = toNumberOrZero(nextMin);
      const rawMax = toNumberOrZero(nextMax);
      const min = clamp(rawMin, 0, 20);
      const max = clamp(rawMax, 0, 20);

      const next = nextMin === "" && nextMax === "" ? null : min > 0 && max > 0 && min > max ? { min: max, max: min } : { min, max: nextMax === "" ? 20 : max };

      updateSearchOptions({
        experience: {
          ...searchOptions.experience,
          peopleManager: next,
        },
      });
    },
    [pmMax, pmMin, searchOptions.experience, updateSearchOptions]
  );

  const senioritySelected = selectedFromSelect(experience.level, ALL_SENIORITY_LEVELS);
  const roleSelected = selectedFromSelect(experience.role, ALL_ROLE_OPTIONS);

  const seniorityBlank = (
    <SentenceBlankMultiSelect
      ariaLabel="Seniority levels"
      options={SENIORITY_BLANK_OPTIONS}
      values={senioritySelected}
      onChange={(next) => {
        updateSearchOptions({
          experience: {
            ...searchOptions.experience,
            level: toSelectValue(next, ALL_SENIORITY_LEVELS),
          },
        });
      }}
      placeholder="any seniority"
      formatOptions={{
        conjunction: "or",
        n1: 4,
        noneText: "any seniority",
        allText: "any seniority",
        total: ALL_SENIORITY_LEVELS.length,
      }}
    />
  );

  const roleBlank = (
    <SentenceBlankMultiSelect
      ariaLabel="Role types"
      options={ROLE_BLANK_OPTIONS}
      values={roleSelected}
      onChange={(next) => {
        updateSearchOptions({
          experience: {
            ...searchOptions.experience,
            role: toSelectValue(next, ALL_ROLE_OPTIONS),
          },
        });
      }}
      placeholder="any role type"
      formatOptions={{
        conjunction: "or",
        n1: 4,
        noneText: "any role type",
        allText: "any role type",
        total: ALL_ROLE_OPTIONS.length,
      }}
    />
  );

  const title = (
    <SentenceText>
      Show jobs requiring
      {seniorityBlank}
    </SentenceText>
  );

  return (
    <FilterContainer categoryId="experience" title={title} chrome="stream">
      <SentenceText>
        Show jobs for
        {roleBlank}
      </SentenceText>

      <SentenceText>
        Must have
        <SentenceRangeBlank
          minAriaLabel="Minimum IC experience years"
          maxAriaLabel="Maximum IC experience years"
          minLabel="Minimum IC experience years"
          maxLabel="Maximum IC experience years"
          minValue={icMin}
          maxValue={icMax}
          onChangeMin={setIcMin}
          onChangeMax={setIcMax}
          onCommit={commitIndividualContributor}
          separator="-"
          minPlaceholder="min"
          maxPlaceholder="max"
          widthClassName="w-10"
        />
        years of individual contributor experience
      </SentenceText>

      <SentenceText>
        Must have
        <SentenceRangeBlank
          minAriaLabel="Minimum PM experience years"
          maxAriaLabel="Maximum PM experience years"
          minLabel="Minimum PM experience years"
          maxLabel="Maximum PM experience years"
          minValue={pmMin}
          maxValue={pmMax}
          onChangeMin={setPmMin}
          onChangeMax={setPmMax}
          onCommit={commitPeopleManager}
          separator="-"
          minPlaceholder="min"
          maxPlaceholder="max"
          widthClassName="w-10"
        />
        years of people manager experience
      </SentenceText>
    </FilterContainer>
  );
}
