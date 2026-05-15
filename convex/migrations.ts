import { Migrations, type MigrationStatus } from "@convex-dev/migrations";
import { components, internal } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { refreshCompanyJobSortFromDb } from "./companies";
import { jobTitleLooksEngineering } from "./engineeringJobSignals";
import { incrementJobsCounter } from "./jobs";
import { buildJobCardFields, toSortPublishMillis } from "./jobCards";

const migrations = new Migrations<DataModel>(components.migrations, {
  migrationsLocationPrefix: "migrations:",
});

export const backfillJobCards = migrations.define({
  table: "companies",
  batchSize: 20,
  migrateOne: async (ctx, company) => {
    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_companyId", (q) => q.eq("companyId", company._id))
      .collect();

    if (jobs.length === 0) return;

    let maxMillis = 0;
    for (const job of jobs) {
      const millis = toSortPublishMillis(job);
      if (millis > maxMillis) maxMillis = millis;
    }

    // Ensure company record has the latest grouping timestamp.
    if (maxMillis > 0 && company.lastJobSortPublishMillis !== maxMillis) {
      await ctx.db.patch(company._id, { lastJobSortPublishMillis: maxMillis, updatedAt: Date.now() });
    }

    const now = Date.now();
    // Re-fetch to get updated lastJobSortPublishMillis for buildJobCardFields.
    const updatedCompany = (await ctx.db.get(company._id))!;

    for (const job of jobs) {
      const fields = buildJobCardFields(job, updatedCompany);
      const existing = await ctx.db
        .query("jobCards")
        .withIndex("by_externalId", (q) => q.eq("externalId", job.externalId))
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, { ...fields, updatedAt: now });
      } else {
        await ctx.db.insert("jobCards", { ...fields, createdAt: now, updatedAt: now });
      }
    }
  },
});

/** Drops deprecated `jobs.searchText` after removing the duplicate full-text index (saves table + index bytes). */
export const stripJobsSearchText = migrations.define({
  table: "jobs",
  batchSize: 100,
  migrateOne: async (ctx, job) => {
    if (job.searchText !== undefined) {
      await ctx.db.patch(job._id, { searchText: undefined });
    }
  },
});

/** Drops redundant `jobCards.detailsId` (same as `jobs.detailsId` via `jobId`). */
export const stripJobCardsDetailsId = migrations.define({
  table: "jobCards",
  batchSize: 100,
  migrateOne: async (ctx, card) => {
    if (card.detailsId !== undefined) {
      await ctx.db.patch(card._id, { detailsId: undefined });
    }
  },
});

/**
 * Deletes `jobs` rows (and linked `jobCards` + `jobDetails`) that do not match
 * {@link jobTitleLooksEngineering} on title + department only. Companies are kept; `jobIdsPreview` is
 * patched and company/card sort millis are recomputed when the deleted job was
 * at the company's newest publish time.
 */
export const deleteNonEngineeringJobs = migrations.define({
  table: "jobs",
  batchSize: 10,
  migrateOne: async (ctx, job) => {
    if (jobTitleLooksEngineering(job.title, job.department)) return;

    const card = await ctx.db
      .query("jobCards")
      .withIndex("by_externalId", (q) => q.eq("externalId", job.externalId))
      .unique();

    const company = await ctx.db.get(job.companyId);
    const jobMillis = toSortPublishMillis(job);
    const companyMax = company?.lastJobSortPublishMillis ?? 0;

    if (company) {
      const prev = company.jobIdsPreview ?? [];
      const next = prev.filter((id) => id !== job._id);
      if (next.length !== prev.length) {
        await ctx.db.patch(company._id, { jobIdsPreview: next, updatedAt: Date.now() });
      }
    }

    if (card) await ctx.db.delete(card._id);

    const detailsId = job.detailsId;
    await ctx.db.delete(job._id);
    await ctx.db.delete(detailsId);

    await incrementJobsCounter(ctx, -1);

    if (company && jobMillis >= companyMax) {
      await refreshCompanyJobSortFromDb(ctx, company._id);
    }
  },
});

export const getJobCardsBackfillStatus = query({
  args: {},
  handler: async (ctx): Promise<MigrationStatus | null> => {
    const [status] = await migrations.getStatus(ctx, {
      migrations: ["backfillJobCards"],
      limit: 1,
    });
    return status ?? null;
  },
});

export const getStorageDedupeMigrationStatus = query({
  args: {},
  handler: async (ctx) => {
    const statuses = await migrations.getStatus(ctx, {
      migrations: ["stripJobsSearchText", "stripJobCardsDetailsId"],
      limit: 2,
    });
    return {
      stripJobsSearchText: statuses[0] ?? null,
      stripJobCardsDetailsId: statuses[1] ?? null,
    };
  },
});

export const getDeleteNonEngineeringJobsStatus = query({
  args: {},
  handler: async (ctx): Promise<MigrationStatus | null> => {
    const [status] = await migrations.getStatus(ctx, {
      migrations: ["deleteNonEngineeringJobs"],
      limit: 1,
    });
    return status ?? null;
  },
});

export const cancelJobCardsBackfill = mutation({
  args: {},
  handler: async (ctx) => {
    return await migrations.cancel(ctx, "backfillJobCards");
  },
});

// Run from CLI as public mutations, e.g. `convex run migrations:runStripJobsSearchText` (not `internal/migrations:...`).
export const runJobCardsBackfill = migrations.runner(internal.migrations.backfillJobCards);
export const runStripJobsSearchText = migrations.runner(internal.migrations.stripJobsSearchText);
export const runStripJobCardsDetailsId = migrations.runner(internal.migrations.stripJobCardsDetailsId);
export const runDeleteNonEngineeringJobs = migrations.runner(internal.migrations.deleteNonEngineeringJobs);
