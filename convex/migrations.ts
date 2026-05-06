import { Migrations, type MigrationStatus } from "@convex-dev/migrations";
import { components, internal } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
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

export const cancelJobCardsBackfill = mutation({
  args: {},
  handler: async (ctx) => {
    return await migrations.cancel(ctx, "backfillJobCards");
  },
});

export const runJobCardsBackfill = migrations.runner(internal.migrations.backfillJobCards);
