import degreeTitlesData from "@/data/degree_titles.json" with { type: "json" };
import jobsData from "@/data/jobs_data.json";
import languagesData from "@/data/languages.json" with { type: "json" };
import licensesData from "@/data/licenses.json" with { type: "json" };
import companiesData from "@/data/companies.json" with { type: "json" };
import { AddressComponent, BooleanOperator, CommitmentLevel, CommitmentLevelOptions, Environment, ExperienceLevel, ExperienceLevelOptions, HiringCafeSearchState, InfiniteRange, Intensity, Keywords, Location, Mobility, Range, SearchExpression, SearchState, SecurityClearanceOptions, Select, TravelRequirements, TravelRequirementsOptions, Workplace } from '../types/search';


export function convertSearchStateToHiringCafe(searchState: SearchState): HiringCafeSearchState {
  const convertSelectToArray = <T>(select: T[] | T): string[] => {
    if (Array.isArray(select)) {
      return select.map(item => String(item));
    }
    return select === "All" ? [] : [String(select)];
  };

  const convertKeywordsToArray = (keywords: { include: string[] | string; exclude: string[] | string }) => {
    const include = convertSelectToArray(keywords.include);
    const exclude = convertSelectToArray(keywords.exclude);
    return [...include, ...exclude.filter(item => item !== "None")];
  };

  const convertLocation = (location: Location) => ({
    address_components: location.address.components.map((comp: AddressComponent) => ({
      long_name: comp.long_name,
      short_name: comp.short_name,
      types: comp.types.map(type => String(type))
    })),
    formatted_address: location.address.formatted,
    geometry: {
      location: {
        lat: location.geographical.latitude,
        lon: location.geographical.longitude
      }
    },
    id: location.id,
    options: location.options ? {
      flexible_regions: location.options.flexible_regions.map(type => String(type)),
      ignore_radius: location.options.ignore_radius,
      radius: location.options.radius,
      radius_unit: location.options.radius_unit
    } : undefined,
    types: location.types.map(type => String(type)),
    workplace_types: location.workplace_type ? convertSelectToArray(location.workplace_type) : undefined
  });

  const convertRangeToTuple = (range: { min: number; max: number }): [number, number] => {
    return [range.min, range.max];
  };

  const convertExperienceLevel = (level: ExperienceLevelOptions): string[] => {
    if (Array.isArray(level.level)) {
      return level.level.map((l: ExperienceLevel) => {
        if (l === "None") return "No Prior Experience Required";
        return l;
      });
    }
    return level.level === "All" ? [] : [level.level === "None" ? "No Prior Experience Required" : level.level];
  };

  const convertCommitmentLevel = (commitment: CommitmentLevelOptions): string[] => {
    if (Array.isArray(commitment)) {
      return commitment.map((c: CommitmentLevel) => {
        if (c === "Full Time") return "Full Time";
        if (c === "Part Time") return "Part Time";
        return c;
      });
    }
    return commitment === "All" ? [] : [commitment];
  };

  const convertSecurityClearance = (clearance: SecurityClearanceOptions): string[] => {
    if (Array.isArray(clearance)) {
      return clearance;
    }
    return clearance === "All" ? [] : [clearance];
  };

  const convertTravelRequirements = (travel: TravelRequirementsOptions): string[] => {
    if (Array.isArray(travel.air)) {
      return travel.air.map((t: TravelRequirements) => {
        if (t === "Minimum") return "Minimal";
        return t;
      });
    }
    return travel.air === "All" ? [] : [travel.air === "Minimum" ? "Minimal" : travel.air];
  };

  const convertDemandsToArray = (demands: Select<Intensity | Mobility | Environment | Workplace>): string[] => {
    if (Array.isArray(demands)) {
      return demands.map(d => String(d));
    }
    return demands === "All" ? [] : [String(demands)];
  };

  return {
    airTravelRequirement: convertTravelRequirements(searchState.travel_requirements),
    applicationFormEase: [],
    associatesDegreeFieldsOfStudy: [],
    associatesDegreeRequirements: [],
    bachelorsDegreeFieldsOfStudy: [],
    bachelorsDegreeRequirements: [],
    benefitsAndPerks: convertSelectToArray(searchState.benefits),
    calcFrequency: searchState.salary.unit,
    cognitiveDemandLevels: convertDemandsToArray(searchState.location.workplace_activity.cognitive_intensity),
    commitmentTypes: convertCommitmentLevel(searchState.commitment),
    companyKeywords: convertKeywordsToArray(searchState.company),
    companyKeywordsBooleanOperator: "OR",
    companyNames: [],
    companyPublicOrPrivate: searchState.stage_funding.current === "All" ? "all" : searchState.stage_funding.current.toLowerCase(),
    companySizeRanges: [],
    computerUsageLevels: convertDemandsToArray(searchState.location.workplace_activity.computer_usage),
    currency: {
      label: "Any",
      value: null
    },
    dateFetchedPastNDays: searchState.date_range.magnitude * (searchState.date_range.unit === "Days" ? 1 : searchState.date_range.unit === "Weeks" ? 7 : searchState.date_range.unit === "Months" ? 30 : 365),
    defaultToUserLocation: searchState.location.defaultUserLocation,
    departments: convertSelectToArray(searchState.department),
    doctorateDegreeFieldsOfStudy: [],
    doctorateDegreeRequirements: [],
    encouragedToApply: convertSelectToArray(searchState.encouraged),
    eveningShiftWork: [],
    excludeAllLicensesAndCertifications: searchState.license_certification.hide_required,
    excludedAssociatesDegreeFieldsOfStudy: [],
    excludedBachelorsDegreeFieldsOfStudy: [],
    excludedCompanyKeywords: [],
    excludedCompanyNames: [],
    excludedDoctorateDegreeFieldsOfStudy: [],
    excludedIndustries: convertKeywordsToArray(searchState.industry.industry).filter(item => item !== "All"),
    excludedInvestors: convertKeywordsToArray(searchState.stage_funding.investors),
    excludedLanguageRequirements: [],
    excludedLatestInvestmentSeries: convertKeywordsToArray(searchState.stage_funding.latest_round_type),
    excludedLicensesAndCertifications: convertKeywordsToArray(searchState.license_certification.keywords),
    excludedMastersDegreeFieldsOfStudy: [],
    excludeIfManagementYoeIsNotSpecified: false,
    excludeIfRoleYoeIsNotSpecified: false,
    excludeJobsWithAdditionalLanguageRequirements: false,
    frequency: {
      label: searchState.salary.listedUnit,
      value: searchState.salary.listedUnit === "Any" ? null : searchState.salary.listedUnit
    },
    hiddenCompanies: [],
    hideJobTypes: convertSelectToArray(searchState.exclusion),
    holidayAvailabilityRequired: searchState.shift_preferences.holiday === "Required" ? "Required" : "Doesn't Matter",
    industries: convertKeywordsToArray(searchState.industry.industry),
    investors: convertKeywordsToArray(searchState.stage_funding.investors),
    isNonProfit: searchState.industry.profit === "All" ? "all" : searchState.industry.profit.toLowerCase(),
    jobDescriptionQuery: "",
    jobTitleQuery: "",
    landTravelRequirement: convertTravelRequirements(searchState.travel_requirements),
    languageRequirements: convertKeywordsToArray(searchState.language),
    languageRequirementsOperator: "OR",
    latestInvestmentAmount: null,
    latestInvestmentCurrency: [],
    latestInvestmentSeries: convertKeywordsToArray(searchState.stage_funding.latest_round_type),
    latestInvestmentYearRange: [searchState.stage_funding.latest_round_amount.min, searchState.stage_funding.latest_round_amount.max],
    licensesAndCertifications: convertKeywordsToArray(searchState.license_certification.keywords),
    locations: searchState.location.location.map(convertLocation),
    managementYoeRange: searchState.experience.role === "None" ? [0, 20] : 
      typeof searchState.experience.role === "object" && "peopleManager" in searchState.experience.role ? 
        convertRangeToTuple(searchState.experience.role.peopleManager) : [0, 20],
    mastersDegreeFieldsOfStudy: [],
    mastersDegreeRequirements: [],
    maxCompensationHighEnd: searchState.salary.max_range.max,
    maxCompensationLowEnd: searchState.salary.max_range.max,
    maxYearFounded: searchState.founding_year.max,
    minCompensationHighEnd: searchState.salary.min_range.min,
    minCompensationLowEnd: searchState.salary.min_range.min,
    minYearFounded: searchState.founding_year.min,
    morningShiftWork: [],
    onCallRequirements: convertSelectToArray(searchState.shift_preferences.oncall),
    oralCommunicationLevels: convertDemandsToArray(searchState.location.workplace_activity.oral_communication),
    overnightShiftWork: [],
    overtimeRequired: searchState.shift_preferences.overtime === "Required" ? "Required" : "Doesn't Matter",
    physicalEnvironments: convertDemandsToArray(searchState.location.workplace_activity.environment),
    physicalLaborIntensity: convertDemandsToArray(searchState.location.workplace_activity.physical_intensity),
    physicalPositions: convertDemandsToArray(searchState.location.workplace_activity.mobility),
    requirementsKeywordsQuery: "",
    restrictedSearchAttributes: [],
    restrictJobsToTransparentSalaries: !searchState.salary.undisclosed,
    roleTypes: searchState.experience.role === "None" ? [] : 
      typeof searchState.experience.role === "object" && "individualContributor" in searchState.experience.role ? 
        ["Individual Contributor", "People Manager"] : ["Individual Contributor"],
    roleYoeRange: searchState.experience.role === "None" ? [0, 20] : 
      typeof searchState.experience.role === "object" && "individualContributor" in searchState.experience.role ? 
        convertRangeToTuple(searchState.experience.role.individualContributor) : [0, 20],
    searchModeSelectedCompany: null,
    searchQuery: "",
    securityClearances: convertSecurityClearance(searchState.security_clearance),
    seniorityLevel: convertExperienceLevel(searchState.experience),
    sortBy: "default",
    technologyKeywordsQuery: "",
    usaGovPref: searchState.industry.usa_jobs === "All" ? null : searchState.industry.usa_jobs,
    user: null,
    userId: "",
    userLocation: null,
    weekendAvailabilityRequired: searchState.shift_preferences.weekend === "Required" ? "Required" : "Doesn't Matter",
    workplaceTypes: convertSelectToArray(searchState.location.workplace_type)
  };
} 

export function getJobTitlesFromData(): string[] {
  if (jobsData && Array.isArray(jobsData.results)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const titles = (jobsData.results as any[])
      .map(
        (job) =>
          job.v5_processed_job_data?.core_job_title ||
          job.job_information?.title
      )
      .filter((title): title is string => Boolean(title));
    return Array.from(new Set(titles));
  }
  return [];
}

export function getLanguagesFromData(): string[] {
  if (languagesData && Array.isArray(languagesData.suggestions)) {
    return Array.from(new Set(languagesData.suggestions)).map(language =>
      language.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1))
    );
  }
  return [];
}

export function getDegreeTitlesFromData(): string[] {
  if (degreeTitlesData && Array.isArray(degreeTitlesData.suggestions)) {
    return Array.from(new Set(degreeTitlesData.suggestions)).map(title =>
      title.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1))
    ) as string[];
  }
  return [];
}

export function getLicensesFromData(): string[] {
  if (licensesData && Array.isArray(licensesData.suggestions)) {
    return Array.from(new Set(licensesData.suggestions));
  }
  return [];
}

export function getCompaniesFromData(): string[] {
  if (companiesData && Array.isArray(companiesData.suggestions)) {
    return Array.from(new Set(companiesData.suggestions));
  }
  return [];
}

export function decodeSelectString(select: Select<string> | Select<string, null> | Select<string, string>, maxCount: number = 3) {
  if (!select) return "None";
  if (Array.isArray(select)) return select.length === 0 ? "None" : select.slice(0, maxCount).join(", ");
  return select;
}

export function decodeRangeString(range: Range | InfiniteRange) {
  if (!range) return "All";
  if (range.min === 0 && range.max === 0) return "All";
  function formatK(num: number) {
    if (Math.abs(num) >= 1000) {
      return (num / 1000).toFixed(num % 1000 === 0 ? 0 : 1).replace(/\.0$/, "") + "k";
    }
    return num.toString();
  }

  if (range.min === range.max) return formatK(range.min);
  if (range.max === null) return formatK(range.min) + "+";
  return formatK(range.min) + " - " + formatK(range.max);
}

export function decodeSearchExpression(expression: SearchExpression<string>): string {
  if (!expression) return "";
  if (typeof expression === "string") return expression;
  if (expression.AND) return expression.AND.map(decodeSearchExpression).join(" AND ");
  if (expression.OR) return expression.OR.map(decodeSearchExpression).join(" OR ");
  if (expression.NOT) return "NOT (" + decodeSearchExpression(expression.NOT) + ")";
  return "";
}



export function decodeKeywords(keywords: Keywords, maxCount: number = 5) {
  if (!keywords) return { include: "None", exclude: "None" };
  const include = keywords.include?.length === 0 ? "None" : decodeSelectString(keywords.include || [], maxCount) + ((keywords.include?.length || 0) > maxCount ? "..." : "");
  const exclude = keywords.exclude === "None" ? "None" : decodeSelectString(keywords.exclude || "None", maxCount) + ((Array.isArray(keywords.exclude) ? keywords.exclude.length : 0) > maxCount ? "..." : "");
  return { include, exclude };
}

export function parseSearchExpression(input: string): SearchExpression<string> {
  const tokens: string[] = [];
  let index = 0;

  while (index < input.length) {
    const char = input[index];

    if (char === ' ') {
      index++;
      continue;
    }

    if (char === '(' || char === ')') {
      tokens.push(char);
      index++;
      continue;
    }

    if (char === '"') {
      let end = index + 1;
      let phrase = '';
      while (end < input.length && input[end] !== '"') {
        phrase += input[end++];
      }
      tokens.push(phrase);
      index = end + 1;
      continue;
    }

    if (/^[A-Za-z]$/.test(char)) {
      let end = index;
      while (end < input.length && /[A-Za-z]/.test(input[end])) end++;
      const word = input.slice(index, end).toUpperCase();
      if (word === "AND" || word === "OR" || word === "NOT") {
        tokens.push(word);
        index = end;
        continue;
      }
    }

    let end = index;
    while (end < input.length && ![' ', '(', ')', '"'].includes(input[end])) end++;
    tokens.push(input.slice(index, end));
    index = end;
  }

  let pos = 0;

  function parseExpression(): SearchExpression<string> {
    let currentOp: "AND" | "OR" | null = null;
    const exprStack: (SearchExpression<string> | BooleanOperator<string>)[] = [];

    while (pos < tokens.length) {
      const token = tokens[pos];

      if (token === ')') break;

      if (token === '(') {
        pos++;
        const group = parseExpression();
        if (currentOp && exprStack.length) {
          const prev = exprStack.pop()!;
          exprStack.push({ [currentOp]: [prev, group] });
          currentOp = null;
        } else {
          exprStack.push(group);
        }
        if (tokens[pos] === ')') pos++;
        continue;
      }

      if (token === 'AND' || token === 'OR') {
        currentOp = token;
        pos++;
        continue;
      }

      if (token === 'NOT') {
        pos++;
        let next: SearchExpression<string>;
        if (tokens[pos] === '(') {
          pos++;
          next = parseExpression();
          if (tokens[pos] === ')') pos++;
        } else {
          next = tokens[pos++];
        }
        exprStack.push({ NOT: next });
        continue;
      }

      if (currentOp && exprStack.length) {
        const prev = exprStack.pop()!;
        exprStack.push({ [currentOp]: [prev, token] });
        currentOp = null;
      } else {
        exprStack.push(token);
      }
      pos++;
    }

    while (exprStack.length > 1) {
      const first = exprStack.shift()!;
      const second = exprStack.shift()!;
      exprStack.unshift({ AND: [first, second] });
    }

    return exprStack[0] ?? "";
  }

  return parseExpression();
}