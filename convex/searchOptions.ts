import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getOptions = query({
	args: {
		type: v.string(),
		query: v.optional(v.string()),
		limit: v.optional(v.number()),
	},
	handler: async (ctx, { type, query, limit }) => {
		const max = Math.min(Math.max(limit ?? 50, 1), 2000);
		
		let docs;
		if (query && query.trim()) {
			docs = await ctx.db
				.query("searchOptions")
				.withSearchIndex("search_value", (q) =>
					q.search("value", query.trim()).eq("type", type)
				)
				.take(max);
		} else {
			docs = await ctx.db
				.query("searchOptions")
				.withIndex("by_type", (q) => q.eq("type", type))
				.take(max);
		}

		return { suggestions: docs.map((d) => d.value) };
	},
});

export const insertOptionsBatch = mutation({
	args: {
		type: v.string(),
		values: v.array(v.string()),
	},
	handler: async (ctx, args) => {
		for (const val of args.values) {
			await ctx.db.insert("searchOptions", { type: args.type, value: val });
		}
	},
});
