import type { Doc, Id } from "./_generated/dataModel";
import { query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { toSortPublishMillis } from "./jobCards";

const COMPANIES_COUNTER_NAME = "companies";

export type CompanyIngest = {
  companyId: string;
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
};

function normalizeLower(value: string): string {
  return value.trim().toLowerCase();
}

async function getCompaniesCounterRow(ctx: QueryCtx | MutationCtx): Promise<Doc<"counters"> | null> {
  return await ctx.db
    .query("counters")
    .withIndex("by_name", (q) => q.eq("name", COMPANIES_COUNTER_NAME))
    .unique();
}

export async function incrementCompaniesCounter(ctx: MutationCtx, delta: number) {
  if (delta === 0) return;
  const now = Date.now();
  const row = await getCompaniesCounterRow(ctx);
  if (!row) {
    await ctx.db.insert("counters", { name: COMPANIES_COUNTER_NAME, value: Math.max(0, delta), updatedAt: now });
  } else {
    await ctx.db.patch(row._id, { value: Math.max(0, row.value + delta), updatedAt: now });
  }
}

export async function upsertCompanyFromIngest(ctx: MutationCtx, input: CompanyIngest): Promise<{ companyDocId: Id<"companies">; inserted: boolean }> {
  const now = Date.now();
  const existing = await ctx.db
    .query("companies")
    .withIndex("by_companyId", (q) => q.eq("companyId", input.companyId))
    .unique();

  const patch = {
    companyId: input.companyId,
    canonicalDomain: input.canonicalDomain,
    name: input.name,
    nameLower: normalizeLower(input.name),
    homepageUri: input.homepageUri,
    imageUrl: input.imageUrl,
    tagline: input.tagline,
    description: input.description,
    yearFounded: input.yearFounded,
    numEmployees: input.numEmployees,
    hqCountry: input.hqCountry,
    industries: input.industries,
    activities: input.activities,
    updatedAt: now,
  } as const;

  if (existing) {
    await ctx.db.patch(existing._id, patch);
    return { companyDocId: existing._id, inserted: false };
  }

  const id = await ctx.db.insert("companies", {
    ...patch,
    jobIdsPreview: [],
    createdAt: now,
  });
  await incrementCompaniesCounter(ctx, 1);
  return { companyDocId: id, inserted: true };
}

export async function updateCompanyLastJobMillis(ctx: MutationCtx, companyId: Id<"companies">, millis: number) {
  const company = await ctx.db.get(companyId);
  if (!company) return;

  const current = company.lastJobSortPublishMillis ?? 0;
  if (millis <= current) return;

  // Only the company row is used for grouping; do not fan out to all jobCards.
  await ctx.db.patch(companyId, { lastJobSortPublishMillis: millis, updatedAt: Date.now() });
}

/**
 * Recompute `lastJobSortPublishMillis` from remaining `jobs` rows (e.g. after deletes).
 */
export async function refreshCompanyJobSortFromDb(ctx: MutationCtx, companyDocId: Id<"companies">) {
  const jobs = await ctx.db
    .query("jobs")
    .withIndex("by_companyId", (q) => q.eq("companyId", companyDocId))
    .collect();

  let maxMillis = 0;
  for (const j of jobs) {
    const m = toSortPublishMillis(j);
    if (m > maxMillis) maxMillis = m;
  }

  const now = Date.now();
  const company = await ctx.db.get(companyDocId);
  if (!company) return;

  const nextLast = maxMillis > 0 ? maxMillis : undefined;
  if (company.lastJobSortPublishMillis !== nextLast) {
    await ctx.db.patch(companyDocId, { lastJobSortPublishMillis: nextLast, updatedAt: now });
  }
}

export async function addCompanyJobPreview(ctx: MutationCtx, companyDocId: Id<"companies">, jobId: Id<"jobs">) {
  const c = await ctx.db.get(companyDocId);
  if (!c) return;
  const prev = c.jobIdsPreview ?? [];
  const next = [jobId, ...prev.filter((x: Id<"jobs">) => x !== jobId)].slice(0, 5);
  if (next.length === prev.length && next.every((v, i) => v === prev[i])) return;
  await ctx.db.patch(companyDocId, { jobIdsPreview: next, updatedAt: Date.now() });
}

export const count = query({
  args: {},
  handler: async (ctx) => {
    const row = await getCompaniesCounterRow(ctx);
    return row?.value ?? null;
  },
});
