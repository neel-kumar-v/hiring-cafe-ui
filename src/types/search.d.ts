export interface SortOptions {
  by: "Relevance" | "Recency" | "Salary" | "Experience" | "Match Score";
  order: "Most" | "Least";
}
export type TimeUnits =
  | "Minutes"
  | "Hours"
  | "Days"
  | "Weeks"
  | "Months"
  | "Years";
export interface DateRangeOptions {
  magnitude: number;
  unit: TimeUnits;
}

export type ApplyForm = "All" | "Fast" | "Slow";

export type Exclusion = "Saved" | "Applied" | "Hidden" | "Viewed";

export type ExclusionOptions = Exclusion[];

export type Department = "Engineering" | "Software Development" | "Information Technology" | "Data and Analytics" | "Design" | "Creative and Art Services" | "Project and Program Management" | "Product Management" | "Business Operations" | "Legal and Compliance" | "Finance and Accounting" | "Human Resources" | "Administrative & Clerical Support" | "Sales" | "Marketing" | "Communications and Public Affairs" | "Business Development" | "Advanced Practice" | "Allied Health" | "Nursing" | "Pharmacy" | "Veterinary" | "Education" | "Customer Service" | "Social Services" | "Construction" | "Mechanical and Electrical" | "Manufacturing and Industrial" | "Maintenance and Repair" | "General Labor" | "Transportation Services" | "Supply Chain / Logistics / Procurement" | "Quality Assurance" | "Environment, Health, and Safety" | "Research and Development (R&D)" | "Food and Beverage Services" | "Protective Services" | "Custodial Services";

export type Select<T, V = "All"> = T[] | V;

export type DepartmentOptions = Select<Department>;

export type SalaryUnit = "Any"
  | "Hourly"
  | "Daily"
  | "Weekly"
  | "Bi-Weekly"
  | "Monthly"
  | "Yearly";

export interface Range {
  min: number;
  max: number;
}

export interface InfiniteRange {
  min: number;
  max: number | null;
}

export interface SalaryOptions {
  min_range: Range;
  max_range: Range;
  unit: SalaryUnit;
  listedUnit: SalaryUnit | "Any";
  currency: string;
  undisclosed: boolean;
}

export type CommitmentLevel = "Full Time" | "Part Time" | "Contract" | "Internship" | "Temporary" | "Volunteer" | "Seasonal";

export type CommitmentLevelOptions = Select<CommitmentLevel>;

export interface BooleanOperator<T> {
  AND?: (T | BooleanOperator<T>)[];
  OR?: (T | BooleanOperator<T>)[];
  NOT?: T | BooleanOperator<T>;
}

export type SearchExpression<T> = T | BooleanOperator<T>;

export interface JobInfoOptions {
  title: SearchExpression<string>;
  technical: SearchExpression<string>;
  description: SearchExpression<string>;
  requirements: SearchExpression<string>;
}

export type DegreePreferences = "Required" | "Preferred" | "Not Mentioned";

export interface Keywords {
  include: Select<string>;
  exclude: Select<string, "None">;
}

export interface DegreePreferencesOptions {
  associate: {
    preferences: Select<DegreePreferences, null>;
    keywords: Keywords;
  };
  bachelor: {
    preferences: Select<DegreePreferences, null>;
    keywords: Keywords;
  };
  master: {
    preferences: Select<DegreePreferences, null>;
    keywords: Keywords;
  };
  doctorate: {
    preferences: Select<DegreePreferences, null>;
    keywords: Keywords;
  };
}

export type ExperienceLevel = "None" | "Entry Level" | "Mid Level" | "Senior Level";
export type Role = "Individual Contributor" | "People Manager";


export interface ExperienceLevelOptions {
  level: Select<ExperienceLevel>;
  role: Select<Role>;
  individualContributor: Range | null;
  peopleManager: Range | null;
}

export interface LicenseCertificationOptions {
  hide_required: boolean;
  keywords: Keywords;
}

export type SecurityClearance = "None" | "Confidential" | "Secret" | "Top Secret" | "Top Secret/SCI" | "Public Trust" | "Interim Clearances" | "Other";

export type SecurityClearanceOptions = Select<SecurityClearance>;

export type ShiftPreferences = "Required" | "Optional" | "Not Indicated";
export type AvailabilityPreferences = "Required" | "Not Indicated" | "None";
export type OncallPreferences = "Regular" | "Occasional" | "None";

export interface ShiftPreferencesOptions {
  morning: Select<ShiftPreferences, null>;
  afternoon: Select<ShiftPreferences, null>;
  night: Select<ShiftPreferences, null>;
  weekend: AvailabilityPreferences;
  holiday: AvailabilityPreferences;
  overtime: AvailabilityPreferences;
  oncall: Select<OncallPreferences>;
}

export type TravelRequirements = "None" | "Minimum" | "Moderate" | "Extensive";
export interface TravelRequirementsOptions {
  air: Select<TravelRequirements>;
  land: Select<TravelRequirements>;
  [key: string]: Select<TravelRequirements>;
}

export type Benefits = "PTO" | "4 Days" | "401k" | "Parental Leave" | "Retirement" | "Tuition" | "Visa" | "Relocation";
export type BenefitsOptions = Select<Benefits, null>;

export type Encouraged = "Veteran" | "Fair Chance";
export type EncouragedOptions = Select<Encouraged, null>;

export type Profit = "For-Profit" | "Non-Profit";
export type USAJobs = "Only" | "No" | "All";
export interface IndustryOptions {
  profit: Select<Profit, "All">;
  activities: Keywords;
  industry: Keywords;
  usa_jobs: USAJobs;
}

export type CurrentStage = "Public" | "Private";
export interface FundingOptions {
  current: Select<CurrentStage, "All">;
  investors: Keywords;
  latest_round: Range;
  latest_round_type: Keywords;
  latest_round_amount: Range;
}

export type Workplace = "Remote" | "Hybrid" | "Onsite";
export type Environment = "Office"  | "Outdoor"  | "Vehicle"  | "Industrial"  | "Customer-Facing";

export type LocationType = "Locality" | "Admin Area" | "Country" | "Continent";
export interface AddressComponent {
  long_name: string;
  short_name: string;
  types: LocationType[];
}
export interface Address {
  formatted: string;
  components: AddressComponent[];
}

export interface GeographicalLocation {
  latitude: number;
  longitude: number;
}
export interface SearchedLocationOptions {
  radius: number;
  radius_unit: "Miles" | "Kilometers";
  ignore_radius: boolean;
  flexible_regions: LocationType[];
}
export type Intensity = "Low" | "Medium" | "High";
export type Mobility = "Sitting" | "Active";
export interface WorkplaceActivityOptions {
  environment: Select<Environment>;
  mobility: Select<Mobility>;
  physical_intensity: Select<Intensity>;
  cognitive_intensity: Select<Intensity>;
  computer_usage: Select<Intensity>;
  oral_communication: Select<Intensity>;
}
export interface Location {
  searched: boolean;
  id: string;
  types: LocationType[];
  address: Address;
  geographical: GeographicalLocation;
  workplace_type?: Select<Workplace>;
  options?: SearchedLocationOptions;
}

export interface LocationOptions {
  defaultUserLocation: boolean;
  userLocation: Location;
  location: Location[];
  workplace_type: Select<Workplace>;
  workplace_activity: WorkplaceActivityOptions;
}

export interface SearchState {
  sort: SortOptions;
  date_range: DateRangeOptions;
  apply_form: ApplyForm;
  exclusion: ExclusionOptions;
  benefits: BenefitsOptions;
  encouraged: EncouragedOptions;
  department: DepartmentOptions;
  salary: SalaryOptions;
  commitment: CommitmentLevelOptions;
  experience: ExperienceLevelOptions;
  job_titles: JobInfoOptions;
  education: DegreePreferencesOptions;
  license_certification: LicenseCertificationOptions;
  security_clearance: SecurityClearanceOptions;
  language: Keywords;
  shift_preferences: ShiftPreferencesOptions;
  travel_requirements: TravelRequirementsOptions;
  location: LocationOptions;
  company: Keywords;
  industry: IndustryOptions;
  stage_funding: FundingOptions;
  size: Select<InfiniteRange>;
  founding_year: Range;
}

export interface SettingsCategory {
  id: CategoryId;
  name: string;
  type:
    | "general"
    | "compensation"
    | "role-department"
    | "qualifications"
    | "availability"
    | "miscellaneous"
    | "company"
    | "location";
}

export interface HiringCafeSearchState {
  airTravelRequirement: string[];
  applicationFormEase: string[];
  associatesDegreeFieldsOfStudy: string[];
  associatesDegreeRequirements: string[];
  bachelorsDegreeFieldsOfStudy: string[];
  bachelorsDegreeRequirements: string[];
  benefitsAndPerks: string[];
  calcFrequency: string;
  cognitiveDemandLevels: string[];
  commitmentTypes: string[];
  companyKeywords: string[];
  companyKeywordsBooleanOperator: string;
  companyNames: string[];
  companyPublicOrPrivate: string;
  companySizeRanges: string[];
  computerUsageLevels: string[];
  currency: {
    label: string;
    value: string | null;
  };
  dateFetchedPastNDays: number;
  defaultToUserLocation: boolean;
  departments: string[];
  doctorateDegreeFieldsOfStudy: string[];
  doctorateDegreeRequirements: string[];
  encouragedToApply: string[];
  eveningShiftWork: string[];
  excludeAllLicensesAndCertifications: boolean;
  excludedAssociatesDegreeFieldsOfStudy: string[];
  excludedBachelorsDegreeFieldsOfStudy: string[];
  excludedCompanyKeywords: string[];
  excludedCompanyNames: string[];
  excludedDoctorateDegreeFieldsOfStudy: string[];
  excludedIndustries: string[];
  excludedInvestors: string[];
  excludedLanguageRequirements: string[];
  excludedLatestInvestmentSeries: string[];
  excludedLicensesAndCertifications: string[];
  excludedMastersDegreeFieldsOfStudy: string[];
  excludeIfManagementYoeIsNotSpecified: boolean;
  excludeIfRoleYoeIsNotSpecified: boolean;
  excludeJobsWithAdditionalLanguageRequirements: boolean;
  frequency: {
    label: string;
    value: string | null;
  };
  hiddenCompanies: string[];
  hideJobTypes: string[];
  holidayAvailabilityRequired: string;
  industries: string[];
  investors: string[];
  isNonProfit: string;
  jobDescriptionQuery: string;
  jobTitleQuery: string;
  landTravelRequirement: string[];
  languageRequirements: string[];
  languageRequirementsOperator: string;
  latestInvestmentAmount: number | null;
  latestInvestmentCurrency: string[];
  latestInvestmentSeries: string[];
  latestInvestmentYearRange: [number | null, number | null];
  licensesAndCertifications: string[];
  locations: Array<{
    address_components: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
    formatted_address: string;
    geometry: {
      location: {
        lat: string | number;
        lon: string | number;
      };
    };
    id: string;
    options?: {
      flexible_regions: string[];
      ignore_radius?: boolean;
      radius?: number;
      radius_unit?: string;
    };
    population?: number;
    types: string[];
    workplace_types?: string[];
  }>;
  managementYoeRange: [number, number];
  mastersDegreeFieldsOfStudy: string[];
  mastersDegreeRequirements: string[];
  maxCompensationHighEnd: number | null;
  maxCompensationLowEnd: number | null;
  maxYearFounded: number | null;
  minCompensationHighEnd: number | null;
  minCompensationLowEnd: number | null;
  minYearFounded: number | null;
  morningShiftWork: string[];
  onCallRequirements: string[];
  oralCommunicationLevels: string[];
  overnightShiftWork: string[];
  overtimeRequired: string;
  physicalEnvironments: string[];
  physicalLaborIntensity: string[];
  physicalPositions: string[];
  requirementsKeywordsQuery: string;
  restrictedSearchAttributes: string[];
  restrictJobsToTransparentSalaries: boolean;
  roleTypes: string[];
  roleYoeRange: [number, number];
  searchModeSelectedCompany: string | null;
  searchQuery: string;
  securityClearances: string[];
  seniorityLevel: string[];
  sortBy: string;
  technologyKeywordsQuery: string;
  usaGovPref: string | null;
  user: string | null;
  userId: string;
  userLocation: string | null;
  weekendAvailabilityRequired: string;
  workplaceTypes: string[];
}

export type CategoryType = "general" | "compensation" | "role-department" | "qualifications" | "availability" | "location" | "company";

export type CategoryId = | "filters" | "saved" | "date-range" | "sorting" | "apply-form" | "exclusion" | "encouraged" | "salary" | "commitment" | "experience" | "benefits" | "departments" | "job-titles" | "education" | "licenses" | "security" | "languages" | "shifts" | "travel" | "location" | "workplace-activity" | "options" | "company" | "industry" | "stage" | "size" | "founding" ;

// Type definitions for search state based on CurrentSearchFiltersContext

// Location Types
export type WorkplaceType = "Remote" | "Hybrid" | "Onsite";

export type LocationType = "locality" | "administrative_area_level_1" | "country" | "continent" | "political";

export interface AddressComponent {
  long_name: string;
  short_name: string;
  types: LocationType[];
}

export interface LocationGeometry {
  location: {
    lat: number | string;
    lon?: number | string;
    lng?: number | string;
  };
}

export interface LocationOptions {
  radius?: number;
  radius_unit?: "miles" | "kilometers" | "Miles" | "Kilometers";
  ignore_radius?: boolean;
  flexible_regions?: LocationType[];
}

export interface SearchLocation {
  id: string;
  formatted_address: string;
  address_components?: AddressComponent[];
  geometry?: LocationGeometry;
  types?: LocationType[];
  workplace_types?: WorkplaceType[];
  options?: LocationOptions;
  population?: number;
}

// Compensation Types
export interface CurrencyOption {
  label: string;
  value: string | null;
}

export interface FrequencyOption {
  label: string;
  value: string | null;
}

export type CalcFrequency = "Hourly" | "Daily" | "Weekly" | "Bi-Weekly" | "Monthly" | "Yearly";

// Commitment Types
export type CommitmentType = "Full Time" | "Part Time" | "Contract" | "Internship" | "Temporary" | "Seasonal" | "Volunteer";

// Workplace Activity Types
export type WorkplacePhysicalEnvironment = "Office" | "Outdoor" | "Vehicle" | "Industrial" | "Customer-Facing";

export type PhysicalLaborIntensity = "Low" | "Medium" | "High";

export type PhysicalPosition = "Sitting" | "Standing";

export type OralCommunicationLevel = "Low" | "Medium" | "High";

export type ComputerUsageLevel = "Low" | "Medium" | "High";

export type CognitiveDemandLevel = "Low" | "Medium" | "High";

// Experience Types
export type SeniorityLevel = "No Prior Experience Required" | "Entry Level" | "Mid Level" | "Senior Level";

export type RoleType = "Individual Contributor" | "People Manager";

// Security Clearance Types
export type SecurityClearance = "None" | "Confidential" | "Secret" | "Top Secret" | "Top Secret/SCI" | "Public Trust" | "Interim Clearances" | "Other";

// Travel Requirement Types
export type TravelRequirement = "None" | "Minimal" | "Moderate" | "Extensive";

// Oncall Requirement Types
export type OncallRequirement = "None" | "Occasional (once a month or less)" | "Regular (once a week or more)";

// Shift Work Types
export type ShiftWorkRequirement = "Required" | "Optional" | "Not Indicated";

export type AvailabilityRequirement = "Required" | "Not Indicated" | "Doesn't Matter" | "None";

// Education Requirement Types
export type EducationRequirement = "Required" | "Preferred" | "Not Mentioned";

// Application Form Ease Types
export type ApplicationFormEase = "Simple" | "Time Consuming";

// Hide Job Types
export type HideJobType = "Hidden" | "Saved" | "Applied" | "Viewed";

// Encouraged to Apply Types
export type EncouragedToApply = "Military Veterans" | "Fair Chance";

// Company Types
export type CompanyPublicOrPrivate = "all" | "public" | "private";

export type IsNonProfit = "all" | "for-profit" | "non-profit";

export type USAGovPref = "Only" | "No" | "All" | null;

// Sort Options
export type SortBy = "default" | "date" | "date_asc" | "compensation_desc" | "compensation_asc" | "experience_asc" | "experience_desc";

export interface SortOption {
  label: string;
  value: SortBy;
}

// Main Search State Interface
export interface CurrentSearchFiltersState {
  // Locations
  locations: SearchLocation[];
  workplaceTypes: WorkplaceType[];
  defaultToUserLocation: boolean;
  userLocation: SearchLocation | null;
  physicalEnvironments: WorkplacePhysicalEnvironment[];
  physicalLaborIntensity: PhysicalLaborIntensity[];
  physicalPositions: PhysicalPosition[];
  oralCommunicationLevels: OralCommunicationLevel[];
  computerUsageLevels: ComputerUsageLevel[];
  cognitiveDemandLevels: CognitiveDemandLevel[];

  // Compensation
  currency: CurrencyOption;
  frequency: FrequencyOption;
  minCompensationLowEnd: number | null;
  minCompensationHighEnd: number | null;
  maxCompensationLowEnd: number | null;
  maxCompensationHighEnd: number | null;
  restrictJobsToTransparentSalaries: boolean;
  calcFrequency: CalcFrequency;

  // Commitment
  commitmentTypes: CommitmentType[];

  // Keywords
  jobTitleQuery: string;
  jobDescriptionQuery: string;
  technologyKeywordsQuery: string;
  requirementsKeywordsQuery: string;

  // Education
  associatesDegreeFieldsOfStudy: string[];
  excludedAssociatesDegreeFieldsOfStudy: string[];
  bachelorsDegreeFieldsOfStudy: string[];
  excludedBachelorsDegreeFieldsOfStudy: string[];
  mastersDegreeFieldsOfStudy: string[];
  excludedMastersDegreeFieldsOfStudy: string[];
  doctorateDegreeFieldsOfStudy: string[];
  excludedDoctorateDegreeFieldsOfStudy: string[];
  associatesDegreeRequirements: EducationRequirement[];
  bachelorsDegreeRequirements: EducationRequirement[];
  mastersDegreeRequirements: EducationRequirement[];
  doctorateDegreeRequirements: EducationRequirement[];

  // Licenses and Certifications
  licensesAndCertifications: string[];
  excludedLicensesAndCertifications: string[];
  excludeAllLicensesAndCertifications: boolean;

  // Experience
  seniorityLevel: SeniorityLevel[];
  roleTypes: RoleType[];
  roleYoeRange: [number, number];
  excludeIfRoleYoeIsNotSpecified: boolean;
  managementYoeRange: [number, number];
  excludeIfManagementYoeIsNotSpecified: boolean;

  // Security Clearance
  securityClearances: SecurityClearance[];

  // Language Requirements
  languageRequirements: string[];
  excludedLanguageRequirements: string[];
  languageRequirementsOperator: "OR" | "AND";
  excludeJobsWithAdditionalLanguageRequirements: boolean;

  // Travel Requirements
  airTravelRequirement: TravelRequirement[];
  landTravelRequirement: TravelRequirement[];

  // Shifts & Schedules
  morningShiftWork: ShiftWorkRequirement[];
  eveningShiftWork: ShiftWorkRequirement[];
  overnightShiftWork: ShiftWorkRequirement[];
  weekendAvailabilityRequired: AvailabilityRequirement;
  holidayAvailabilityRequired: AvailabilityRequirement;
  overtimeRequired: AvailabilityRequirement;
  onCallRequirements: OncallRequirement[];

  // Benefits & Perks
  benefitsAndPerks: string[];

  // Easy Application
  applicationFormEase: ApplicationFormEase[];

  // Company Filters
  companyNames: string[];
  excludedCompanyNames: string[];
  usaGovPref: USAGovPref;
  industries: string[];
  excludedIndustries: string[];
  companyKeywords: string[];
  companyKeywordsBooleanOperator: "OR" | "AND";
  excludedCompanyKeywords: string[];

  // Exclude Marked Jobs
  hideJobTypes: HideJobType[];

  // Encouraged to apply
  encouragedToApply: EncouragedToApply[];

  // General Search
  searchQuery: string;
  dateFetchedPastNDays: number;
  hiddenCompanies: string[];
  user: any | null;
  searchModeSelectedCompany: string | null;

  // Departments
  departments: string[];

  // Search Configuration
  restrictedSearchAttributes: string[];
  sortBy: SortBy;

  // Company Filters (Additional)
  companyPublicOrPrivate: CompanyPublicOrPrivate;

  // Latest Investment
  latestInvestmentYearRange: [number | null, number | null];
  latestInvestmentSeries: string[];
  latestInvestmentAmount: number | null;
  latestInvestmentCurrency: string[];
  investors: string[];
  excludedInvestors: string[];
  isNonProfit: IsNonProfit;

  // Company Size
  companySizeRanges: string[];

  // Founding Year
  minYearFounded: number | null;
  maxYearFounded: number | null;

  // Excluded Investment Series
  excludedLatestInvestmentSeries: string[];
}

// Legacy types (keeping for backward compatibility)
export interface SortOptions {
  by: "Relevance" | "Recency" | "Salary" | "Experience" | "Match Score";
  order: "Most" | "Least";
}

export type TimeUnits = "Minutes" | "Hours" | "Days" | "Weeks" | "Months" | "Years";

export interface DateRangeOptions {
  magnitude: number;
  unit: TimeUnits;
}

export type ApplyForm = "All" | "Fast" | "Slow";

export type Exclusion = "Saved" | "Applied" | "Hidden" | "Viewed";

export type ExclusionOptions = Exclusion[];

export type Department =
  | "Engineering"
  | "Software Development"
  | "Information Technology"
  | "Data and Analytics"
  | "Design"
  | "Creative and Art Services"
  | "Project and Program Management"
  | "Product Management"
  | "Business Operations"
  | "Legal and Compliance"
  | "Finance and Accounting"
  | "Human Resources"
  | "Administrative & Clerical Support"
  | "Sales"
  | "Marketing"
  | "Communications and Public Affairs"
  | "Business Development"
  | "Advanced Practice"
  | "Allied Health"
  | "Nursing"
  | "Pharmacy"
  | "Veterinary"
  | "Education"
  | "Customer Service"
  | "Social Services"
  | "Construction"
  | "Mechanical and Electrical"
  | "Manufacturing and Industrial"
  | "Maintenance and Repair"
  | "General Labor"
  | "Transportation Services"
  | "Supply Chain / Logistics / Procurement"
  | "Quality Assurance"
  | "Environment, Health, and Safety"
  | "Research and Development (R&D)"
  | "Food and Beverage Services"
  | "Protective Services"
  | "Custodial Services";

export type Select<T, V = "All"> = T[] | V;

export type DepartmentOptions = Select<Department>;

export type SalaryUnit = "Any" | "Hourly" | "Daily" | "Weekly" | "Bi-Weekly" | "Monthly" | "Yearly";

export interface Range {
  min: number;
  max: number;
}

export interface InfiniteRange {
  min: number;
  max: number | null;
}

export interface SalaryOptions {
  min_range: Range;
  max_range: Range;
  unit: SalaryUnit;
  listedUnit: SalaryUnit | "Any";
  currency: string;
  undisclosed: boolean;
}

export type CommitmentLevel = "Full Time" | "Part Time" | "Contract" | "Internship" | "Temporary" | "Volunteer" | "Seasonal";

export type CommitmentLevelOptions = Select<CommitmentLevel>;

export interface BooleanOperator<T> {
  AND?: (T | BooleanOperator<T>)[];
  OR?: (T | BooleanOperator<T>)[];
  NOT?: T | BooleanOperator<T>;
}

export type SearchExpression<T> = T | BooleanOperator<T>;

export interface JobInfoOptions {
  title: SearchExpression<string>;
  technical: SearchExpression<string>;
  description: SearchExpression<string>;
  requirements: SearchExpression<string>;
}

export type DegreePreferences = "Required" | "Preferred" | "Not Mentioned";

export interface Keywords {
  include: Select<string>;
  exclude: Select<string, "None">;
}

export interface DegreePreferencesOptions {
  associate: {
    preferences: Select<DegreePreferences, null>;
    keywords: Keywords;
  };
  bachelor: {
    preferences: Select<DegreePreferences, null>;
    keywords: Keywords;
  };
  master: {
    preferences: Select<DegreePreferences, null>;
    keywords: Keywords;
  };
  doctorate: {
    preferences: Select<DegreePreferences, null>;
    keywords: Keywords;
  };
}

export type ExperienceLevel = "None" | "Entry Level" | "Mid Level" | "Senior Level";
export type Role = "Individual Contributor" | "People Manager";

export interface ExperienceLevelOptions {
  level: Select<ExperienceLevel>;
  role: Select<Role>;
  individualContributor: Range | null;
  peopleManager: Range | null;
}

export interface LicenseCertificationOptions {
  hide_required: boolean;
  keywords: Keywords;
}

export type SecurityClearanceOptions = Select<SecurityClearance>;

export type ShiftPreferences = "Required" | "Optional" | "Not Indicated";
export type AvailabilityPreferences = "Required" | "Not Indicated" | "None";
export type OncallPreferences = "Regular" | "Occasional" | "None";

export interface ShiftPreferencesOptions {
  morning: Select<ShiftPreferences, null>;
  afternoon: Select<ShiftPreferences, null>;
  night: Select<ShiftPreferences, null>;
  weekend: AvailabilityPreferences;
  holiday: AvailabilityPreferences;
  overtime: AvailabilityPreferences;
  oncall: Select<OncallPreferences>;
}

export interface TravelRequirementsOptions {
  air: Select<TravelRequirement>;
  land: Select<TravelRequirement>;
  [key: string]: Select<TravelRequirement>;
}

export type Benefits = "PTO" | "4 Days" | "401k" | "Parental Leave" | "Retirement" | "Tuition" | "Visa" | "Relocation";

export type BenefitsOptions = Select<Benefits, null>;

export type Encouraged = "Veteran" | "Fair Chance";
export type EncouragedOptions = Select<Encouraged, null>;

export type Profit = "For-Profit" | "Non-Profit";
export type USAJobs = "Only" | "No" | "All";

export interface IndustryOptions {
  profit: Select<Profit, "All">;
  activities: Keywords;
  industry: Keywords;
  usa_jobs: USAJobs;
}

export type CurrentStage = "Public" | "Private";

export interface FundingOptions {
  current: Select<CurrentStage, "All">;
  investors: Keywords;
  latest_round: Range;
  latest_round_type: Keywords;
  latest_round_amount: Range;
}

export type Workplace = "Remote" | "Hybrid" | "Onsite";
export type Environment = "Office" | "Outdoor" | "Vehicle" | "Industrial" | "Customer-Facing";

export interface Address {
  formatted: string;
  components: AddressComponent[];
}

export interface GeographicalLocation {
  latitude: number;
  longitude: number;
}

export interface SearchedLocationOptions {
  radius: number;
  radius_unit: "Miles" | "Kilometers";
  ignore_radius: boolean;
  flexible_regions: LocationType[];
}

export type Intensity = "Low" | "Medium" | "High";
export type Mobility = "Sitting" | "Active";

export interface WorkplaceActivityOptions {
  environment: Select<Environment>;
  mobility: Select<Mobility>;
  physical_intensity: Select<Intensity>;
  cognitive_intensity: Select<Intensity>;
  computer_usage: Select<Intensity>;
  oral_communication: Select<Intensity>;
}

export interface Location {
  searched: boolean;
  id: string;
  types: LocationType[];
  address: Address;
  geographical: GeographicalLocation;
  workplace_type?: Select<Workplace>;
  options?: SearchedLocationOptions;
}

export interface LocationOptions_Legacy {
  defaultUserLocation: boolean;
  userLocation: Location;
  location: Location[];
  workplace_type: Select<Workplace>;
  workplace_activity: WorkplaceActivityOptions;
}

export interface SearchState {
  sort: SortOptions;
  date_range: DateRangeOptions;
  apply_form: ApplyForm;
  exclusion: ExclusionOptions;
  benefits: BenefitsOptions;
  encouraged: EncouragedOptions;
  department: DepartmentOptions;
  salary: SalaryOptions;
  commitment: CommitmentLevelOptions;
  experience: ExperienceLevelOptions;
  job_titles: JobInfoOptions;
  education: DegreePreferencesOptions;
  license_certification: LicenseCertificationOptions;
  security_clearance: SecurityClearanceOptions;
  language: Keywords;
  shift_preferences: ShiftPreferencesOptions;
  travel_requirements: TravelRequirementsOptions;
  location: LocationOptions_Legacy;
  company: Keywords;
  industry: IndustryOptions;
  stage_funding: FundingOptions;
  size: Select<InfiniteRange>;
  founding_year: Range;
}

export interface SettingsCategory {
  id: CategoryId;
  name: string;
  type: "general" | "compensation" | "role-department" | "qualifications" | "availability" | "miscellaneous" | "company" | "location";
}

export type CategoryType = "general" | "compensation" | "role-department" | "qualifications" | "availability" | "location" | "company";

export type CategoryId =
  | "filters"
  | "saved"
  | "date-range"
  | "sorting"
  | "apply-form"
  | "exclusion"
  | "encouraged"
  | "salary"
  | "commitment"
  | "experience"
  | "benefits"
  | "departments"
  | "job-titles"
  | "education"
  | "licenses"
  | "security"
  | "languages"
  | "shifts"
  | "travel"
  | "location"
  | "workplace-activity"
  | "options"
  | "company"
  | "industry"
  | "stage"
  | "size"
  | "founding";