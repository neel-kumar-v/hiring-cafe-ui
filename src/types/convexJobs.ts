export type ConvexId = string;

export interface CompanyDTO {
  _id: ConvexId;
  companyId: string; // routing slug
  canonicalDomain?: string;
  name: string;
  homepageUri?: string;
  imageUrl?: string;
  tagline?: string;
  description?: string;
  yearFounded?: number;
  numEmployees?: number;
  hqCountry?: string;
  industries: string[];
  activities: string[];
  jobIdsPreview: ConvexId[];
}

export interface JobDTO {
  _id: ConvexId;
  externalId: string;
  title: string;
  applyUrl?: string;
  companyId: ConvexId; // companies doc id
  detailsId: ConvexId;

  workplaceType?: string;
  commitment: string[];

  workplaceCities: string[];
  workplaceStates: string[];
  workplaceCountries: string[];
  workplaceContinents: string[];

  geoloc: { lat: number; lon: number }[];

  minIcYoe?: number;
  minMgmtYoe?: number;

  requirementsSummary?: string;
  skills: string[];

  estimatedPublishDate?: string;
  estimatedPublishDateMillis?: number;

  views: number;
  saves: number;
  applies: number;

  listedCompensationCurrency?: string;
  listedCompensationFrequency?: string;
  isCompensationTransparent?: boolean;
  hourlyMinComp?: number;
  hourlyMaxComp?: number;
  dailyMinComp?: number;
  dailyMaxComp?: number;
  weeklyMinComp?: number;
  weeklyMaxComp?: number;
  biWeeklyMinComp?: number;
  biWeeklyMaxComp?: number;
  monthlyMinComp?: number;
  monthlyMaxComp?: number;
  yearlyMinComp?: number;
  yearlyMaxComp?: number;
}

export interface JobDetailsDTO {
  _id: ConvexId;
  jobId?: ConvexId;
  description: string;
  roleActivities: string[];
}

export interface JobCardResultDTO {
  job: JobDTO;
  company: CompanyDTO | null;
}

export interface JobDetailsResultDTO {
  job: JobDTO;
  details: JobDetailsDTO | null;
  company: CompanyDTO | null;
}

