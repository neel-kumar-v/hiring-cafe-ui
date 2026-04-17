import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

function stripHeavyJobFields(raw: any) {
	if (!raw || typeof raw !== "object") return raw;
	const out: any = { ...raw };
	const ji = out.job_information;
	if (ji && typeof ji === "object") {
		out.job_information = { ...ji, description: "" };
	}
	return out;
}

function isLightJobRaw(raw: any) {
	if (!raw || typeof raw !== "object") return true;
	const ji = (raw as any).job_information;
	if (!ji || typeof ji !== "object") return true;
	const d = (ji as any).description;
	return typeof d !== "string" || d.length === 0;
}

async function upsertJobDetails(ctx: any, externalId: string, raw: any, now: number) {
	const existing = await ctx.db
		.query("jobDetails")
		.withIndex("by_externalId", (q: any) => q.eq("externalId", externalId))
		.unique();
	if (existing) {
		await ctx.db.patch(existing._id, { raw, updatedAt: now });
	} else {
		await ctx.db.insert("jobDetails", { externalId, raw, createdAt: now, updatedAt: now });
	}
}

async function ensureJobDetailsIfMissing(ctx: any, externalId: string, raw: any, now: number) {
	const existing = await ctx.db
		.query("jobDetails")
		.withIndex("by_externalId", (q: any) => q.eq("externalId", externalId))
		.unique();
	if (!existing) {
		await ctx.db.insert("jobDetails", { externalId, raw, createdAt: now, updatedAt: now });
		return false;
	}
	return true;
}

const jobArgs = v.object({
	externalId: v.string(),
	jobTitle: v.string(),
	companyName: v.string(),
	workplaceType: v.optional(v.string()),
	country: v.optional(v.string()),
	region: v.optional(v.string()),
	city: v.optional(v.string()),
	searchText: v.optional(v.string()),
	dateFetched: v.optional(v.number()),
	raw: v.any(),
});

export const upsertBatch = mutation({
	args: { jobs: v.array(jobArgs) },
	handler: async (ctx, { jobs }) => {
		const now = Date.now();
		for (const j of jobs) {
			// Store full raw (heavy) separately, and keep the `jobs` table light.
			await upsertJobDetails(ctx, j.externalId, j.raw, now);
			const lightRaw = stripHeavyJobFields(j.raw);

			const existing = await ctx.db
				.query("jobs")
				.withIndex("by_externalId", (q) => q.eq("externalId", j.externalId))
				.unique();

			if (existing) {
				await ctx.db.patch(existing._id, {
					...j,
					raw: lightRaw,
					updatedAt: now,
				});
			} else {
				await ctx.db.insert("jobs", {
					...j,
					raw: lightRaw,
					createdAt: now,
					updatedAt: now,
				});
			}
		}
		return { upserted: jobs.length };
	},
});

export const list = query({
	args: {
		q: v.optional(v.string()),
		paginationOpts: v.any(),
	},
	handler: async (ctx, { q, paginationOpts }) => {
		const queryText = (q ?? "").trim().toLowerCase();
		if (queryText) {
			const page = await ctx.db
				.query("jobs")
				.withSearchIndex("search_searchText", (q2) => q2.search("searchText", queryText))
				.paginate(paginationOpts);
			return {
				page: page.page.map((d) => d.raw),
				continueCursor: page.continueCursor,
				isDone: page.isDone,
			};
		}

		const page = await ctx.db.query("jobs").order("desc").paginate(paginationOpts);
		return {
			page: page.page.map((d) => d.raw),
			continueCursor: page.continueCursor,
			isDone: page.isDone,
		};
	},
});

export const byExternalIds = query({
	args: { ids: v.array(v.string()) },
	handler: async (ctx, { ids }) => {
		const out = [];
		for (const externalId of ids) {
			const doc = await ctx.db
				.query("jobs")
				.withIndex("by_externalId", (q) => q.eq("externalId", externalId))
				.unique();
			if (doc) out.push(doc.raw);
		}
		return out;
	},
});

export const distinctJobTitles = query({
	args: { query: v.optional(v.string()), limit: v.optional(v.number()) },
	handler: async (ctx, { query, limit }) => {
		const q = (query ?? "").trim().toLowerCase();
		const max = Math.min(Math.max(limit ?? 50, 1), 200);

		// Keep reads small: we only need enough docs to produce `max` unique titles.
		const titles = new Set<string>();
		const readLimit = Math.min(Math.max(max * 6, 120), 600);

		if (q) {
			const docs = await ctx.db
				.query("jobs")
				.withSearchIndex("search_searchText", (q2) => q2.search("searchText", q))
				.take(readLimit);
			for (const d of docs) {
				const t = (d.jobTitle ?? "").trim();
				if (t) titles.add(t);
				if (titles.size >= max) break;
			}
		} else {
			const docs = await ctx.db.query("jobs").order("desc").take(readLimit);
			for (const d of docs) {
				const t = (d.jobTitle ?? "").trim();
				if (t) titles.add(t);
				if (titles.size >= max) break;
			}
		}

		return Array.from(titles);
	},
});

export const search = query({
	args: {
		q: v.optional(v.string()),
		filters: v.optional(
			v.object({
				workplaceType: v.optional(v.string()),
				companyNames: v.optional(v.array(v.string())),
			})
		),
		paginationOpts: v.any(),
	},
	handler: async (ctx, { q, filters, paginationOpts }) => {
		const queryText = (q ?? "").trim().toLowerCase();
		const workplaceType = filters?.workplaceType?.trim().toLowerCase();
		const companyNames = (filters?.companyNames ?? []).map((s) => s.trim()).filter(Boolean);
		const singleCompanyName = companyNames.length === 1 ? companyNames[0] : undefined;

		// Prefer search index when there is a query string.
		if (queryText) {
			const page = await ctx.db
				.query("jobs")
				.withSearchIndex("search_searchText", (q2) => {
					let q3 = q2.search("searchText", queryText);
					// Apply selective filters in-index when possible to avoid reading extra docs.
					if (workplaceType) q3 = q3.eq("workplaceType", workplaceType);
					if (singleCompanyName) q3 = q3.eq("companyName", singleCompanyName);
					return q3;
				})
				.paginate(paginationOpts);

			// If we couldn't apply all filters via index (e.g. multiple company names),
			// do a final lightweight in-memory filter on the already-paginated page.
			const filtered =
				companyNames.length > 1
					? page.page.filter((d) => companyNames.includes(d.companyName))
					: page.page;

			return {
				page: filtered.map((d) => d.raw),
				continueCursor: page.continueCursor,
				isDone: page.isDone,
			};
		}

		// No query: use the most selective available index to minimize bytes read.
		let page;
		if (workplaceType && singleCompanyName) {
			page = await ctx.db
				.query("jobs")
				.withIndex("by_workplaceType_companyName", (q2) =>
					q2.eq("workplaceType", workplaceType).eq("companyName", singleCompanyName)
				)
				.paginate(paginationOpts);
		} else if (workplaceType) {
			page = await ctx.db
				.query("jobs")
				.withIndex("by_workplaceType", (q2) => q2.eq("workplaceType", workplaceType))
				.paginate(paginationOpts);
		} else if (singleCompanyName) {
			page = await ctx.db
				.query("jobs")
				.withIndex("by_companyName", (q2) => q2.eq("companyName", singleCompanyName))
				.paginate(paginationOpts);
		} else {
			page = await ctx.db.query("jobs").order("desc").paginate(paginationOpts);
		}

		const filtered =
			companyNames.length > 1 ? page.page.filter((d: any) => companyNames.includes(d.companyName)) : page.page;

		return {
			page: filtered.map((d: any) => d.raw),
			continueCursor: page.continueCursor,
			isDone: page.isDone,
		};
	},
});

export const getRaw = query({
	args: { externalId: v.string() },
	handler: async (ctx, { externalId }) => {
		const details = await ctx.db
			.query("jobDetails")
			.withIndex("by_externalId", (q) => q.eq("externalId", externalId))
			.unique();
		return details?.raw ?? null;
	},
});

export const migrateSplitRawCursor = mutation({
	args: { batchSize: v.optional(v.number()), cursor: v.optional(v.string()) },
	handler: async (ctx, { batchSize, cursor }) => {
		const now = Date.now();
		const limit = Math.min(Math.max(batchSize ?? 100, 1), 500);

		// Paginate deterministically through ALL jobs.
		const page = await ctx.db
			.query("jobs")
			.order("desc")
			.paginate({ numItems: limit, cursor: cursor ?? null });

		let touched = 0;
		for (const j of page.page) {
			const detailsExists = await ensureJobDetailsIfMissing(ctx, j.externalId, j.raw, now);
			const alreadyLight = isLightJobRaw(j.raw);

			// If details exist and the job row is already stripped, skip redundant writes.
			if (detailsExists && alreadyLight) continue;

			if (!alreadyLight) {
				await ctx.db.patch(j._id, { raw: stripHeavyJobFields(j.raw), updatedAt: now });
			}
			touched += 1;
		}

		return {
			migrated: touched,
			scanned: page.page.length,
			continueCursor: page.continueCursor,
			isDone: page.isDone,
		};
	},
});

// Backwards-compatible one-shot migration. Kept for older scripts; prefer `migrateSplitRawCursor`.
export const migrateSplitRaw = mutation({
	args: { batchSize: v.optional(v.number()) },
	handler: async (ctx, { batchSize }) => {
		// Reuse the implementation of the cursor-based migration for a single page.
		return await (migrateSplitRawCursor as any).handler(ctx, { batchSize, cursor: undefined });
	},
});

export const count = query({
	args: {},
	handler: async (ctx) => {
		// Counting by iterating isn’t ideal long-term; ok as an import sanity check.
		const all = await ctx.db.query("jobs").collect();
		return all.length;
	},
});

