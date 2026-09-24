import type { Doc, Id } from "./_generated/dataModel";
import { v } from "convex/values";

/**
 * The public search contract is deliberately separate from the ingest
 * contract. Search only needs normalized, denormalized card fields.
 */
export const searchFiltersValidator = v.object({
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
  minViews: v.optional(v.number()),
  maxViews: v.optional(v.number()),
  minApplies: v.optional(v.number()),
  maxApplies: v.optional(v.number()),
  minSaves: v.optional(v.number()),
  maxSaves: v.optional(v.number()),
});

export const searchSortValidator = v.object({
  by: v.union(v.literal("relevance"), v.literal("recent")),
  order: v.union(v.literal("asc"), v.literal("desc")),
});

export type ConvexJobSearchFilters = {
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
  minViews?: number;
  maxViews?: number;
  minApplies?: number;
  maxApplies?: number;
  minSaves?: number;
  maxSaves?: number;
};

export type ConvexJobSearchSort = {
  by: "relevance" | "recent";
  order: "asc" | "desc";
};

export function normalizeLower(value: string): string {
  return value.trim().toLowerCase();
}

export function normalizeStringList(values: string[] | undefined): string[] {
  if (!Array.isArray(values)) return [];
  const out = new Set<string>();
  for (const value of values) {
    if (typeof value !== "string") continue;
    const normalized = normalizeLower(value);
    if (normalized) out.add(normalized);
  }
  return Array.from(out);
}

type SearchRow = Doc<"jobCards">;

/**
 * Apply the filters that cannot currently be expressed by the search index.
 *
 * This is kept pure so filter semantics can be tested without a Convex
 * deployment. Index-backed filters are still applied by the caller when
 * building the database query.
 */
export function applyPostFilters(rows: SearchRow[], filters: ConvexJobSearchFilters, viewerUserId: Id<"users"> | null, companyDocIds: Set<string>): SearchRow[] {
  const workplaceTypes = new Set(normalizeStringList(filters.workplaceTypes));
  const departments = new Set(normalizeStringList(filters.departments));
  const currencies = new Set(normalizeStringList(filters.currencies));
  const frequencies = new Set(normalizeStringList(filters.frequencies));
  const companyProfit = new Set(normalizeStringList(filters.companyProfit));
  const companyStage = new Set(normalizeStringList(filters.companyStage));
  const commitment = new Set(normalizeStringList(filters.commitment));
  const locationCountries = new Set(normalizeStringList(filters.locationCountries));
  const locationStates = new Set(normalizeStringList(filters.locationStates));
  const locationCities = new Set(normalizeStringList(filters.locationCities));

  return rows.filter((row) => {
    if (viewerUserId && (row.hidden ?? []).includes(viewerUserId)) return false;
    if (companyDocIds.size >= 1 && !companyDocIds.has(String(row.companyId))) return false;
    if (workplaceTypes.size >= 1 && !workplaceTypes.has(normalizeLower(row.workplaceType ?? ""))) return false;
    if (departments.size >= 1 && !departments.has(normalizeLower(row.department ?? ""))) return false;
    if (currencies.size >= 1 && !currencies.has(normalizeLower(row.listedCompensationCurrency ?? ""))) return false;
    if (frequencies.size >= 1 && !frequencies.has(normalizeLower(row.listedCompensationFrequency ?? ""))) return false;
    if (companyProfit.size >= 1 && !companyProfit.has(normalizeLower(row.companyProfit ?? ""))) return false;
    if (companyStage.size >= 1 && !companyStage.has(normalizeLower(row.companyStage ?? ""))) return false;
    if (typeof filters.minViews === "number" && (row.views ?? 0) < filters.minViews) return false;
    if (typeof filters.maxViews === "number" && (row.views ?? 0) > filters.maxViews) return false;
    if (typeof filters.minApplies === "number" && (row.applies ?? 0) < filters.minApplies) return false;
    if (typeof filters.maxApplies === "number" && (row.applies ?? 0) > filters.maxApplies) return false;
    if (typeof filters.minSaves === "number" && (row.saves ?? 0) < filters.minSaves) return false;
    if (typeof filters.maxSaves === "number" && (row.saves ?? 0) > filters.maxSaves) return false;

    if (typeof filters.postedAfterMillis === "number") {
      const publishMillis = typeof row.sortPublishMillis === "number" ? row.sortPublishMillis : row.estimatedPublishDateMillis;
      if ((publishMillis ?? 0) < filters.postedAfterMillis) return false;
    }
    if (typeof filters.minYearlyComp === "number" && typeof row.yearlyMaxComp === "number" && row.yearlyMaxComp < filters.minYearlyComp) {
      return false;
    }
    if (typeof filters.maxYearlyComp === "number" && typeof row.yearlyMinComp === "number" && row.yearlyMinComp > filters.maxYearlyComp) {
      return false;
    }
    if (typeof filters.minIcYoe === "number" && typeof row.minIcYoe === "number" && row.minIcYoe < filters.minIcYoe) {
      return false;
    }
    if (typeof filters.minMgmtYoe === "number" && typeof row.minMgmtYoe === "number" && row.minMgmtYoe < filters.minMgmtYoe) {
      return false;
    }
    if (commitment.size >= 1 && !(row.commitment ?? []).some((value) => commitment.has(normalizeLower(value)))) return false;
    if (locationCountries.size >= 1 && !(row.workplaceCountries ?? []).some((value) => locationCountries.has(normalizeLower(value)))) return false;
    if (locationStates.size >= 1 && !(row.workplaceStates ?? []).some((value) => locationStates.has(normalizeLower(value)))) return false;
    if (locationCities.size >= 1 && !(row.workplaceCities ?? []).some((value) => locationCities.has(normalizeLower(value)))) return false;
    return true;
  });
}

export function toCardResult(card: SearchRow) {
  return {
    job: {
      _id: card._id,
      jobId: card.jobId,
      externalId: card.externalId,
      title: card.title,
      applyUrl: card.applyUrl,
      companyId: card.companyId,
      detailsId: card.detailsId,
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
