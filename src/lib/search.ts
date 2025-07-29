import companiesData from "@/data/companies.json" with { type: "json" };
import companyActivitiesData from "@/data/company_activities.json" with { type: "json" };
import degreeTitlesData from "@/data/degree_titles.json" with { type: "json" };
import industriesData from "@/data/industries.json" with { type: "json" };
import investorsData from "@/data/investors.json" with { type: "json" };
import jobsData from "@/data/jobs_data.json";
import languagesData from "@/data/languages.json" with { type: "json" };
import licensesData from "@/data/licenses.json" with { type: "json" };
import roundTypesData from "@/data/round_types.json" with { type: "json" };
import { AddressComponent, Benefits, BenefitsOptions, BooleanOperator, CommitmentLevel, CommitmentLevelOptions, CurrentStage, DegreePreferences, DegreePreferencesOptions, Department, DepartmentOptions, Encouraged, EncouragedOptions, Environment, Exclusion, ExclusionOptions, ExperienceLevel, ExperienceLevelOptions, FundingOptions, HiringCafeSearchState, IndustryOptions, InfiniteRange, Intensity, Keywords, LicenseCertificationOptions, Location, LocationType, Mobility, Profit, Range, SearchExpression, SearchState, SecurityClearanceOptions, Select, TravelRequirements, TravelRequirementsOptions, Workplace } from '../types/search';


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
    companyPublicOrPrivate: Array.isArray(searchState.stage_funding.current) ? "all" : searchState.stage_funding.current === "All" ? "all" : (searchState.stage_funding.current as string).toLowerCase(),
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
    excludeIfManagementYoeIsNotSpecified: searchState.experience.role === "None" ? false : typeof searchState.experience.role === "object" && "peopleManager" in searchState.experience.role ? searchState.experience.role.peopleManager.exclude_not_mentioned : false,
    excludeIfRoleYoeIsNotSpecified: searchState.experience.role === "None" ? false : typeof searchState.experience.role === "object" && "individualContributor" in searchState.experience.role ? searchState.experience.role.individualContributor.exclude_not_mentioned : false,
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
    isNonProfit: Array.isArray(searchState.industry.profit) ? "all" : searchState.industry.profit === "All" ? "all" : (searchState.industry.profit as string).toLowerCase(),
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
        convertRangeToTuple(searchState.experience.role.peopleManager.range) : [0, 20],
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
        convertRangeToTuple(searchState.experience.role.individualContributor.range) : [0, 20],
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

export function getIndustriesFromData(): string[] {
  if (industriesData && Array.isArray(industriesData.suggestions)) {
    return Array.from(new Set(industriesData.suggestions));
  }
  return [];
}

export function getCompanyActivitiesFromData(): string[] {
  if (companyActivitiesData && Array.isArray(companyActivitiesData.suggestions)) {
    return Array.from(new Set(companyActivitiesData.suggestions));
  }
  return [];
}

export function getRoundTypesFromData(): string[] {
  if (roundTypesData && Array.isArray(roundTypesData.suggestions)) {
    return Array.from(new Set(roundTypesData.suggestions));
  }
  return [];
}

export function getInvestorsFromData(): string[] {
  if (investorsData && Array.isArray(investorsData.suggestions)) {
    return Array.from(new Set(investorsData.suggestions));
  }
  return [];
}


export function decodeSelectString(select: Select<string> | Select<string, null> | Select<string, string>, maxCount: number = 3) {
  if (!select) return "None";
  if (Array.isArray(select)) return select.length === 0 ? "None" : select.slice(0, maxCount).join(", ");
  return select;
}

export function decodeRangeString(range: Range | InfiniteRange, moneyFormat: boolean = true) {
  if (!range) return "All";
  if (range.min === 0 && range.max === 0) return "All";
  function formatNumber(num: number) {
    if (!moneyFormat) return num.toString();
    if (Math.abs(num) >= 1000000) return (num / 1000000).toFixed(num % 1000000 === 0 ? 0 : 1).replace(/\.0$/, "") + "M";
    if (Math.abs(num) >= 1000) return (num / 1000).toFixed(num % 1000 === 0 ? 0 : 1).replace(/\.0$/, "") + "K";
    return num.toString();
  }

  if (range.min === range.max) return formatNumber(range.min);
  if (range.max === null) return formatNumber(range.min) + "+";
  return formatNumber(range.min) + " - " + formatNumber(range.max);
}

export function decodeSearchExpression(expression: SearchExpression<string>): string {
  if (!expression) return "";
  if (typeof expression === "string") return expression;
  if (expression.AND) return expression.AND.map(decodeSearchExpression).join(" AND ");
  if (expression.OR) return expression.OR.map(decodeSearchExpression).join(" OR ");
  if (expression.NOT) return "NOT (" + decodeSearchExpression(expression.NOT) + ")";
  return "";
}

export function decodeLocationInfo(location: Location): {
  addresses: string;
  radius: string;
  flexibleRegions: string;
  workplaceTypes: string;
} {
  if (!location) {
    return {
      addresses: "None",
      radius: "None",
      flexibleRegions: "None",
      workplaceTypes: "None"
    };
  }
  
  const address = location.address.formatted;
  const radius = location.options?.radius || 0;
  const radiusUnit = location.options?.radius_unit || "Miles";
  const ignoreRadius = location.options?.ignore_radius || false;
  const flexibleRegions = location.options?.flexible_regions || [];
  const workplaceTypes = location.workplace_type;
  
  // Format radius
  let radiusText = "None";
  if (ignoreRadius) {
    radiusText = "Exact location";
  } else if (radius > 0) {
    radiusText = `${radius} ${radiusUnit.toLowerCase()}`;
  }
  
  // Format flexible regions
  let flexibleRegionsText = "None";
  if (flexibleRegions.length > 0) {
    const regionNames = flexibleRegions.map(region => {
      switch (region) {
        case "Admin Area": return "state";
        case "Country": return "country";
        case "Continent": return "continent";
        default: return region.toLowerCase();
      }
    });
    flexibleRegionsText = regionNames.join(", ");
  }
  
  // Format workplace types
  let workplaceTypesText = "All";
  if (workplaceTypes && workplaceTypes !== "All") {
    const types = Array.isArray(workplaceTypes) ? workplaceTypes : [workplaceTypes];
    if (types.length > 0) {
      workplaceTypesText = types.join(", ");
    }
  }
  
  return {
    addresses: address,
    radius: radiusText,
    flexibleRegions: flexibleRegionsText,
    workplaceTypes: workplaceTypesText
  };
}

export function decodeLocations(locations: Location[]): {
  addresses: string;
  radius: string;
  flexibleRegions: string;
  workplaceTypes: string;
  isMultiple: boolean;
} {
  if (!locations || locations.length === 0) {
    return {
      addresses: "None",
      radius: "None",
      flexibleRegions: "None",
      workplaceTypes: "None",
      isMultiple: false
    };
  }
  
  if (locations.length === 1) {
    return {
      ...decodeLocationInfo(locations[0]),
      isMultiple: false
    };
  }
  
  // For multiple locations, just show the addresses
  const addresses = locations.map(location => location.address.formatted).join("; ");
  
  return {
    addresses,
    radius: "Multiple locations",
    flexibleRegions: "Multiple locations",
    workplaceTypes: "Multiple locations",
    isMultiple: true
  };
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

// Generalized handler functions for SearchState updates

export function createSelectHandler<T>(
  currentValue: Select<T>,
  allOptions: T[],
  updateSearchOptions: (updates: Partial<SearchState>) => void,
  path: keyof SearchState | string
) {
  return (item: T) => {
    let newValue: Select<T>;
    
    if (currentValue === "All") {
      const allExceptSelected = allOptions.filter(option => option !== item);
      newValue = allExceptSelected;
    } else if (Array.isArray(currentValue)) {
      if (currentValue.includes(item)) {
        const filtered = currentValue.filter(option => option !== item);
        newValue = filtered.length === 0 ? "All" : filtered;
      } else {
        const added = [...currentValue, item];
        newValue = added.length === allOptions.length ? "All" : added;
      }
    } else {
      newValue = [item];
    }
    
    updateSearchOptions({ [path]: newValue } as Partial<SearchState>);
  };
}

export function createSelectWithNullHandler<T>(
  currentValue: Select<T, null>,
  allOptions: T[],
  updateSearchOptions: (updates: Partial<SearchState>) => void,
  path: keyof SearchState | string
) {
  return (item: T) => {
    let newValue: Select<T, null>;
    
    if (!Array.isArray(currentValue)) {
      const allExceptSelected = allOptions.filter(option => option !== item);
      newValue = allExceptSelected;
    } else if (currentValue.includes(item)) {
      const filtered = currentValue.filter(option => option !== item);
      newValue = filtered.length === 0 ? null : filtered;
    } else {
      newValue = [...currentValue, item];
      if (newValue.length === allOptions.length) newValue = null;
    }
    
    updateSearchOptions({ [path]: newValue } as Partial<SearchState>);
  };
}

export function createKeywordsHandler(
  updateSearchOptions: (updates: Partial<SearchState>) => void,
  path: keyof SearchState | string
) {
  return (keywords: Keywords) => {
    updateSearchOptions({ [path]: keywords } as Partial<SearchState>);
  };
}

export function createRangeHandler(
  updateSearchOptions: (updates: Partial<SearchState>) => void,
  path: keyof SearchState | string
) {
  return ([min, max]: [number, number]) => {
    updateSearchOptions({ [path]: { min, max } } as Partial<SearchState>);
  };
}

export function createBooleanHandler(
  currentValue: boolean,
  updateSearchOptions: (updates: Partial<SearchState>) => void,
  path: keyof SearchState | string
) {
  return (checked: boolean | "indeterminate") => {
    updateSearchOptions({ [path]: Boolean(checked) } as Partial<SearchState>);
  };
}

export function createRadioHandler<T>(
  updateSearchOptions: (updates: Partial<SearchState>) => void,
  path: keyof SearchState | string
) {
  return (value: T) => {
    updateSearchOptions({ [path]: value } as Partial<SearchState>);
  };
}

export function createNestedSelectHandler<T>(
  currentValue: { [key: string]: Select<T> },
  allOptions: T[],
  updateSearchOptions: (updates: Partial<SearchState>) => void,
  path: keyof SearchState | string,
  nestedPath: string
) {
  return (item: T) => {
    let newValue: Select<T>;
    
    const currentSelectValue = currentValue[nestedPath];
    
    if (currentSelectValue === "All") {
      const allExceptSelected = allOptions.filter(option => option !== item);
      newValue = allExceptSelected;
    } else if (Array.isArray(currentSelectValue)) {
      if (currentSelectValue.includes(item)) {
        const filtered = currentSelectValue.filter(option => option !== item);
        newValue = filtered.length === 0 ? "All" : filtered;
      } else {
        const added = [...currentSelectValue, item];
        newValue = added.length === allOptions.length ? "All" : added;
      }
    } else {
      newValue = [item];
    }
    
    const nestedUpdate = { [nestedPath]: newValue };
    updateSearchOptions({ [path]: { ...currentValue, ...nestedUpdate } } as Partial<SearchState>);
  };
}

export function createNestedKeywordsHandler(
  currentValue: { [key: string]: Keywords },
  updateSearchOptions: (updates: Partial<SearchState>) => void,
  path: keyof SearchState | string,
  nestedPath: string
) {
  return (keywords: Keywords) => {
    const nestedUpdate = { [nestedPath]: keywords };
    updateSearchOptions({ [path]: { ...currentValue, ...nestedUpdate } } as Partial<SearchState>);
  };
}

export function createNestedBooleanHandler(
  currentValue: { [key: string]: boolean },
  updateSearchOptions: (updates: Partial<SearchState>) => void,
  path: keyof SearchState | string,
  nestedPath: string
) {
  return (checked: boolean | "indeterminate") => {
    const nestedUpdate = { [nestedPath]: Boolean(checked) };
    updateSearchOptions({ [path]: { ...currentValue, ...nestedUpdate } } as Partial<SearchState>);
  };
}

// Utility functions for checking if items are selected

export function isSelectItemSelected<T>(
  currentValue: Select<T>,
  item: T
): boolean {
  if (currentValue === "All") return true;
  if (Array.isArray(currentValue)) {
    return currentValue.includes(item);
  }
  return false;
}

export function isSelectWithNullItemSelected<T>(
  currentValue: Select<T, null>,
  item: T
): boolean {
  if (!Array.isArray(currentValue)) return true;
  return currentValue.includes(item);
}

export function isKeywordsItemSelected(
  keywords: Keywords,
  item: string,
  type: 'include' | 'exclude'
): boolean {
  const items = keywords[type];
  if (type === 'exclude' && items === "None") return false;
  if (Array.isArray(items)) {
    return items.includes(item);
  }
  return false;
}

// Specialized handlers for common patterns

export function createBenefitsHandler(
  currentBenefits: BenefitsOptions,
  updateSearchOptions: (updates: Partial<SearchState>) => void
) {
  return (benefit: Benefits) => {
    const newBenefits = currentBenefits?.includes(benefit)
      ? currentBenefits.filter(item => item !== benefit)
      : [...(currentBenefits || []), benefit];
    
    updateSearchOptions({ benefits: newBenefits });
  };
}

export function createExclusionHandler(
  currentExclusion: ExclusionOptions,
  updateSearchOptions: (updates: Partial<SearchState>) => void
) {
  return (exclusion: Exclusion) => {
    const newExclusion = currentExclusion.includes(exclusion)
      ? currentExclusion.filter(item => item !== exclusion)
      : [...currentExclusion, exclusion];
    
    updateSearchOptions({ exclusion: newExclusion });
  };
}

export function createEncouragedHandler(
  currentEncouraged: EncouragedOptions,
  updateSearchOptions: (updates: Partial<SearchState>) => void
) {
  return (encouraged: Encouraged) => {
    const newEncouraged = currentEncouraged?.includes(encouraged)
      ? currentEncouraged.filter(item => item !== encouraged)
      : [...(currentEncouraged || []), encouraged];
    
    updateSearchOptions({ encouraged: newEncouraged });
  };
}

export function createDepartmentHandler(
  currentDepartments: DepartmentOptions,
  allDepartments: Department[],
  updateSearchOptions: (updates: Partial<SearchState>) => void
) {
  return (department: Department) => {
    let currentDepartmentsArray: Department[] = [];
    
    if (currentDepartments === "All") {
      currentDepartmentsArray = allDepartments.filter(item => item !== department);
    } else if (Array.isArray(currentDepartments)) {
      currentDepartmentsArray = [...currentDepartments];
    }
    
    let newDepartments: Select<Department>;
    
    if (currentDepartments === "All") {
      newDepartments = currentDepartmentsArray;
    } else if (currentDepartmentsArray.includes(department)) {
      const filtered = currentDepartmentsArray.filter(item => item !== department);
      newDepartments = filtered.length === 0 ? [] : filtered;
    } else {
      const added = [...currentDepartmentsArray, department];
      newDepartments = added.length === allDepartments.length ? "All" : added;
    }
    
    if (Array.isArray(newDepartments) && newDepartments.length === allDepartments.length) {
      newDepartments = "All";
    }
    
    updateSearchOptions({ department: newDepartments });
  };
}

export function createEducationPreferenceHandler(
  currentEducation: DegreePreferencesOptions,
  updateSearchOptions: (updates: Partial<SearchState>) => void
) {
  return (degreeType: 'associate' | 'bachelor' | 'master' | 'doctorate', preference: DegreePreferences) => {
    const currentPreferences = currentEducation[degreeType].preferences;
    
    let newPreferences: Select<DegreePreferences, null>;
    
    if (Array.isArray(currentPreferences)) {
      if (currentPreferences.includes(preference)) {
        const filtered = currentPreferences.filter(p => p !== preference);
        newPreferences = filtered.length > 0 ? filtered : null;
      } else {
        newPreferences = [...currentPreferences, preference];
      }
    } else {
      newPreferences = [preference];
    }
    
    updateSearchOptions({
      education: {
        ...currentEducation,
        [degreeType]: {
          ...currentEducation[degreeType],
          preferences: newPreferences
        }
      }
    });
  };
}

export function createEducationKeywordsHandler(
  currentEducation: DegreePreferencesOptions,
  updateSearchOptions: (updates: Partial<SearchState>) => void
) {
  return (degreeType: 'associate' | 'bachelor' | 'master' | 'doctorate', keywords: Keywords) => {
    updateSearchOptions({
      education: {
        ...currentEducation,
        [degreeType]: {
          ...currentEducation[degreeType],
          keywords
        }
      }
    });
  };
}

// Specialized handlers for complex nested structures

export function createLicenseCertificationHandler(
  currentLicenseCertification: LicenseCertificationOptions,
  updateSearchOptions: (updates: Partial<SearchState>) => void
) {
  return (keywords: Keywords) => {
    updateSearchOptions({
      license_certification: {
        keywords,
        hide_required: currentLicenseCertification.hide_required
      }
    });
  };
}

export function createLicenseCertificationHideRequiredHandler(
  currentLicenseCertification: LicenseCertificationOptions,
  updateSearchOptions: (updates: Partial<SearchState>) => void
) {
  return (checked: boolean | "indeterminate") => {
    updateSearchOptions({
      license_certification: {
        keywords: currentLicenseCertification.keywords,
        hide_required: Boolean(checked)
      }
    });
  };
}

export function createIndustryHandler(
  currentIndustry: IndustryOptions,
  updateSearchOptions: (updates: Partial<SearchState>) => void
) {
  return (keywords: Keywords, field: 'activities' | 'industry') => {
    updateSearchOptions({
      industry: {
        ...currentIndustry,
        [field]: keywords
      }
    });
  };
}

export function createIndustryProfitHandler(
  currentIndustry: IndustryOptions,
  updateSearchOptions: (updates: Partial<SearchState>) => void
) {
  return (profit: Profit) => {
    const profitOptions: Profit[] = ["For-Profit", "Non-Profit"];
    let newProfit: Select<Profit, "All">;
    
    if (currentIndustry.profit === "All") {
      const allExceptSelected = profitOptions.filter(item => item !== profit);
      newProfit = allExceptSelected;
    } else if (Array.isArray(currentIndustry.profit)) {
      if (currentIndustry.profit.includes(profit)) {
        const filtered = currentIndustry.profit.filter(item => item !== profit);
        newProfit = filtered.length === 0 ? "All" : filtered;
      } else {
        const added = [...currentIndustry.profit, profit];
        newProfit = added.length === profitOptions.length ? "All" : added;
      }
    } else {
      newProfit = [profit];
    }
    
    updateSearchOptions({ 
      industry: { 
        ...currentIndustry, 
        profit: newProfit 
      } 
    });
  };
}

export function createStageFundingHandler(
  currentStageFunding: FundingOptions,
  updateSearchOptions: (updates: Partial<SearchState>) => void
) {
  return (keywords: Keywords, field: 'investors' | 'latest_round_type') => {
    updateSearchOptions({
      stage_funding: {
        ...currentStageFunding,
        [field]: keywords
      }
    });
  };
}

export function createStageFundingCurrentHandler(
  currentStageFunding: FundingOptions,
  updateSearchOptions: (updates: Partial<SearchState>) => void
) {
  return (currentStage: CurrentStage) => {
    const stagesOptions: CurrentStage[] = ["Public", "Private"];
    let newCurrentStages: Select<CurrentStage, "All">;

    if (currentStageFunding.current === "All") {
      const allExceptSelected = stagesOptions.filter((stage: CurrentStage) => stage !== currentStage);
      newCurrentStages = allExceptSelected;
    } else if (Array.isArray(currentStageFunding.current)) {
      if (currentStageFunding.current.includes(currentStage)) {
        newCurrentStages = currentStageFunding.current.filter(stage => stage !== currentStage);
        newCurrentStages = newCurrentStages.length === 0 ? "All" : newCurrentStages;
      } else {
        newCurrentStages = [...currentStageFunding.current, currentStage];
        newCurrentStages = newCurrentStages.length === stagesOptions.length ? "All" : newCurrentStages;
      }
    } else {
      newCurrentStages = [currentStage];
    }

    updateSearchOptions({
      stage_funding: {
        ...currentStageFunding,
        current: newCurrentStages
      }
    });
  };
}

export function createStageFundingRangeHandler(
  currentStageFunding: FundingOptions,
  updateSearchOptions: (updates: Partial<SearchState>) => void
) {
  return (field: 'latest_round' | 'latest_round_amount', [min, max]: [number, number]) => {
    updateSearchOptions({
      stage_funding: {
        ...currentStageFunding,
        [field]: { min, max }
      }
    });
  };
}

// Location-specific handlers

export function createLocationRadiusHandler(
  currentLocation: Location,
  searchState: SearchState,
  updateSearchOptions: (updates: Partial<SearchState>) => void,
  locationIndex: number
) {
  return (radius: number) => {
    const updatedLocation = {
      ...currentLocation,
      options: {
        ...currentLocation.options,
        radius: radius,
        radius_unit: currentLocation.options?.radius_unit || "Miles",
        ignore_radius: radius === 0,
        flexible_regions: currentLocation.options?.flexible_regions || []
      }
    };
    
    updateSearchOptions({
      location: {
        ...searchState.location,
        location: searchState.location.location.map((loc: Location, index: number) => 
          index === locationIndex ? updatedLocation : loc
        )
      }
    });
  };
}

export function createLocationRadiusUnitHandler(
  currentLocation: Location,
  searchState: SearchState,
  updateSearchOptions: (updates: Partial<SearchState>) => void,
  locationIndex: number
) {
  return (unit: "Miles" | "Kilometers") => {
    const updatedLocation = {
      ...currentLocation,
      options: {
        ...currentLocation.options,
        radius: currentLocation.options?.radius || 25,
        radius_unit: unit,
        ignore_radius: currentLocation.options?.ignore_radius || false,
        flexible_regions: currentLocation.options?.flexible_regions || []
      }
    };
    
    updateSearchOptions({
      location: {
        ...searchState.location,
        location: searchState.location.location.map((loc: Location, index: number) => 
          index === locationIndex ? updatedLocation : loc
        )
      }
    });
  };
}

export function createLocationIgnoreRadiusHandler(
  currentLocation: Location,
  searchState: SearchState,
  updateSearchOptions: (updates: Partial<SearchState>) => void,
  locationIndex: number
) {
  return (ignore: boolean) => {
    const updatedLocation = {
      ...currentLocation,
      options: {
        ...currentLocation.options,
        radius: ignore ? 0 : (currentLocation.options?.radius || 25),
        radius_unit: currentLocation.options?.radius_unit || "Miles",
        ignore_radius: ignore,
        flexible_regions: currentLocation.options?.flexible_regions || []
      }
    };
    
    updateSearchOptions({
      location: {
        ...searchState.location,
        location: searchState.location.location.map((loc: Location, index: number) => 
          index === locationIndex ? updatedLocation : loc
        )
      }
    });
  };
}

export function createLocationWorkplaceTypeHandler(
  currentLocation: Location,
  searchState: SearchState,
  updateSearchOptions: (updates: Partial<SearchState>) => void,
  locationIndex: number
) {
  return (workplaceType: Workplace) => {
    let newWorkplaceType: Workplace[] | "All";
    
    const currentTypes = Array.isArray(currentLocation.workplace_type) ? currentLocation.workplace_type : 
      (currentLocation.workplace_type === "All" ? [] : (currentLocation.workplace_type ? [currentLocation.workplace_type as Workplace] : []));
    
    if (currentTypes.includes(workplaceType)) {
      const filtered = currentTypes.filter(type => type !== workplaceType);
      newWorkplaceType = filtered.length > 0 ? filtered : "All";
    } else {
      newWorkplaceType = [...currentTypes, workplaceType];
    }
    
    const updatedLocation = {
      ...currentLocation,
      workplace_type: newWorkplaceType
    };
    
    updateSearchOptions({
      location: {
        ...searchState.location,
        location: searchState.location.location.map((loc: Location, index: number) => 
          index === locationIndex ? updatedLocation : loc
        )
      }
    });
  };
}

export function createLocationFlexibleRegionsHandler(
  currentLocation: Location,
  searchState: SearchState,
  updateSearchOptions: (updates: Partial<SearchState>) => void,
  locationIndex: number
) {
  return (region: LocationType) => {
    const currentRegions = currentLocation.options?.flexible_regions || [];
    let newRegions: LocationType[];
    
    if (currentRegions.includes(region)) {
      newRegions = currentRegions.filter(r => r !== region);
    } else {
      newRegions = [...currentRegions, region];
    }

    const updatedLocation = {
      ...currentLocation,
      options: {
        ...currentLocation.options,
        radius: currentLocation.options?.radius || 25,
        radius_unit: currentLocation.options?.radius_unit || "Miles",
        ignore_radius: currentLocation.options?.ignore_radius || false,
        flexible_regions: newRegions
      }
    };
    
    updateSearchOptions({
      location: {
        ...searchState.location,
        location: searchState.location.location.map((loc: Location, index: number) => 
          index === locationIndex ? updatedLocation : loc
        )
      }
    });
  };
}

export function createLocationRemoveHandler(
  searchState: SearchState,
  updateSearchOptions: (updates: Partial<SearchState>) => void,
  locationIndex: number
) {
  return () => {
    const updatedLocations = searchState.location.location.filter((_, index) => index !== locationIndex);
    
    updateSearchOptions({
      location: {
        ...searchState.location,
        location: updatedLocations
      }
    });
  };
}

export function createLocationsChangeHandler(
  searchState: SearchState,
  updateSearchOptions: (updates: Partial<SearchState>) => void
) {
  return (locations: Location[]) => {
    updateSearchOptions({
      location: {
        ...searchState.location,
        location: locations
      }
    });
  };
}