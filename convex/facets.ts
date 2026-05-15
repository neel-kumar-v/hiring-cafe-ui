import { v } from "convex/values";
import { query } from "./_generated/server";

/**
 * Facets are not currently wired into the UI, and this refactor removes `jobs.raw:any`.
 * Keep the endpoint stable but implement only lightweight facets over typed columns.
 */
const facetType = v.union(v.literal("job_title"), v.literal("company_name"));

export const get = query({
	args: {
		facetType,
		query: v.optional(v.string()),
		limit: v.optional(v.number()),
	},
	handler: async (ctx, { facetType: ft, query: q, limit }) => {
		const max = Math.min(Math.max(limit ?? 50, 1), 200);
		const queryText = (q ?? "").trim().toLowerCase();
		const hasJobCards = (await ctx.db.query("jobCards").take(1)).length > 0;

		let docs;
		if (hasJobCards) {
			docs = queryText
				? await ctx.db
						.query("jobCards")
						.withSearchIndex("search_searchText", (q2) => q2.search("searchText", queryText))
						.take(2000)
				: await ctx.db.query("jobCards").withIndex("by_recent").order("desc").take(2000);
		} else if (queryText) {
			const rows = await ctx.db.query("jobs").order("desc").take(3000);
			docs = rows.filter(
				(d) =>
					(d.title ?? "").toLowerCase().includes(queryText) ||
					(d.requirementsSummary ?? "").toLowerCase().includes(queryText) ||
					(d.skills ?? []).some((s) => (s ?? "").toLowerCase().includes(queryText)),
			);
		} else {
			docs = await ctx.db.query("jobs").order("desc").take(2000);
		}

		const out = new Set<string>();
		for (const d of docs) {
			const val = ft === "job_title" ? d.title : null;
			// Company name lives on `companies`; we can't facet it here cheaply without a join.
			if (val) out.add(val);
			if (out.size >= max) break;
		}
		return { suggestions: Array.from(out) };
	},
});
