import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalMutation, mutation, query } from "./_generated/server";
import {
	buildJobCardFields,
	JOBCARDS_BACKFILL_DONE_COUNTER,
	JOBCARDS_BACKFILL_TOTAL_COUNTER,
	JOBCARDS_BACKFILL_UPDATED_AT_COUNTER,
} from "./jobCards";

const DEFAULT_BATCH_SIZE = 100;
const MAX_BATCH_SIZE = 500;

function normalizeBatchSize(batchSize: number | undefined): number {
	if (typeof batchSize !== "number" || !Number.isFinite(batchSize)) return DEFAULT_BATCH_SIZE;
	return Math.max(1, Math.min(Math.floor(batchSize), MAX_BATCH_SIZE));
}

async function getCounter(ctx: any, name: string): Promise<number | null> {
	const row = await ctx.db
		.query("counters")
		.withIndex("by_name", (q: any) => q.eq("name", name))
		.unique();
	return row?.value ?? null;
}

async function setCounter(ctx: any, name: string, value: number) {
	const now = Date.now();
	const row = await ctx.db
		.query("counters")
		.withIndex("by_name", (q: any) => q.eq("name", name))
		.unique();
	if (row) {
		await ctx.db.patch(row._id, { value, updatedAt: now });
	} else {
		await ctx.db.insert("counters", { name, value, updatedAt: now });
	}
}

async function incrementCounter(ctx: any, name: string, delta: number) {
	const existing = (await getCounter(ctx, name)) ?? 0;
	await setCounter(ctx, name, Math.max(0, existing + delta));
}

export const startJobCardsBackfill = mutation({
	args: { batchSize: v.optional(v.number()) },
	handler: async (ctx, { batchSize }) => {
		const size = normalizeBatchSize(batchSize);
		const now = Date.now();
		const jobsTotal = (await getCounter(ctx, "jobs")) ?? 0;

		await setCounter(ctx, JOBCARDS_BACKFILL_TOTAL_COUNTER, jobsTotal);
		await setCounter(ctx, JOBCARDS_BACKFILL_DONE_COUNTER, 0);
		await setCounter(ctx, JOBCARDS_BACKFILL_UPDATED_AT_COUNTER, now);

		await ctx.scheduler.runAfter(0, internal.jobsBackfill.backfillJobCardsBatch, {
			cursor: null,
			batchSize: size,
		});

		return { scheduled: true, batchSize: size, totalHint: jobsTotal, startedAt: now };
	},
});

export const jobCardsBackfillStatus = query({
	args: {},
	handler: async (ctx) => {
		const [total, done, updatedAt] = await Promise.all([
			getCounter(ctx, JOBCARDS_BACKFILL_TOTAL_COUNTER),
			getCounter(ctx, JOBCARDS_BACKFILL_DONE_COUNTER),
			getCounter(ctx, JOBCARDS_BACKFILL_UPDATED_AT_COUNTER),
		]);
		const remaining =
			typeof total === "number" && typeof done === "number" ? Math.max(0, total - done) : null;
		return { total, done, remaining, updatedAt };
	},
});

export const getSchedulerHealth = query({
	args: {},
	handler: async (ctx) => {
		const scheduled = await ctx.db.system.query("_scheduled_functions").take(2000);
		let pendingCount = 0;
		let pendingJobsBackfillCount = 0;
		let oldestPending: {
			id: string;
			name: string;
			scheduledTime: number;
			createdAt: number;
		} | null = null;

		for (const row of scheduled) {
			if (row.state?.kind !== "pending") continue;
			pendingCount += 1;
			if (row.name.includes("jobsBackfill")) pendingJobsBackfillCount += 1;
			if (!oldestPending || row.scheduledTime < oldestPending.scheduledTime) {
				oldestPending = {
					id: String(row._id),
					name: row.name,
					scheduledTime: row.scheduledTime,
					createdAt: row._creationTime,
				};
			}
		}

		return {
			sampleSize: scheduled.length,
			pendingCount,
			pendingJobsBackfillCount,
			oldestPending,
		};
	},
});

export const compareJobsVsJobCards = query({
	args: { sampleSize: v.optional(v.number()) },
	handler: async (ctx, { sampleSize }) => {
		const take = Math.max(1, Math.min(sampleSize ?? 200, 1000));
		const jobsCounter = await getCounter(ctx, "jobs");
		const cardsCounter = await getCounter(ctx, JOBCARDS_BACKFILL_DONE_COUNTER);
		const sampleJobs = await ctx.db.query("jobs").order("desc").take(take);

		const missingExternalIds: string[] = [];
		for (const job of sampleJobs) {
			const card = await ctx.db
				.query("jobCards")
				.withIndex("by_externalId", (q) => q.eq("externalId", job.externalId))
				.unique();
			if (!card) missingExternalIds.push(job.externalId);
		}

		return {
			jobsCountHint: jobsCounter ?? null,
			jobCardsBackfilledHint: cardsCounter ?? null,
			sampleChecked: sampleJobs.length,
			missingCount: missingExternalIds.length,
			missingExternalIds: missingExternalIds.slice(0, 50),
		};
	},
});

export const runJobCardsBackfillBatchNow = mutation({
	args: {
		cursor: v.union(v.string(), v.null()),
		batchSize: v.optional(v.number()),
	},
	handler: async (ctx, { cursor, batchSize }) => {
		const result: {
			processed: number;
			read: number;
			cursor: string | null;
			isDone: boolean;
			batchSize: number;
		} = await ctx.runMutation(internal.jobsBackfill.backfillJobCardsBatch, {
			cursor,
			batchSize: normalizeBatchSize(batchSize),
		});
		return result;
	},
});

export const backfillJobCardsBatch = internalMutation({
	args: {
		cursor: v.union(v.string(), v.null()),
		batchSize: v.number(),
	},
	handler: async (ctx, { cursor, batchSize }) => {
		const size = normalizeBatchSize(batchSize);
		const page = await ctx.db.query("jobs").order("asc").paginate({
			numItems: size,
			cursor,
		});

		let processed = 0;
		for (const job of page.page) {
			const company = await ctx.db.get(job.companyId);
			if (!company) continue;

			const fields = buildJobCardFields(job, company);
			const existing = await ctx.db
				.query("jobCards")
				.withIndex("by_externalId", (q) => q.eq("externalId", job.externalId))
				.unique();
			const now = Date.now();

			if (existing) {
				await ctx.db.patch(existing._id, { ...fields, updatedAt: now });
			} else {
				await ctx.db.insert("jobCards", { ...fields, createdAt: now, updatedAt: now });
			}
			processed += 1;
		}

		await incrementCounter(ctx, JOBCARDS_BACKFILL_DONE_COUNTER, page.page.length);
		await setCounter(ctx, JOBCARDS_BACKFILL_UPDATED_AT_COUNTER, Date.now());

		if (!page.isDone) {
			await ctx.scheduler.runAfter(0, internal.jobsBackfill.backfillJobCardsBatch, {
				cursor: page.continueCursor,
				batchSize: size,
			});
		}

		return {
			processed,
			read: page.page.length,
			cursor: page.continueCursor,
			isDone: page.isDone,
			batchSize: size,
		};
	},
});
