import { AddressComponent, CommitmentLevel, CommitmentLevelOptions, Environment, ExperienceLevel, ExperienceLevelOptions, HiringCafeSearchState, Intensity, Location, Mobility, SearchState, SecurityClearanceOptions, Select, TravelRequirements, TravelRequirementsOptions, Workplace } from '../../types/search';

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
      return demands.map((d: Intensity | Mobility | Environment | Workplace) => String(d));
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
    excludeIfManagementYoeIsNotSpecified: searchState.experience.role === "All" ? false : Array.isArray(searchState.experience.role) && searchState.experience.role.includes("People Manager") ? false : false,
    excludeIfRoleYoeIsNotSpecified: searchState.experience.role === "All" ? false : Array.isArray(searchState.experience.role) && searchState.experience.role.includes("Individual Contributor") ? false : false,
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
    managementYoeRange: searchState.experience.role === "All" ? [0, 20] : 
      Array.isArray(searchState.experience.role) && searchState.experience.role.includes("People Manager") ? 
        searchState.experience.peopleManager ? [searchState.experience.peopleManager.min, searchState.experience.peopleManager.max] : [0, 20] : [0, 20],
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
    roleTypes: searchState.experience.role === "All" ? [] : 
      Array.isArray(searchState.experience.role) && searchState.experience.role.includes("Individual Contributor") ? 
        ["Individual Contributor", "People Manager"] : ["Individual Contributor"],
    roleYoeRange: searchState.experience.role === "All" ? [0, 20] : 
      Array.isArray(searchState.experience.role) && searchState.experience.role.includes("Individual Contributor") ? 
        searchState.experience.individualContributor ? [searchState.experience.individualContributor.min, searchState.experience.individualContributor.max] : [0, 20] : [0, 20],
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
