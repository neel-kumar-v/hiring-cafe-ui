import { v } from "convex/values";
import { query } from "./_generated/server";

const facetType = v.union(
	v.literal("job_title"),
	v.literal("company_name"),
	v.literal("company_sector_and_industry"),
	v.literal("technology_keywords"),
	v.literal("listed_compensation_currency")
);

export const get = query({
	args: {
		facetType,
		query: v.optional(v.string()),
		limit: v.optional(v.number()),
		applyFilters: v.optional(v.boolean()),
		// Placeholder for future: pass structured filters and narrow facets.
		filters: v.optional(v.any()),
	},
	handler: async (ctx, { facetType: ft, query: q, limit }) => {
		const max = Math.min(Math.max(limit ?? 50, 1), 200);
		const queryText = (q ?? "").trim().toLowerCase();

		if (ft === "job_title") {
			if (queryText) {
				const docs = await ctx.db
					.query("jobs")
					.withSearchIndex("search_searchText", (q2) => q2.search("searchText", queryText))
					.take(2000);
				const titles = new Set<string>();
				for (const d of docs) {
					const t = (d.jobTitle ?? "").trim();
					if (t) titles.add(t);
					if (titles.size >= max) break;
				}
				return { suggestions: Array.from(titles) };
			}
			const docs = await ctx.db.query("jobs").order("desc").take(2000);
			const titles = new Set<string>();
			for (const d of docs) {
				const t = (d.jobTitle ?? "").trim();
				if (t) titles.add(t);
				if (titles.size >= max) break;
			}
			return { suggestions: Array.from(titles) };
		}

		if (ft === "company_name") {
			if (queryText) {
				const docs = await ctx.db
					.query("jobs")
					.withSearchIndex("search_searchText", (q2) => q2.search("searchText", queryText))
					.take(3000);
				const names = new Set<string>();
				for (const d of docs) {
					const n = (d.companyName ?? "").trim();
					if (n) names.add(n);
					if (names.size >= max) break;
				}
				return { suggestions: Array.from(names) };
			}
			const docs = await ctx.db.query("jobs").order("desc").take(3000);
			const names = new Set<string>();
			for (const d of docs) {
				const n = (d.companyName ?? "").trim();
				if (n) names.add(n);
				if (names.size >= max) break;
			}
			return { suggestions: Array.from(names) };
		}

		// TODO: extend schema to store these as normalized fields for real facets.
		return { suggestions: [] as string[] };
	},
});

