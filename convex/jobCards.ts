import type { Doc } from "./_generated/dataModel";

export const JOBCARDS_BACKFILL_TOTAL_COUNTER = "jobCards_backfill_total";
export const JOBCARDS_BACKFILL_DONE_COUNTER = "jobCards_backfill_done";
export const JOBCARDS_BACKFILL_UPDATED_AT_COUNTER = "jobCards_backfill_updatedAt";

function toNumberOrZero(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export function toSortPublishMillis(job: Pick<Doc<"jobs">, "estimatedPublishDateMillis" | "updatedAt" | "_creationTime">): number {
  if (typeof job.estimatedPublishDateMillis === "number") return job.estimatedPublishDateMillis;
  if (typeof job.updatedAt === "number") return job.updatedAt;
  return job._creationTime;
}

export type JobCardUpsertFields = Omit<Doc<"jobCards">, "_id" | "_creationTime" | "createdAt" | "updatedAt">;

export function buildJobCardFields(job: Doc<"jobs">, company: Doc<"companies">): JobCardUpsertFields {
  return {
    externalId: job.externalId,
    jobId: job._id,
    detailsId: job.detailsId,

    title: job.title,
    applyUrl: job.applyUrl,
    companyId: job.companyId,
    companySlug: company.companyId,
    searchText: job.searchText,

    workplaceType: job.workplaceType,
    commitment: job.commitment ?? [],
    workplaceCities: job.workplaceCities ?? [],
    workplaceStates: job.workplaceStates ?? [],
    workplaceCountries: job.workplaceCountries ?? [],
    workplaceContinents: job.workplaceContinents ?? [],
    geoloc: job.geoloc ?? [],

    minIcYoe: job.minIcYoe,
    minMgmtYoe: job.minMgmtYoe,
    requirementsSummary: job.requirementsSummary,
    skills: job.skills ?? [],
    estimatedPublishDate: job.estimatedPublishDate,
    estimatedPublishDateMillis: job.estimatedPublishDateMillis,
    sortPublishMillis: toSortPublishMillis(job),
    companySortPublishMillis: Math.max(toSortPublishMillis(job), company.lastJobSortPublishMillis ?? 0),

    views: toNumberOrZero(job.views),
    saves: toNumberOrZero(job.saves),
    applies: toNumberOrZero(job.applies),

    department: job.department,
    listedCompensationCurrency: job.listedCompensationCurrency,
    listedCompensationFrequency: job.listedCompensationFrequency,
    isCompensationTransparent: job.isCompensationTransparent,
    hourlyMinComp: job.hourlyMinComp,
    hourlyMaxComp: job.hourlyMaxComp,
    dailyMinComp: job.dailyMinComp,
    dailyMaxComp: job.dailyMaxComp,
    weeklyMinComp: job.weeklyMinComp,
    weeklyMaxComp: job.weeklyMaxComp,
    biWeeklyMinComp: job.biWeeklyMinComp,
    biWeeklyMaxComp: job.biWeeklyMaxComp,
    monthlyMinComp: job.monthlyMinComp,
    monthlyMaxComp: job.monthlyMaxComp,
    yearlyMinComp: job.yearlyMinComp,
    yearlyMaxComp: job.yearlyMaxComp,

    companyProfit: job.companyProfit,
    companyStage: job.companyStage,
    companyFoundedYear: job.companyFoundedYear ?? company.yearFounded,
    companyNumEmployees: job.companyNumEmployees ?? company.numEmployees,

    companyName: company.name,
    companyImageUrl: company.imageUrl,
    companyTagline: company.tagline,
    companyHomepageUri: company.homepageUri,
    companyIndustries: (job.companyIndustries?.length ? job.companyIndustries : company.industries) ?? [],
    companyActivities: (job.companyActivities?.length ? job.companyActivities : company.activities) ?? [],
    companyHqCountry: company.hqCountry,
  };
}
