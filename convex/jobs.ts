import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { addCompanyJobPreview, updateCompanyLastJobMillis, upsertCompanyFromIngest } from "./companies";
import { buildJobCardFields, toSortPublishMillis } from "./jobCards";

const JOBS_COUNTER_NAME = "jobs";

async function getJobsCounter(ctx: any) {
  return await ctx.db
    .query("counters")
    .withIndex("by_name", (q: any) => q.eq("name", JOBS_COUNTER_NAME))
    .unique();
}

export async function incrementJobsCounter(ctx: any, delta: number) {
  if (delta === 0) return;
  const now = Date.now();
  const row = await getJobsCounter(ctx);
  if (!row) {
    await ctx.db.insert("counters", { name: JOBS_COUNTER_NAME, value: Math.max(0, delta), updatedAt: now });
  } else {
    await ctx.db.patch(row._id, { value: Math.max(0, row.value + delta), updatedAt: now });
  }
}

export const ingestBatch = mutation({
  args: {
    items: v.array(
      v.object({
        externalId: v.string(),
        applyUrl: v.optional(v.string()),
        title: v.string(),
        description: v.string(),
        roleActivities: v.array(v.string()),
        searchText: v.string(),

        // Company identity + metadata (already normalized/slugged by scraper).
        company: v.object({
          companyId: v.string(),
          canonicalDomain: v.optional(v.string()),
          name: v.string(),
          homepageUri: v.optional(v.string()),
          imageUrl: v.optional(v.string()),
          tagline: v.optional(v.string()),
          description: v.optional(v.string()),
          yearFounded: v.optional(v.number()),
          numEmployees: v.optional(v.number()),
          hqCountry: v.optional(v.string()),
          industries: v.array(v.string()),
          activities: v.array(v.string()),
        }),

        // Card fields
        workplaceType: v.optional(v.string()),
        commitment: v.array(v.string()),
        workplaceCities: v.array(v.string()),
        workplaceStates: v.array(v.string()),
        workplaceCountries: v.array(v.string()),
        workplaceContinents: v.array(v.string()),
        geoloc: v.array(v.object({ lat: v.number(), lon: v.number() })),

        minIcYoe: v.optional(v.number()),
        minMgmtYoe: v.optional(v.number()),
        requirementsSummary: v.optional(v.string()),
        skills: v.array(v.string()),
        estimatedPublishDate: v.optional(v.string()),
        estimatedPublishDateMillis: v.optional(v.number()),

        // Stats (counts)
        views: v.optional(v.number()),
        saves: v.optional(v.number()),
        applies: v.optional(v.number()),

        // Advanced search fields
        department: v.optional(v.string()),
        listedCompensationCurrency: v.optional(v.string()),
        listedCompensationFrequency: v.optional(v.string()),
        isCompensationTransparent: v.optional(v.boolean()),
        hourlyMinComp: v.optional(v.number()),
        hourlyMaxComp: v.optional(v.number()),
        dailyMinComp: v.optional(v.number()),
        dailyMaxComp: v.optional(v.number()),
        weeklyMinComp: v.optional(v.number()),
        weeklyMaxComp: v.optional(v.number()),
        biWeeklyMinComp: v.optional(v.number()),
        biWeeklyMaxComp: v.optional(v.number()),
        monthlyMinComp: v.optional(v.number()),
        monthlyMaxComp: v.optional(v.number()),
        yearlyMinComp: v.optional(v.number()),
        yearlyMaxComp: v.optional(v.number()),

        workplaceEnvironment: v.optional(v.string()),
        workplaceMobility: v.optional(v.string()),
        physicalLaborIntensity: v.optional(v.string()),
        cognitiveDemand: v.optional(v.string()),
        computerUsage: v.optional(v.string()),
        oralCommunicationLevel: v.optional(v.string()),

        associatesDegreeRequirement: v.optional(v.string()),
        associatesDegreeFieldsOfStudy: v.array(v.string()),
        bachelorsDegreeRequirement: v.optional(v.string()),
        bachelorsDegreeFieldsOfStudy: v.array(v.string()),
        mastersDegreeRequirement: v.optional(v.string()),
        mastersDegreeFieldsOfStudy: v.array(v.string()),
        doctorateDegreeRequirement: v.optional(v.string()),
        doctorateDegreeFieldsOfStudy: v.array(v.string()),

        licensesOrCertifications: v.array(v.string()),
        licensesOrCertificationsNotMentioned: v.optional(v.boolean()),
        securityClearance: v.optional(v.string()),
        languageRequirements: v.array(v.string()),

        morningShiftWork: v.optional(v.string()),
        eveningShiftWork: v.optional(v.string()),
        overnightWork: v.optional(v.string()),
        weekendAvailabilityRequired: v.optional(v.boolean()),
        holidayAvailabilityRequired: v.optional(v.boolean()),
        overtimeRequired: v.optional(v.boolean()),
        onCallRequirement: v.optional(v.string()),
        airTravelRequirement: v.optional(v.string()),
        landTravelRequirement: v.optional(v.string()),

        generousPaidTimeOff: v.optional(v.boolean()),
        fourDayWorkWeek: v.optional(v.boolean()),
        matching401k: v.optional(v.boolean()),
        generousParentalLeave: v.optional(v.boolean()),
        retirementPlan: v.optional(v.boolean()),
        tuitionReimbursement: v.optional(v.boolean()),
        visaSponsorship: v.optional(v.boolean()),
        relocationAssistance: v.optional(v.boolean()),
        militaryVeterans: v.optional(v.boolean()),
        fairChance: v.optional(v.boolean()),

        companyProfit: v.optional(v.string()),
        companyStage: v.optional(v.string()),
        companyFoundedYear: v.optional(v.number()),
        companyNumEmployees: v.optional(v.number()),
        companyIndustries: v.array(v.string()),
        companyActivities: v.array(v.string()),
      })
    ),
  },
  handler: async (ctx, { items }) => {
    const now = Date.now();
    let insertedJobs = 0;
    let insertedCompanies = 0;

    for (const item of items) {
      const { companyDocId, inserted } = await upsertCompanyFromIngest(ctx, item.company);
      if (inserted) insertedCompanies += 1;

      const existing = await ctx.db
        .query("jobs")
        .withIndex("by_externalId", (q) => q.eq("externalId", item.externalId))
        .unique();

      let detailsId: Id<"jobDetails">;
      if (existing) {
        detailsId = existing.detailsId;
        await ctx.db.patch(detailsId, {
          description: item.description,
          roleActivities: item.roleActivities,
          updatedAt: now,
        });
      } else {
        detailsId = await ctx.db.insert("jobDetails", {
          jobId: undefined,
          description: item.description,
          roleActivities: item.roleActivities,
          createdAt: now,
          updatedAt: now,
        });
      }

      const patch = {
        externalId: item.externalId,
        title: item.title,
        applyUrl: item.applyUrl,
        companyId: companyDocId,
        detailsId,

        workplaceType: item.workplaceType,
        commitment: item.commitment,
        workplaceCities: item.workplaceCities,
        workplaceStates: item.workplaceStates,
        workplaceCountries: item.workplaceCountries,
        workplaceContinents: item.workplaceContinents,
        geoloc: item.geoloc,

        minIcYoe: item.minIcYoe,
        minMgmtYoe: item.minMgmtYoe,
        requirementsSummary: item.requirementsSummary,
        skills: item.skills,
        estimatedPublishDate: item.estimatedPublishDate,
        estimatedPublishDateMillis: item.estimatedPublishDateMillis,

        views: item.views ?? 0,
        saves: item.saves ?? 0,
        applies: item.applies ?? 0,

        department: item.department,

        listedCompensationCurrency: item.listedCompensationCurrency,
        listedCompensationFrequency: item.listedCompensationFrequency,
        isCompensationTransparent: item.isCompensationTransparent,
        hourlyMinComp: item.hourlyMinComp,
        hourlyMaxComp: item.hourlyMaxComp,
        dailyMinComp: item.dailyMinComp,
        dailyMaxComp: item.dailyMaxComp,
        weeklyMinComp: item.weeklyMinComp,
        weeklyMaxComp: item.weeklyMaxComp,
        biWeeklyMinComp: item.biWeeklyMinComp,
        biWeeklyMaxComp: item.biWeeklyMaxComp,
        monthlyMinComp: item.monthlyMinComp,
        monthlyMaxComp: item.monthlyMaxComp,
        yearlyMinComp: item.yearlyMinComp,
        yearlyMaxComp: item.yearlyMaxComp,

        workplaceEnvironment: item.workplaceEnvironment,
        workplaceMobility: item.workplaceMobility,
        physicalLaborIntensity: item.physicalLaborIntensity,
        cognitiveDemand: item.cognitiveDemand,
        computerUsage: item.computerUsage,
        oralCommunicationLevel: item.oralCommunicationLevel,

        associatesDegreeRequirement: item.associatesDegreeRequirement,
        associatesDegreeFieldsOfStudy: item.associatesDegreeFieldsOfStudy,
        bachelorsDegreeRequirement: item.bachelorsDegreeRequirement,
        bachelorsDegreeFieldsOfStudy: item.bachelorsDegreeFieldsOfStudy,
        mastersDegreeRequirement: item.mastersDegreeRequirement,
        mastersDegreeFieldsOfStudy: item.mastersDegreeFieldsOfStudy,
        doctorateDegreeRequirement: item.doctorateDegreeRequirement,
        doctorateDegreeFieldsOfStudy: item.doctorateDegreeFieldsOfStudy,

        licensesOrCertifications: item.licensesOrCertifications,
        licensesOrCertificationsNotMentioned: item.licensesOrCertificationsNotMentioned,
        securityClearance: item.securityClearance,
        languageRequirements: item.languageRequirements,

        morningShiftWork: item.morningShiftWork,
        eveningShiftWork: item.eveningShiftWork,
        overnightWork: item.overnightWork,
        weekendAvailabilityRequired: item.weekendAvailabilityRequired,
        holidayAvailabilityRequired: item.holidayAvailabilityRequired,
        overtimeRequired: item.overtimeRequired,
        onCallRequirement: item.onCallRequirement,
        airTravelRequirement: item.airTravelRequirement,
        landTravelRequirement: item.landTravelRequirement,

        generousPaidTimeOff: item.generousPaidTimeOff,
        fourDayWorkWeek: item.fourDayWorkWeek,
        matching401k: item.matching401k,
        generousParentalLeave: item.generousParentalLeave,
        retirementPlan: item.retirementPlan,
        tuitionReimbursement: item.tuitionReimbursement,
        visaSponsorship: item.visaSponsorship,
        relocationAssistance: item.relocationAssistance,
        militaryVeterans: item.militaryVeterans,
        fairChance: item.fairChance,

        companyProfit: item.companyProfit,
        companyStage: item.companyStage,
        companyFoundedYear: item.companyFoundedYear,
        companyNumEmployees: item.companyNumEmployees,
        companyIndustries: item.companyIndustries,
        companyActivities: item.companyActivities,

        updatedAt: now,
      };

      let jobId: Id<"jobs">;
      if (existing) {
        await ctx.db.patch(existing._id, patch);
        jobId = existing._id;
      } else {
        jobId = await ctx.db.insert("jobs", { ...patch, createdAt: now });
        insertedJobs += 1;
        await incrementJobsCounter(ctx, 1);
      }

      // Backfill jobId on details (only needed for new details).
      const details = await ctx.db.get(detailsId);
      if (details && !details.jobId) {
        await ctx.db.patch(detailsId, { jobId, updatedAt: now });
      }

      // Dual-write jobCards so search can stay on the denormalized hot path.
      const companyDoc = await ctx.db.get(companyDocId);
      if (companyDoc) {
        const jobDoc = await ctx.db.get(jobId);
        if (jobDoc) {
          const cardFields = buildJobCardFields(jobDoc, companyDoc, item.searchText);
          const existingCard = await ctx.db
            .query("jobCards")
            .withIndex("by_externalId", (q) => q.eq("externalId", item.externalId))
            .unique();
          if (existingCard) {
            await ctx.db.patch(existingCard._id, { ...cardFields, updatedAt: now });
          } else {
            await ctx.db.insert("jobCards", { ...cardFields, createdAt: now, updatedAt: now });
          }
        }
      }

      await addCompanyJobPreview(ctx, companyDocId, jobId);

      // Maintain grouping/sorting metadata.
      const finalJobDoc = await ctx.db.get(jobId);
      if (finalJobDoc) {
        await updateCompanyLastJobMillis(ctx, companyDocId, toSortPublishMillis(finalJobDoc));
      }
    }

    // If we created companies via ingestion but counters row was missing, the company helper increments it.    // This local variable is kept for observability in the return value.
    return { upserted: items.length, insertedJobs, insertedCompanies };
  },
});

const searchFiltersValidator = v.object({
  workplaceTypes: v.optional(v.array(v.string())),
  companyIds: v.optional(v.array(v.string())),
  departments: v.optional(v.array(v.string())),
  commitment: v.optional(v.array(v.string())),
  currencies: v.optional(v.array(v.string())),
  frequencies: v.optional(v.array(v.string())),
  postedAfterMillis: v.optional(v.number()),
  locationCountries: v.optional(v.array(v.string())),
  locationStates: v.optional(v.array(v.string())),
  locationCities: v.optional(v.array(v.string())),
  minYearlyComp: v.optional(v.number()),
  maxYearlyComp: v.optional(v.number()),
  minIcYoe: v.optional(v.number()),
  minMgmtYoe: v.optional(v.number()),
  companyProfit: v.optional(v.array(v.string())),
  companyStage: v.optional(v.array(v.string())),
});

const searchSortValidator = v.object({
  by: v.union(v.literal("relevance"), v.literal("recent")),
  order: v.union(v.literal("asc"), v.literal("desc")),
});

type ConvexJobSearchFilters = {
  workplaceTypes?: string[];
  companyIds?: string[];
  departments?: string[];
  commitment?: string[];
  currencies?: string[];
  frequencies?: string[];
  postedAfterMillis?: number;
  locationCountries?: string[];
  locationStates?: string[];
  locationCities?: string[];
  minYearlyComp?: number;
  maxYearlyComp?: number;
  minIcYoe?: number;
  minMgmtYoe?: number;
  companyProfit?: string[];
  companyStage?: string[];
};

type ConvexJobSearchSort = {
  by: "relevance" | "recent";
  order: "asc" | "desc";
};

function normalizeLower(value: string): string {
  return value.trim().toLowerCase();
}

function normalizeStringList(values: string[] | undefined): string[] {
  if (!Array.isArray(values)) return [];
  const out = new Set<string>();
  for (const value of values) {
    if (typeof value !== "string") continue;
    const normalized = normalizeLower(value);
    if (normalized) out.add(normalized);
  }
  return Array.from(out);
}

function toCardResult(card: any, detailsIdFromJob?: Id<"jobDetails"> | null) {
  const detailsId = detailsIdFromJob ?? card.detailsId;
  return {
    job: {
      _id: card._id,
      jobId: card.jobId,
      externalId: card.externalId,
      title: card.title,
      applyUrl: card.applyUrl,
      companyId: card.companyId,
      detailsId,
      workplaceType: card.workplaceType,
      commitment: card.commitment ?? [],
      workplaceCities: card.workplaceCities ?? [],
      workplaceStates: card.workplaceStates ?? [],
      workplaceCountries: card.workplaceCountries ?? [],
      workplaceContinents: card.workplaceContinents ?? [],
      geoloc: card.geoloc ?? [],
      minIcYoe: card.minIcYoe,
      minMgmtYoe: card.minMgmtYoe,
      requirementsSummary: card.requirementsSummary,
      skills: card.skills ?? [],
      estimatedPublishDate: card.estimatedPublishDate,
      estimatedPublishDateMillis: card.estimatedPublishDateMillis,
      views: card.views ?? 0,
      saves: card.saves ?? 0,
      applies: card.applies ?? 0,
      listedCompensationCurrency: card.listedCompensationCurrency,
      listedCompensationFrequency: card.listedCompensationFrequency,
      isCompensationTransparent: card.isCompensationTransparent,
      hourlyMinComp: card.hourlyMinComp,
      hourlyMaxComp: card.hourlyMaxComp,
      dailyMinComp: card.dailyMinComp,
      dailyMaxComp: card.dailyMaxComp,
      weeklyMinComp: card.weeklyMinComp,
      weeklyMaxComp: card.weeklyMaxComp,
      biWeeklyMinComp: card.biWeeklyMinComp,
      biWeeklyMaxComp: card.biWeeklyMaxComp,
      monthlyMinComp: card.monthlyMinComp,
      monthlyMaxComp: card.monthlyMaxComp,
      yearlyMinComp: card.yearlyMinComp,
      yearlyMaxComp: card.yearlyMaxComp,
    },
    company: {
      _id: card.companyId,
      companyId: card.companySlug,
      name: card.companyName,
      homepageUri: card.companyHomepageUri,
      imageUrl: card.companyImageUrl,
      tagline: card.companyTagline,
      industries: card.companyIndustries ?? [],
      activities: card.companyActivities ?? [],
      hqCountry: card.companyHqCountry,
      yearFounded: card.companyFoundedYear,
      numEmployees: card.companyNumEmployees,
      jobIdsPreview: [],
    },
  };
}

function toJobResult(job: any, company: any | null) {
  const resolvedCompany = company ?? {
    _id: job.companyId,
    companyId: undefined,
    name: "",
    homepageUri: undefined,
    imageUrl: undefined,
    tagline: undefined,
    industries: [],
    activities: [],
    hqCountry: undefined,
    yearFounded: job.companyFoundedYear,
    numEmployees: job.companyNumEmployees,
    jobIdsPreview: [],
  };

  return {
    job: {
      _id: job._id,
      jobId: job._id,
      externalId: job.externalId,
      title: job.title,
      applyUrl: job.applyUrl,
      companyId: job.companyId,
      detailsId: job.detailsId,
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
      views: job.views ?? 0,
      saves: job.saves ?? 0,
      applies: job.applies ?? 0,
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
    },
    company: {
      _id: resolvedCompany._id,
      companyId: resolvedCompany.companyId,
      name: resolvedCompany.name,
      homepageUri: resolvedCompany.homepageUri,
      imageUrl: resolvedCompany.imageUrl,
      tagline: resolvedCompany.tagline,
      industries: resolvedCompany.industries ?? [],
      activities: resolvedCompany.activities ?? [],
      hqCountry: resolvedCompany.hqCountry,
      yearFounded: resolvedCompany.yearFounded,
      numEmployees: resolvedCompany.numEmployees,
      jobIdsPreview: resolvedCompany.jobIdsPreview ?? [],
    },
  };
}

/** Distinct / sampling helpers: prefer `jobCards` (only indexed search surface) when backfilled. */
async function sampleJobLikeDocsForDistinct(ctx: any, q: string, readLimit: number) {
  const hasJobCards = (await ctx.db.query("jobCards").take(1)).length > 0;
  if (hasJobCards) {
    if (q) {
      return await ctx.db
        .query("jobCards")
        .withSearchIndex("search_searchText", (q2: any) => q2.search("searchText", q))
        .take(readLimit);
    }
    return await ctx.db.query("jobCards").withIndex("by_recent").order("desc").take(readLimit);
  }
  if (q) {
    const rows = await ctx.db.query("jobs").order("desc").take(Math.min(readLimit * 3, 3000));
    const qq = q.trim().toLowerCase();
    return rows
      .filter(
        (d: any) =>
          (d.title ?? "").toLowerCase().includes(qq) ||
          (d.requirementsSummary ?? "").toLowerCase().includes(qq) ||
          String(d.department ?? "")
            .toLowerCase()
            .includes(qq) ||
          (d.skills ?? []).some((s: string) => (s ?? "").toLowerCase().includes(qq)),
      )
      .slice(0, readLimit);
  }
  return await ctx.db.query("jobs").order("desc").take(readLimit);
}

async function resolveCompanyDocIds(ctx: any, tokens: string[]): Promise<Set<string>> {
  const resolved = new Set<string>();
  for (const raw of tokens.slice(0, 30)) {
    const token = normalizeLower(raw);
    if (!token) continue;
    const candidates = await Promise.all([
      ctx.db
        .query("companies")
        .withIndex("by_companyId", (q: any) => q.eq("companyId", token))
        .unique(),
      ctx.db
        .query("companies")
        .withIndex("by_canonicalDomain", (q: any) => q.eq("canonicalDomain", token))
        .unique(),
      ctx.db
        .query("companies")
        .withIndex("by_nameLower", (q: any) => q.eq("nameLower", token))
        .unique(),
    ]);
    for (const company of candidates) {
      if (company?._id) resolved.add(String(company._id));
    }
  }
  return resolved;
}

export const search = query({
  args: {
    q: v.optional(v.string()),
    filters: v.optional(searchFiltersValidator),
    sort: v.optional(searchSortValidator),
    viewerEmail: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { q, filters, sort, viewerEmail, paginationOpts }) => {
    const startedAt = Date.now();
    const queryText = (q ?? "").trim().toLowerCase();
    const normalizedFilters: ConvexJobSearchFilters = filters ?? {};
    const normalizedSort: ConvexJobSearchSort = sort ?? {
      by: queryText ? "relevance" : "recent",
      order: "desc",
    };
    const normalizedViewerEmail = (viewerEmail ?? "").trim().toLowerCase();
    const viewerUser = normalizedViewerEmail
      ? await ctx.db
          .query("users")
          .withIndex("by_email", (q2) => q2.eq("email", normalizedViewerEmail))
          .unique()
      : null;
    const viewerUserId = viewerUser?._id ?? null;

    const workplaceTypes = normalizeStringList(normalizedFilters.workplaceTypes);
    const departments = normalizeStringList(normalizedFilters.departments);
    const currencies = normalizeStringList(normalizedFilters.currencies);
    const frequencies = normalizeStringList(normalizedFilters.frequencies);
    const companyProfit = normalizeStringList(normalizedFilters.companyProfit);
    const companyStage = normalizeStringList(normalizedFilters.companyStage);
    const companyTokens = normalizeStringList(normalizedFilters.companyIds);
    const companyDocIds = await resolveCompanyDocIds(ctx, companyTokens);

    const hasQuery = queryText.length > 0;
    const order = normalizedSort.order === "asc" ? "asc" : "desc";
    let mode = "recent";
    const hasJobCards = (await ctx.db.query("jobCards").take(1)).length > 0;

    let page;
    if (hasQuery) {
      mode = "searchIndex";
      page = await ctx.db
        .query("jobCards")
        .withSearchIndex("search_searchText", (q2) => {
          let qq = q2.search("searchText", queryText);
          if (workplaceTypes.length === 1) qq = qq.eq("workplaceType", workplaceTypes[0]);
          if (departments.length === 1) qq = qq.eq("department", departments[0]);
          if (currencies.length === 1) qq = qq.eq("listedCompensationCurrency", currencies[0]);
          if (frequencies.length === 1) qq = qq.eq("listedCompensationFrequency", frequencies[0]);
          return qq;
        })
        .paginate(paginationOpts);
    } else if (!hasJobCards) {
      mode = "jobs_recent";
      page = await ctx.db.query("jobs").order(order).paginate(paginationOpts);
    } else {
      // All browse paths use `by_recent` only; filters are applied in `applyPostFilters`.
      mode = "by_recent";
      page = await ctx.db.query("jobCards").withIndex("by_recent").order(order).paginate(paginationOpts);
    }

    const applyPostFilters = (rows: any[]) => {
      let filteredRows = rows;
      if (viewerUserId) {
        filteredRows = filteredRows.filter((row: any) => !(row.hidden ?? []).includes(viewerUserId));
      }
      if (companyDocIds.size >= 1) {
        filteredRows = filteredRows.filter((row: any) => companyDocIds.has(String(row.companyId)));
      }
      if (workplaceTypes.length >= 1) {
        const workplaceSet = new Set(workplaceTypes);
        filteredRows = filteredRows.filter((row: any) => workplaceSet.has(normalizeLower(row.workplaceType ?? "")));
      }
      if (departments.length >= 1) {
        const deptSet = new Set(departments);
        filteredRows = filteredRows.filter((row: any) => deptSet.has(normalizeLower(row.department ?? "")));
      }
      if (currencies.length >= 1) {
        const currencySet = new Set(currencies);
        filteredRows = filteredRows.filter((row: any) => currencySet.has(normalizeLower(row.listedCompensationCurrency ?? "")));
      }
      if (frequencies.length >= 1) {
        const frequencySet = new Set(frequencies);
        filteredRows = filteredRows.filter((row: any) => frequencySet.has(normalizeLower(row.listedCompensationFrequency ?? "")));
      }
      if (companyProfit.length) {
        const profitSet = new Set(companyProfit);
        filteredRows = filteredRows.filter((row: any) => profitSet.has(normalizeLower(row.companyProfit ?? "")));
      }
      if (companyStage.length) {
        const stageSet = new Set(companyStage);
        filteredRows = filteredRows.filter((row: any) => stageSet.has(normalizeLower(row.companyStage ?? "")));
      }
      if (typeof normalizedFilters.postedAfterMillis === "number") {
        filteredRows = filteredRows.filter((row: any) => {
          const publishMillis = typeof row.sortPublishMillis === "number" ? row.sortPublishMillis : row.estimatedPublishDateMillis;
          return (publishMillis ?? 0) >= normalizedFilters.postedAfterMillis!;
        });
      }
      if (typeof normalizedFilters.minYearlyComp === "number") {
        filteredRows = filteredRows.filter((row: any) => typeof row.yearlyMaxComp !== "number" || row.yearlyMaxComp >= normalizedFilters.minYearlyComp!);
      }
      if (typeof normalizedFilters.maxYearlyComp === "number") {
        filteredRows = filteredRows.filter((row: any) => typeof row.yearlyMinComp !== "number" || row.yearlyMinComp <= normalizedFilters.maxYearlyComp!);
      }
      if (typeof normalizedFilters.minIcYoe === "number") {
        filteredRows = filteredRows.filter((row: any) => typeof row.minIcYoe !== "number" || row.minIcYoe >= normalizedFilters.minIcYoe!);
      }
      if (typeof normalizedFilters.minMgmtYoe === "number") {
        filteredRows = filteredRows.filter((row: any) => typeof row.minMgmtYoe !== "number" || row.minMgmtYoe >= normalizedFilters.minMgmtYoe!);
      }
      if (normalizedFilters.commitment?.length) {
        const commitmentSet = new Set(normalizeStringList(normalizedFilters.commitment));
        filteredRows = filteredRows.filter((row: any) => {
          for (const commitment of row.commitment ?? []) {
            if (commitmentSet.has(normalizeLower(commitment))) return true;
          }
          return false;
        });
      }
      if (normalizedFilters.locationCountries?.length) {
        const countrySet = new Set(normalizeStringList(normalizedFilters.locationCountries));
        filteredRows = filteredRows.filter((row: any) => (row.workplaceCountries ?? []).some((c: string) => countrySet.has(normalizeLower(c))));
      }
      if (normalizedFilters.locationStates?.length) {
        const stateSet = new Set(normalizeStringList(normalizedFilters.locationStates));
        filteredRows = filteredRows.filter((row: any) => (row.workplaceStates ?? []).some((s: string) => stateSet.has(normalizeLower(s))));
      }
      if (normalizedFilters.locationCities?.length) {
        const citySet = new Set(normalizeStringList(normalizedFilters.locationCities));
        filteredRows = filteredRows.filter((row: any) => (row.workplaceCities ?? []).some((c: string) => citySet.has(normalizeLower(c))));
      }
      return filteredRows;
    };

    let scannedCount = page.page.length;
    let continueCursor = page.continueCursor;
    let isDone = page.isDone;
    const filteredRows = applyPostFilters(page.page);
    let resultPage: any[] = [];
    const pageRowsAreJobCards = filteredRows.length > 0 && "jobId" in filteredRows[0];
    if (pageRowsAreJobCards) {
      const uniqueJobIds = Array.from(new Set(filteredRows.map((row: any) => String(row.jobId))));
      const jobDocs = await Promise.all(uniqueJobIds.map((id) => ctx.db.get(id as Id<"jobs">)));
      const detailsIdByJobId = new Map<string, Id<"jobDetails">>();
      for (const j of jobDocs) {
        if (j?._id && j.detailsId) detailsIdByJobId.set(String(j._id), j.detailsId);
      }
      resultPage = filteredRows.map((card: any) =>
        toCardResult(card, detailsIdByJobId.get(String(card.jobId)) ?? null),
      );
    } else if (filteredRows.length > 0) {
      const companyIds = Array.from(new Set(filteredRows.map((row: any) => String(row.companyId))));
      const companyDocs = await Promise.all(companyIds.map((id) => ctx.db.get(id as Id<"companies">)));
      const companiesById = new Map<string, any>();
      for (const company of companyDocs) {
        if (company?._id) companiesById.set(String(company._id), company);
      }
      resultPage = filteredRows.map((job: any) => toJobResult(job, companiesById.get(String(job.companyId)) ?? null));
    } else {
      resultPage = [];
    }

    const durationMs = Date.now() - startedAt;
    const slowThresholdMs = 1200;
    const logLine =
      `[jobs.search] mode=${mode} query=${queryText ? "text" : "browse"} order=${order} ` + `scanned=${scannedCount} returned=${resultPage.length} durationMs=${durationMs}`;
    if (durationMs >= slowThresholdMs) {
      console.warn(`[SLOW_QUERY] ${logLine}`);
    } else {
      console.log(logLine);
    }

    return {
      page: resultPage,
      continueCursor,
      isDone,
    };
  },
});

export const getDetails = query({
  args: { jobId: v.union(v.id("jobs"), v.id("jobCards")) },
  handler: async (ctx, { jobId }) => {
    const sourceDoc = await ctx.db.get(jobId);
    if (!sourceDoc) return null;

    const isCardSource = "jobId" in sourceDoc;
    const sourceJobId = isCardSource ? sourceDoc.jobId : sourceDoc._id;
    let job = await ctx.db.get(sourceJobId);

    // Backward compatibility for stale card pointers after history rewrites/import drift.
    if (!job && "externalId" in sourceDoc) {
      job = await ctx.db
        .query("jobs")
        .withIndex("by_externalId", (q) => q.eq("externalId", sourceDoc.externalId))
        .unique();
    }

    let details = null;
    if (job?.detailsId) {
      details = await ctx.db.get(job.detailsId);
    }
    if (!details && "detailsId" in sourceDoc && sourceDoc.detailsId) {
      details = await ctx.db.get(sourceDoc.detailsId);
    }
    if (!details && job?._id) {
      details = await ctx.db
        .query("jobDetails")
        .withIndex("by_jobId", (q) => q.eq("jobId", job._id))
        .unique();
    }
    if (!details && isCardSource) {
      details = await ctx.db
        .query("jobDetails")
        .withIndex("by_jobId", (q) => q.eq("jobId", sourceDoc.jobId))
        .unique();
    }

    const resolvedJob = job ?? sourceDoc;
    const company = await ctx.db.get(resolvedJob.companyId);
    return { job: resolvedJob, details, company };
  },
});

function pickDetailsJob(job: any) {
  if (!job) return null;
  return {
    _id: job._id,
    jobId: job.jobId ?? job._id,
    externalId: job.externalId,
    title: job.title,
    applyUrl: job.applyUrl,
    companyId: job.companyId,
    detailsId: job.detailsId,

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

    views: job.views ?? 0,
    saves: job.saves ?? 0,
    applies: job.applies ?? 0,

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
  };
}

function pickDetailsCompany(company: any) {
  if (!company) return null;
  return {
    _id: company._id,
    companyId: company.companyId,
    canonicalDomain: company.canonicalDomain,
    name: company.name,
    homepageUri: company.homepageUri,
    imageUrl: company.imageUrl,
    tagline: company.tagline,
    industries: company.industries ?? [],
    activities: company.activities ?? [],
    hqCountry: company.hqCountry,
    yearFounded: company.yearFounded,
    numEmployees: company.numEmployees,
  };
}

function pickDetailsDoc(details: any) {
  if (!details) return null;
  return {
    _id: details._id,
    jobId: details.jobId,
    description: details.description,
    roleActivities: details.roleActivities ?? [],
    updatedAt: details.updatedAt,
  };
}

/**
 * Lightweight details fetch for dialogs/drawers.
 * Returns only UI-needed fields to minimize bytes sent to the client.
 */
export const getDetailsLite = query({
  args: { jobId: v.union(v.id("jobs"), v.id("jobCards")) },
  handler: async (ctx, { jobId }) => {
    const sourceDoc = await ctx.db.get(jobId);
    if (!sourceDoc) return null;

    const isCardSource = "jobId" in sourceDoc;
    const sourceJobId = isCardSource ? sourceDoc.jobId : sourceDoc._id;
    let job = await ctx.db.get(sourceJobId);

    // Backward compatibility for stale card pointers after history rewrites/import drift.
    if (!job && "externalId" in sourceDoc) {
      job = await ctx.db
        .query("jobs")
        .withIndex("by_externalId", (q) => q.eq("externalId", sourceDoc.externalId))
        .unique();
    }

    let details: any = null;
    if (job?.detailsId) {
      details = await ctx.db.get(job.detailsId);
    }
    if (!details && "detailsId" in sourceDoc && sourceDoc.detailsId) {
      details = await ctx.db.get(sourceDoc.detailsId);
    }
    if (!details && job?._id) {
      details = await ctx.db
        .query("jobDetails")
        .withIndex("by_jobId", (q) => q.eq("jobId", job._id))
        .unique();
    }
    if (!details && isCardSource) {
      details = await ctx.db
        .query("jobDetails")
        .withIndex("by_jobId", (q) => q.eq("jobId", sourceDoc.jobId))
        .unique();
    }

    const resolvedJob = job ?? sourceDoc;
    const company = await ctx.db.get(resolvedJob.companyId);

    return {
      job: pickDetailsJob(resolvedJob),
      details: pickDetailsDoc(details),
      company: pickDetailsCompany(company),
    };
  },
});

export const distinctJobTitles = query({
  args: { query: v.optional(v.string()), limit: v.optional(v.number()) },
  handler: async (ctx, { query, limit }) => {
    const q = (query ?? "").trim().toLowerCase();
    const max = Math.min(Math.max(limit ?? 50, 1), 200);
    const readLimit = Math.min(Math.max(max * 6, 120), 600);

    const docs = await sampleJobLikeDocsForDistinct(ctx, q, readLimit);

    const titles = new Set<string>();
    for (const d of docs) {
      const t = (d.title ?? "").trim();
      if (t) titles.add(t);
      if (titles.size >= max) break;
    }
    return Array.from(titles);
  },
});

/** Distinct skill tags from jobs (used for description-keyword @ suggestions). */
export const distinctSkills = query({
  args: { query: v.optional(v.string()), limit: v.optional(v.number()) },
  handler: async (ctx, { query, limit }) => {
    const q = (query ?? "").trim().toLowerCase();
    const max = Math.min(Math.max(limit ?? 50, 1), 200);
    const readLimit = Math.min(Math.max(max * 8, 120), 800);

    const docs = await sampleJobLikeDocsForDistinct(ctx, q, readLimit);

    const skills = new Set<string>();
    for (const d of docs) {
      for (const raw of d.skills ?? []) {
        const s = (raw ?? "").trim();
        if (!s) continue;
        if (q && !s.toLowerCase().includes(q)) continue;
        skills.add(s);
        if (skills.size >= max) break;
      }
      if (skills.size >= max) break;
    }
    return Array.from(skills);
  },
});

/** Distinct requirements summary lines from jobs (for requirements-keyword @ suggestions). */
export const distinctRequirementsSummaries = query({
  args: { query: v.optional(v.string()), limit: v.optional(v.number()) },
  handler: async (ctx, { query, limit }) => {
    const q = (query ?? "").trim().toLowerCase();
    const max = Math.min(Math.max(limit ?? 50, 1), 200);
    const readLimit = Math.min(Math.max(max * 8, 120), 800);

    const docs = await sampleJobLikeDocsForDistinct(ctx, q, readLimit);

    const lines = new Set<string>();
    for (const d of docs) {
      const s = (d.requirementsSummary ?? "").trim();
      if (!s) continue;
      if (q && !s.toLowerCase().includes(q)) continue;
      lines.add(s);
      if (lines.size >= max) break;
    }
    return Array.from(lines);
  },
});

export const count = query({
  args: {},
  handler: async (ctx) => {
    const row = await getJobsCounter(ctx);
    return row?.value ?? null;
  },
});

export const byExternalIds = query({
  args: { ids: v.array(v.string()), viewerEmail: v.optional(v.string()) },
  handler: async (ctx, { ids, viewerEmail }) => {
    const normalizedViewerEmail = (viewerEmail ?? "").trim().toLowerCase();
    const viewerUser = normalizedViewerEmail
      ? await ctx.db
          .query("users")
          .withIndex("by_email", (q) => q.eq("email", normalizedViewerEmail))
          .unique()
      : null;
    const viewerUserId = viewerUser?._id ?? null;
    const hiddenExternalIds = new Set<string>();
    if (viewerUserId) {
      const cards = await Promise.all(
        ids.map((externalId) =>
          ctx.db
            .query("jobCards")
            .withIndex("by_externalId", (q) => q.eq("externalId", externalId))
            .unique()
        )
      );
      for (const card of cards) {
        if (!card) continue;
        if ((card.hidden ?? []).includes(viewerUserId)) hiddenExternalIds.add(card.externalId);
      }
    }
    const docs = await Promise.all(
      ids.map((externalId) =>
        ctx.db
          .query("jobs")
          .withIndex("by_externalId", (q) => q.eq("externalId", externalId))
          .unique()
      )
    );
    const jobs = docs
      .filter((d): d is NonNullable<typeof d> => d !== null)
      .filter((job) => !hiddenExternalIds.has(job.externalId));
    const uniqCompanies = Array.from(new Set(jobs.map((j) => String(j.companyId))));
    const companyDocs = await Promise.all(uniqCompanies.map((id) => ctx.db.get(id as any)));
    const byId = new Map<string, any>();
    for (const c of companyDocs) if (c) byId.set(String(c._id), c);
    return jobs.map((job: any) => ({ job, company: byId.get(String(job.companyId)) ?? null }));
  },
});

export const hideForCurrentUser = mutation({
  args: { externalIds: v.array(v.string()), viewerEmail: v.optional(v.string()) },
  handler: async (ctx, { externalIds, viewerEmail }) => {
    const normalizedViewerEmail = (viewerEmail ?? "").trim().toLowerCase();
    if (!normalizedViewerEmail) {
      return { ok: false as const, reason: "SIGN_IN_REQUIRED" as const, updated: 0 };
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalizedViewerEmail))
      .unique();
    if (!user) {
      return { ok: false as const, reason: "SIGN_IN_REQUIRED" as const, updated: 0 };
    }

    let updated = 0;
    const uniqueExternalIds = Array.from(new Set(externalIds));
    for (const externalId of uniqueExternalIds) {
      const card = await ctx.db
        .query("jobCards")
        .withIndex("by_externalId", (q) => q.eq("externalId", externalId))
        .unique();
      if (!card) continue;
      const hidden = card.hidden ?? [];
      if (hidden.includes(user._id)) continue;
      await ctx.db.patch(card._id, { hidden: [...hidden, user._id], updatedAt: Date.now() });
      updated += 1;
    }
    return { ok: true as const, updated };
  },
});
