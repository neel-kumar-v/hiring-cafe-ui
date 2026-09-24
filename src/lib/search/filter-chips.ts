import { orderedFilterIds } from "@/data/search-filters";
import { initialSearchState } from "@/lib/edited-filters";
import type {
  ActivityMetric,
  CategoryId,
  DegreePreferences,
  DegreePreferencesOptions,
  InfiniteRange,
  Keywords,
  Range,
  SearchExpression,
  SearchState,
  Select,
} from "@/types/search";

export interface FilterChip {
  id: string;
  label: string;
  categoryId: CategoryId;
  groupId: string;
  groupLabel: string;
  clear: (state: SearchState, initial?: SearchState) => Partial<SearchState>;
}

export interface FilterChipGroup {
  id: string;
  label: string;
  categoryId: CategoryId;
  chips: FilterChip[];
}

type ChipGroupMeta = {
  id: string;
  label: string;
  categoryId: CategoryId;
};

function isEqual(left: unknown, right: unknown) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function asList<T>(value: Select<T> | Select<T, null> | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

function isEmptyExpression(expression: SearchExpression<string> | undefined): boolean {
  if (expression == null) return true;
  if (typeof expression === "string") return expression.trim() === "";
  return !expression.AND?.length && !expression.OR?.length && expression.NOT == null;
}

export function formatQuotedSearchExpression(expression: SearchExpression<string>, wrapOr = false): string {
  if (expression == null) return "";
  if (typeof expression === "string") return `"${expression}"`;

  if (expression.AND?.length) {
    return expression.AND.map((part) => formatQuotedSearchExpression(part, true)).join(" AND ");
  }

  if (expression.OR?.length) {
    const inner = expression.OR.map((part) => formatQuotedSearchExpression(part, false)).join(" OR ");
    return wrapOr || expression.OR.length > 1 ? `(${inner})` : inner;
  }

  if (expression.NOT != null) {
    const inner = formatQuotedSearchExpression(expression.NOT, true);
    return `NOT ${inner.startsWith("(") ? inner : `(${inner})`}`;
  }

  return "";
}

function formatMoney(value: number, currency = "USD") {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `$${value.toLocaleString("en-US")}`;
  }
}

function formatBound(range: Range, currency: string) {
  const low = range.min > 0 ? formatMoney(range.min, currency) : "any";
  const high = range.max > 0 ? formatMoney(range.max, currency) : "any";
  return `${low} – ${high}`;
}

function hasRangeValue(range: Range | InfiniteRange | null | undefined) {
  if (!range) return false;
  return range.min !== 0 || (range.max !== 0 && range.max != null);
}

function singularizeUnit(magnitude: number, unit: string) {
  if (magnitude === 1 && unit.endsWith("s")) return unit.slice(0, -1).toLowerCase();
  return unit.toLowerCase();
}

function formatKeywordsList(value: Select<string> | Select<string, "None"> | undefined) {
  if (!value || value === "None" || value === "All") return [];
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function formatPreferences(preferences: Select<DegreePreferences, null>) {
  if (!preferences || !Array.isArray(preferences) || preferences.length === 0) return "";
  return preferences.join(" / ");
}

function rangeChip(range: InfiniteRange, suffix = "employees") {
  if (range.max == null) return `${range.min}+ ${suffix}`;
  if (range.min === range.max) return `${range.min} ${suffix}`;
  return `${range.min}–${range.max} ${suffix}`;
}

function addChip(chips: FilterChip[], group: ChipGroupMeta, chip: Pick<FilterChip, "id" | "label" | "clear">) {
  chips.push({
    ...chip,
    groupId: group.id,
    groupLabel: group.label,
    categoryId: group.categoryId,
  });
}

function addKeywordChips(
  chips: FilterChip[],
  group: ChipGroupMeta,
  keywords: Keywords,
  _initial: Keywords,
  options: {
    includePrefix?: string;
    excludePrefix?: string;
    idPrefix?: string;
    replace: (state: SearchState, next: Keywords) => Partial<SearchState>;
  },
) {
  const prefix = options.idPrefix ?? group.id;
  formatKeywordsList(keywords.include).forEach((value) => {
    addChip(chips, group, {
      id: `${prefix}-include-${value}`,
      label: options.includePrefix ? `${options.includePrefix}${value}` : value,
      clear: (state) => {
        const nextInclude = formatKeywordsList(keywords.include).filter((item) => item !== value);
        return options.replace(state, { ...keywords, include: nextInclude });
      },
    });
  });

  formatKeywordsList(keywords.exclude).forEach((value) => {
    addChip(chips, group, {
      id: `${prefix}-exclude-${value}`,
      label: `${options.excludePrefix ?? "Exclude "}${value}`,
      clear: (state) => {
        const nextExclude = formatKeywordsList(keywords.exclude).filter((item) => item !== value);
        return options.replace(state, {
          ...keywords,
          exclude: nextExclude.length ? nextExclude : "None",
        });
      },
    });
  });
}

const metricLabels: Record<"views" | "applications" | "saves", { few: string; many: string }> = {
  views: { few: "Few views", many: "Lots of views" },
  applications: { few: "Few applications", many: "Lots of applications" },
  saves: { few: "Few saves", many: "Lots of saves" },
};

const applyFormLabels: Record<SearchState["apply_form"], string> = {
  All: "All apply forms",
  Fast: "Easy apply only",
  Slow: "Time consuming apply forms",
};

const degreeLabels: Record<keyof DegreePreferencesOptions, string> = {
  associate: "Associate's",
  bachelor: "Bachelor's",
  master: "Master's",
  doctorate: "Doctorate",
};

const jobTitleFieldLabels: Record<keyof SearchState["job_titles"], string> = {
  title: "Title",
  technical: "Tech",
  description: "Description",
  requirements: "Requirements",
};

export function getFilterChips(state: SearchState, initial: SearchState = initialSearchState): FilterChip[] {
  const chips: FilterChip[] = [];

  if (!isEqual(state.date_range, initial.date_range)) {
    addChip(
      chips,
      { id: "date-range", label: "Date Posted", categoryId: "date-range" },
      {
        id: "date-range",
        label: `${state.date_range.magnitude} ${singularizeUnit(state.date_range.magnitude, state.date_range.unit)}`,
        clear: () => ({ date_range: initial.date_range }),
      },
    );
  }

  if (!isEqual(state.sort, initial.sort)) {
    addChip(
      chips,
      { id: "sorting", label: "Sorting", categoryId: "sorting" },
      {
        id: "sorting",
        label: `${state.sort.order} ${state.sort.by}`,
        clear: () => ({ sort: initial.sort }),
      },
    );
  }

  if (state.apply_form !== initial.apply_form) {
    addChip(
      chips,
      { id: "apply-form", label: "Apply Process", categoryId: "apply-form" },
      {
        id: "apply-form",
        label: applyFormLabels[state.apply_form] ?? state.apply_form,
        clear: () => ({ apply_form: initial.apply_form }),
      },
    );
  }

  asList(state.exclusion).forEach((value) => {
    addChip(
      chips,
      { id: "exclusion", label: "Exclude Jobs", categoryId: "exclusion" },
      {
        id: `exclusion-${value}`,
        label: `Exclude ${value}`,
        clear: (current) => ({
          exclusion: current.exclusion.filter((item) => item !== value),
        }),
      },
    );
  });

  (["views", "applications", "saves"] as const).forEach((metric) => {
    const value = state.activity_outcomes[metric];
    if (value === "All" || value === initial.activity_outcomes[metric]) return;
    addChip(
      chips,
      { id: "activity-outcomes", label: "Activity & Outcomes", categoryId: "activity-outcomes" },
      {
        id: `activity-${metric}`,
        label: value === "Few" ? metricLabels[metric].few : metricLabels[metric].many,
        clear: (current) => ({
          activity_outcomes: { ...current.activity_outcomes, [metric]: "All" as ActivityMetric },
        }),
      },
    );
  });

  (
    [
      ["interviews", "Interviews reported"],
      ["offers", "Offers reported"],
      ["ghostProne", "Leave out ghost-prone"],
      ["highRejection", "Leave out high-rejection"],
    ] as const
  ).forEach(([key, label]) => {
    if (!state.activity_outcomes.reportedOutcomes[key]) return;
    addChip(
      chips,
      { id: "activity-outcomes", label: "Activity & Outcomes", categoryId: "activity-outcomes" },
      {
        id: `activity-outcome-${key}`,
        label,
        clear: (current) => ({
          activity_outcomes: {
            ...current.activity_outcomes,
            reportedOutcomes: { ...current.activity_outcomes.reportedOutcomes, [key]: false },
          },
        }),
      },
    );
  });

  asList(state.encouraged).forEach((value) => {
    addChip(
      chips,
      { id: "encouraged", label: "Encouraged to Apply", categoryId: "encouraged" },
      {
        id: `encouraged-${value}`,
        label: value === "Veteran" ? "Military Veterans" : value,
        clear: (current) => {
          const next = asList(current.encouraged).filter((item) => item !== value);
          return { encouraged: next.length ? next : initial.encouraged };
        },
      },
    );
  });

  asList(state.department).forEach((value) => {
    addChip(
      chips,
      { id: "departments", label: "Departments", categoryId: "departments" },
      {
        id: `department-${value}`,
        label: value,
        clear: (current) => {
          const next = asList(current.department).filter((item) => item !== value);
          return { department: next.length ? next : "All" };
        },
      },
    );
  });

  (Object.keys(jobTitleFieldLabels) as Array<keyof SearchState["job_titles"]>).forEach((field) => {
    const expression = state.job_titles[field];
    if (isEmptyExpression(expression) || isEqual(expression, initial.job_titles[field])) return;
    const formatted = formatQuotedSearchExpression(expression);
    if (!formatted) return;
    addChip(
      chips,
      { id: "job-titles", label: "Job Titles & Keywords", categoryId: "job-titles" },
      {
        id: `job-titles-${field}`,
        label: `${jobTitleFieldLabels[field]}: ${formatted}`,
        clear: (current) => ({
          job_titles: { ...current.job_titles, [field]: {} },
        }),
      },
    );
  });

  const salary = state.salary;
  const salaryInitial = initial.salary;
  const salaryGroup: ChipGroupMeta = { id: "salary", label: "Salary", categoryId: "salary" };
  const simpleAmount = salary.min_range.min > 0 && salary.min_range.min === salary.min_range.max && !hasRangeValue(salary.max_range);

  if (simpleAmount) {
    const amount = formatMoney(salary.min_range.min, salary.currency);
    addChip(chips, salaryGroup, {
      id: "salary-lower",
      label: `Lower bound ${amount} – any`,
      clear: (current) => ({
        salary: { ...current.salary, min_range: { min: 0, max: 0 }, max_range: { min: 0, max: 0 } },
      }),
    });
    addChip(chips, salaryGroup, {
      id: "salary-upper",
      label: `Upper bound ${amount} – any`,
      clear: (current) => ({
        salary: { ...current.salary, min_range: { min: 0, max: 0 }, max_range: { min: 0, max: 0 } },
      }),
    });
  } else {
    if (hasRangeValue(salary.min_range)) {
      addChip(chips, salaryGroup, {
        id: "salary-lower",
        label: `Lower bound ${formatBound(salary.min_range, salary.currency)}`,
        clear: (current) => ({ salary: { ...current.salary, min_range: { min: 0, max: 0 } } }),
      });
    }
    if (hasRangeValue(salary.max_range)) {
      addChip(chips, salaryGroup, {
        id: "salary-upper",
        label: `Upper bound ${formatBound(salary.max_range, salary.currency)}`,
        clear: (current) => ({ salary: { ...current.salary, max_range: { min: 0, max: 0 } } }),
      });
    }
  }

  const salaryHasAmounts = simpleAmount || hasRangeValue(salary.min_range) || hasRangeValue(salary.max_range);
  if ((salaryHasAmounts && salary.unit !== "Any") || salary.unit !== salaryInitial.unit) {
    addChip(chips, salaryGroup, {
      id: "salary-unit",
      label: `Paid ${salary.unit}`,
      clear: (current) => ({ salary: { ...current.salary, unit: "Any", listedUnit: "Any" } }),
    });
  }

  if (salary.currency !== salaryInitial.currency) {
    addChip(chips, salaryGroup, {
      id: "salary-currency",
      label: salary.currency,
      clear: (current) => ({ salary: { ...current.salary, currency: salaryInitial.currency } }),
    });
  }

  if (salary.undisclosed) {
    addChip(chips, salaryGroup, {
      id: "salary-undisclosed",
      label: "Hide undisclosed salaries",
      clear: (current) => ({ salary: { ...current.salary, undisclosed: false } }),
    });
  }

  asList(state.commitment).forEach((value) => {
    addChip(
      chips,
      { id: "commitment", label: "Commitment", categoryId: "commitment" },
      {
        id: `commitment-${value}`,
        label: value,
        clear: (current) => {
          const next = asList(current.commitment).filter((item) => item !== value);
          return { commitment: next.length ? next : "All" };
        },
      },
    );
  });

  asList(state.experience.level).forEach((value) => {
    addChip(
      chips,
      { id: "experience", label: "Experience", categoryId: "experience" },
      {
        id: `experience-level-${value}`,
        label: value === "None" ? "No experience required" : value,
        clear: (current) => {
          const next = asList(current.experience.level).filter((item) => item !== value);
          return { experience: { ...current.experience, level: next.length ? next : "All" } };
        },
      },
    );
  });

  asList(state.experience.role).forEach((value) => {
    addChip(
      chips,
      { id: "experience", label: "Experience", categoryId: "experience" },
      {
        id: `experience-role-${value}`,
        label: value,
        clear: (current) => {
          const next = asList(current.experience.role).filter((item) => item !== value);
          return { experience: { ...current.experience, role: next.length ? next : "All" } };
        },
      },
    );
  });

  if (state.experience.individualContributor && hasRangeValue(state.experience.individualContributor)) {
    const range = state.experience.individualContributor;
    addChip(
      chips,
      { id: "experience", label: "Experience", categoryId: "experience" },
      {
        id: "experience-ic-years",
        label: `IC experience: ${range.min}–${range.max} years`,
        clear: (current) => ({ experience: { ...current.experience, individualContributor: null } }),
      },
    );
  }

  if (state.experience.peopleManager && hasRangeValue(state.experience.peopleManager)) {
    const range = state.experience.peopleManager;
    addChip(
      chips,
      { id: "experience", label: "Experience", categoryId: "experience" },
      {
        id: "experience-pm-years",
        label: `Manager experience: ${range.min}–${range.max} years`,
        clear: (current) => ({ experience: { ...current.experience, peopleManager: null } }),
      },
    );
  }

  asList(state.benefits).forEach((value) => {
    addChip(
      chips,
      { id: "benefits", label: "Benefits & Perks", categoryId: "benefits" },
      {
        id: `benefits-${value}`,
        label: value,
        clear: (current) => {
          const next = asList(current.benefits).filter((item) => item !== value);
          return { benefits: next.length ? next : initial.benefits };
        },
      },
    );
  });

  (Object.keys(degreeLabels) as Array<keyof DegreePreferencesOptions>).forEach((degree) => {
    const current = state.education[degree];
    const preferences = formatPreferences(current.preferences);
    if (preferences) {
      addChip(
        chips,
        { id: "education", label: "Education", categoryId: "education" },
        {
          id: `education-${degree}-preferences`,
          label: `${degreeLabels[degree]}: ${preferences}`,
          clear: (currentState) => ({
            education: {
              ...currentState.education,
              [degree]: { ...currentState.education[degree], preferences: null },
            },
          }),
        },
      );
    }

    addKeywordChips(chips, { id: "education", label: "Education", categoryId: "education" }, current.keywords, initial.education[degree].keywords, {
      idPrefix: `education-${degree}`,
      includePrefix: `${degreeLabels[degree]} includes: `,
      excludePrefix: `${degreeLabels[degree]} excludes: `,
      replace: (currentState, next) => ({
        education: {
          ...currentState.education,
          [degree]: { ...currentState.education[degree], keywords: next },
        },
      }),
    });
  });

  addKeywordChips(
    chips,
    { id: "licenses", label: "Licenses & Certifications", categoryId: "licenses" },
    state.license_certification.keywords,
    initial.license_certification.keywords,
    {
      replace: (current, next) => ({
        license_certification: { ...current.license_certification, keywords: next },
      }),
    },
  );

  if (state.license_certification.hide_required) {
    addChip(
      chips,
      { id: "licenses", label: "Licenses & Certifications", categoryId: "licenses" },
      {
        id: "licenses-hide-required",
        label: "Hide jobs requiring licenses",
        clear: (current) => ({
          license_certification: { ...current.license_certification, hide_required: false },
        }),
      },
    );
  }

  asList(state.security_clearance).forEach((value) => {
    addChip(
      chips,
      { id: "security", label: "Security Clearance", categoryId: "security" },
      {
        id: `security-${value}`,
        label: value,
        clear: (current) => {
          const next = asList(current.security_clearance).filter((item) => item !== value);
          return { security_clearance: next.length ? next : "All" };
        },
      },
    );
  });

  addKeywordChips(chips, { id: "languages", label: "Languages", categoryId: "languages" }, state.language, initial.language, {
    replace: (_current, next) => ({ language: next }),
  });

  (
    [
      ["morning", "Morning shift"],
      ["afternoon", "Afternoon shift"],
      ["night", "Evening shift"],
      ["weekend", "Weekend"],
      ["holiday", "Holiday"],
      ["overtime", "Overtime"],
      ["oncall", "On-call"],
    ] as const
  ).forEach(([key, label]) => {
    const value = state.shift_preferences[key];
    const initialValue = initial.shift_preferences[key];
    if (value == null || value === "None" || value === "All" || isEqual(value, initialValue)) return;
    const text = Array.isArray(value) ? value.join(" / ") : String(value);
    addChip(
      chips,
      { id: "shifts", label: "Shifts & Schedules", categoryId: "shifts" },
      {
        id: `shifts-${key}`,
        label: `${label}: ${text}`,
        clear: (current) => ({
          shift_preferences: { ...current.shift_preferences, [key]: initialValue },
        }),
      },
    );
  });

  if (state.travel_requirements.air !== "All") {
    asList(state.travel_requirements.air).forEach((value) => {
      addChip(
        chips,
        { id: "travel", label: "Travel Requirement", categoryId: "travel" },
        {
          id: `travel-air-${value}`,
          label: `Air travel: ${value}`,
          clear: (current) => {
            const next = asList(current.travel_requirements.air).filter((item) => item !== value);
            return { travel_requirements: { ...current.travel_requirements, air: next.length ? next : "All" } };
          },
        },
      );
    });
  }

  if (state.travel_requirements.land !== "All") {
    asList(state.travel_requirements.land).forEach((value) => {
      addChip(
        chips,
        { id: "travel", label: "Travel Requirement", categoryId: "travel" },
        {
          id: `travel-land-${value}`,
          label: `Land travel: ${value}`,
          clear: (current) => {
            const next = asList(current.travel_requirements.land).filter((item) => item !== value);
            return { travel_requirements: { ...current.travel_requirements, land: next.length ? next : "All" } };
          },
        },
      );
    });
  }

  state.location.location.forEach((location) => {
    const label = location.address.formatted;
    if (!label) return;
    addChip(
      chips,
      { id: "location", label: "Location", categoryId: "location" },
      {
        id: `location-${location.id || label}`,
        label,
        clear: (current) => ({
          location: {
            ...current.location,
            location: current.location.location.filter((item) => item.id !== location.id && item.address.formatted !== label),
          },
        }),
      },
    );
  });

  asList(state.location.workplace_type).forEach((value) => {
    addChip(
      chips,
      { id: "workplace-activity", label: "Workplace Activity", categoryId: "workplace-activity" },
      {
        id: `workplace-type-${value}`,
        label: value,
        clear: (current) => {
          const next = asList(current.location.workplace_type).filter((item) => item !== value);
          return { location: { ...current.location, workplace_type: next.length ? next : "All" } };
        },
      },
    );
  });

  (
    [
      ["environment", "Environment"],
      ["mobility", "Mobility"],
      ["physical_intensity", "Physical intensity"],
      ["cognitive_intensity", "Cognitive intensity"],
      ["computer_usage", "Computer usage"],
      ["oral_communication", "Oral communication"],
    ] as const
  ).forEach(([key, label]) => {
    const value = state.location.workplace_activity[key];
    if (value === "All") return;
    asList(value).forEach((item) => {
      addChip(
        chips,
        { id: "workplace-activity", label: "Workplace Activity", categoryId: "workplace-activity" },
        {
          id: `workplace-${key}-${item}`,
          label: `${label}: ${item}`,
          clear: (current) => {
            const currentValue = current.location.workplace_activity[key];
            const next = asList(currentValue).filter((entry) => entry !== item);
            return {
              location: {
                ...current.location,
                workplace_activity: {
                  ...current.location.workplace_activity,
                  [key]: next.length ? next : "All",
                },
              },
            };
          },
        },
      );
    });
  });

  addKeywordChips(chips, { id: "company", label: "Company", categoryId: "company" }, state.company, initial.company, {
    replace: (_current, next) => ({ company: next }),
  });

  if (state.industry.profit !== "All") {
    asList(state.industry.profit).forEach((value) => {
      addChip(
        chips,
        { id: "industry", label: "Industry", categoryId: "industry" },
        {
          id: `industry-profit-${value}`,
          label: value,
          clear: (current) => {
            const next = asList(current.industry.profit).filter((item) => item !== value);
            return { industry: { ...current.industry, profit: next.length ? next : "All" } };
          },
        },
      );
    });
  }

  addKeywordChips(
    chips,
    { id: "industry", label: "Industry", categoryId: "industry" },
    state.industry.industry,
    initial.industry.industry,
    {
      idPrefix: "industry-name",
      replace: (current, next) => ({ industry: { ...current.industry, industry: next } }),
    },
  );

  addKeywordChips(
    chips,
    { id: "industry", label: "Industry", categoryId: "industry" },
    state.industry.activities,
    initial.industry.activities,
    {
      idPrefix: "industry-activity",
      includePrefix: "Activity: ",
      excludePrefix: "Exclude activity: ",
      replace: (current, next) => ({ industry: { ...current.industry, activities: next } }),
    },
  );

  if (state.industry.usa_jobs !== "All") {
    addChip(
      chips,
      { id: "industry", label: "Industry", categoryId: "industry" },
      {
        id: "industry-usa-jobs",
        label: state.industry.usa_jobs === "Only" ? "USAJobs only" : "Hide USAJobs",
        clear: (current) => ({ industry: { ...current.industry, usa_jobs: "All" } }),
      },
    );
  }

  if (state.stage_funding.current !== "All") {
    asList(state.stage_funding.current).forEach((value) => {
      addChip(
        chips,
        { id: "stage", label: "Stage & Funding", categoryId: "stage" },
        {
          id: `stage-current-${value}`,
          label: value,
          clear: (current) => {
            const next = asList(current.stage_funding.current).filter((item) => item !== value);
            return { stage_funding: { ...current.stage_funding, current: next.length ? next : "All" } };
          },
        },
      );
    });
  }

  addKeywordChips(
    chips,
    { id: "stage", label: "Stage & Funding", categoryId: "stage" },
    state.stage_funding.investors,
    initial.stage_funding.investors,
    {
      includePrefix: "Investor: ",
      excludePrefix: "Exclude investor: ",
      replace: (current, next) => ({ stage_funding: { ...current.stage_funding, investors: next } }),
    },
  );

  if (hasRangeValue(state.stage_funding.latest_round)) {
    addChip(
      chips,
      { id: "stage", label: "Stage & Funding", categoryId: "stage" },
      {
        id: "stage-latest-round",
        label: `Latest round: ${state.stage_funding.latest_round.min}–${state.stage_funding.latest_round.max}`,
        clear: (current) => ({ stage_funding: { ...current.stage_funding, latest_round: initial.stage_funding.latest_round } }),
      },
    );
  }

  if (Array.isArray(state.size)) {
    state.size.forEach((range, index) => {
      addChip(
        chips,
        { id: "size", label: "Size", categoryId: "size" },
        {
          id: `size-${index}-${range.min}-${range.max ?? "plus"}`,
          label: rangeChip(range),
          clear: (current) => {
            if (!Array.isArray(current.size)) return { size: "All" };
            const next = current.size.filter((_, itemIndex) => itemIndex !== index);
            return { size: next.length ? next : "All" };
          },
        },
      );
    });
  }

  if (hasRangeValue(state.founding_year)) {
    const { min, max } = state.founding_year;
    const label = min && max ? `Founded ${min}–${max}` : min ? `Founded after ${min}` : `Founded before ${max}`;
    addChip(
      chips,
      { id: "founding", label: "Founding Year", categoryId: "founding" },
      {
        id: "founding-year",
        label,
        clear: () => ({ founding_year: initial.founding_year }),
      },
    );
  }

  const categoryOrder = new Map(orderedFilterIds.map((id, index) => [id, index]));
  return chips.sort((left, right) => {
    const leftIndex = categoryOrder.get(left.categoryId) ?? Number.MAX_SAFE_INTEGER;
    const rightIndex = categoryOrder.get(right.categoryId) ?? Number.MAX_SAFE_INTEGER;
    return leftIndex - rightIndex;
  });
}

export function groupFilterChips(chips: FilterChip[]): FilterChipGroup[] {
  const groups: FilterChipGroup[] = [];
  const indexById = new Map<string, FilterChipGroup>();

  chips.forEach((chip) => {
    let group = indexById.get(chip.groupId);
    if (!group) {
      group = {
        id: chip.groupId,
        label: chip.groupLabel,
        categoryId: chip.categoryId,
        chips: [],
      };
      indexById.set(chip.groupId, group);
      groups.push(group);
    }
    group.chips.push(chip);
  });

  return groups;
}

export function applyFilterChipClear(state: SearchState, chip: FilterChip, initial: SearchState = initialSearchState): SearchState {
  return { ...state, ...chip.clear(state, initial) };
}
